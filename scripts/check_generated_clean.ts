import { spawnSync } from "node:child_process";
import { parseEnumFlag } from "./lib/cli";
import { generatedArtifacts, root } from "./lib/bootstrap";

const scopes = ["bootstrap", "determinism", "release"] as const;

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const args = process.argv.slice(2);
const scope = parseEnumFlag(args, "--scope", scopes) ?? "bootstrap";

run("bun", ["run", "scripts/render_control_plane.ts"]);
run("bun", ["run", "scripts/validate_json_examples.ts", "--rewrite"]);

const diff = spawnSync("git", ["diff", "--exit-code", "--", ...generatedArtifacts], {
  cwd: root,
  stdio: "inherit"
});

if (diff.status !== 0) {
  console.error(`Generated artifacts dirty after regeneration for scope: ${scope}`);
  process.exit(diff.status ?? 1);
}

const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "--", ...generatedArtifacts], {
  cwd: root,
  stdio: "ignore"
});

if (tracked.status !== 0) {
  console.error("One or more generated artifacts are not tracked yet.");
  process.exit(1);
}

console.log(`Generated artifacts clean for scope: ${scope}`);
