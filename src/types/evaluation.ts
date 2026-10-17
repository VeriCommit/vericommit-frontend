// Types for VeriCommit MVP evaluation contract (POST /api/v1/evaluations).
// Source of truth: ../vericommit-backend/docs/API_CONTRACT.md (approved baseline, D1–D8).
// No extra fields: the backend rejects undocumented fields.

export type EvidenceSource = "github" | "sample";

export interface EvaluationRequest {
  project_name: string;
  /** Required in both evidence modes (github and sample); validated as a GitHub repo URL. */
  repository_url: string;
  milestone: {
    title: string;
    description: string;
    acceptance_criteria: string[];
  };
  evidence_source: EvidenceSource;
}

export interface EvidenceReference {
  /** Nonblank string (e.g. "pull_request"); not a closed enum per contract D4. */
  type: string;
  title: string;
  /** Present in every reference; null only for labelled sample evidence with no genuine URL. */
  url: string | null;
}

/** Exactly the three contract statuses. */
export type CriterionStatus = "supported" | "insufficient_evidence" | "uncertain";

export interface CriterionResult {
  criterion: string;
  status: CriterionStatus;
  explanation: string;
  evidence: EvidenceReference[];
}

export interface EvaluationResponse {
  evaluation_id: string;
  project_name: string;
  milestone_title: string;
  overall_summary: string;
  criteria_results: CriterionResult[];
  suggested_next_steps: string[];
  limitations: string[];
  /** Literal true; AI never makes the final decision. */
  human_review_required: true;
}

/**
 * Error codes and their approved HTTP mappings (API_CONTRACT.md §6, D8):
 * - INVALID_REQUEST -> 400
 * - INVALID_REPOSITORY_URL -> 400
 * - REPOSITORY_ACCESS_DENIED -> 403
 * - EVIDENCE_RETRIEVAL_FAILED -> 502 (504 on upstream evidence retrieval timeout)
 * - EVALUATION_FAILED -> 502 (504 on upstream AI evaluation timeout)
 * A 504 reuses the failed operation's existing code; no separate timeout code.
 */
export type ErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_REPOSITORY_URL"
  | "REPOSITORY_ACCESS_DENIED"
  | "EVIDENCE_RETRIEVAL_FAILED"
  | "EVALUATION_FAILED";

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
}

export interface ApiError {
  error: ApiErrorBody;
}
