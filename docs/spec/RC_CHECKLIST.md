# GPL v1 Base RC Checklist

This checklist tracks the work needed to take the GPL v1 base format from release candidate to final v1.

## 1. RC Scope

The GPL v1 base RC covers only the immutable base `.gpl` interoperability surface defined in `docs/spec/SPEC.md`:

- container framing, checksums, directory rules, and compatibility rules
- required base section set and fixed core record layouts
- canonical ordering, dense-ID, alignment, padding, and reference rules
- street, profile, snapping, transit, and stop-anchor semantics in the base file
- validator requirements for base conformance

The following are outside base RC scope and MUST remain skippable, non-required extension work until separately standardized:

- pathway-aware extension layouts and semantics
- explicit frequency-template support for GTFS `exact_times = 0`
- additional non-core section layouts not required by Appendix F
- mutable realtime data inside the base `.gpl` file

## 2. Document Freeze Criteria

- `docs/spec/SPEC.md`, `docs/spec/README.md`, and `docs/spec/SPEC_EXPLAINED.md` use consistent RC status language
- no section inside the base interoperability surface is still described as draft, TBD, or pending freeze
- every required base section has exact presence, cardinality, schema, and layout rules
- every reserved byte, bit, enum position, and flag position is either assigned or explicitly reserved-zero

## 3. Conformance Criteria

- the spec defines conforming reader, writer, validator, and strict-validator behavior
- every base MUST and MUST NOT statement is testable by a reader, writer, validator, or fixture corpus
- Appendix F remains the canonical base section presence and dependency table
- unsupported skippable sections are explicitly ignorable without affecting base interoperability

## 4. Registry Freeze Criteria

- Appendix B assignments used by the base interoperability surface are frozen
- no base section type, feature bit, codec, flag, enum value, or sort-order assignment is renumbered after RC
- any new work after RC stays outside the base contract unless RC status is explicitly reset

## 5. Validation And Test Evidence

- a validator corpus exists for valid and invalid base files
- invalid fixtures cover at least header, directory, bounds, overlap, checksum, reserved-zero, dense-ID, and cross-section dependency failures
- valid fixtures cover at least a minimal hand-checkable file and real integration datasets such as Monaco and Aachen
- expected outcomes are documented as accept or reject with failure class where applicable

## 6. Implementation Evidence

- at least one conforming writer can produce base GPL v1 files
- at least one independent conforming reader can load and validate those files
- repeated builds with the same inputs and semantics produce byte-identical output except for explicitly non-deterministic skippable metadata
- mmap-safety assumptions are exercised by tests covering bounds, alignment, overflow, and section framing

## 7. Final v1 Exit Decision

GPL v1 base is ready to leave RC when:

- the base spec is frozen and internally consistent
- deferred work is clearly outside the base contract
- the conformance and validator story is implemented, not just described
- the fixture corpus demonstrates both acceptance and rejection behavior
- no open ambiguity remains in any required base field, layout, sort rule, or rejection condition
