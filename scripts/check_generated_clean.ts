import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const targets = [
  "docs/v1-final/traceability-matrix.md",
  "docs/v1-final/release-evidence-index.md",
  "manifests/corpus-outcome.example.json",
  "manifests/release-evidence.example.json"
];

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const args = process.argv.slice(2);
const scopeIndex = args.indexOf("--scope");
const scope = scopeIndex >= 0 ? args[scopeIndex + 1] : "bootstrap";

run("bun", ["run", "scripts/render_control_plane.ts"]);
run("bun", ["run", "scripts/validate_json_examples.ts", "--rewrite"]);

const diff = spawnSync("git", ["diff", "--exit-code", "--", ...targets], {
  cwd: root,
  stdio: "inherit"
});

if (diff.status !== 0) {
  console.error(`Generated artifacts dirty after regeneration for scope: ${scope}`);
  process.exit(diff.status ?? 1);
}

for (const target of targets) {
  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "--", target], {
    cwd: root,
    stdio: "ignore"
  });
  if (tracked.status !== 0) {
    console.error(`Generated artifact is not tracked yet: ${target}`);
    process.exit(1);
  }
}

console.log(`Generated artifacts clean for scope: ${scope}`);
