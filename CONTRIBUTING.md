# Contributing

This repository is still in the GPL v1 finalization bootstrap phase. The canonical local and CI entrypoints live in the root `justfile`.

## Required tools

- `bun`
- `git`
- `just`
- `rustup` with the pinned toolchain from `rust-toolchain.toml`

The pinned Rust toolchain is the currently supported development toolchain for this repository. It is not yet an MSRV promise.

## Bootstrap

1. Install the required tools.
2. Run `just setup` to print the expected local toolchain surface.
3. Run `just doctor` to verify fixture presence and repository prerequisites.

Bootstrap scripts are written in TypeScript and run through Bun.

## Toolchain upgrade rule

- Upgrade `rust-toolchain.toml`, workflow setup, and bootstrap docs together.
- Keep `package.json`, `bun.lock`, and the TypeScript script surface aligned when Bun tooling changes.
- Run `just ci` before landing any toolchain bump.

## Verification loops

- Fast pre-PR loop: `just fmt && just lint && just test-fast`
- Full local loop: `just test && just corpus && just determinism && just release-check`
- Full CI parity: `just ci`

## Fixtures

- Monaco and Aachen under `fixtures/` are mandatory release fixtures.
- Do not rename or move fixture inputs casually; the control-plane docs reference their current paths.

## Generated artifacts

- Generated bootstrap artifacts must be reproducible from a clean checkout.
- Run `just fmt` to normalize generated docs and example manifests.
- Run `just determinism` or `just release-check` before opening a PR; both fail if regeneration leaves the tree dirty.

## Workflow policy

- Keep developer and CI entrypoints aligned through `just`; do not add bespoke workflow-only shell recipes when a `just` recipe should exist instead.
- Keep commits small and logically grouped.
- When work touches the `.gpl` bytes or reader/writer conformance, update `docs/spec/SPEC.md` first or alongside code.
