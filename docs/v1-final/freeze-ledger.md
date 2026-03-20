# GPL v1 Freeze Ledger

This ledger turns the frozen GPL v1 base contract into explicit execution inputs for implementation and release review.

Generated matrices under `docs/v1-final/` are planning aids. They help assign proof work, but they do not override the normative meaning of `docs/spec/SPEC.md`.

## Authority

- `docs/spec/SPEC.md` is authoritative for GPL v1 base on-disk behavior.
- `docs/spec/RC_CHECKLIST.md` defines the exit bar from RC to final.
- `docs/prd-v1.md` defines the required product package.
- `docs/v1.md` defines sequencing and review gates.

## Frozen v1 base surfaces

The following surfaces are frozen for GPL v1 base work and must not be reopened by implementation convenience:

- required section presence, cardinality, and dependency semantics in Appendix F
- section type, feature-bit, codec, flag, enum, and sort-order assignments used by base interoperability in Appendix B
- container framing, checksums, alignment, padding, dense-ID, and in-bounds rules
- canonical ordering and deterministic tie-breaking rules
- rejection conditions for invalid container, section, schema, and semantic states
- base street, snapping, transit, and stop-anchor semantics already defined by the spec
- required/skippable compatibility behavior, including `container_major`, `container_minor`, and section schema handling

## Immutable rules for issue execution

- Do not change required section presence, field layouts, encodings, sort rules, rejection conditions, or normative semantics for GPL v1 base.
- Do not renumber or repurpose existing Appendix B base assignments.
- Treat incompatible ideas as extension work or a future major-version/reset conversation, not as in-scope v1 cleanup.
- Keep `PROVENANCE` and `BUILD_INFO` skippable and non-required.
- Reject source semantics that base GPL v1 cannot represent losslessly rather than approximating them.

## Phase 0 artifact map

| Artifact | Purpose | Status |
| --- | --- | --- |
| `docs/v1-final/appendix-b-freeze-matrix.md` | enumerate frozen registry assignments and reserved-zero surfaces used by GPL v1 base | seed |
| `docs/v1-final/appendix-f-implementation-matrix.md` | freeze Appendix F section presence and planned proof paths | seed |
| `docs/v1-final/compatibility-matrix.md` | freeze compatibility and rejection behavior for readers, writers, validators | seed |
| `docs/v1-final/deferred-extension-register.md` | record out-of-scope extension work that must not reopen base | seed |
| `docs/v1-final/fixture-inventory.md` | confirm Monaco and Aachen fixture ownership and intended evidence roles | seed |
| `docs/v1-final/traceability-matrix.md` | map base normative requirements to planned proof artifacts | generated seed |
| `docs/v1-final/release-evidence-index.md` | map RC checklist items to future evidence artifacts | generated seed |
| `docs/adr/0001-v1-architecture-and-policy.md` | record architectural and policy decisions | seed |

## Review gate outputs

- Every normative base requirement has a planned proof path in the traceability matrix.
- Every RC checklist item has a placeholder row in the release-evidence index.
- Every frozen Appendix B and Appendix F surface has an explicit home in this control-plane package.
- Every deferred idea that might otherwise erode GPL v1 base has an explicit entry in the deferred-extension register.
