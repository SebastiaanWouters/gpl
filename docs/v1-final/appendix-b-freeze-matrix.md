# Appendix B Freeze Matrix

This matrix keeps the Appendix B registry surface explicit without turning the control plane into a second spec.

| Registry surface | Frozen base assignment | Handling rule | Spec ref |
| --- | --- | --- | --- |
| checksum kinds | `0 = invalid`, `1 = CRC32C` | do not renumber or repurpose | `docs/spec/SPEC.md:1104` |
| codecs | `0 = RAW`, `1 = ZSTD` | base mmap-safe sections remain `RAW` only | `docs/spec/SPEC.md:1111` |
| header flags | `bits 0-15 = reserved_zero` | unknown or non-zero bits reject | `docs/spec/SPEC.md:1118` |
| section flags | `REQUIRED`, `SKIPPABLE`, `MMAP_SAFE`, `COMPRESSED`, `CANONICAL`, remaining bits reserved-zero | do not renumber or repurpose | `docs/spec/SPEC.md:1126` |
| section type IDs | `MANIFEST` through `BUILD_INFO` assignments in Appendix B.5 | do not renumber or repurpose | `docs/spec/SPEC.md:1139` |
| required feature bits | none assigned in base GPL v1 | unknown required bits reject | `docs/spec/SPEC.md:1178` |
| optional feature bits | bits 0-2 reserved-zero | unknown optional bits ignore only when spec allows | `docs/spec/SPEC.md:1182` |
| connection sort order enum | `0 = departure_then_arrival_then_trip_then_from_stop_time` | base manifest value remains frozen | `docs/spec/SPEC.md:1190` |
| unit enums | `coord_unit = latlon_e7`, `distance_unit = millimeters`, `duration_unit = seconds` | do not repurpose in base GPL v1 | `docs/spec/SPEC.md:1196` |
| core enums and flags | transit location type, anchor kind, overlay flags, restriction flags, reserved-zero positions | writers emit assigned values only; strict validators reject reserved non-zero values | `docs/spec/SPEC.md:1209` |

Any new registry work after GPL v1 base RC remains outside the base contract unless RC status is explicitly reset or a future major version standardizes it.
