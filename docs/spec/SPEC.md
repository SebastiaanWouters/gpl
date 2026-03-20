# GPL v1 Base Format Release Candidate Specification

## 1. Status of This Document

This document defines the GPL v1 base-format release candidate.

The GPL v1 base interoperability surface is frozen for implementation: the single-file container, feature and section compatibility model, canonical ordering and encoding rules, fixed core section set, shared street graph, turn semantics, immutable profile matrices, snap index, core transit model, stop/station anchoring, and validator requirements define the production contract for the base `.gpl` file.

The remaining deferred items listed in Section 18 are extension-only and are outside base GPL v1 interoperability. They do not block release of the base GPL v1 format and MUST remain skippable and non-required until later standardized.

The process and evidence required to leave RC are tracked in `docs/spec/RC_CHECKLIST.md`, including conforming writer, independent reader, validator corpus, determinism, and release-review evidence.

### 1.1 RC Change Policy

While GPL v1 base is in release-candidate status:

- editorial clarifications that do not change bytes or normative behavior are allowed
- additional examples, fixtures, and test vectors are allowed
- extension-only material may be added only as skippable, non-required work outside base interoperability

Any change that alters a required section's presence, field layout, encoding, sort rule, rejection condition, or normative meaning is a base-format change and MUST either be deferred to a later version or explicitly reset GPL v1 base RC status.

## 2. Introduction

GPL is a binary container and data model for high-performance multimodal routing.

GPL combines:

- a shared street graph derived from OpenStreetMap
- one or more transit datasets derived from GTFS
- explicit street-transit attachment data
- deterministic, mmap-friendly binary layout rules

GPL is optimized for query performance first.

## 3. Scope of the Base RC

GPL v1 defines:

- a single-file binary container
- canonical encoding rules
- section types and section compatibility rules
- street topology, geometry, turn, profile, and snapping sections
- transit feed, location, service, route, pattern, trip, stop-time, and connection sections
- stop/station anchor sections
- validation requirements

GPL v1 does not define a routing algorithm or public API.

## 4. Non-Goals

GPL v1 does not attempt to:

- reproduce OSM or GTFS source files losslessly
- mutate the base file in place for realtime updates
- auto-merge GTFS feeds by heuristic entity deduplication
- guarantee exact source geometry reconstruction
- support best-effort parsing across incompatible major versions

## 5. Conformance Language and Terminology

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, MAY, and OPTIONAL in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals.

### 5.1 Terminology

Terms used throughout this document:

- `record`: one fixed-size row in a flat section array
- `span`: a contiguous subrange described by `offset + count` or `offset + length`
- `dense ID`: a zero-based integer indexing records of one entity class
- `base file`: the immutable `.gpl` file
- `overlay`: external mutable data layered on top of the base file
- `service day`: the local GTFS service day in the feed timezone
- `reader`: an implementation that parses and serves data from a `.gpl` base file
- `writer`: an implementation that produces a `.gpl` base file
- `validator`: an implementation that checks whether a `.gpl` base file conforms to this specification
- `strict validator`: a validator mode that rejects reserved non-zero bits or bytes and unknown reserved enum or flag values where this specification requires rejection

### 5.2 Conformance Targets

Interoperability is defined against this specification rather than against any one implementation.

A conforming GPL v1 base reader:

- MUST accept any base GPL v1 file that satisfies this specification and whose required features and required sections it supports
- MUST reject files that violate required container, feature, section, schema, or normative semantic rules
- MUST ignore unsupported sections marked `SKIPPABLE` after validating their directory framing and byte ranges
- MUST NOT require any extension section for base GPL v1 interoperability

A conforming GPL v1 base writer:

- MUST emit files that satisfy all base GPL v1 MUST and MUST NOT requirements in this specification
- MUST emit every base-required section listed in Appendix F with the required presence and cardinality rules
- MUST use the section schema versions and frozen layouts defined by this specification for base sections
- MUST reject source inputs whose semantics cannot be represented losslessly within base GPL v1 unless an explicit required extension defining those semantics is in use

A conforming GPL v1 validator:

- MUST fail any file that violates a GPL v1 base MUST or MUST NOT requirement
- MUST report an overall pass or fail result for base GPL v1 conformance
- SHOULD classify failures by container validity, section structural validity, cross-section referential validity, and semantic dataset validity
- MAY implement advisory checks beyond this specification, but MUST distinguish advisory results from normative conformance failures

## 6. Versioning, Compatibility, and Extensibility

### 6.1 Version Layers

GPL defines two version layers:

- `container_major` and `container_minor` govern the file container and directory format
- `schema_major` and `schema_minor` in each section directory entry govern the payload semantics of that section

### 6.2 Major and Minor Changes

- a major version change is incompatible
- a minor version change is additive only
- a reader MUST reject a file whose `container_major` it does not support
- a reader MAY accept a newer `container_minor` only if all unknown additions are skippable and all required features are understood

### 6.3 Required and Optional Features

The header contains two 128-bit feature bitsets:

- `required_features`
- `optional_features`

Bit numbering uses least-significant-bit-first order within each byte. Bit 0 is the least significant bit of byte 0.

- unknown `required_features` bits MUST cause rejection
- unknown `optional_features` bits MUST be ignored

### 6.4 Section Compatibility

Each section directory entry declares:

- section type
- section schema version
- section flags
- section codec

A reader MUST reject a required section whose type, schema major version, or required semantics it does not support.

A reader MUST ignore any unsupported section marked `SKIPPABLE`, provided the section directory entry is valid and the declared byte range is structurally in-bounds.

### 6.5 Section Type and Feature Registries

GPL v1 SHOULD maintain stable numeric registries for:

- section type IDs
- feature bits
- section flags
- codecs

Vendor or experimental section types MUST be skippable.

The assignments in Appendix B are normative for GPL v1.

While GPL v1 base remains in RC status, the Appendix B assignments for base interoperability are frozen and MUST NOT be renumbered or repurposed.

## 7. Common Encoding Rules

### 7.1 Endianness

All integers are little-endian.

### 7.2 Numeric Types

Only fixed-width integer encodings are normative in core sections.

Floating-point values SHOULD NOT appear in required hot sections.

### 7.3 Units

Unless a section definition states otherwise:

- coordinates use `lat_e7` and `lon_e7` signed integer units
- street lengths use millimeters
- street and transit durations use integer seconds
- snap and anchor offsets use millimeters along the canonical edge metric

### 7.4 Dense IDs

Core entity references MUST use dense zero-based IDs.

### 7.5 Alignment

- `header_size` MUST be a multiple of 64 bytes
- `directory_offset` MUST be aligned to `2^global_alignment_log2`
- every section payload offset MUST be aligned to at least `2^global_alignment_log2`
- `global_alignment_log2` MUST be at least 6 in GPL v1
- a section `align_log2`, if used, MUST be greater than or equal to `global_alignment_log2`

### 7.6 Padding and Reserved Bytes

All padding bytes and reserved bytes MUST be zero.

### 7.7 References

All references MUST use IDs or explicit offsets. Raw pointers are forbidden.

### 7.8 Compression Rules

Compression is section-local.

- required query-hot sections SHOULD be stored raw
- a section marked `MMAP_SAFE` MUST use `codec = RAW` in GPL v1
- for uncompressed sections, `stored_length` MUST equal `logical_length`
- for compressed sections, `logical_length` is the decompressed byte length

## 8. Container Format

### 8.1 Overview

A GPL file consists of:

- fixed header
- section directory
- section payloads
- mirrored footer

### 8.2 Header

The file begins with a fixed v1 header.

For GPL v1, `header_size` MUST equal 128 bytes.

Required header fields, in order:

- `magic[8]`
- `header_size: u16`
- `container_major: u16`
- `container_minor: u16`
- `header_flags: u16`
- `required_features[16]`
- `optional_features[16]`
- `declared_file_length: u64`
- `directory_offset: u64`
- `directory_length: u64`
- `section_count: u32`
- `directory_entry_size: u16`
- `global_alignment_log2: u8`
- `checksum_kind: u8`
- `header_checksum: u32`
- `directory_checksum: u32`
- `footer_offset: u64`
- reserved zero bytes up to `header_size`

For GPL v1:

- `magic` MUST equal `0x89 0x47 0x50 0x4C 0x0D 0x0A 0x1A 0x0A`
- `header_flags` MUST equal `0`
- `checksum_kind` MUST equal `CRC32C`

### 8.3 Footer

The footer MUST repeat:

- footer magic
- declared file length
- directory offset
- directory length
- section count
- directory checksum
- footer checksum

For GPL v1:

- the footer size MUST equal 64 bytes
- `footer_magic` MUST equal ASCII `GPLFOOT\0`
- `footer_offset + 64` MUST equal `declared_file_length`
- no bytes may appear after the footer
- footer fields `declared_file_length`, `directory_offset`, `directory_length`, `section_count`, and `directory_checksum` MUST exactly equal the corresponding header fields

### 8.4 Checksums

For GPL v1, checksums are CRC32C.

- `header_checksum` covers the header bytes with the checksum field zeroed
- `directory_checksum` covers the exact directory byte range
- each section checksum covers the stored section bytes exactly as written in the file
- `footer_checksum` covers the footer bytes with the checksum field zeroed

### 8.5 Section Directory

The directory contains exactly `section_count` entries sorted by `(section_type, instance)`.

For GPL v1, `directory_entry_size` MUST equal 64 bytes.

`directory_length` MUST equal `section_count * directory_entry_size`.

The directory byte range `[directory_offset, directory_offset + directory_length)` MUST be fully in-bounds and MUST NOT overlap the header, footer, or any section payload.

Each entry MUST contain:

- `section_type: u32`
- `instance: u16`
- `section_flags: u16`
- `schema_major: u16`
- `schema_minor: u16`
- `codec: u8`
- `align_log2: u8`
- reserved zero bytes
- `offset: u64`
- `stored_length: u64`
- `logical_length: u64`
- `item_count_or_zero: u64`
- `section_checksum: u32`
- reserved zero bytes

Each `(section_type, instance)` pair MUST be unique.

For GPL v1, unless a section definition explicitly allows otherwise, `instance` MUST equal `0`.

For GPL v1, `item_count_or_zero` MUST be interpreted as follows:

- for fixed-record sections and raw dense-array sections, it MUST equal the logical item count
- for blob sections whose logical item count is not defined, it MUST equal `0`

A reader MUST reject a section whose `item_count_or_zero` conflicts with its frozen section layout.

### 8.6 Section Flags

GPL v1 defines the following section flags:

- `REQUIRED`
- `SKIPPABLE`
- `MMAP_SAFE`
- `COMPRESSED`
- `CANONICAL`

`REQUIRED` and `SKIPPABLE` MUST NOT both be set.

Every GPL v1 section MUST set exactly one of `REQUIRED` or `SKIPPABLE`.

If `COMPRESSED` is set, `codec` MUST NOT equal `RAW`.

If `codec` is not `RAW`, `COMPRESSED` MUST be set.

`CANONICAL` indicates that the section payload is emitted according to the deterministic ordering rules of Appendix D. Readers MAY ignore this bit.

For GPL v1, unknown `header_flags` bits and unknown `section_flags` bits MUST cause rejection.

### 8.7 Reader Rejection Conditions

A reader MUST reject the file if:

- magic is invalid
- declared file length does not match actual file length
- checksums fail
- offsets or lengths are out of bounds
- the footer range is out of bounds or overlaps the header or directory
- section payloads overlap
- required features are unknown
- required sections are unsupported
- a section violates its alignment or codec rules

## 9. Common Data Model Conventions

### 9.1 Normative Versus Advisory Data

GPL section definitions MUST state which stored values are normative.

Readers MUST use normative values even if advisory values imply a different derived result.

### 9.2 Canonical Ordering

Flat arrays MUST use deterministic canonical ordering.

Where a section definition requires sorted or grouped records, that ordering is normative.

### 9.3 Internal and External Identity

Dense internal IDs are runtime identity only.

External source identity and future overlay identity MUST be represented separately.

### 9.4 Feed Namespaces

Each imported GTFS feed MUST have a file-global stable `feed_namespace`.

`feed_namespace` uniqueness is scoped to one GPL file. If the same source feed is rebuilt with the same builder identity rules, its namespace SHOULD remain stable.

### 9.5 Immutable Base File

The `.gpl` base file is immutable. Realtime and other dynamic changes MUST be carried by external overlays.

## 10. Section Registry

GPL v1 defines the following canonical section families:

- manifest and string sections
- street sections
- profile sections
- snapping sections
- transit sections
- linking sections
- provenance and auxiliary sections

Recommended initial ranges:

- `0x0001` `MANIFEST`
- `0x0002` `STRING_TABLE`
- `0x0010` through `0x001F` street sections
- `0x0020` through `0x002F` profile sections
- `0x0030` through `0x003F` snapping sections
- `0x0040` through `0x004F` transit sections
- `0x0050` through `0x005F` linking sections
- `0x00F0` through `0x00FF` provenance and integrity sections
- `0x8000` through `0xFFFF` vendor or experimental skippable sections

## 11. Manifest and Auxiliary Sections

### 11.1 MANIFEST

`MANIFEST` is REQUIRED and MUST exist exactly once.

`MANIFEST` MUST use the `ManifestV1` layout defined in Appendix E.

It MUST contain:

- dataset bounding box
- counts for all core entity classes
- service date span begin and end
- canonical units
- declared connection sort order

For GPL v1:

- `service_date_begin` and `service_date_end` define an inclusive date span
- `connection_sort_order` MUST equal `0`
- schema `1.0` `MANIFEST` MUST have `logical_length = 100` bytes and contain exactly the `ManifestV1` fields defined in Appendix E.1

The manifest is normative for global counts and declared dataset-wide conventions. The directory remains authoritative for actual section presence.

### 11.2 STRING_TABLE

`STRING_TABLE` is REQUIRED and MUST exist exactly once.

`STRING_TABLE` stores deduplicated strings used by other sections.

String references MUST be explicit and deterministic.

`STRING_TABLE` MUST use the `StringTableV1` representation defined in Appendix E.

All `*_str_off` fields in GPL v1 are byte offsets relative to `STRING_TABLE`.

A conforming validator MUST verify that every referenced string offset is in bounds and resolves to a NUL-terminated UTF-8 string inside the `STRING_TABLE` payload.

### 11.3 PROVENANCE

`PROVENANCE` SHOULD contain canonical build provenance such as:

- normalized input dataset digests
- builder version
- builder configuration affecting semantics
- feed ordering and namespaces

`PROVENANCE` is OPTIONAL. In GPL v1, any `PROVENANCE` section MUST be marked `SKIPPABLE` and MUST NOT be marked `REQUIRED`.

### 11.4 BUILD_INFO

`BUILD_INFO` MAY contain non-deterministic metadata. It MUST be skippable.

`BUILD_INFO` MUST exist at most once.

## 12. Street Topology and Geometry

### 12.1 Street Model

The street model is a shared vertex-based adjacency graph with directed edges.

If traversal exists in both directions, the base graph MUST encode one directed edge per traversal direction. Reverse traversal MUST NOT be represented solely by flags on one edge record.

Transit locations attach to existing street vertices or directed edges through anchors rather than requiring permanent graph splits. Stop/station anchoring alone MUST NOT require vertex promotion.

### 12.2 Vertex Promotion and Simplification

A source point MUST become a routing vertex if any of the following is true:

- topology branches or merges there
- a dead end exists there
- directionality changes there
- accessibility changes there in a way that changes traversable edge segmentation
- a barrier or routing-significant control point exists there
- a turn restriction or explicit turn-cost boundary requires it
- stop or station anchoring requires it

Intermediate geometry MAY be collapsed into edge geometry payloads.

### 12.3 STREET_VERTICES

`STREET_VERTICES` MUST be a flat fixed-size array.

Each record MUST use the `StreetVertexV1` layout defined in Appendix C.

Each record contains:

- `lat_e7: i32`
- `lon_e7: i32`
- `first_out_edge: u32`
- `out_edge_count: u32`
- `flags: u16`
- `reserved: u16`

Outgoing edges of a vertex MUST occupy one contiguous span.

### 12.4 STREET_EDGES

`STREET_EDGES` MUST be a flat fixed-size array of directed edges.

Each record MUST use the `StreetEdgeV1` layout defined in Appendix C.

Each record contains:

- `to_vertex: u32`
- `opp_edge: u32` or invalid sentinel
- `geom_id: u32`
- `length_mm: u32`
- `first_turn: u32`
- `turn_count: u16`
- `base_flags: u16`
- `base_class: u16`
- `reserved: u16`

The `from_vertex` is implicit from the owning vertex adjacency span.

For edge `e`, the span `[first_turn, first_turn + turn_count)` in `STREET_TURNS` MUST be contiguous, MUST be in bounds, and every row in that span MUST have `in_edge = e`.

### 12.5 Geometry Sections

Geometry MUST be stored out-of-line in flat arrays:

- `STREET_GEOMETRY_OFFSETS`
- `STREET_GEOMETRY_COORDS`

`STREET_GEOMETRY_OFFSETS` MUST use the `GeometrySpanV1` layout defined in Appendix E.

`STREET_GEOMETRY_COORDS` MUST use the `CoordV1` layout defined in Appendix E.

Each geometry span MUST start and end at the corresponding graph endpoint coordinates.

### 12.6 Distance and Offset Semantics

`length_mm` is the normative route-distance metric for an edge.

Each directed edge is oriented from its implicit `from_vertex` to `to_vertex`.

For all edge-relative measures in GPL v1, offset `0` denotes the `from_vertex` endpoint and offset `length_mm` denotes the `to_vertex` endpoint.

Any stored edge-relative offset MUST satisfy `0 <= offset_mm <= length_mm`.

Snap offsets, anchor offsets, and other edge-relative offsets measured in millimeters MUST use the canonical edge metric, not raw polyline arclength if the two differ.

Geometry-derived distance is advisory only.

### 12.7 Topology and Geometry Validation

A conforming validator MUST verify:

- vertex and edge IDs are dense and in bounds
- every edge belongs to exactly one vertex adjacency span
- every `to_vertex` is valid
- every non-sentinel `opp_edge` is valid and symmetric
- every `geom_id` is valid
- every geometry span starts and ends at the corresponding endpoints
- every edge turn span is in bounds and contains only rows whose `in_edge` equals that edge ID
- every side-array span referenced by `SNAP_GRID`, `STOP_ANCHOR_REFS`, and `STREET_COMPLEX_RESTRICTIONS` is in bounds

## 13. Turn Model

### 13.1 General Rule

Turn restrictions and turn costs are first-class. A reader MUST NOT infer turn legality solely from edge geometry or street class.

### 13.2 Base Turn Transition Set

`STREET_TURNS` defines the complete base set of legal directed `(in_edge, out_edge)` transitions in the file.

If a transition is absent from `STREET_TURNS`, that transition is forbidden.

A U-turn is represented only by an explicit turn row and is forbidden if no such row exists.

Each record MUST use the `StreetTurnV1` layout defined in Appendix C.

Each record contains:

- `in_edge: u32`
- `out_edge: u32`
- `via_vertex: u32`
- `flags: u16`
- `reserved: u16`
- `restriction_ref: u32` or invalid sentinel

### 13.3 Profile Legality and Penalties

Profile-specific legality and penalties MUST be encoded in profile turn overlays aligned to `turn_id`.

A profile turn overlay MAY forbid a base turn or add a non-negative penalty to a base turn, but it MUST NOT legalize a transition absent from `STREET_TURNS`.

For every turn row:

- `via_vertex` MUST equal `STREET_EDGES[in_edge].to_vertex`
- `out_edge` MUST belong to the outgoing edge span of `via_vertex`

### 13.4 Complex Restrictions

Path-based restrictions MUST be representable using:

- `STREET_COMPLEX_RESTRICTIONS`
- `STREET_COMPLEX_RESTRICTION_EDGES`

Each complex restriction header MUST define:

- `from_edge`
- `to_edge`
- a contiguous via-edge span
- flags describing the restriction kind

Each complex restriction record MUST use the `StreetComplexRestrictionV1` layout defined in Appendix C.

Only exact matching traversals of the stored path semantics trigger the restriction.

### 13.5 Restriction Normalization

Writers SHOULD normalize `only_*` source restrictions into equivalent explicit prohibitions when lossless to do so.

## 14. Street Profiles

### 14.1 Shared Graph Contract

All profiles share the same base street graph.

Profile-dependent access, snap eligibility, and cost behavior MUST live in overlay sections.

Sections named `PROFILE_*_OVERLAYS` are immutable base-file profile matrices. They are not external mutable overlays as defined in Section 5.

### 14.2 PROFILES

`PROFILES` MUST define the canonical profile ordering.

`PROFILES` MUST use the `ProfileV1` layout defined in Appendix E.

### 14.3 PROFILE_EDGE_OVERLAYS

`PROFILE_EDGE_OVERLAYS` MUST be a flat array aligned 1:1 with `(profile_id, edge_id)` in row-major order.

Each row MUST use the `ProfileEdgeOverlayV1` layout defined in Appendix C.

Each row contains:

- access flags
- snap eligibility flags
- `duration_secs`
- `weight_class`

### 14.4 PROFILE_TURN_OVERLAYS

`PROFILE_TURN_OVERLAYS` MUST be a flat array aligned 1:1 with `(profile_id, turn_id)` in row-major order.

Each row MUST use the `ProfileTurnOverlayV1` layout defined in Appendix C.

Each row contains:

- allowed or forbidden state
- additive penalty in integer seconds

### 14.5 Overlay Cardinality

Overlay cardinalities MUST exactly equal:

- `profile_count * edge_count` for edge overlays
- `profile_count * turn_count` for turn overlays

## 15. Snapping

### 15.1 Snap Result Model

Snapping operates on routable street edges.

The canonical snap result is a projected position on a directed edge or one of its endpoints.

Snap candidate identity is per directed edge. If both traversal directions are snap-eligible, they MUST be treated as distinct candidates even when snapped coordinate and edge-relative offset are identical.

### 15.2 Snap Candidate Fields

A snap candidate MUST be representable using at least:

- `edge_id`
- edge-relative offset in canonical millimeters
- snapped coordinate
- connector or projection distance
- endpoint-collapse flag if applicable

### 15.3 Eligibility and Filtering

The snap index is a geometric candidate generator. Profile filtering is applied afterward.

Only profile-valid, snap-linkable edges MAY be returned for a profile.

### 15.4 Determinism

Tie-breaking MUST be deterministic. GPL v1 MUST order ties by:

1. projection distance
2. connector distance
3. `edge_id`
4. offset

### 15.5 Snap Index Sections

GPL v1 defines flat snap index sections:

- `SNAP_GRID`
- `SNAP_GRID_EDGE_IDS`

`SNAP_GRID` MUST use the `SnapGridCellV1` layout defined in Appendix E.

`SNAP_GRID_EDGE_IDS` MUST be a flat `u32` edge-id array.

Each cell references a contiguous candidate edge span.

Each snap-linkable edge MUST appear in at least one cell that intersects its geometry bounds.

For GPL v1, a point whose coordinates fall on a snap-grid cell boundary MUST be evaluated against all boundary-sharing cells needed to preserve deterministic candidate completeness.

## 16. Transit Sections

### 16.1 Transit Time Model

The canonical transit time model for GPL v1 is:

- `service_date`
- `offset_secs_from_service_day_start`

This basis is normative for trips, stop times, frequencies, and connections.

`service_date` is the GTFS service day in the feed timezone.

For GPL v1, the feed timezone is the canonical GTFS timezone used for calendar evaluation and service-day interpretation.

Offsets MAY exceed `24:00:00` and MUST support overnight and multi-day trips.

### 16.2 Transit Feed Identity

`TRANSIT_FEEDS` MUST define feed records and their `feed_namespace` values.

`TRANSIT_FEEDS` MUST use the `TransitFeedV1` layout defined in Appendix C.

Transit source identifiers MUST be interpreted as namespaced by feed.

### 16.3 TRANSIT_LOCATIONS

`TRANSIT_LOCATIONS` MUST be a flat array of typed location records.

Each record MUST use the `TransitLocationV1` layout defined in Appendix C.

Each record contains:

- `feed_id`
- source identifier reference
- location type
- parent location or invalid sentinel
- `lat_e7`
- `lon_e7`

Only stop-time-eligible location types MAY appear in trip stop sequences.

### 16.4 TRANSIT_SERVICES

`TRANSIT_SERVICES` MUST be a flat array of normalized service records.

`TRANSIT_SERVICE_BITSETS` MUST be a flat byte array.

Each service record MUST use the `TransitServiceV1` layout defined in Appendix C.

Each service record references a canonical service availability representation stored in `TRANSIT_SERVICE_BITSETS` over the manifest date span.

That normalized representation is authoritative after GTFS calendar normalization.

For GPL v1, service availability is encoded as one dense fixed-length bitset per service.

Let:

- `service_day_count = (service_date_end - service_date_begin) + 1`
- `service_bitset_len_bytes = ceil(service_day_count / 8)`

Each service record MUST reference exactly `service_bitset_len_bytes` bytes.

Bit semantics:

- bit index `d` corresponds to date `service_date_begin + d days`
- bit value `1` means service is active on that service date
- bit value `0` means service is inactive on that service date

Within each byte, bit numbering is least-significant-bit first.

All padding bits at indexes greater than or equal to `service_day_count` in the final byte MUST be zero.

`bitset_off` is a byte offset relative to the start of the `TRANSIT_SERVICE_BITSETS` payload.

### 16.5 TRANSIT_ROUTES

`TRANSIT_ROUTES` MUST be a flat array of feed-scoped route records.

`TRANSIT_ROUTES` MUST use the `TransitRouteV1` layout defined in Appendix C.

### 16.6 TRANSIT_PATTERNS and TRANSIT_PATTERN_STOPS

A pattern is a canonical ordered stop sequence plus the stop-position-level boarding and alighting semantics that participate in pattern identity.

`TRANSIT_PATTERNS` MUST be a flat array.

`TRANSIT_PATTERNS` MUST use the `TransitPatternV1` layout defined in Appendix C.

`TRANSIT_PATTERN_STOPS` MUST store all pattern stop sequences in one flat side array referenced by contiguous spans.

`TRANSIT_PATTERN_STOPS` MUST use the `PatternStopV1` layout defined in Appendix E.

### 16.7 TRANSIT_TRIPS

`TRANSIT_TRIPS` MUST be a flat array.

Each trip record MUST use the `TransitTripV1` layout defined in Appendix C.

Each trip record contains:

- `feed_id`
- source trip identifier reference
- `route_id`
- `pattern_id`
- `service_id`
- `first_stop_time: u32`
- `stop_time_count: u32`
- `trip_start_offset_secs`
- trip flags

For GPL v1, `trip_start_offset_secs` is the first departure offset if present, otherwise the first arrival offset.

For every trip, `stop_time_count` MUST equal `TRANSIT_PATTERNS[pattern_id].pattern_stop_count`.

For each trip-local stop index `i`, the stop-time row at that index MUST match the referenced pattern stop at `i` in location identity and boarding or alighting semantics.

### 16.8 TRANSIT_STOP_TIMES

`TRANSIT_STOP_TIMES` MUST be a flat array in trip order.

Each stop-time row MUST use the `TransitStopTimeV1` layout defined in Appendix C.

Each stop-time row contains:

- `location_id`
- arrival offset from service-day start
- departure offset from service-day start
- pickup and dropoff semantics
- timepoint or normalization flags

Within a trip:

- arrival offsets MUST be non-decreasing
- departure offsets MUST be non-decreasing
- `arrival <= departure` at each stop-time row

### 16.9 Frequency Handling

GPL v1 does not encode explicit frequency templates in the base schema.

A writer MUST materialize all GTFS `frequencies.txt` entries with `exact_times = 1` into concrete trips, stop times, services, and connections before writing the GPL v1 base transit sections.

For a frequency entry, instantiations MUST be generated at offsets:

- `start_time + k * headway_secs`

for all non-negative integers `k` such that the instantiated trip start is strictly less than `end_time`.

GTFS `frequencies.txt` entries with `exact_times = 0` are not representable in base GPL v1 and MUST cause the writer to reject the build unless a required extension explicitly defines those semantics.

After materialization, the base file MUST NOT preserve whether a trip originated from scheduled stop times or from GTFS frequency entries.

### 16.10 TRANSIT_CONNECTIONS

`TRANSIT_CONNECTIONS` MUST be a flat denormalized array of consecutive-stop ride segments.

Each row MUST use the `TransitConnectionV1` layout defined in Appendix C.

Each row contains:

- `trip_id`
- `from_stop_time`
- `to_stop_time`
- departure offset from service-day start
- arrival offset from service-day start
- passenger access flags

GPL v1 does not encode independent per-connection boarding or alighting semantics. Boarding permission is derived from the origin stop-time row and alighting permission is derived from the destination stop-time row. `TransitConnectionV1.flags` MUST be zero.

The manifest MUST declare the canonical connection sort order used in the file.

GPL v1 defines exactly one canonical connection sort order:

- `0 = departure_then_arrival_then_trip_then_from_stop_time`

For sort order `0`, connection rows MUST be sorted lexicographically by:

1. `departure_offset`
2. `arrival_offset`
3. `trip_id`
4. `from_stop_time`

### 16.11 Transit Validation

A conforming validator MUST verify:

- feed-scoped identity consistency
- valid parent-child location references
- valid stop-time location types
- valid service spans and service references
- trip, pattern, and stop-time span bounds
- stop-time monotonicity
- trip `stop_time_count` equals referenced pattern `pattern_stop_count`
- each trip stop-time row matches its pattern stop location and boarding or alighting semantics
- connection consistency with stop-time data
- each connection refers to adjacent stop-time rows of the same trip
- each connection departure equals the origin stop-time departure and each connection arrival equals the destination stop-time arrival
- any non-zero transit flags or enums not assigned in Appendix B MUST cause rejection by strict validators

## 17. Linking, Transfers, and Overlays

### 17.1 Stop and Station Anchors

Transit locations attach to the street graph through anchors rather than permanent graph splits.

### 17.2 STOP_ANCHORS

`STOP_ANCHORS` MUST be a flat array.

Each record MUST use the `StopAnchorV1` layout defined in Appendix C.

Each record contains:

- anchor kind
- linked `edge_id` or `vertex_id`
- edge-relative offset if edge-linked
- snapped coordinate
- connector distance

### 17.3 STOP_ANCHOR_REFS

`STOP_ANCHOR_REFS` MUST map each anchor-bearing location to a contiguous span of anchor references.

`STOP_ANCHOR_REFS` MUST use the `StopAnchorRefV1` layout defined in Appendix E and MUST be aligned 1:1 with `location_id`.

Any transit location intended to participate in street ingress, street egress, or street-routed transfer MUST reference at least one anchor. A location with `anchor_count = 0` is unreachable from the street layer in the GPL v1 base file.

### 17.4 Transfer Semantics

GPL v1 supports query-time street-routed transfers.

GPL v1 base files do not encode `transfers.txt` rows.

A writer without a required transfer-constraints extension MUST reject any feed whose transfer constraints cannot be losslessly represented by GPL v1 base street-routed transfers plus base schedule semantics.

GPL v1 does not define normative pathway graph semantics in the base file.

GTFS `pathways.txt` MUST NOT introduce additional base-v1 routing edges, states, or traversal rules unless a required feature explicitly enables that extension.

A writer that cannot safely ignore non-empty `pathways.txt` for its target deployment MUST reject the build.

Transfer symmetry MUST NOT be assumed unless explicitly encoded.

### 17.5 Future Realtime Overlays

Realtime overlays:

- MUST remain external to the base file
- SHOULD attach to stable feed-scoped transit identity
- SHOULD support atomic replacement

The canonical stable trip-instance identity for GPL v1 is:

- `feed_namespace`
- `service_date_ymd`
- `source_trip_id`
- `trip_start_offset_secs`

`service_date_ymd` MUST encode the GTFS service day in the feed timezone as `YYYYMMDD` in `u32` form.

`source_trip_id` MUST equal the exact normalized trip identifier referenced by `TRANSIT_TRIPS.source_id_str_off`.

For stop-level attachment, the canonical stop-event identity is the canonical trip-instance identity plus `stop_index`, where `stop_index` is the zero-based ordinal within the trip stop-time span.

For any one `feed_namespace` and `service_date_ymd`, the tuple `(source_trip_id, trip_start_offset_secs)` MUST resolve to at most one active trip instance.

Realtime overlays MUST attach by this canonical stable identity and MUST NOT attach by dense `trip_id` or connection row index.

## 18. Deferred Extension Areas Outside Base RC

The following areas are intentionally deferred from base GPL v1 and remain optional extension work for later standardization:

- exact fixed record layouts and field widths for remaining non-core or extension sections
- exact optional extension layouts for pathway-aware files
- exact optional extension layouts for explicit frequency-template files

Any section layout deferred by this section is outside GPL v1 base interoperability. Such sections MUST NOT be required for reading a GPL v1 base file and MUST be emitted only as `SKIPPABLE` extensions until standardized.

## 19. Validation Classes

A conforming validator MUST report an overall pass or fail result for base GPL v1 conformance.

GPL validators SHOULD report results in at least these classes:

- container validity
- section structural validity
- cross-section referential validity
- semantic dataset validity

The phrase "safe to mmap and iterate" in GPL means that container and structural validity checks pass and all referenced spans stay in bounds under the frozen layout rules.

## 20. Security and Robustness Considerations

Readers MUST treat all offsets, lengths, counts, and IDs as untrusted input until validated.

Readers MUST guard against:

- integer overflow in offset and length calculations
- overlapping or aliased section payloads
- malformed compressed payload declarations
- invalid dense IDs
- logically inconsistent but structurally valid cross-references

## Appendix A. Binary Layout Tables

This appendix is normative for the container-level binary framing of GPL v1.

### A.1 Header Layout

GPL v1 header layout, total size 128 bytes:

```text
offset  size  field
0x00    8     magic
0x08    2     header_size
0x0A    2     container_major
0x0C    2     container_minor
0x0E    2     header_flags
0x10    16    required_features
0x20    16    optional_features
0x30    8     declared_file_length
0x38    8     directory_offset
0x40    8     directory_length
0x48    4     section_count
0x4C    2     directory_entry_size
0x4E    1     global_alignment_log2
0x4F    1     checksum_kind
0x50    4     header_checksum
0x54    4     directory_checksum
0x58    8     footer_offset
0x60    32    reserved_zero
```

### A.2 Directory Entry Layout

GPL v1 section directory entry layout, total size 64 bytes:

```text
offset  size  field
0x00    4     section_type
0x04    2     instance
0x06    2     section_flags
0x08    2     schema_major
0x0A    2     schema_minor
0x0C    1     codec
0x0D    1     align_log2
0x0E    2     reserved_zero
0x10    8     offset
0x18    8     stored_length
0x20    8     logical_length
0x28    8     item_count_or_zero
0x30    4     section_checksum
0x34    12    reserved_zero
```

### A.3 Footer Layout

GPL v1 footer layout, total size 64 bytes:

```text
offset  size  field
0x00    8     footer_magic
0x08    8     declared_file_length
0x10    8     directory_offset
0x18    8     directory_length
0x20    4     section_count
0x24    4     directory_checksum
0x28    4     footer_checksum
0x2C    36    reserved_zero
```

For GPL v1, `footer_magic` is the 8-byte ASCII sequence `GPLFOOT\0`.

## Appendix B. Initial Registries

This appendix assigns initial GPL v1 values for container-level registries.

### B.1 Checksum Kinds

```text
0 = invalid
1 = CRC32C
```

### B.2 Codecs

```text
0 = RAW
1 = ZSTD
```

### B.3 Header Flags

Bit positions in `header_flags`:

```text
bits 0-15 = reserved_zero
```

### B.4 Section Flags

Bit positions in `section_flags`:

```text
bit 0 = REQUIRED
bit 1 = SKIPPABLE
bit 2 = MMAP_SAFE
bit 3 = COMPRESSED
bit 4 = CANONICAL
bits 5-15 = reserved_zero
```

### B.5 Initial Section Type IDs

```text
0x0001 = MANIFEST
0x0002 = STRING_TABLE

0x0010 = STREET_VERTICES
0x0011 = STREET_EDGES
0x0012 = STREET_GEOMETRY_OFFSETS
0x0013 = STREET_GEOMETRY_COORDS
0x0014 = STREET_TURNS
0x0015 = STREET_COMPLEX_RESTRICTIONS
0x0016 = STREET_COMPLEX_RESTRICTION_EDGES

0x0020 = PROFILES
0x0021 = PROFILE_EDGE_OVERLAYS
0x0022 = PROFILE_TURN_OVERLAYS

0x0030 = SNAP_GRID
0x0031 = SNAP_GRID_EDGE_IDS

0x0040 = TRANSIT_FEEDS
0x0041 = TRANSIT_LOCATIONS
0x0042 = TRANSIT_SERVICES
0x0043 = TRANSIT_ROUTES
0x0044 = TRANSIT_PATTERNS
0x0045 = TRANSIT_PATTERN_STOPS
0x0046 = TRANSIT_TRIPS
0x0047 = TRANSIT_STOP_TIMES
0x0048 = TRANSIT_SERVICE_BITSETS
0x0049 = TRANSIT_CONNECTIONS

0x0050 = STOP_ANCHORS
0x0051 = STOP_ANCHOR_REFS

0x00F0 = PROVENANCE
0x00F1 = BUILD_INFO
```

### B.6 Required Feature Bits

No required feature bits are assigned in base GPL v1.

### B.7 Optional Feature Bits

```text
bit 0 = reserved_zero
bit 1 = reserved_zero
bit 2 = reserved_zero
```

### B.8 Connection Sort Order Enum

```text
0 = departure_then_arrival_then_trip_then_from_stop_time
```

### B.9 Unit Enums

```text
coord_unit:
0 = latlon_e7

distance_unit:
0 = millimeters

duration_unit:
0 = seconds
```

### B.10 Core Enums and Flags

Unless explicitly assigned below, fixed-layout record `flags` fields are reserved in GPL v1. Writers MUST write them as zero. Strict validators MUST reject non-zero values in reserved positions.

```text
Transit location_type:
0 = stop_or_platform
1 = station
2 = entrance_exit
3 = generic_node
4 = boarding_area

StopAnchor anchor_kind:
0 = edge
1 = vertex

ProfileEdgeOverlay access_flags:
bit 0 = traversal_allowed
bits 1-15 = reserved_zero

ProfileEdgeOverlay snap_flags:
bit 0 = snap_eligible
bits 1-15 = reserved_zero

ProfileTurnOverlay flags:
bit 0 = turn_forbidden
bits 1-15 = reserved_zero

StreetComplexRestriction flags:
bit 0 = forbidden_path
bits 1-15 = reserved_zero

TransitStopTime pickup_dropoff packing:
bits 0-1 = pickup_type
bits 2-3 = drop_off_type
bits 4-15 = reserved_zero

pickup_type/drop_off_type values:
0 = regular
1 = unavailable
2 = must_phone
3 = must_coordinate_with_driver

TransitConnection flags:
bits 0-15 = reserved_zero

StreetVertex flags:
bits 0-15 = reserved_zero

StreetEdge base_flags:
bits 0-15 = reserved_zero

StreetTurn flags:
bits 0-15 = reserved_zero

ProfileV1 flags:
bits 0-31 = reserved_zero

TransitFeedV1 flags:
bits 0-31 = reserved_zero

TransitLocationV1 flags:
bits 0-31 = reserved_zero

TransitRouteV1 flags:
bits 0-31 = reserved_zero

TransitPatternV1 flags:
bits 0-31 = reserved_zero

TransitTripV1 flags:
bits 0-31 = reserved_zero

TransitStopTimeV1 flags:
bits 0-15 = reserved_zero

StopAnchorV1 flags:
bits 0-15 = reserved_zero
```

## Appendix C. Core Record Layouts

This appendix is normative for the fixed layouts of GPL v1 core records.

Sentinel rules used in this appendix:

- invalid `u16` ID or enum sentinel = `0xFFFF`
- invalid `u32` ID or reference sentinel = `0xFFFFFFFF`

### C.1 StreetVertexV1

Total size: 20 bytes

```text
offset  size  field
0x00    4     lat_e7               i32
0x04    4     lon_e7               i32
0x08    4     first_out_edge       u32
0x0C    4     out_edge_count       u32
0x10    2     flags                u16
0x12    2     reserved_zero        u16
```

### C.2 StreetEdgeV1

Total size: 28 bytes

```text
offset  size  field
0x00    4     to_vertex            u32
0x04    4     opp_edge             u32
0x08    4     geom_id              u32
0x0C    4     length_mm            u32
0x10    4     first_turn           u32
0x14    2     turn_count           u16
0x16    2     base_flags           u16
0x18    2     base_class           u16
0x1A    2     reserved_zero        u16
```

### C.3 StreetTurnV1

Total size: 20 bytes

```text
offset  size  field
0x00    4     in_edge              u32
0x04    4     out_edge             u32
0x08    4     via_vertex           u32
0x0C    2     flags                u16
0x0E    2     reserved_zero        u16
0x10    4     restriction_ref      u32
```

### C.4 StreetComplexRestrictionV1

Total size: 20 bytes

```text
offset  size  field
0x00    4     from_edge            u32
0x04    4     to_edge              u32
0x08    4     first_via_edge       u32
0x0C    4     via_edge_count       u32
0x10    2     flags                u16
0x12    2     reserved_zero        u16
```

### C.5 ProfileEdgeOverlayV1

Total size: 12 bytes

```text
offset  size  field
0x00    2     access_flags         u16
0x02    2     snap_flags           u16
0x04    4     duration_secs        u32
0x08    2     weight_class         u16
0x0A    2     reserved_zero        u16
```

`duration_secs` is the normative per-profile traversal duration for GPL v1 when present.

### C.6 ProfileTurnOverlayV1

Total size: 8 bytes

```text
offset  size  field
0x00    2     flags                u16
0x02    2     reserved_zero        u16
0x04    4     penalty_secs         u32
```

### C.7 TransitFeedV1

Total size: 16 bytes

```text
offset  size  field
0x00    4     namespace_str_off    u32
0x04    4     timezone_str_off     u32
0x08    4     feed_info_str_off    u32
0x0C    4     flags                u32
```

### C.8 TransitLocationV1

Total size: 24 bytes

```text
offset  size  field
0x00    2     feed_id              u16
0x02    2     location_type        u16
0x04    4     source_id_str_off    u32
0x08    4     parent_location      u32
0x0C    4     lat_e7               i32
0x10    4     lon_e7               i32
0x14    4     flags                u32
```

### C.9 TransitServiceV1

Total size: 16 bytes

```text
offset  size  field
0x00    2     feed_id              u16
0x02    2     reserved_zero        u16
0x04    4     source_id_str_off    u32
0x08    4     bitset_off           u32
0x0C    4     bitset_len_bytes     u32
```

### C.10 TransitRouteV1

Total size: 20 bytes

```text
offset  size  field
0x00    2     feed_id              u16
0x02    2     route_type           u16
0x04    4     source_id_str_off    u32
0x08    4     short_name_str_off   u32
0x0C    4     long_name_str_off    u32
0x10    4     flags                u32
```

### C.11 TransitPatternV1

Total size: 16 bytes

```text
offset  size  field
0x00    4     route_id             u32
0x04    4     first_pattern_stop   u32
0x08    4     pattern_stop_count   u32
0x0C    4     flags                u32
```

### C.12 TransitTripV1

Total size: 36 bytes

```text
offset  size  field
0x00    2     feed_id              u16
0x02    2     reserved_zero        u16
0x04    4     source_id_str_off    u32
0x08    4     route_id             u32
0x0C    4     pattern_id           u32
0x10    4     service_id           u32
0x14    4     first_stop_time      u32
0x18    4     stop_time_count      u32
0x1C    4     trip_start_offset_secs u32
0x20    4     flags                u32
```

### C.13 TransitStopTimeV1

Total size: 20 bytes

```text
offset  size  field
0x00    4     location_id          u32
0x04    4     arrival_offset       u32
0x08    4     departure_offset     u32
0x0C    2     pickup_dropoff       u16
0x0E    2     flags                u16
0x10    4     reserved_zero        u32
```

### C.14 TransitConnectionV1

Total size: 24 bytes

```text
offset  size  field
0x00    4     trip_id              u32
0x04    4     from_stop_time       u32
0x08    4     to_stop_time         u32
0x0C    4     departure_offset     u32
0x10    4     arrival_offset       u32
0x14    2     flags                u16
0x16    2     reserved_zero        u16
```

### C.15 StopAnchorV1

Total size: 24 bytes

```text
offset  size  field
0x00    2     anchor_kind          u16
0x02    2     flags                u16
0x04    4     linked_ref           u32
0x08    4     edge_offset_mm       u32
0x0C    4     snapped_lat_e7       i32
0x10    4     snapped_lon_e7       i32
0x14    4     connector_mm         u32
```

For `anchor_kind = vertex`, `linked_ref` is a `vertex_id` and `edge_offset_mm` MUST be zero.

For `anchor_kind = edge`, `linked_ref` is an `edge_id` and `edge_offset_mm` is the canonical offset along that edge.

## Appendix D. Canonical Ordering Rules

This appendix is normative for canonical GPL v1 file generation.

Unless stated otherwise:

- integers are ordered by ascending numeric value
- strings and byte sequences are ordered lexicographically by bytes
- invalid sentinels sort after all valid values

If two entities are otherwise equal under the frozen serialized sort keys, writers MUST break ties using a deterministic build-stable source provenance key. That provenance key is not required to be serialized.

### D.1 Container Ordering

- section directory entries MUST be sorted by `(section_type, instance)`
- canonical section payload emission SHOULD follow the same order
- `STRING_TABLE` strings MUST be unique and sorted lexicographically by UTF-8 bytes, with the empty string first

### D.2 Street Ordering

- `STREET_VERTICES` MUST be sorted by `(lat_e7, lon_e7, flags, provenance_key)`
- `STREET_EDGES` MUST be grouped by `from_vertex`
- within one vertex span, outgoing edges MUST be sorted by `(to_vertex, length_mm, base_class, base_flags, geometry_bytes, opp_edge, provenance_key)`
- `STREET_TURNS` MUST be grouped by `in_edge`
- within one `in_edge` span, turn rows MUST be sorted by `(out_edge, flags, restriction_ref)` with invalid `restriction_ref` ordered last
- `STREET_COMPLEX_RESTRICTIONS` MUST be sorted by `(from_edge, to_edge, via_edge_sequence_bytes, flags, provenance_key)`
- `STREET_COMPLEX_RESTRICTION_EDGES` MUST be the concatenation of via-edge spans in restriction order

### D.3 Profile and Snap Ordering

- `PROFILES` MUST be sorted by profile name bytes
- `PROFILE_EDGE_OVERLAYS` MUST use row-major `(profile_id, edge_id)` ordering
- `PROFILE_TURN_OVERLAYS` MUST use row-major `(profile_id, turn_id)` ordering
- `SNAP_GRID` MUST use row-major `(cell_y, cell_x)` ordering over the frozen grid definition
- each `SNAP_GRID_EDGE_IDS` candidate span MUST be deduplicated and sorted by `edge_id`

### D.4 Transit Ordering

- `TRANSIT_FEEDS` MUST be sorted by `feed_namespace` bytes
- `TRANSIT_LOCATIONS` MUST be sorted by `(feed_id, source_id_bytes, location_type, parent_source_identity, lat_e7, lon_e7)`
- `TRANSIT_SERVICES` MUST be sorted by `(feed_id, source_id_bytes, service_bitset_bytes)`
- `TRANSIT_ROUTES` MUST be sorted by `(feed_id, source_id_bytes)`
- `TRANSIT_PATTERNS` MUST be sorted by `(route_id, pattern_stop_sequence_bytes, flags)`
- `TRANSIT_PATTERN_STOPS` MUST be the concatenation of pattern stop spans in `pattern_id` order
- `TRANSIT_TRIPS` MUST be sorted by `(service_id, route_id, pattern_id, trip_start_offset_secs, feed_id, source_id_bytes)`
- `TRANSIT_STOP_TIMES` MUST be the concatenation of trip-local stop-time spans in `trip_id` order
- within each trip, stop-time rows MUST remain in stop sequence order
- `TRANSIT_CONNECTIONS` MUST be sorted according to the manifest-declared connection sort order; for GPL v1 that is Appendix B.8 value `0`

### D.5 Anchor Ordering

- `STOP_ANCHOR_REFS` MUST be grouped by `location_id`
- `STOP_ANCHORS` MUST be concatenated by ascending `location_id`
- within one location span, anchors MUST be sorted by `(anchor_kind, linked_ref, edge_offset_mm, snapped_lat_e7, snapped_lon_e7, connector_mm, flags)`

## Appendix E. Auxiliary Section Layouts

This appendix is normative for auxiliary and side-array layouts used by GPL v1.

### E.1 ManifestV1

Total size: 100 bytes

```text
offset  size  field
0x00    4     bbox_min_lat_e7           i32
0x04    4     bbox_min_lon_e7           i32
0x08    4     bbox_max_lat_e7           i32
0x0C    4     bbox_max_lon_e7           i32
0x10    4     vertex_count              u32
0x14    4     edge_count                u32
0x18    4     turn_count                u32
0x1C    4     profile_count             u32
0x20    4     feed_count                u32
0x24    4     location_count            u32
0x28    4     service_count             u32
0x2C    4     route_count               u32
0x30    4     pattern_count             u32
0x34    4     trip_count                u32
0x38    4     stop_time_count           u32
0x3C    4     connection_count          u32
0x40    4     anchor_count              u32
0x44    4     service_date_begin_ymd    u32
0x48    4     service_date_end_ymd      u32
0x4C    2     connection_sort_order     u16
0x4E    2     coord_unit                u16
0x50    2     distance_unit             u16
0x52    2     duration_unit             u16
0x54    2     snap_grid_width           u16
0x56    2     snap_grid_height          u16
0x58    4     snap_cell_lat_e7          u32
0x5C    4     snap_cell_lon_e7          u32
0x60    4     reserved_zero             u32
```

The snap grid origin is `(bbox_min_lat_e7, bbox_min_lon_e7)`.

### E.2 StringTableV1

`STRING_TABLE` is a flat byte blob of UTF-8 strings terminated by `0x00` bytes.

All string offsets in GPL v1 are byte offsets relative to the start of `STRING_TABLE`.

The empty string MUST be present at offset `0`.

All strings in `STRING_TABLE` MUST be unique.

### E.3 ProfileV1

Total size: 8 bytes

```text
offset  size  field
0x00    4     name_str_off             u32
0x04    4     flags                    u32
```

### E.4 GeometrySpanV1

Total size: 8 bytes

```text
offset  size  field
0x00    4     first_coord              u32
0x04    4     coord_count              u32
```

### E.5 CoordV1

Total size: 8 bytes

```text
offset  size  field
0x00    4     lat_e7                   i32
0x04    4     lon_e7                   i32
```

### E.6 PatternStopV1

Total size: 8 bytes

```text
offset  size  field
0x00    4     location_id              u32
0x04    2     pickup_dropoff           u16
0x06    2     flags                    u16
```

### E.7 SnapGridCellV1

Total size: 8 bytes

```text
offset  size  field
0x00    4     first_candidate          u32
0x04    4     candidate_count          u32
```

### E.8 StopAnchorRefV1

Total size: 8 bytes

```text
offset  size  field
0x00    4     first_anchor             u32
0x04    4     anchor_count             u32
```

### E.9 Raw Side Arrays

The following sections are raw dense arrays without per-record wrappers:

- `STREET_COMPLEX_RESTRICTION_EDGES`: flat `u32` edge-id array
- `SNAP_GRID_EDGE_IDS`: flat `u32` edge-id array
- `TRANSIT_SERVICE_BITSETS`: flat byte array

## Appendix F. Base Section Presence and Cardinality

This appendix is normative for base GPL v1 section presence.

Unless stated otherwise, a base section listed here MUST use directory `instance = 0`.

```text
Section                           Cardinality in base GPL v1
MANIFEST                          exactly one
STRING_TABLE                      exactly one

STREET_VERTICES                   exactly one
STREET_EDGES                      exactly one
STREET_GEOMETRY_OFFSETS           exactly one
STREET_GEOMETRY_COORDS            exactly one
STREET_TURNS                      exactly one
STREET_COMPLEX_RESTRICTIONS       exactly one (zero-length allowed)
STREET_COMPLEX_RESTRICTION_EDGES  exactly one (zero-length allowed)

PROFILES                          exactly one
PROFILE_EDGE_OVERLAYS             exactly one
PROFILE_TURN_OVERLAYS             exactly one

SNAP_GRID                         exactly one
SNAP_GRID_EDGE_IDS                exactly one

TRANSIT_FEEDS                     exactly one
TRANSIT_LOCATIONS                 exactly one
TRANSIT_SERVICES                  exactly one
TRANSIT_SERVICE_BITSETS           exactly one
TRANSIT_ROUTES                    exactly one
TRANSIT_PATTERNS                  exactly one
TRANSIT_PATTERN_STOPS             exactly one
TRANSIT_TRIPS                     exactly one
TRANSIT_STOP_TIMES                exactly one
TRANSIT_CONNECTIONS               exactly one

STOP_ANCHORS                      exactly one
STOP_ANCHOR_REFS                  exactly one

PROVENANCE                        zero or one, skippable only
BUILD_INFO                        zero or one, skippable only
```

Zero-length sections are permitted where the declared cardinality or payload length is zero. A zero-length section offset MUST still be aligned and in-bounds.

Cross-section dependency rules:

- `STREET_GEOMETRY_OFFSETS.item_count_or_zero` MUST equal `edge_count`
- `PROFILE_EDGE_OVERLAYS.item_count_or_zero` MUST equal `profile_count * edge_count`
- `PROFILE_TURN_OVERLAYS.item_count_or_zero` MUST equal `profile_count * turn_count`
- `TRANSIT_PATTERN_STOPS` MUST contain exactly the sum of all `pattern_stop_count` values
- `TRANSIT_STOP_TIMES` MUST contain exactly the sum of all `stop_time_count` values
- `STOP_ANCHOR_REFS.item_count_or_zero` MUST equal `location_count`
