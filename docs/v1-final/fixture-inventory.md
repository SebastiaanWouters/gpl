# Fixture Inventory

These fixtures are mandatory execution inputs for GPL v1 final release work.

| Fixture | Current paths | Source inputs present | Required release roles |
| --- | --- | --- | --- |
| Monaco | `fixtures/monaco/monaco.osm.obf`, `fixtures/monaco/monaco-gtfs.zip` | OSM extract + GTFS feed bundle | writer integration build, validator regression, determinism evidence, benchmark evidence |
| Aachen | `fixtures/aachen/aachen.osm.obf`, `fixtures/aachen/aachen-gtfs.zip` | OSM extract + GTFS feed bundle | writer integration build, validator regression, determinism evidence, benchmark evidence |

## Inventory rules

- Monaco and Aachen are mandatory release fixtures for GPL v1 final.
- Their current files are source fixtures, not yet proof of valid `.gpl` outputs.
- Later valid corpus outputs derived from these inputs should keep stable fixture IDs tied back to these source paths.
- New convenience fixtures may be added later, but they do not replace Monaco and Aachen in the release evidence set.
