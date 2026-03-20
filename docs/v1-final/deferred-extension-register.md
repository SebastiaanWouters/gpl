# Deferred Extension Register

These items are explicitly deferred outside GPL v1 base finalization. They must not be used to reopen frozen GPL v1 base behavior.

| Item | Reason deferred | Allowed in v1 base? | Future path |
| --- | --- | --- | --- |
| exact fixed record layouts and field widths for remaining non-core or extension sections | explicitly deferred by Section 18 | no | future skippable extension standardization |
| pathway-aware extension layouts and semantics | outside the frozen base interoperability surface | no | future skippable extension standardization |
| explicit GTFS `exact_times = 0` frequency-template support | base GPL v1 cannot represent it losslessly without new semantics | no | future extension or later major version |
| additional non-core required sections beyond Appendix F | Appendix F is frozen for base interoperability | no | extension-only or later major version |
| mutable realtime data inside the immutable `.gpl` file | violates base-file immutability model | no | external overlays |
| any renumbering or repurposing of Appendix B base assignments | breaks frozen interoperability registries | no | later major version or explicit RC reset |

## Handling rule

When one of these ideas becomes important for implementation, record it as extension work. Do not reinterpret it as implicit GPL v1 base scope.
