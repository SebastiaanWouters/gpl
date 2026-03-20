# Development Workflows

This document defines the canonical CI stages and their intent. Workflow YAML files implement this policy by calling the root `justfile`.

| Workflow | Trigger | Goal | Owner area | Required check name | Canonical commands |
| --- | --- | --- | --- | --- | --- |
| `PR-fast` | pull requests | cheap branch-protection checks | workflow/DX | `PR-fast / pr-fast` | `just doctor`, `just fmt`, `just lint`, `just test-fast` |
| `PR-full` | pull requests | slower confidence checks still suitable for PRs | workflow/DX + release quality | `PR-full / pr-full` | `just test`, `just corpus`, `just determinism`, `just release-check` |
| `nightly` | scheduled/manual | heavier non-blocking checks and rehearsal surfaces | hardening/bench | `nightly / nightly` | `just fuzz`, `just bench` |
| `release` | manual/tagged release prep | final gated verification surface | release owner | `release / release-check` | `just ci` |

## Ownership model

- Contributor and CI entrypoints stay aligned through `just`.
- Fast checks should stay cheap enough for merge-heavy work.
- Heavy jobs belong in nightly or release paths unless they become essential PR gates.

## Current bootstrap stance

- This repository does not yet have the full Rust implementation.
- The workflow surface already exists so later phases can plug real writer, reader, validator, corpus, and benchmark work into stable commands instead of changing CI topology midstream.
- Bootstrap checks and generated control-plane artifacts are implemented with Bun-run TypeScript scripts.
