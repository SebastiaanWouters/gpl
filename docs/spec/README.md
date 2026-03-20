# GPL Specification Docs

This directory contains the current GPL format documentation.

GPL v1 is in release-candidate status. The base specification is effectively frozen: container framing, versioning and compatibility rules, canonical encoding, mmap-safe section layout, street graph and turn model, profile overlays, snapping, core transit sections, stop/station anchors, and validation rules are the intended GPL v1 interoperability surface.

What remains deferred is extension-only work: optional layouts for pathway-aware files, optional explicit frequency-template support, and other non-core or extension section layouts not required for base interoperability. The intended target is a production-ready base format for high-performance multimodal routing engines, with realtime and other mutable behavior layered through external overlays rather than the immutable base file.

The current RC work is focused on formalizing and proving the base contract: consistent status language, explicit reader/writer/validator conformance targets, frozen registries for the base interoperability surface, and a concrete exit checklist for final v1.

Files:

- `docs/spec/SPEC.md` - normative base-format release-candidate specification
- `docs/spec/SPEC_EXPLAINED.md` - non-normative ground-up explainer
- `docs/spec/RC_CHECKLIST.md` - release-candidate checklist and finalization criteria

Suggested reading order:

1. `docs/spec/SPEC_EXPLAINED.md`
2. `docs/spec/SPEC.md`
3. `docs/spec/RC_CHECKLIST.md`

The explainer builds the mental model.
The spec freezes the contract and is the source of truth for any normative question.
The checklist tracks what must be proven before final v1.
