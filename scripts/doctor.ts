import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { parseEnumFlag } from "./lib/cli";
import { doctorSurfaces, fixturePaths, requiredPaths, root, surfaceRequirements } from "./lib/bootstrap";

function requirePaths(paths: readonly string[]): string[] {
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
const surface = parseEnumFlag(args, "--surface", doctorSurfaces);

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
  errors.push(...requirePaths(surfaceRequirements[surface]));
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exit(1);
}

console.log(surface ? `Doctor OK for surface: ${surface}` : "Doctor OK");
