// Runtime shape checks for backend responses. The backend may return error
// codes outside our TypeScript union, so error codes are handled as plain
// strings at runtime.

import type {
  CriterionStatus,
  EvaluationResponse,
  EvidenceReference,
} from "@/types/evaluation";

const CRITERION_STATUSES: readonly CriterionStatus[] = [
  "supported",
  "insufficient_evidence",
  "uncertain",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCriterionStatus(value: unknown): value is CriterionStatus {
  return (
    typeof value === "string" &&
    (CRITERION_STATUSES as readonly string[]).includes(value)
  );
}

function isEvidenceReference(value: unknown): value is EvidenceReference {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    (typeof value.url === "string" || value.url === null)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Validate an unknown value against the EvaluationResponse contract shape. */
export function isEvaluationResponse(
  value: unknown,
): value is EvaluationResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.evaluation_id !== "string" ||
    typeof value.project_name !== "string" ||
    typeof value.milestone_title !== "string" ||
    typeof value.overall_summary !== "string"
  ) {
    return false;
  }

  if (!Array.isArray(value.criteria_results)) {
    return false;
  }

  const criteriaAreValid = value.criteria_results.every(
    (result) =>
      isRecord(result) &&
      typeof result.criterion === "string" &&
      isCriterionStatus(result.status) &&
      typeof result.explanation === "string" &&
      Array.isArray(result.evidence) &&
      result.evidence.every(isEvidenceReference),
  );
  if (!criteriaAreValid) {
    return false;
  }

  return (
    isStringArray(value.suggested_next_steps) &&
    isStringArray(value.limitations) &&
    value.human_review_required === true
  );
}

export interface ParsedErrorEnvelope {
  code: string;
  message: string;
}

/** Parse the `{ error: { code, message } }` envelope, or null when malformed. */
export function parseErrorEnvelope(
  value: unknown,
): ParsedErrorEnvelope | null {
  if (!isRecord(value) || !isRecord(value.error)) {
    return null;
  }
  const { code, message } = value.error;
  if (typeof code !== "string" || typeof message !== "string") {
    return null;
  }
  return { code, message };
}
