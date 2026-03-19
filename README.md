# geopool

`geopool` is a spec and implementation effort for a `.gpl` binary format that indexes OSM PBF and GTFS feeds for fast multimodal routing.

## Goals

- keep `.gpl` files smaller than raw source inputs
- stay mmap-friendly for fast readers and routing engines
- support street routing, transit routing, and street-based access/egress legs
- snap coordinates onto the road network efficiently
- build Belgium-scale datasets quickly from streaming Rust tooling

## Repository layout

- `docs/spec/SPEC.md` - normative format draft
- `docs/spec/SPEC_EXPLAINED.md` - explainer and mental model
- `fixtures/` - Monaco and Aachen fixtures for tests and benchmarks
- `.agents/` - local agent skill definitions used in this workspace

## Status

The repository currently contains the format docs, fixtures, and research references. The writer implementation is planned in Rust.
