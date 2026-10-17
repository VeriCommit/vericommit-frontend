// Maps an evaluate() failure to a user-facing message.
//
// The backend error code is a plain string at runtime, so codes are checked
// against a known set. Message text from the backend is never matched.

import type { EvaluateResult } from "@/lib/api/client";

export type EvaluateFailure = Extract<EvaluateResult, { ok: false }>;

// Exact messages from INTEGRATION_DECISIONS.md section 5.
const KNOWN_CODE_MESSAGES: Record<string, string> = {
  INVALID_REQUEST: "Please check the submitted information and try again.",
  INVALID_REPOSITORY_URL: "Enter a valid GitHub repository URL.",
  REPOSITORY_ACCESS_DENIED:
    "This repository cannot be accessed. Check its visibility and permissions.",
  EVIDENCE_RETRIEVAL_FAILED:
    "We couldn't retrieve the repository evidence. Please try again.",
  EVALUATION_FAILED:
    "The evaluation could not be completed. Please try again later.",
};

// Frontend addition, not from the decisions document.
export const TIMEOUT_MESSAGE =
  "The evaluation took too long to respond. Please try again.";

// Frontend addition, not from the decisions document.
export const NETWORK_MESSAGE =
  "We couldn't reach the evaluation service. Check your connection and try again.";

// Frontend addition, not from the decisions document.
export const UNKNOWN_MESSAGE = "Something went wrong. Please try again.";

function isKnownErrorCode(code: unknown): code is keyof typeof KNOWN_CODE_MESSAGES {
  return (
    typeof code === "string" &&
    Object.prototype.hasOwnProperty.call(KNOWN_CODE_MESSAGES, code)
  );
}

/**
 * Resolve the user-facing message for a failed evaluation.
 * Order: HTTP 504 timeout, then network failure, then known error code,
 * otherwise the generic fallback.
 */
export function getUserMessage(failure: EvaluateFailure): string {
  if (failure.kind === "api" && failure.status === 504) {
    return TIMEOUT_MESSAGE;
  }

  if (failure.kind === "network") {
    return NETWORK_MESSAGE;
  }

  if (failure.kind === "api" && isKnownErrorCode(failure.error.code)) {
    return KNOWN_CODE_MESSAGES[failure.error.code];
  }

  return UNKNOWN_MESSAGE;
}
