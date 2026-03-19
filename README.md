# geopool

`geopool` defines a `.gpl` binary format for compact, mmap-friendly multimodal routing data built from OSM PBF and GTFS feeds.

## What it aims to provide

- a file smaller than the combined raw inputs
- fast street and transit routing from one binary
- street-routed ingress, egress, and transfer legs
- coordinate snapping onto the road network
- a streaming Rust writer that can build Belgium-scale datasets quickly

## In this repo

- `docs/spec/SPEC.md` - normative format draft
- `docs/spec/SPEC_EXPLAINED.md` - explainer and mental model
- `fixtures/` - Monaco and Aachen test and benchmark data
- `pool/` - checked-out reference engines and libraries for research

## Status

The spec drafts and fixtures are in place. The Rust writer implementation is next.
