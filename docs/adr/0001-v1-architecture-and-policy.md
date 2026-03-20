# ADR 0001: GPL v1 Architecture And Policy Boundaries

## Status

Accepted for GPL v1 finalization planning.

## Context

GPL v1 final is a package of interoperable artifacts, not a writer-only milestone. The repository needs stable architecture and policy decisions before large-scale implementation starts.

## Decisions

### Crate graph

- Shared crates may contain frozen constants, stable types, and other spec-derived primitives only.
- Writer logic, reader logic, validator logic, and CLI/tooling surfaces stay in separate crates.
- Reader and writer convenience sharing must not erode implementation independence.

### Public API boundaries

- Supported library APIs and CLI surfaces must be named explicitly.
- Internal helpers are not treated as accidental public interfaces.
- Future crate additions should document whether they are public, internal, or test-only.

### Diagnostics policy

- Public failures should expose stable machine-readable codes.
- Diagnostics should attach context such as section, offset, offending field, and relevant spec clause when practical.
- Advisory findings must remain distinguishable from normative conformance failures.

### Determinism policy

- Output bytes must not depend on hash iteration order, wall clock, filesystem traversal order, locale, hostname, or other incidental state.
- Non-deterministic metadata, if ever emitted, stays skippable and never becomes required for base interoperability.

### Unsafe policy

- Prefer safe Rust.
- Any `unsafe` required for mmap or zero-copy work must be isolated, justified with `SAFETY` invariants, and covered by targeted tests and review.

## Consequences

- Early implementation may feel more constrained, but later reader independence and release review become auditable.
- CI and contributor workflows can target stable command surfaces even while code is still arriving.
