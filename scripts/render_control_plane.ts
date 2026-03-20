import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const specPath = resolve(root, "docs/spec/SPEC.md");
const checklistPath = resolve(root, "docs/spec/RC_CHECKLIST.md");
const traceabilityPath = resolve(root, "docs/v1-final/traceability-matrix.md");
const evidencePath = resolve(root, "docs/v1-final/release-evidence-index.md");

export type Requirement = {
  line: number;
  heading: string;
  summary: string;
};

type ChecklistItem = {
  id: string;
  section: string;
  criterion: string;
};

type Rule<T> = {
  value: T;
  when: (value: Requirement) => boolean;
};

export type ProofPlan = {
  writer: string;
  reader: string;
  validator: string;
  corpus: string;
  checklistIds: string[];
  status: string;
};

function escapeCell(text: string): string {
  return text.replaceAll("|", "\\|");
}

function matchesAny(text: string, needles: readonly string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

function startsWithAny(text: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => text.startsWith(prefix));
}

export function normalizeRequirement(line: string): string | null {
  const stripped = line.trim().replace(/^[-*]\s*/, "");
  if (!stripped.includes("MUST")) {
    return null;
  }

  if (!stripped.endsWith(":")) {
    return stripped;
  }

  const sentences = stripped.split(/(?<=\.)\s+/);
  const atomicSentences = sentences.filter((sentence) => sentence.includes("MUST") && !sentence.endsWith(":"));
  if (atomicSentences.length === 0) {
    return null;
  }

  return atomicSentences.join(" ");
}

export function extractRequirementsFromLines(lines: readonly string[]): Requirement[] {
  let heading = "Top-level";
  let inFence = false;
  const requirements: Requirement[] = [];

  for (const [index, line] of lines.entries()) {
    const stripped = line.trim();
    if (stripped.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    if (stripped.startsWith("## ") || stripped.startsWith("### ")) {
      heading = stripped.replace(/^#+\s+/, "");
    }

    const summary = normalizeRequirement(line);
    if (!summary) {
      continue;
    }

    requirements.push({
      line: index + 1,
      heading,
      summary
    });
  }

  return requirements;
}

function extractRequirements(): Requirement[] {
  return extractRequirementsFromLines(readFileSync(specPath, "utf8").split(/\r?\n/));
}

export function isGovernanceRequirement(requirement: Requirement): boolean {
  return (
    startsWithAny(requirement.heading, ["1.", "1.1", "5. Conformance Language and Terminology", "6.5"]) ||
    matchesAny(requirement.summary, [
      "extension-only",
      "RFC 2119",
      "RFC 8174",
      "RC status",
      "Appendix B assignments",
      "renumbered or repurposed"
    ])
  );
}

export function isContainerRequirement(requirement: Requirement): boolean {
  return (
    matchesAny(requirement.heading, ["Header", "Directory", "Footer", "Alignment", "Compression"]) ||
    matchesAny(requirement.summary, [
      "`header_size`",
      "`directory_offset`",
      "`directory_length`",
      "`header_flags`",
      "`checksum_kind`",
      "`footer_",
      "`stored_length`",
      "`logical_length`",
      "MMAP_SAFE"
    ])
  );
}

export function isReaderCompatibilityRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.summary, [
    "A reader MUST reject",
    "A reader MUST ignore",
    "reader MUST reject",
    "reader MUST ignore",
    "required_features",
    "optional_features",
    "container_major",
    "SKIPPABLE",
    "required section"
  ]);
}

export function isWriterRejectionRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.summary, [
    "writer MUST reject",
    "writer without a required",
    "MUST reject source inputs",
    "cannot be represented losslessly",
    "rather than approximated"
  ]);
}

export function isCrossSectionRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.summary, [
    "contiguous span",
    "in bounds",
    "must be in bounds",
    "offset +",
    "count)",
    "span ",
    "belongs to the outgoing edge span",
    "resolves to",
    "exactly equal",
    "aligned 1:1",
    "cardinalities MUST exactly equal"
  ]);
}

export function isReservedZeroRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.summary, [
    "reserved bytes MUST be zero",
    "reserved-zero",
    "reserved in GPL v1",
    "MUST write them as zero",
    "padding bits",
    "flags` MUST be zero",
    "unknown `header_flags` bits",
    "unknown `section_flags` bits"
  ]);
}

export function isDeterminismRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.summary, ["deterministic", "byte-identical", "Tie-breaking MUST be deterministic"]);
}

export function isSectionLayoutRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.summary, [
    "MUST use the `",
    "MUST be a flat",
    "MUST exist exactly once",
    "MUST exist at most once",
    "MUST define the canonical profile ordering",
    "MUST be a flat `u32` edge-id array"
  ]);
}

export function isOrderingRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.heading, ["Ordering"]) ||
    matchesAny(requirement.summary, ["MUST be sorted", "row-major", "concatenation of", "grouped by", "ordered last"]);
}

export function isValidatorConformanceRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.summary, [
    "validator MUST",
    "strict validators",
    "MUST fail any file",
    "MUST report an overall pass or fail result",
    "MUST treat all offsets, lengths, counts, and IDs as untrusted input"
  ]);
}

export function isBaseSemanticRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.heading, [
    "Conformance Targets",
    "Normative Versus Advisory Data",
    "Immutable Base File",
    "Street Model",
    "Distance and Offset Semantics",
    "General Rule",
    "Profile Legality and Penalties",
    "Shared Graph Contract",
    "Snap Result Model",
    "Transit Time Model",
    "Transit Feed Identity",
    "TRANSIT_SERVICES",
    "TRANSIT_TRIPS",
    "TRANSIT_STOP_TIMES",
    "TRANSIT_CONNECTIONS",
    "STOP_ANCHOR_REFS",
    "Frequency Handling",
    "Transfer Semantics",
    "Future Realtime Overlays",
    "StopAnchorV1",
    "StringTableV1"
  ]);
}

export function isAppendixFRequirement(requirement: Requirement): boolean {
  return requirement.heading.includes("Appendix F") || requirement.summary.includes("Appendix F");
}

export function isSpecShapeRequirement(requirement: Requirement): boolean {
  return matchesAny(requirement.heading, ["MANIFEST", "StringTableV1", "StopAnchorV1"]) ||
    matchesAny(requirement.summary, [
      "MUST equal `0`",
      "MUST have `logical_length = 100` bytes",
      "The empty string MUST be present at offset `0`",
      "All strings in `STRING_TABLE` MUST be unique"
    ]);
}

function ruleValue<T>(requirement: Requirement, rules: readonly Rule<T>[], fallback: T): T {
  for (const rule of rules) {
    if (rule.when(requirement)) {
      return rule.value;
    }
  }
  return fallback;
}

const writerProofRules: readonly Rule<string>[] = [
  { value: "not-applicable", when: isGovernanceRequirement },
  { value: "writer-reject", when: isWriterRejectionRequirement },
  { value: "writer-layout", when: isContainerRequirement },
  { value: "writer-golden", when: (requirement) => matchesAny(requirement.summary, ["MUST emit", "Appendix F"]) },
  { value: "writer-semantic", when: isOrderingRequirement },
  { value: "writer-semantic", when: isSpecShapeRequirement },
  { value: "writer-semantic", when: isSectionLayoutRequirement }
];

const readerProofRules: readonly Rule<string>[] = [
  { value: "not-applicable", when: isGovernanceRequirement },
  { value: "reader-compat", when: isReaderCompatibilityRequirement },
  { value: "reader-semantic", when: isOrderingRequirement },
  { value: "reader-semantic", when: isSpecShapeRequirement },
  { value: "reader-semantic", when: isBaseSemanticRequirement },
  { value: "reader-semantic", when: isAppendixFRequirement },
  { value: "reader-semantic", when: isValidatorConformanceRequirement },
  { value: "reader-semantic", when: (requirement) => requirement.summary.includes("Readers MUST use normative values") }
];

const validatorProofRules: readonly Rule<string>[] = [
  { value: "not-applicable", when: isGovernanceRequirement },
  { value: "validator-reserved-zero", when: isReservedZeroRequirement },
  { value: "validator-container", when: isContainerRequirement },
  { value: "validator-cross-section", when: isCrossSectionRequirement },
  { value: "validator-semantic", when: () => true }
];

const corpusFixtureRules: readonly Rule<string>[] = [
  { value: "not-applicable", when: isGovernanceRequirement },
  { value: "fixture-compat-edge", when: isReaderCompatibilityRequirement },
  { value: "fixture-minimal-container", when: isContainerRequirement },
  { value: "fixture-dependency-invalid", when: isCrossSectionRequirement },
  { value: "fixture-minimal-valid", when: isOrderingRequirement },
  { value: "fixture-minimal-valid", when: isAppendixFRequirement },
  { value: "fixture-valid-invalid", when: () => true }
];

const releaseEvidenceRules: readonly Rule<string[]>[] = [
  { value: ["RC-4-01", "RC-4-02"], when: (requirement) => requirement.heading.startsWith("6.5") },
  { value: ["RC-2-01", "RC-4-03", "RC-7-02"], when: isGovernanceRequirement },
  { value: ["RC-3-01", "RC-3-02"], when: isValidatorConformanceRequirement },
  { value: ["RC-3-04", "RC-5-02", "RC-6-02"], when: isReaderCompatibilityRequirement },
  { value: ["RC-2-04", "RC-3-02", "RC-5-02"], when: isReservedZeroRequirement },
  { value: ["RC-3-02", "RC-5-02", "RC-6-04"], when: isContainerRequirement },
  { value: ["RC-6-03"], when: isDeterminismRequirement },
  { value: ["RC-2-03", "RC-3-02", "RC-6-01"], when: isOrderingRequirement },
  { value: ["RC-2-03", "RC-3-02", "RC-6-01"], when: isSpecShapeRequirement },
  { value: ["RC-2-03", "RC-3-02", "RC-6-01"], when: isSectionLayoutRequirement },
  { value: ["RC-3-02", "RC-6-01"], when: isWriterRejectionRequirement },
  { value: ["RC-3-02", "RC-5-03", "RC-6-01"], when: isBaseSemanticRequirement },
  { value: ["RC-3-03", "RC-6-01"], when: isAppendixFRequirement },
  { value: ["RC-3-02", "RC-5-02"], when: isCrossSectionRequirement }
];

function renderChecklistIds(ids: readonly string[]): string {
  return ids.length > 0 ? ids.join(", ") : "unmapped";
}

function rowStatus(releaseEvidence: readonly string[]): string {
  return releaseEvidence.length > 0 ? "planned" : "review-needed";
}

export function planRequirement(requirement: Requirement): ProofPlan {
  const writer = ruleValue(requirement, writerProofRules, "writer-semantic");
  const reader = ruleValue(requirement, readerProofRules, "reader-semantic");
  const validator = ruleValue(requirement, validatorProofRules, "validator-semantic");
  const corpus = ruleValue(requirement, corpusFixtureRules, "fixture-valid-invalid");
  const checklistIds = ruleValue(requirement, releaseEvidenceRules, []);

  return {
    writer,
    reader,
    validator,
    corpus,
    checklistIds,
    status: rowStatus(checklistIds)
  };
}

function buildTraceability(): string {
  const rows = extractRequirements().map((requirement) => {
    const requirementId = `SPEC-L${requirement.line.toString().padStart(4, "0")}`;
    const plan = planRequirement(requirement);

    return `| \`${requirementId}\` | \`docs/spec/SPEC.md:${requirement.line}\` | ${escapeCell(requirement.heading)} | ${escapeCell(requirement.summary)} | ${plan.writer} | ${plan.reader} | ${plan.validator} | ${plan.corpus} | ${renderChecklistIds(plan.checklistIds)} | ${plan.status} |`;
  });

  return [
    "# Traceability Matrix",
    "",
    "This generated matrix seeds the clause-level proof-path ledger for GPL v1 final. It lists atomic `MUST` or `MUST NOT` requirements from `docs/spec/SPEC.md` and assigns planned proof types plus related RC checklist IDs.",
    "",
    "Rows marked `review-needed` are intentionally left unmapped rather than pretending confidence the current heuristics do not have.",
    "",
    "| Requirement ID | Spec ref | Section | Requirement summary | Planned writer proof type | Planned reader proof type | Planned validator proof type | Planned corpus fixture type | Related checklist IDs | Status |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
    "Generated by `scripts/render_control_plane.ts`.",
    ""
  ].join("\n");
}

function suggestedArtifactShape(item: ChecklistItem): string {
  if (item.section.includes("RC Scope")) {
    return "scope review note or freeze-ledger entry";
  }
  if (item.section.includes("Document Freeze")) {
    return "spec review note or matrix diff";
  }
  if (item.section.includes("Conformance")) {
    return "traceability matrix row set or conformance report";
  }
  if (item.section.includes("Registry")) {
    return "freeze ledger or registry review note";
  }
  if (item.section.includes("Validation")) {
    return "corpus manifest plus validator fixture results";
  }
  if (item.section.includes("Implementation")) {
    return "writer/reader test report or determinism log";
  }
  if (item.section.includes("Exit")) {
    return "release signoff note";
  }
  return "review note";
}

function ownerArea(section: string): string {
  if (section.includes("Validation")) {
    return "validator/corpus";
  }
  if (section.includes("Implementation")) {
    return "writer/reader/hardening";
  }
  if (section.includes("Registry")) {
    return "governance/spec";
  }
  if (section.includes("Document")) {
    return "spec/governance";
  }
  if (section.includes("Exit")) {
    return "release owner";
  }
  return "control plane";
}

function buildEvidenceIndex(): string {
  const lines = readFileSync(checklistPath, "utf8").split(/\r?\n/);
  let section: string | undefined;
  const counters = new Map<string, number>();
  const rows: string[] = [];

  for (const line of lines) {
    const stripped = line.trim();
    if (stripped.startsWith("## ")) {
      section = stripped.slice(3);
      counters.set(section, 0);
      continue;
    }
    if (!stripped.startsWith("- ") || !section) {
      continue;
    }

    const count = (counters.get(section) ?? 0) + 1;
    counters.set(section, count);
    const item: ChecklistItem = {
      id: `RC-${section.split(".", 1)[0]}-${count.toString().padStart(2, "0")}`,
      section,
      criterion: stripped.slice(2)
    };

    rows.push(
      `| \`${item.id}\` | ${escapeCell(item.section)} | ${escapeCell(item.criterion)} | ${ownerArea(item.section)} | ${escapeCell(suggestedArtifactShape(item))} | planned |`
    );
  }

  return [
    "# Release Evidence Index",
    "",
    "This generated skeleton maps each RC checklist bullet to a suggested evidence shape. It remains intentionally lightweight until later phases land concrete artifact paths.",
    "",
    "| Checklist ID | Checklist section | Criterion | Owner area | Suggested artifact shape | Status |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
    "Generated by `scripts/render_control_plane.ts`.",
    ""
  ].join("\n");
}

if (import.meta.main) {
  writeFileSync(traceabilityPath, buildTraceability(), "utf8");
  writeFileSync(evidencePath, buildEvidenceIndex(), "utf8");

  console.log("Wrote docs/v1-final/traceability-matrix.md");
  console.log("Wrote docs/v1-final/release-evidence-index.md");
}
