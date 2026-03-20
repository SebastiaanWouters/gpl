# Appendix F Implementation Matrix

This matrix freezes the Appendix F base section contract into implementation-facing planning rows. It is a proof-path document, not an implementation claim.

| Section | Cardinality | Required in base | Spec ref | Planned writer proof | Planned validator proof | Planned corpus coverage |
| --- | --- | --- | --- | --- | --- | --- |
| `MANIFEST` | exactly one | yes | `docs/spec/SPEC.md:1699` | minimal container slice | layout and cardinality checks | minimal valid fixture |
| `STRING_TABLE` | exactly one | yes | `docs/spec/SPEC.md:1700` | minimal/full writer | string reference checks | minimal + integration valid fixtures |
| `STREET_VERTICES` | exactly one | yes | `docs/spec/SPEC.md:1702` | full base writer | item count and bounds checks | Monaco/Aachen valid fixtures |
| `STREET_EDGES` | exactly one | yes | `docs/spec/SPEC.md:1703` | full base writer | referential and geometry checks | Monaco/Aachen valid fixtures |
| `STREET_GEOMETRY_OFFSETS` | exactly one | yes | `docs/spec/SPEC.md:1704` | full base writer | dependency and span checks | valid + dependency invalid fixtures |
| `STREET_GEOMETRY_COORDS` | exactly one | yes | `docs/spec/SPEC.md:1705` | full base writer | bounds and alignment checks | valid + malformed geometry fixtures |
| `STREET_TURNS` | exactly one | yes | `docs/spec/SPEC.md:1706` | full base writer | turn-span checks | valid + turn invalid fixtures |
| `STREET_COMPLEX_RESTRICTIONS` | exactly one, zero-length allowed | yes | `docs/spec/SPEC.md:1707` | full base writer | zero-length and referential checks | valid + referential invalid fixtures |
| `STREET_COMPLEX_RESTRICTION_EDGES` | exactly one, zero-length allowed | yes | `docs/spec/SPEC.md:1708` | full base writer | cross-section checks | valid + referential invalid fixtures |
| `PROFILES` | exactly one | yes | `docs/spec/SPEC.md:1710` | full base writer | overlay dependency checks | valid + dependency invalid fixtures |
| `PROFILE_EDGE_OVERLAYS` | exactly one | yes | `docs/spec/SPEC.md:1711` | full base writer | `profile_count * edge_count` validation | valid + dependency invalid fixtures |
| `PROFILE_TURN_OVERLAYS` | exactly one | yes | `docs/spec/SPEC.md:1712` | full base writer | `profile_count * turn_count` validation | valid + dependency invalid fixtures |
| `SNAP_GRID` | exactly one | yes | `docs/spec/SPEC.md:1714` | full base writer | bounds and lookup checks | Monaco/Aachen valid fixtures |
| `SNAP_GRID_EDGE_IDS` | exactly one | yes | `docs/spec/SPEC.md:1715` | full base writer | dependency and dense-array checks | valid + dependency invalid fixtures |
| `TRANSIT_FEEDS` | exactly one | yes | `docs/spec/SPEC.md:1717` | full base writer | namespace and bounds checks | Monaco/Aachen valid fixtures |
| `TRANSIT_LOCATIONS` | exactly one | yes | `docs/spec/SPEC.md:1718` | full base writer | anchor/reference checks | Monaco/Aachen valid fixtures |
| `TRANSIT_SERVICES` | exactly one | yes | `docs/spec/SPEC.md:1719` | full base writer | service-bitset dependency checks | Monaco/Aachen valid fixtures |
| `TRANSIT_SERVICE_BITSETS` | exactly one | yes | `docs/spec/SPEC.md:1720` | full base writer | referential and bounds checks | Monaco/Aachen valid fixtures |
| `TRANSIT_ROUTES` | exactly one | yes | `docs/spec/SPEC.md:1721` | full base writer | feed and string-table checks | Monaco/Aachen valid fixtures |
| `TRANSIT_PATTERNS` | exactly one | yes | `docs/spec/SPEC.md:1722` | full base writer | pattern-stop dependency checks | valid + dependency invalid fixtures |
| `TRANSIT_PATTERN_STOPS` | exactly one | yes | `docs/spec/SPEC.md:1723` | full base writer | sum-of-counts validation | valid + dependency invalid fixtures |
| `TRANSIT_TRIPS` | exactly one | yes | `docs/spec/SPEC.md:1724` | full base writer | route/pattern/service references | Monaco/Aachen valid fixtures |
| `TRANSIT_STOP_TIMES` | exactly one | yes | `docs/spec/SPEC.md:1725` | full base writer | sum-of-counts validation | valid + dependency invalid fixtures |
| `TRANSIT_CONNECTIONS` | exactly one | yes | `docs/spec/SPEC.md:1726` | full base writer | canonical ordering and semantic checks | Monaco/Aachen valid fixtures |
| `STOP_ANCHORS` | exactly one | yes | `docs/spec/SPEC.md:1728` | full base writer | anchor bounds and offset checks | Monaco/Aachen valid fixtures |
| `STOP_ANCHOR_REFS` | exactly one | yes | `docs/spec/SPEC.md:1729` | full base writer | `location_count` validation | valid + dependency invalid fixtures |
| `PROVENANCE` | zero or one, skippable only | no | `docs/spec/SPEC.md:1731` | optional writer extension path | skippable-only flag checks | compatibility-edge fixtures |
| `BUILD_INFO` | zero or one, skippable only | no | `docs/spec/SPEC.md:1732` | optional writer extension path | skippable-only and determinism checks | compatibility-edge fixtures |

## Cross-section dependency rows

| Rule | Spec ref | Planned proof |
| --- | --- | --- |
| `STREET_GEOMETRY_OFFSETS.item_count_or_zero == edge_count` | `docs/spec/SPEC.md:1739` | validator dependency check + invalid corpus |
| `PROFILE_EDGE_OVERLAYS.item_count_or_zero == profile_count * edge_count` | `docs/spec/SPEC.md:1740` | validator dependency check + invalid corpus |
| `PROFILE_TURN_OVERLAYS.item_count_or_zero == profile_count * turn_count` | `docs/spec/SPEC.md:1741` | validator dependency check + invalid corpus |
| `TRANSIT_PATTERN_STOPS` count equals sum of `pattern_stop_count` | `docs/spec/SPEC.md:1742` | validator dependency check + invalid corpus |
| `TRANSIT_STOP_TIMES` count equals sum of `stop_time_count` | `docs/spec/SPEC.md:1743` | validator dependency check + invalid corpus |
| `STOP_ANCHOR_REFS.item_count_or_zero == location_count` | `docs/spec/SPEC.md:1744` | validator dependency check + invalid corpus |
