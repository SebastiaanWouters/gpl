import { describe, expect, test } from "bun:test";
import {
  extractRequirementsFromLines,
  normalizeRequirement,
  planRequirement,
  isGovernanceRequirement,
  isContainerRequirement,
  isReaderCompatibilityRequirement,
  isWriterRejectionRequirement,
  isCrossSectionRequirement,
  isReservedZeroRequirement,
  isDeterminismRequirement,
  isSectionLayoutRequirement,
  isOrderingRequirement,
  isValidatorConformanceRequirement,
  isBaseSemanticRequirement,
  isAppendixFRequirement,
  isSpecShapeRequirement,
  type Requirement,
} from "./render_control_plane";

describe("normalizeRequirement", () => {
  test("skips parent clauses that only introduce sublists", () => {
    expect(normalizeRequirement("- The footer MUST repeat:")).toBeNull();
  });

  test("keeps atomic MUST clauses", () => {
    expect(normalizeRequirement("- `magic` MUST equal `GPL`")).toBe("`magic` MUST equal `GPL`");
  });

  test("returns null for lines without MUST", () => {
    expect(normalizeRequirement("- some regular text")).toBeNull();
  });

  test("strips leading bullet markers", () => {
    const result = normalizeRequirement("* writers MUST validate");
    expect(result).not.toBeNull();
    expect(result!.startsWith("*")).toBe(false);
    expect(result!.startsWith("-")).toBe(false);
    expect(result).toContain("MUST");
  });
});

describe("extractRequirementsFromLines", () => {
  test("ignores fenced code and parent clauses", () => {
    const requirements = extractRequirementsFromLines([
      "## Example",
      "- Parent MUST contain:",
      "- child MUST stay",
      "```",
      "- code MUST stay ignored",
      "```"
    ]);

    expect(requirements).toHaveLength(1);
    expect(requirements[0].heading).toBe("Example");
    expect(requirements[0].summary).toContain("MUST");
    expect(requirements[0].line).toBe(3);
  });

  test("tracks heading context across lines", () => {
    const requirements = extractRequirementsFromLines([
      "## Section A",
      "- A MUST do something",
      "## Section B",
      "- B MUST do something else"
    ]);

    expect(requirements).toHaveLength(2);
    expect(requirements[0].heading).toBe("Section A");
    expect(requirements[1].heading).toBe("Section B");
  });

  test("uses 1-based line numbers", () => {
    const requirements = extractRequirementsFromLines([
      "filler",
      "filler",
      "- X MUST be valid"
    ]);

    expect(requirements).toHaveLength(1);
    expect(requirements[0].line).toBe(3);
  });
});

// ── Classifier predicate tests ──────────────────────────────────────

type ClassifierCase = {
  name: string;
  requirement: Requirement;
  expected: (req: Requirement) => boolean;
  shouldMatch: boolean;
};

const classifierCases: ClassifierCase[] = [
  {
    name: "governance: heading starting with 1.",
    requirement: { line: 1, heading: "1. Introduction", summary: "X MUST Y" },
    expected: isGovernanceRequirement,
    shouldMatch: true,
  },
  {
    name: "governance: RFC 2119 mention",
    requirement: { line: 1, heading: "5. Conformance Language and Terminology", summary: "Terms as defined in RFC 2119 MUST apply" },
    expected: isGovernanceRequirement,
    shouldMatch: true,
  },
  {
    name: "governance: does not match unrelated requirement",
    requirement: { line: 1, heading: "12.1 Street Model", summary: "edges MUST be directed" },
    expected: isGovernanceRequirement,
    shouldMatch: false,
  },
  {
    name: "container: header_size mention",
    requirement: { line: 1, heading: "7. Header", summary: "`header_size` MUST be 100" },
    expected: isContainerRequirement,
    shouldMatch: true,
  },
  {
    name: "container: heading with Compression",
    requirement: { line: 1, heading: "9. Compression", summary: "data MUST be compressed" },
    expected: isContainerRequirement,
    shouldMatch: true,
  },
  {
    name: "reader compat: reader MUST reject",
    requirement: { line: 1, heading: "Versioning", summary: "A reader MUST reject unknown major versions" },
    expected: isReaderCompatibilityRequirement,
    shouldMatch: true,
  },
  {
    name: "reader compat: SKIPPABLE mention",
    requirement: { line: 1, heading: "Sections", summary: "SKIPPABLE sections MUST be ignored" },
    expected: isReaderCompatibilityRequirement,
    shouldMatch: true,
  },
  {
    name: "writer rejection: writer MUST reject",
    requirement: { line: 1, heading: "17.4 Transfer Semantics", summary: "A writer MUST reject feeds that cannot be represented" },
    expected: isWriterRejectionRequirement,
    shouldMatch: true,
  },
  {
    name: "writer rejection: cannot be represented losslessly",
    requirement: { line: 1, heading: "Semantics", summary: "data that cannot be represented losslessly MUST be rejected" },
    expected: isWriterRejectionRequirement,
    shouldMatch: true,
  },
  {
    name: "cross-section: contiguous span",
    requirement: { line: 1, heading: "Graph", summary: "edges MUST form a contiguous span" },
    expected: isCrossSectionRequirement,
    shouldMatch: true,
  },
  {
    name: "reserved zero: reserved in GPL v1",
    requirement: { line: 1, heading: "B.10 Core Enums and Flags", summary: "fields are reserved in GPL v1" },
    expected: isReservedZeroRequirement,
    shouldMatch: true,
  },
  {
    name: "reserved zero: MUST write them as zero",
    requirement: { line: 1, heading: "Flags", summary: "Writers MUST write them as zero" },
    expected: isReservedZeroRequirement,
    shouldMatch: true,
  },
  {
    name: "determinism: deterministic mention",
    requirement: { line: 1, heading: "Build", summary: "output MUST be deterministic" },
    expected: isDeterminismRequirement,
    shouldMatch: true,
  },
  {
    name: "section layout: MUST use the backtick pattern",
    requirement: { line: 1, heading: "Sections", summary: "MUST use the `EdgeV1` record type" },
    expected: isSectionLayoutRequirement,
    shouldMatch: true,
  },
  {
    name: "ordering: heading with Ordering",
    requirement: { line: 1, heading: "D.1 Container Ordering", summary: "strings MUST be sorted" },
    expected: isOrderingRequirement,
    shouldMatch: true,
  },
  {
    name: "ordering: MUST be sorted",
    requirement: { line: 1, heading: "StringTable", summary: "entries MUST be sorted lexicographically" },
    expected: isOrderingRequirement,
    shouldMatch: true,
  },
  {
    name: "validator conformance: validator MUST",
    requirement: { line: 1, heading: "Conformance", summary: "A validator MUST check all sections" },
    expected: isValidatorConformanceRequirement,
    shouldMatch: true,
  },
  {
    name: "base semantic: Street Model heading",
    requirement: { line: 1, heading: "Street Model", summary: "edges MUST be directed" },
    expected: isBaseSemanticRequirement,
    shouldMatch: true,
  },
  {
    name: "appendix F: heading contains Appendix F",
    requirement: { line: 1, heading: "Appendix F Golden Files", summary: "output MUST match" },
    expected: isAppendixFRequirement,
    shouldMatch: true,
  },
  {
    name: "spec shape: MANIFEST heading",
    requirement: { line: 1, heading: "MANIFEST", summary: "entries MUST be present" },
    expected: isSpecShapeRequirement,
    shouldMatch: true,
  },
];

describe("classifier predicates", () => {
  for (const { name, requirement, expected, shouldMatch } of classifierCases) {
    test(name, () => {
      expect(expected(requirement)).toBe(shouldMatch);
    });
  }
});

// ── planRequirement structural invariant tests ──────────────────────

describe("planRequirement", () => {
  test("status is 'planned' when checklistIds are non-empty", () => {
    const plan = planRequirement({
      line: 472,
      heading: "12.1 Street Model",
      summary: "the base graph MUST encode one directed edge per traversal direction",
    });

    expect(plan.checklistIds.length).toBeGreaterThan(0);
    expect(plan.status).toBe("planned");
  });

  test("governance requirements get not-applicable for writer, reader, and validator", () => {
    const plan = planRequirement({
      line: 10,
      heading: "1. Introduction",
      summary: "implementations MUST follow RFC 2119 keywords",
    });

    expect(isGovernanceRequirement({ line: 10, heading: "1. Introduction", summary: "implementations MUST follow RFC 2119 keywords" })).toBe(true);
    expect(plan.writer).toBe("not-applicable");
    expect(plan.reader).toBe("not-applicable");
    expect(plan.validator).toBe("not-applicable");
  });

  test("reserved-zero requirements get validator-reserved-zero", () => {
    const req: Requirement = {
      line: 1211,
      heading: "B.10 Core Enums and Flags",
      summary: "fixed-layout record `flags` fields are reserved in GPL v1. Writers MUST write them as zero.",
    };

    expect(isReservedZeroRequirement(req)).toBe(true);
    const plan = planRequirement(req);
    expect(plan.validator).toBe("validator-reserved-zero");
  });

  test("writer-rejection requirements get writer-reject", () => {
    const req: Requirement = {
      line: 960,
      heading: "17.4 Transfer Semantics",
      summary: "A writer without a required transfer-constraints extension MUST reject any feed whose transfer constraints cannot be losslessly represented",
    };

    expect(isWriterRejectionRequirement(req)).toBe(true);
    const plan = planRequirement(req);
    expect(plan.writer).toBe("writer-reject");
  });

  test("ordering requirements get writer-semantic and reader-semantic", () => {
    const req: Requirement = {
      line: 1531,
      heading: "D.1 Container Ordering",
      summary: "strings MUST be sorted lexicographically by UTF-8 bytes",
    };

    expect(isOrderingRequirement(req)).toBe(true);
    const plan = planRequirement(req);
    expect(plan.writer).toBe("writer-semantic");
    expect(plan.reader).toBe("reader-semantic");
    expect(plan.corpus).toBe("fixture-minimal-valid");
  });

  test("container requirements get validator-container", () => {
    const req: Requirement = {
      line: 100,
      heading: "7. Header",
      summary: "`header_size` MUST equal 100",
    };

    expect(isContainerRequirement(req)).toBe(true);
    const plan = planRequirement(req);
    expect(plan.validator).toBe("validator-container");
  });

  test("all proof plan fields are populated strings or arrays", () => {
    const plan = planRequirement({
      line: 500,
      heading: "12.1 Street Model",
      summary: "edges MUST have a valid target node",
    });

    expect(typeof plan.writer).toBe("string");
    expect(typeof plan.reader).toBe("string");
    expect(typeof plan.validator).toBe("string");
    expect(typeof plan.corpus).toBe("string");
    expect(Array.isArray(plan.checklistIds)).toBe(true);
    expect(typeof plan.status).toBe("string");
    expect(plan.writer.length).toBeGreaterThan(0);
    expect(plan.reader.length).toBeGreaterThan(0);
    expect(plan.validator.length).toBeGreaterThan(0);
    expect(plan.corpus.length).toBeGreaterThan(0);
  });

  test("checklistIds entries match RC-N-NN pattern", () => {
    const plan = planRequirement({
      line: 472,
      heading: "12.1 Street Model",
      summary: "the base graph MUST encode one directed edge per traversal direction",
    });

    for (const id of plan.checklistIds) {
      expect(id).toMatch(/^RC-\d+-\d{2}$/);
    }
  });

  test("status is review-needed when no checklist ids are mapped", () => {
    // A requirement that doesn't match any releaseEvidenceRules
    const plan = planRequirement({
      line: 9999,
      heading: "99. Hypothetical",
      summary: "something MUST happen but no rule matches",
    });

    expect(plan.checklistIds).toEqual([]);
    expect(plan.status).toBe("review-needed");
  });
});
