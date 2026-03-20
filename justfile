set shell := ["bash", "-euo", "pipefail", "-c"]

default:
    @just --list

setup:
    bun run scripts/doctor.ts --setup

doctor:
    bun run scripts/doctor.ts

fmt:
    bun run scripts/render_control_plane.ts
    bun run scripts/validate_json_examples.ts --rewrite

lint:
    bun run scripts/doctor.ts --surface lint
    bun run scripts/validate_json_examples.ts
    bun run typecheck

test-fast:
    bun run scripts/doctor.ts --surface test-fast
    bun run scripts/validate_json_examples.ts

test:
    just test-fast
    bun run scripts/check_generated_clean.ts --scope bootstrap

corpus:
    bun run scripts/validate_json_examples.ts --only corpus

determinism:
    bun run scripts/check_generated_clean.ts --scope determinism

fuzz:
    bun run scripts/doctor.ts --surface fuzz

bench:
    bun run scripts/doctor.ts --surface bench

release-check:
    bun run scripts/doctor.ts --surface release
    bun run scripts/validate_json_examples.ts
    bun run scripts/check_generated_clean.ts --scope release

ci:
    just doctor
    just fmt
    just lint
    just test-fast
    just test
    just corpus
    just determinism
    just fuzz
    just bench
    just release-check
