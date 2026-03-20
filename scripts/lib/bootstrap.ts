import { resolve } from "node:path";

export const root = resolve(import.meta.dir, "..", "..");

export const requiredPaths = [
  "docs/spec/SPEC.md",
  "docs/spec/RC_CHECKLIST.md",
  "docs/v1-final/freeze-ledger.md",
  "docs/v1-final/appendix-b-freeze-matrix.md",
  "docs/v1-final/compatibility-matrix.md",
  "docs/v1-final/traceability-matrix.md",
  "docs/v1-final/release-evidence-index.md",
  "docs/adr/0001-v1-architecture-and-policy.md",
  "docs/dev/workflows.md",
  "docs/policies/generated-artifacts.md",
  "schemas/corpus-outcome.schema.json",
  "schemas/release-evidence-manifest.schema.json",
  "manifests/corpus-outcome.example.json",
  "manifests/release-evidence.example.json",
  ".github/workflows/pr-fast.yml",
  ".github/workflows/pr-full.yml",
  ".github/workflows/nightly.yml",
  ".github/workflows/release.yml",
  "justfile",
  "rust-toolchain.toml",
  "package.json",
  "tsconfig.json"
] as const;

export const fixturePaths = [
  "fixtures/monaco/monaco.osm.obf",
  "fixtures/monaco/monaco-gtfs.zip",
  "fixtures/aachen/aachen.osm.obf",
  "fixtures/aachen/aachen-gtfs.zip"
] as const;

export const generatedArtifacts = [
  "docs/v1-final/traceability-matrix.md",
  "docs/v1-final/release-evidence-index.md",
  "manifests/corpus-outcome.example.json",
  "manifests/release-evidence.example.json"
] as const;

export const surfaceRequirements = {
  lint: ["schemas/corpus-outcome.schema.json", "schemas/release-evidence-manifest.schema.json"],
  "test-fast": fixturePaths,
  fuzz: ["docs/dev/workflows.md", ".github/workflows/nightly.yml"],
  bench: ["docs/dev/workflows.md", ".github/workflows/nightly.yml"],
  release: ["docs/policies/generated-artifacts.md", ".github/workflows/release.yml"]
} as const;

export type DoctorSurface = keyof typeof surfaceRequirements;
export const doctorSurfaces = Object.keys(surfaceRequirements) as DoctorSurface[];

export const manifestKinds = ["corpus", "release"] as const;
export type ManifestKind = (typeof manifestKinds)[number];
