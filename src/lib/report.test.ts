import { describe, expect, it } from "vitest";
import type { CriterionResult, CriterionStatus } from "@/types/evaluation";
import { groupCriteriaByStatus } from "./report";

function result(
  criterion: string,
  status: CriterionStatus,
): CriterionResult {
  return { criterion, status, explanation: `${criterion} explanation`, evidence: [] };
}

describe("groupCriteriaByStatus", () => {
  it("returns groups in supported, insufficient_evidence, uncertain order", () => {
    const groups = groupCriteriaByStatus([
      result("c1", "uncertain"),
      result("c2", "supported"),
      result("c3", "insufficient_evidence"),
    ]);
    expect(groups.map((g) => g.status)).toEqual([
      "supported",
      "insufficient_evidence",
      "uncertain",
    ]);
  });

  it("preserves backend order within each group", () => {
    const groups = groupCriteriaByStatus([
      result("supported-first", "supported"),
      result("uncertain-first", "uncertain"),
      result("supported-second", "supported"),
      result("uncertain-second", "uncertain"),
    ]);
    const supported = groups.find((g) => g.status === "supported");
    const uncertain = groups.find((g) => g.status === "uncertain");
    expect(supported?.results.map((r) => r.criterion)).toEqual([
      "supported-first",
      "supported-second",
    ]);
    expect(uncertain?.results.map((r) => r.criterion)).toEqual([
      "uncertain-first",
      "uncertain-second",
    ]);
  });

  it("omits empty groups", () => {
    const groups = groupCriteriaByStatus([
      result("only-supported", "supported"),
    ]);
    expect(groups.map((g) => g.status)).toEqual(["supported"]);
  });

  it("returns no groups for an empty result list", () => {
    expect(groupCriteriaByStatus([])).toEqual([]);
  });

  it("never drops or reclassifies a criterion", () => {
    const input = [
      result("a", "supported"),
      result("b", "insufficient_evidence"),
      result("c", "uncertain"),
      result("d", "supported"),
      result("e", "insufficient_evidence"),
    ];
    const groups = groupCriteriaByStatus(input);
    const grouped = groups.flatMap((g) => g.results);
    expect(grouped.length).toBe(input.length);
    expect(new Set(grouped.map((r) => r.criterion)).size).toBe(input.length);
    for (const group of groups) {
      for (const item of group.results) {
        expect(item.status).toBe(group.status);
      }
    }
  });

  it("assigns the expected headings", () => {
    const groups = groupCriteriaByStatus([
      result("a", "supported"),
      result("b", "insufficient_evidence"),
      result("c", "uncertain"),
    ]);
    expect(groups.map((g) => g.heading)).toEqual([
      "Supported",
      "Insufficient evidence",
      "Uncertain",
    ]);
  });
});
