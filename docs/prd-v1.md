# GPL v1 Final PRD

## Problem Statement

GPL v1 base already has a strong release-candidate specification, but it is not yet final because the project does not have the implementation and proof package needed to make the format trustworthy in production.

From a user and integrator perspective, the problem is not "what should GPL v1 be". The problem is that the frozen contract is not yet backed by the assets required to rely on it:

- there is no conforming Rust writer that emits the full base section set
- there is no independent reader proving the spec is implementable without relying on writer internals
- there is no validator and strict-validator enforcing the contract
- there is no published valid and invalid corpus demonstrating acceptance and rejection behavior
- there is no determinism, mmap-safety, or release evidence package proving the format is ready for production use

Until those pieces exist, GPL v1 remains a well-specified RC rather than a final, production-ready binary format.

## Solution

Deliver GPL v1 final as a complete product package rather than only a document set.

The release must include a frozen and internally consistent base spec, a conforming Rust writer, an independent conforming reader, a validator and strict-validator, a published conformance corpus, determinism and mmap-safety evidence, and enough operational benchmark evidence to support production-readiness claims.

The solution must preserve the current GPL v1 base freeze:

- `docs/spec/SPEC.md` remains authoritative for all base on-disk behavior
- Appendix F remains the canonical base section presence and dependency contract
- Appendix B remains frozen for base interoperability assignments
- work outside the base contract remains `SKIPPABLE` and non-required unless separately standardized

## User Stories

1. As a routing-engine implementer, I want GPL v1 base to be formally defined, so that I can build a reader without guessing unwritten behavior.
2. As a writer implementer, I want exact required section, layout, ordering, and rejection rules, so that I can emit valid `.gpl` files with confidence.
3. As a validator author, I want every normative rule to map to a check or fixture outcome, so that conformance is testable rather than interpretive.
4. As a third-party integrator, I want a published valid corpus, so that I can verify my own implementation against known-good files.
5. As a third-party integrator, I want a published invalid corpus, so that I can verify my rejection behavior against known-bad files.
6. As a reader implementer, I want unsupported but well-framed `SKIPPABLE` sections to be explicitly ignorable, so that extension work does not break base interoperability.
7. As a release owner, I want deterministic builds for identical inputs and semantics, so that I can trust benchmark, regression, and validation evidence.
8. As a systems engineer, I want mmap-safety to be proven by tests, so that zero-copy style access is safe after validation.
9. As a product owner, I want Monaco and Aachen to be part of the release evidence set, so that GPL v1 final is proven on real datasets instead of only toy data.
10. As a benchmark owner, I want documented build, size, validation, and load measurements, so that production-readiness claims are backed by evidence.
11. As a maintainer, I want clear post-v1 compatibility rules, so that later work does not accidentally reopen the frozen base contract.
12. As a contributor, I want the implementation path broken into explicit workstreams, so that writer, reader, validator, corpus, and release work can progress in parallel.
13. As a reviewer, I want a traceability matrix from spec clauses to evidence, so that I can verify that every `MUST` and `MUST NOT` is covered.
14. As an operator, I want CI gates for conformance, determinism, and mmap-safety, so that release quality does not depend on manual checks.
15. As a transit-data integrator, I want unsupported base semantics to be rejected explicitly, so that the writer never silently degrades data it cannot represent losslessly.
16. As a future extension author, I want base and extension boundaries to stay clear, so that new work can ship without destabilizing GPL v1 final.
17. As a specification reader, I want examples and clarified wording where ambiguity exists, so that independent implementation is practical.
18. As a governance owner, I want a final evidence index linking every release criterion to an artifact, so that v1 final signoff is auditable.

## Implementation Decisions

- GPL v1 final is delivered as a package of artifacts, not just one implementation.
- The product is complete only when writer, reader, validator, corpus, determinism proof, mmap-safety proof, and release evidence all exist.
- Base interoperability remains frozen during this effort; incompatible format changes are out of scope.
- The writer is implemented in Rust.
- The first reader must be independent from the writer: separate ownership, no shared parser or serializer logic, and no shared binary-layout implementation beyond frozen constants and spec-derived tables.
- The validator must distinguish container validity, section structural validity, cross-section referential validity, semantic dataset validity, and advisory-only findings.
- The conformance corpus must include both minimal hand-checkable files and real integration fixtures.
- Monaco and Aachen are required release fixtures.
- The project will maintain a compatibility matrix covering feature bits, required versus skippable behavior, container and schema version handling, reserved-zero enforcement, and `item_count_or_zero` behavior.
- Unsupported source semantics that GPL v1 base cannot represent losslessly must be rejected, not approximated.
- `PROVENANCE` and `BUILD_INFO` may support reproducibility and debugging, but they remain optional `SKIPPABLE` sections and cannot become required for base interoperability.
- A spec traceability matrix is required so that every base `MUST` and `MUST NOT` maps to implementation or corpus evidence.
- Release evidence must include an auditable index mapping each RC checklist item to a concrete artifact.
- Post-v1 governance stays additive-only for compatible work; incompatible change requires a new major version or explicit RC reset.

Major modules expected for delivery:

- spec closure and conformance-traceability module
- corpus definition and expected-outcome module
- Rust writer and deterministic binary-emission module
- independent reader module
- validator and strict-validator module
- determinism and hardening module
- benchmark and release-evidence module
- governance and release-signoff module

## Testing Decisions

- Good tests validate externally visible behavior: accepted files, rejected files, byte layout, determinism, compatibility handling, and mmap-safety assumptions.
- Tests should avoid coupling to incidental implementation details when a behavior can be verified at the artifact boundary.
- The writer must be tested with exact layout checks, corpus outputs, end-to-end builds, and rejection cases.
- The independent reader must be tested against the valid and invalid corpus, including unknown `SKIPPABLE` section handling and required rejection cases.
- The validator must be tested with both handcrafted and mutation-generated invalid fixtures.
- Hardening tests must cover offset arithmetic, bounds, overlap, overflow, alignment, section framing, and deterministic ordering behavior.
- CI must enforce corpus runs, strict-validator runs, deterministic rebuild checks, layout tests, and mmap-safety regressions on the release path.
- Real-dataset tests must include Monaco and Aachen.
- A minimal hand-checkable fixture is required to anchor low-level container and layout testing.

Modules that must receive dedicated tests:

- binary container framing and checksums
- canonical ordering and deterministic emission
- required section presence and cardinality handling
- compatibility and feature-bit handling
- validator failure classification
- corpus runner and expected-outcome matching
- mmap-safety and structural hardening logic

## Out of Scope

- pathway-aware extension layouts beyond the frozen GPL v1 base contract
- explicit frequency-template support for GTFS `exact_times = 0`
- non-core required sections outside Appendix F
- mutable realtime data inside the immutable base `.gpl` file
- any incompatible redesign of GPL v1 base bytes or semantics
- treating optional skippable metadata as base-required release blockers

## Further Notes

- This PRD defines what GPL v1 final must deliver; execution sequencing is defined in `docs/v1.md`.
- `docs/spec/SPEC.md` remains authoritative whenever this PRD and implementation details differ.
- The project should treat the conformance corpus as a product artifact, not just a test fixture folder.
- The final release should be auditable by a third party who did not participate in the writer implementation.
