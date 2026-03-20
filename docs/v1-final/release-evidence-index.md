# Release Evidence Index

This generated skeleton maps each RC checklist bullet to a placeholder release-evidence row. It is intentionally incomplete until later phases land concrete artifacts.

| Checklist ID | Checklist section | Criterion | Owner area | Planned artifact | Status |
| --- | --- | --- | --- | --- | --- |
| `RC-1-01` | 1. RC Scope | container framing, checksums, directory rules, and compatibility rules | control plane | planned artifact path TBD | planned |
| `RC-1-02` | 1. RC Scope | required base section set and fixed core record layouts | control plane | planned artifact path TBD | planned |
| `RC-1-03` | 1. RC Scope | canonical ordering, dense-ID, alignment, padding, and reference rules | control plane | planned artifact path TBD | planned |
| `RC-1-04` | 1. RC Scope | street, profile, snapping, transit, and stop-anchor semantics in the base file | control plane | planned artifact path TBD | planned |
| `RC-1-05` | 1. RC Scope | validator requirements for base conformance | control plane | planned artifact path TBD | planned |
| `RC-1-06` | 1. RC Scope | pathway-aware extension layouts and semantics | control plane | planned artifact path TBD | planned |
| `RC-1-07` | 1. RC Scope | explicit frequency-template support for GTFS `exact_times = 0` | control plane | planned artifact path TBD | planned |
| `RC-1-08` | 1. RC Scope | additional non-core section layouts not required by Appendix F | control plane | planned artifact path TBD | planned |
| `RC-1-09` | 1. RC Scope | mutable realtime data inside the base `.gpl` file | control plane | planned artifact path TBD | planned |
| `RC-2-01` | 2. Document Freeze Criteria | `docs/spec/SPEC.md`, `docs/spec/README.md`, and `docs/spec/SPEC_EXPLAINED.md` use consistent RC status language | spec/governance | planned artifact path TBD | planned |
| `RC-2-02` | 2. Document Freeze Criteria | no section inside the base interoperability surface is still described as draft, TBD, or pending freeze | spec/governance | planned artifact path TBD | planned |
| `RC-2-03` | 2. Document Freeze Criteria | every required base section has exact presence, cardinality, schema, and layout rules | spec/governance | planned artifact path TBD | planned |
| `RC-2-04` | 2. Document Freeze Criteria | every reserved byte, bit, enum position, and flag position is either assigned or explicitly reserved-zero | spec/governance | planned artifact path TBD | planned |
| `RC-3-01` | 3. Conformance Criteria | the spec defines conforming reader, writer, validator, and strict-validator behavior | control plane | planned artifact path TBD | planned |
| `RC-3-02` | 3. Conformance Criteria | every base MUST and MUST NOT statement is testable by a reader, writer, validator, or fixture corpus | control plane | planned artifact path TBD | planned |
| `RC-3-03` | 3. Conformance Criteria | Appendix F remains the canonical base section presence and dependency table | control plane | planned artifact path TBD | planned |
| `RC-3-04` | 3. Conformance Criteria | unsupported skippable sections are explicitly ignorable without affecting base interoperability | control plane | planned artifact path TBD | planned |
| `RC-4-01` | 4. Registry Freeze Criteria | Appendix B assignments used by the base interoperability surface are frozen | governance/spec | planned artifact path TBD | planned |
| `RC-4-02` | 4. Registry Freeze Criteria | no base section type, feature bit, codec, flag, enum value, or sort-order assignment is renumbered after RC | governance/spec | planned artifact path TBD | planned |
| `RC-4-03` | 4. Registry Freeze Criteria | any new work after RC stays outside the base contract unless RC status is explicitly reset | governance/spec | planned artifact path TBD | planned |
| `RC-5-01` | 5. Validation And Test Evidence | a validator corpus exists for valid and invalid base files | validator/corpus | planned artifact path TBD | planned |
| `RC-5-02` | 5. Validation And Test Evidence | invalid fixtures cover at least header, directory, bounds, overlap, checksum, reserved-zero, dense-ID, and cross-section dependency failures | validator/corpus | planned artifact path TBD | planned |
| `RC-5-03` | 5. Validation And Test Evidence | valid fixtures cover at least a minimal hand-checkable file and real integration datasets such as Monaco and Aachen | validator/corpus | planned artifact path TBD | planned |
| `RC-5-04` | 5. Validation And Test Evidence | expected outcomes are documented as accept or reject with failure class where applicable | validator/corpus | planned artifact path TBD | planned |
| `RC-6-01` | 6. Implementation Evidence | at least one conforming writer can produce base GPL v1 files | writer/reader/hardening | planned artifact path TBD | planned |
| `RC-6-02` | 6. Implementation Evidence | at least one independent conforming reader can load and validate those files | writer/reader/hardening | planned artifact path TBD | planned |
| `RC-6-03` | 6. Implementation Evidence | repeated builds with the same inputs and semantics produce byte-identical output except for explicitly non-deterministic skippable metadata | writer/reader/hardening | planned artifact path TBD | planned |
| `RC-6-04` | 6. Implementation Evidence | mmap-safety assumptions are exercised by tests covering bounds, alignment, overflow, and section framing | writer/reader/hardening | planned artifact path TBD | planned |
| `RC-7-01` | 7. Final v1 Exit Decision | the base spec is frozen and internally consistent | release owner | planned artifact path TBD | planned |
| `RC-7-02` | 7. Final v1 Exit Decision | deferred work is clearly outside the base contract | release owner | planned artifact path TBD | planned |
| `RC-7-03` | 7. Final v1 Exit Decision | the conformance and validator story is implemented, not just described | release owner | planned artifact path TBD | planned |
| `RC-7-04` | 7. Final v1 Exit Decision | the fixture corpus demonstrates both acceptance and rejection behavior | release owner | planned artifact path TBD | planned |
| `RC-7-05` | 7. Final v1 Exit Decision | no open ambiguity remains in any required base field, layout, sort rule, or rejection condition | release owner | planned artifact path TBD | planned |

Generated by `scripts/render_control_plane.ts`.
