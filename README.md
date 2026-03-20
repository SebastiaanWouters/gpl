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
- `docs/v1.md` - GPL v1 finalization plan
- `docs/v1-final/` - freeze, compatibility, traceability, and release-control artifacts
- `fixtures/` - Monaco and Aachen test and benchmark data
- `pool/` - local research checkouts only; not tracked in git and expected to contain `motis/`, `navitia/`, `OpenTripPlanner/`, `osmix/`, `osrm-backend/`, `r5/`, and `valhalla/`

## Status

The spec drafts and fixtures are in place. The GPL v1 finalization control plane and developer workflow foundations are now in-repo; the Rust writer implementation is next.

## Development bootstrap

- read `CONTRIBUTING.md` for setup, fast/full verification, and fixture expectations
- use the root `justfile` as the canonical local and CI entrypoint surface
- use Bun-run TypeScript scripts under `scripts/` for control-plane generation and bootstrap checks
- treat `docs/spec/SPEC.md` as authoritative for GPL v1 base on-disk behavior
