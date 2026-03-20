import { describe, expect, test } from "bun:test";
import { extractRequirementsFromLines, normalizeRequirement, planRequirement } from "./render_control_plane";

describe("normalizeRequirement", () => {
  test("skips parent clauses that only introduce sublists", () => {
    expect(normalizeRequirement("- The footer MUST repeat:")).toBeNull();
  });

  test("keeps atomic MUST clauses", () => {
    expect(normalizeRequirement("- `magic` MUST equal `GPL`")).toBe("`magic` MUST equal `GPL`");
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

    expect(requirements).toEqual([
      {
        line: 3,
        heading: "Example",
        summary: "child MUST stay"
      }
    ]);
  });
});

describe("planRequirement", () => {
  test("maps semantic street requirements without reserved-zero false positives", () => {
    const plan = planRequirement({
      line: 472,
      heading: "12.1 Street Model",
      summary:
        "If traversal exists in both directions, the base graph MUST encode one directed edge per traversal direction. Reverse traversal MUST NOT be represented solely by flags on one edge record."
    });

    expect(plan.validator).toBe("validator-semantic");
    expect(plan.checklistIds).toEqual(["RC-3-02", "RC-5-03", "RC-6-01"]);
    expect(plan.status).toBe("planned");
  });

  test("maps reserved flag requirements to strict validation evidence", () => {
    const plan = planRequirement({
      line: 1211,
      heading: "B.10 Core Enums and Flags",
      summary:
        "Unless explicitly assigned below, fixed-layout record `flags` fields are reserved in GPL v1. Writers MUST write them as zero. Strict validators MUST reject non-zero values in reserved positions."
    });

    expect(plan.writer).toBe("writer-semantic");
    expect(plan.validator).toBe("validator-reserved-zero");
    expect(plan.checklistIds).toEqual(["RC-2-04", "RC-3-02", "RC-5-02"]);
  });

  test("maps ordering clauses to semantic proof lanes", () => {
    const plan = planRequirement({
      line: 1531,
      heading: "D.1 Container Ordering",
      summary: "`STRING_TABLE` strings MUST be unique and sorted lexicographically by UTF-8 bytes, with the empty string first"
    });

    expect(plan.writer).toBe("writer-semantic");
    expect(plan.reader).toBe("reader-semantic");
    expect(plan.corpus).toBe("fixture-minimal-valid");
    expect(plan.checklistIds).toEqual(["RC-2-03", "RC-3-02", "RC-6-01"]);
  });

  test("maps writer rejection clauses to rejection evidence", () => {
    const plan = planRequirement({
      line: 960,
      heading: "17.4 Transfer Semantics",
      summary:
        "A writer without a required transfer-constraints extension MUST reject any feed whose transfer constraints cannot be losslessly represented by GPL v1 base street-routed transfers plus base schedule semantics."
    });

    expect(plan.writer).toBe("writer-reject");
    expect(plan.checklistIds).toEqual(["RC-3-02", "RC-6-01"]);
  });
});
