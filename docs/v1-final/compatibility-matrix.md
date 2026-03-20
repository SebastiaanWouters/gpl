# Compatibility Matrix

This matrix freezes the compatibility and rejection contract that writer, reader, validator, corpus, and release evidence all reference.

| Surface | Condition | Reader behavior | Writer behavior | Validator/corpus proof path | Spec ref |
| --- | --- | --- | --- | --- | --- |
| Container version | unsupported `container_major` | reject | emit only supported major | invalid compatibility fixture | `docs/spec/SPEC.md:117` |
| Container version | newer `container_minor` with only skippable additive changes | may accept | emit base `container_minor` only | compatibility-edge fixture | `docs/spec/SPEC.md:118` |
| Required features | unknown required feature bit | reject | never emit unknown required bits | invalid compatibility fixture | `docs/spec/SPEC.md:129` |
| Optional features | unknown optional feature bit | ignore | may emit only assigned optional bits | compatibility-edge fixture | `docs/spec/SPEC.md:130` |
| Required sections | unsupported required section/type/schema major/required semantics | reject | emit Appendix F required sections only | invalid compatibility fixture | `docs/spec/SPEC.md:141` |
| Skippable sections | unsupported but well-framed `SKIPPABLE` section | ignore after framing and bounds validation | mark extension-only work skippable | valid + compatibility-edge fixtures | `docs/spec/SPEC.md:143` |
| Experimental section types | vendor or experimental section type | allow only when skippable | must mark skippable | compatibility-edge fixture | `docs/spec/SPEC.md:154` |
| Registry freeze | Appendix B base assignments | treat as frozen | do not renumber or repurpose | freeze-ledger review | `docs/spec/SPEC.md:158` |
| Flags | unknown header or section flag bits | reject | emit only assigned bits | invalid malformed-container fixture | `docs/spec/SPEC.md:341` |
| Reserved bytes | any reserved byte/bit non-zero where forbidden | reject in strict validation | emit zero only | strict-validator fixture family | `docs/spec/SPEC.md:195` |
| `item_count_or_zero` | conflicts with frozen section layout | reject | emit exact logical count or zero as specified | invalid compatibility/dependency fixture | `docs/spec/SPEC.md:319` |
| Footer | trailing bytes after footer or mismatched footer values | reject | emit exact file length and footer mirror | malformed-container fixture | `docs/spec/SPEC.md:268` |
| `PROVENANCE` | section present | accept only if skippable | never require it | compatibility-edge fixture | `docs/spec/SPEC.md:458` |
| `BUILD_INFO` | section present | accept only if skippable | may emit as skippable-only metadata | compatibility-edge + determinism checks | `docs/spec/SPEC.md:462` |

## Compatibility notes

- GPL v1 base interoperability is defined by the spec, not by one implementation.
- Unknown required semantics always lose to rejection; unknown optional semantics only survive when the spec explicitly allows skippable handling.
- No compatibility row here authorizes changing base bytes or relaxing rejection behavior.
