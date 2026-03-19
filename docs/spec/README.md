# GPL Specification Docs

This directory contains the current GPL format documentation.

GPL v1 is in release-candidate status. The base specification is effectively frozen: container framing, versioning and compatibility rules, canonical encoding, mmap-safe section layout, street graph and turn model, profile overlays, snapping, core transit sections, stop/station anchors, and validation rules are the intended GPL v1 interoperability surface.

What remains deferred is extension-only work: optional layouts for pathway-aware files, optional explicit frequency-template support, and other non-core or extension section layouts not required for base interoperability. The intended target is a production-ready base format for high-performance multimodal routing engines, with realtime and other mutable behavior layered through external overlays rather than the immutable base file.

Files:

- `docs/spec/SPEC.md` - normative RFC-style specification draft
- `docs/spec/SPEC_EXPLAINED.md` - non-normative ground-up explainer

Suggested reading order:

1. `docs/spec/SPEC_EXPLAINED.md`
2. `docs/spec/SPEC.md`

The explainer builds the mental model.
The spec freezes the contract.
