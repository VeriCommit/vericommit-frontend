// Pure display helper for the evaluation report.
//
// Groups criteria results by status for display. The backend's order is
// preserved within each group, and no criterion is dropped or reclassified.

import type { CriterionResult, CriterionStatus } from "@/types/evaluation";

export interface CriterionGroup {
  status: CriterionStatus;
  heading: string;
  results: CriterionResult[];
}

const GROUP_ORDER: readonly CriterionStatus[] = [
  "supported",
  "insufficient_evidence",
  "uncertain",
];

const GROUP_HEADINGS: Record<CriterionStatus, string> = {
  supported: "Supported",
  insufficient_evidence: "Insufficient evidence",
  uncertain: "Uncertain",
};

/**
 * Group criteria results by status in the fixed order:
 * supported, insufficient_evidence, uncertain.
 * Groups with no results are omitted; order within a group is preserved.
 */
export function groupCriteriaByStatus(
  results: CriterionResult[],
): CriterionGroup[] {
  return GROUP_ORDER.map((status) => ({
    status,
    heading: GROUP_HEADINGS[status],
    results: results.filter((result) => result.status === status),
  })).filter((group) => group.results.length > 0);
}
