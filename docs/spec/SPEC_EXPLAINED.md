# GPL Spec Explained

## Why This Document Exists

`docs/spec/SPEC.md` is the contract.

This file is the guided tour.

It explains the format from the ground up: what problem GPL is solving, why the file is shaped the way it is, and why the big design choices fit together.

This document is non-normative.

## Start With The Problem

Suppose you want a routing engine to answer questions like these very fast:

- how do I drive from one coordinate to another?
- what is the best bike route to a station?
- which train can I catch after I walk there?
- how do I transfer from one stop to another on foot?

The raw data for this comes from two different worlds:

- OpenStreetMap for the street network
- GTFS for transit schedules

Those formats are great for publishing data, but they are not ideal as direct runtime formats for a very fast router. GPL exists to bridge that gap.

## The Core Idea

GPL stores the routing world in the shape queries want.

That is the single most important idea in the whole design.

Instead of asking, “what is the most faithful way to preserve the original files?”, GPL asks, “what layout lets a routing engine answer questions quickly, safely, and predictably?”

That one decision explains almost everything else.

## The First Big Tradeoff: Speed Over Cleverness

GPL is optimized for query speed first.

That means the format prefers:

- dense IDs
- flat arrays
- contiguous spans
- fixed-size records
- explicit offsets
- mmap-friendly sections

And it avoids depending on:

- pointer-heavy object graphs
- lots of tiny allocations
- expensive runtime reconstruction
- fuzzy reader inference

The spec sounds obsessed with layout because the layout is part of the performance story.

## Why Mmap Changes Everything

Memory mapping lets the operating system expose a file as memory.

That reduces startup cost and avoids a giant deserialize step.

But mmap-friendly formats have to be disciplined. They need structure.

GPL therefore uses a container with a header, section directory, payloads, and footer.

```text
+-----------------------------+
| Header                      |
+-----------------------------+
| Section Directory           |
+-----------------------------+
| Street / Transit Sections   |
+-----------------------------+
| Provenance / Aux Sections   |
+-----------------------------+
| Footer                      |
+-----------------------------+
```

The container answers basic safety questions early:

- is this really a GPL file?
- what version is it?
- what sections exist?
- where are they?
- is the file truncated or corrupted?

That is why the container is strict.

And at this point it is not just conceptually strict. The spec now freezes exact header, directory-entry, and footer layouts, plus the core record layouts used by the main routing sections.

## Why Flat Arrays Matter So Much

Flat arrays are one of the simplest high-performance data layouts you can have.

If `edge_id = 12345`, and that means “the 12346th record in `STREET_EDGES`”, then a reader can jump straight there.

No map lookup.
No tree walk.
No string comparison.

This is why GPL likes patterns like:

- one record array per entity kind
- dense IDs
- `offset + count`
- side arrays for varlen data

That gives good cache behavior and very simple validation.

## Four Layers To Keep In Your Head

The simplest mental model for GPL is that it has four layers:

```text
GPL
|- container
|- street
|- transit
`- linking + provenance
```

### 1. Container

The file-level framing: header, directory, checksums, compatibility.

### 2. Street

Vertices, directed edges, geometry, turns, profile overlays, and snapping.

### 3. Transit

Feeds, locations, services, routes, patterns, trips, stop times, and connections.

### 4. Linking

How the transit world attaches to the street world, plus provenance and future overlay hooks.

If you keep those four layers in your head, the rest of the spec becomes much easier to follow.

## Why The Street Graph Is Shared

The street network could have been duplicated for each profile.

For example:

- one graph for cars
- one graph for bikes
- one graph for walking

That sounds simple, but it wastes space and duplicates topology.

GPL instead stores one shared street graph, then layers profile-specific behavior on top.

So the graph says what physically exists.
The profile overlays say who may use it and at what cost.

That separation is a huge win.

## Why The Street Graph Is Directed

Roads are not always symmetric.

- one-way streets exist
- turns are directional
- reverse movement can be illegal or more expensive

So GPL stores directed edges.

If a street segment is usable in both directions, GPL stores two directed edges.

```text
vertex 10
  -> edge 40 -> vertex 11

vertex 11
  -> edge 41 -> vertex 10
```

Even if those describe the same physical road, they are different traversal states.

That makes routing logic much cleaner.

## Why Geometry And Topology Are Separated

A road may contain many shape points that matter for drawing but not for routing decisions.

So GPL separates:

- topology: where decisions happen
- geometry: what the path physically looks like

Example:

```text
source shape: A --- p --- q --- r --- B
```

GPL may store that as:

```text
vertex A -------- edge -------- vertex B
                 shape = [A, p, q, r, B]
```

That keeps the routing graph smaller and faster.

But there is a catch: if you simplify too hard, snapping gets worse.

That is why GPL allows simplification, but not at the cost of broken nearest-routable-point behavior.

## Why `length_mm` Is The Truth For Distance

GPL does not promise exact source geometry reconstruction.

That means geometry is useful, but not a safe universal source of truth for route metrics.

Different readers could compute slightly different lengths from the same polyline.

So GPL makes one clean rule:

- `length_mm` is normative for routing distance
- geometry is advisory for snapping and approximate route reconstruction

This is a classic spec move: pick one truth so implementations do not drift apart.

## Why Turns Are First-Class

A naive graph model says routing is just vertices and edges.

Real driving says otherwise.

What matters is often the transition from one edge to another:

- left turn forbidden
- right turn slow
- U-turn discouraged

So GPL stores turns explicitly.

```text
incoming edge 12
       \
        \
         > vertex V > outgoing edge 33
        /
       /
incoming edge 11
```

The important object is the transition `(12 -> 33)`, not just the vertex.

That is why turn rows and complex restrictions get their own sections.

## Why Profiles Are Overlays

Think about one edge on one street:

- for cars it may be fast and legal
- for bikes it may be legal but unpleasant
- for walking it may be forbidden

GPL handles that by storing profile overlays, not separate graphs.

That means the file can answer:

- can profile X use this edge?
- can profile X snap to this edge?
- what is the traversal metric for profile X?
- what turn penalty applies for profile X?

This keeps the physical world and the policy world nicely separated.

## Why Snapping Is More Than “Nearest Edge”

Snapping sounds easy until you try to do it well.

The closest edge might be:

- inaccessible for the chosen profile
- a bad one-way choice
- a synthetic connector that should not be treated as a real street

So GPL defines snapping as a proper routing-adjacent operation.

The result is not just “a point”. It is a projected position on a routable edge, with an offset.

That matters a lot near intersections and for street-transit attachment.

GPL keeps the snap index flat too:

```text
cell 0 -> edge ids [4, 9, 10]
cell 1 -> edge ids [2, 8]
cell 2 -> edge ids [8, 11, 12, 19]
```

Again: flat arrays, contiguous spans, predictable access.

## Why Transit Uses Service Days

Transit gets weird around midnight.

Imagine one trip:

- departure `23:00:00`
- arrival `26:45:00`

That looks strange if you think only in wall-clock time, but it makes perfect sense as one transit service day.

GPL keeps that model.

```text
service_date = 2026-03-19

stop A departure = 23:00:00 -> offset 82800
stop B arrival   = 26:45:00 -> offset 96300
```

This cleanly supports overnight and multi-day trips without splitting them into weird fragments.

It also gives one stable interpretation inside the file, which is much better than letting every reader invent its own time model.

In GPL, this time basis is the one truth used for trips, stop times, and connections.

## Why Feed Namespaces Matter

When you combine multiple GTFS feeds, simple IDs are dangerous.

Two feeds can both have `trip_id = 42`.

So GPL requires a stable `feed_namespace` per feed.

That means transit identity is always something like:

- this feed
- this route or trip or stop ID

That is crucial for correctness now, and also for future realtime overlays.

## Why Transit Has Patterns, Trips, Stop Times, And Connections

This part is easier if you start from what a rider sees.

Imagine a train line that runs all day.

Many runs of that line visit the same stops in the same order.
What changes from run to run is mostly the time.

GPL takes advantage of that by storing transit in two useful shapes at once:

- normalized structure
- denormalized query views

Here is the clean way to think about it:

```text
route
  -> pattern   = which stops, in which order
  -> trip      = one concrete run of that pattern
  -> stop times = when that run reaches each stop
  -> connections = one rideable hop at a time
```

Now let us slow that down.

`Pattern` means the shared structure.
It says: this service goes from stop A to stop B to stop C, in that order.
In GPL it is a little stricter than just a stop list. It also includes the boarding and alighting semantics at each stop position.

`Trip` means one actual run of that pattern.
For example, if the pattern is “Central -> North -> Airport”, then the trip is “the 07:30 run of that pattern on this service day.”

`Stop times` are the timetable rows for that trip.
They answer: when does this particular run arrive and depart at each stop?

`Connection` means one consecutive ride segment between two neighboring stop-time rows.
Some routing algorithms want to scan transit one hop at a time, so GPL stores that scan-friendly view directly too.

Here is a concrete example:

```text
Pattern P:
  Central -> North -> Airport

Trip T1:
  the 07:30 run of Pattern P

Stop times for T1:
  Central  07:30
  North    07:42
  Airport  07:55

Connections derived from T1:
  Central -> North   dep 07:30 arr 07:42
  North   -> Airport dep 07:42 arr 07:55
```

So GPL stores both:

- the compact normalized model: patterns, trips, stop times
- the scan-friendly flat model: connections

That is a very query-first design.

It avoids making every reader rebuild the same transit views over and over.

## Why Stops Use Anchors Instead Of Splitting Streets

Suppose a stop snaps halfway along a street edge.

You could permanently split the street graph there.

But if you do that for every stop, the street graph gets bloated with transit-specific surgery.

GPL uses anchors instead.

```text
street edge:   U ---------------------- V
                            ^
                            |
                         anchor
                            |
                          stop S
```

The stop attaches precisely to the street world without defaulting to permanent transit-driven graph splits.

An anchor may point either to an edge position or to a promoted vertex, depending on what preserves good routing and snapping behavior.

This is one of the cleanest parts of the design.

## Why Transfers Stay Dynamic

In GPL v1, inter-stop street transfers are query-time street routes.

That means the file does not try to precompute every possible walking transfer between every pair of nearby stops.

That keeps the file smaller and keeps routing flexible.

But GPL still protects transit semantics: if the feed gives explicit lower bounds or constraints, street routing is not allowed to violate them.

So the dynamic part adds flexibility. It does not erase the transit rules.

Also, transfer symmetry is not assumed. Going from A to B does not automatically mean B to A costs the same.

GPL v1 is strict here: the base format does not try to half-support every possible GTFS transfer or pathway feature. If a feed depends on semantics that base v1 cannot represent safely, the writer should reject the build instead of silently pretending everything is fine.

## Why Realtime Is Outside The Base File

The base `.gpl` file is designed to be:

- deterministic
- immutable
- mmap-friendly
- easy to validate

Realtime is the opposite kind of data. It changes constantly.

Trying to mix both into one mutable file would make the design much messier.

So GPL does the clean thing:

- static schedule and topology go in the base file
- future realtime hangs off stable identities in external overlays

That is safer and easier to reason about.

## Why Provenance Belongs In The Format

If two `.gpl` files behave differently, you want the file itself to help explain why.

That is what provenance is for.

It records things like:

- which inputs were used
- which builder version was used
- which options affected the result

That matters for debugging, reproducibility, and benchmarking.

Serious binary formats need that kind of memory.

## Why Validation Is Strict

GPL does not aim for “sort of parses.”

It aims for “safe to mmap and iterate under the frozen rules.”

That means validators care about:

- bad offsets
- overlapping sections
- invalid dense IDs
- broken adjacency spans
- invalid geometry references
- inconsistent transit spans

Strong validation is part of what makes mmap practical.

## What Is Frozen And What Is Still Open

The big architecture is now clear:

- one strict container
- one shared directed street graph
- flat arrays almost everywhere
- service-day transit time
- anchors instead of permanent stop splits
- immutable base file plus future overlays

What remains to freeze is now limited to the extension areas still listed as deferred in the main spec.

The core container, registries, and core record layouts are frozen, except for the explicitly deferred extension areas.

What is still open is mainly:

- non-core or extension section layouts
- pathway-aware extension details, if included later
- frequency-template extension details, if included later

The GPL v1 base line is now much stricter: explicit pathway graphs and `exact_times = 0` frequency-template behavior are extension territory, not fuzzy maybe-supported core behavior.

That is a healthy place to be in. The shape of the system is decided; the remaining work is making the bytes final.

## Reading Guide

If you are new to GPL, read the spec in this order:

1. Section 1 for status and scope
2. Section 6 for compatibility rules
3. Section 8 for the container
4. Sections 12 through 17 for the routing model
5. Section 18 for the remaining deferred extension areas
6. Appendix A for container bytes, Appendix B for registries, Appendix C and Appendix E for record layouts

If you keep the four-layer mental model in your head while reading, the rest should click into place.
