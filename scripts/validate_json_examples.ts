import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { type } from "arktype";
import { parseEnumFlag } from "./lib/cli";
import { manifestKinds, root } from "./lib/bootstrap";

const corpusSchema = resolve(root, "schemas/corpus-outcome.schema.json");
const releaseSchema = resolve(root, "schemas/release-evidence-manifest.schema.json");
const corpusExample = resolve(root, "manifests/corpus-outcome.example.json");
const releaseExample = resolve(root, "manifests/release-evidence.example.json");

const corpusEntry = type({
  fixture_id: "string >= 1",
  kind: "'valid' | 'invalid'",
  expected_action: "'accept' | 'reject'",
  "failure_class?": "string | null",
  "spec_refs?": "string[]",
  "notes?": "string"
});

const corpusDocument = corpusEntry.array();

const releaseItem = type({
  checklist_id: "string >= 1",
  artifact_path: "string >= 1",
  artifact_type: "'doc' | 'manifest' | 'fixture' | 'test' | 'benchmark' | 'review'",
  status: "'placeholder' | 'planned' | 'landed'",
  "spec_refs?": "string[]",
  "notes?": "string"
});

const releaseDocument = type({
  manifest_version: "'1.0'",
  items: releaseItem.array()
});

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ensureSchemaShape(path: string, expectedRootType: "array" | "object"): void {
  const schema = loadJson(path);
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    throw new Error(`${path} must be a JSON object schema`);
  }
  const record = schema as Record<string, unknown>;
  if (record.type !== expectedRootType) {
    throw new Error(`${path} must declare root type ${expectedRootType}`);
  }
}

function ensureCorpus(data: unknown): void {
  ensureSchemaShape(corpusSchema, "array");
  corpusDocument.assert(data);
  if (!Array.isArray(data)) {
    throw new Error("corpus example must be a JSON array");
  }
  for (const [index, item] of data.entries()) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error(`corpus item ${index} must be an object`);
    }
    const record = item as Record<string, unknown>;
    for (const key of ["fixture_id", "kind", "expected_action"]) {
      if (!(key in record)) {
        throw new Error(`corpus item ${index} missing required key: ${key}`);
      }
    }
    if (record.kind !== "valid" && record.kind !== "invalid") {
      throw new Error(`corpus item ${index} has invalid kind`);
    }
    if (record.expected_action !== "accept" && record.expected_action !== "reject") {
      throw new Error(`corpus item ${index} has invalid expected_action`);
    }
  }
}

function ensureRelease(data: unknown): void {
  ensureSchemaShape(releaseSchema, "object");
  releaseDocument.assert(data);
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("release evidence example must be a JSON object");
  }
  const record = data as Record<string, unknown>;
  if (record.manifest_version !== "1.0") {
    throw new Error("release evidence manifest_version must equal 1.0");
  }
  if (!Array.isArray(record.items)) {
    throw new Error("release evidence items must be an array");
  }
  for (const [index, item] of record.items.entries()) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error(`release item ${index} must be an object`);
    }
    const entry = item as Record<string, unknown>;
    for (const key of ["checklist_id", "artifact_path", "artifact_type", "status"]) {
      if (!(key in entry)) {
        throw new Error(`release item ${index} missing required key: ${key}`);
      }
    }
  }
}

const args = process.argv.slice(2);
const rewrite = args.includes("--rewrite");
const only = parseEnumFlag(args, "--only", manifestKinds);

if (!only || only === "corpus") {
  const data = loadJson(corpusExample);
  ensureCorpus(data);
  if (rewrite) {
    writeJson(corpusExample, data);
  }
  console.log("Validated manifests/corpus-outcome.example.json");
}

if (!only || only === "release") {
  const data = loadJson(releaseExample);
  ensureRelease(data);
  if (rewrite) {
    writeJson(releaseExample, data);
  }
  console.log("Validated manifests/release-evidence.example.json");
}
