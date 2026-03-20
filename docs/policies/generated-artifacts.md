# Generated Artifact Policy

Generated artifacts must be reproducible from a clean checkout.

## Policy

- Developers and CI use the same canonical regeneration entrypoints through the root `justfile`.
- Regeneration must not leave the tree dirty unexpectedly.
- Machine-readable example manifests and generated control-plane indexes are normalized through checked-in scripts.
- Generated control-plane indexes are seed scaffolding; when spec structure changes, regenerate and review them instead of treating the output as self-authenticating.
- Future corpus outputs, release evidence manifests, and derived fixtures must join this policy rather than introducing ad hoc generation steps.

## Current bootstrap-generated paths

- `docs/v1-final/traceability-matrix.md`
- `docs/v1-final/release-evidence-index.md`
- `manifests/corpus-outcome.example.json`
- `manifests/release-evidence.example.json`

The bootstrap scripts treat these files as the declared generated set for dirty-tree enforcement. Later phases may expand the set, but they must do so by updating the generator and policy together.

## Enforcement

- `just fmt` regenerates and normalizes the current generated paths.
- `just determinism` and `just release-check` fail if regeneration changes tracked outputs.
- CI workflows call only `just` recipes rather than duplicating regeneration logic in YAML.
- The canonical generators and validators for these paths live under `scripts/*.ts` and run through Bun.
