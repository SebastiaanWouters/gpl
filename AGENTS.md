# geopool multimodal routing binary format

geopool is a spec+implementation for a binary storage format that acts as an index on top of osm.pbf and gtfs feeds

- .gpl extension
- smaller in size then sum(osm.pbf, sum(gtfs zip feeds))
- mmap compatible
- facilitates blazingly fast multimodal routing engines 
- support for street routing with different profiles (car, walk, bike...)
- support for transit routing (combination of all gtfs feeds) with ingress / egress / transfer street routed legs
- coordinate snapping to road network
- easy to build from raw inputs (<10 min for belgium sized osm.pbf + 4 gtfs feeds covering belgium transit network)
- formal spec, well documented
- extensively tested and benchmarked
- implementation of the writer (osm.pbf + gtfs -> .gpl) is written in Rust (only allowed deps for osm and gtfs parsing/processing, must support streaming)

# references
you are standing on the shoulder of giantsfrom which you steal lots of ideas
source code of sota routing engines / libraries is in ./pool
use parallel subagents when researching ideas/brainstorming/planning

# fixtures
monaco and aachen fixtures available in ./fixtures. used for testing and benching

# spec versioning
when changing anything that touches the `.gpl` format, treat `docs/spec/SPEC.md` as authoritative

- GPL v1 base is in RC and its base interoperability surface is frozen
- do not change required section presence, field layouts, encodings, sort rules, rejection conditions, or normative semantics for GPL v1 base
- do not renumber or repurpose existing GPL v1 section type ids, feature bits, flags, codecs, or enums
- GPL minor versions are additive-only; incompatible changes require a new major version or an explicit RC reset in the spec
- any new work outside GPL v1 base interoperability must be a `SKIPPABLE`, non-required extension until standardized
- if a change would alter on-disk bytes or reader/writer conformance, update the spec first or alongside the code and classify it clearly

# git
use small, logically grouped,  conventional commits
