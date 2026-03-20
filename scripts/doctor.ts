import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");

const requiredPaths = [
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
];

const fixturePaths = [
  "fixtures/monaco/monaco.osm.obf",
  "fixtures/monaco/monaco-gtfs.zip",
  "fixtures/aachen/aachen.osm.obf",
  "fixtures/aachen/aachen-gtfs.zip"
];

const surfaceRequirements: Record<string, string[]> = {
  lint: ["schemas/corpus-outcome.schema.json", "schemas/release-evidence-manifest.schema.json"],
  "test-fast": fixturePaths,
  fuzz: ["docs/dev/workflows.md", ".github/workflows/nightly.yml"],
  bench: ["docs/dev/workflows.md", ".github/workflows/nightly.yml"],
  release: ["docs/policies/generated-artifacts.md", ".github/workflows/release.yml"]
};

function requirePaths(paths: string[]): string[] {
  return paths
    .filter((path) => !existsSync(resolve(root, path)))
    .map((path) => `missing required path: ${path}`);
}

function printSetupHints(): void {
  console.log("Bootstrap expectations:");
  console.log("- install Bun 1.3.11 or newer compatible with package.json");
  console.log("- install just: https://github.com/casey/just");
  console.log("- install rustup and the pinned toolchain from rust-toolchain.toml");
  console.log("- ensure git is available");
  console.log("- run `just doctor` after setup");
}

function requireCommand(command: string, args: string[] = ["--version"]): string[] {
  const result = spawnSync(command, args, { cwd: root, stdio: "ignore" });
  if (result.error || result.status !== 0) {
    return [`required tool not available: ${command}`];
  }
  return [];
}

function requirePinnedRustToolchain(): string[] {
  const contents = readFileSync(resolve(root, "rust-toolchain.toml"), "utf8");
  const match = contents.match(/channel = "([^"]+)"/);
  if (!match) {
    return ["unable to read pinned Rust toolchain from rust-toolchain.toml"];
  }
  const pinned = match[1];
  const result = spawnSync("rustup", ["toolchain", "list"], { cwd: root, encoding: "utf8" });
  if (result.error || result.status !== 0) {
    return ["required tool not available: rustup"];
  }
  if (!result.stdout.includes(pinned)) {
    return [`pinned Rust toolchain not installed: ${pinned}`];
  }
  return [];
}

const args = process.argv.slice(2);
const setup = args.includes("--setup");
const surfaceIndex = args.indexOf("--surface");
const surface = surfaceIndex >= 0 ? args[surfaceIndex + 1] : undefined;

if (setup) {
  printSetupHints();
}

const errors = [
  ...requireCommand("bun"),
  ...requireCommand("just"),
  ...requireCommand("git"),
  ...requirePaths(requiredPaths),
  ...requirePaths(fixturePaths),
  ...requirePinnedRustToolchain()
];

if (surface) {
  if (!(surface in surfaceRequirements)) {
    console.error(`ERROR: unknown surface: ${surface}`);
    process.exit(1);
  }
  errors.push(...requirePaths(surfaceRequirements[surface]));
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exit(1);
}

console.log(surface ? `Doctor OK for surface: ${surface}` : "Doctor OK");
