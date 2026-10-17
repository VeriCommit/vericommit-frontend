// Illustrative mock fixtures for the evaluation report.
//
// These are synthetic demonstration outputs only. They are not verified
// evidence for any real repository, and their URLs (where present) are
// illustrative. Every case fixture has a distinct, stable evaluation_id so
// saved localStorage decisions never collide.

import type { EvaluationResponse } from "@/types/evaluation";

export type MockCaseName =
  | "mixed"
  | "all-supported"
  | "all-insufficient"
  | "sample-null-urls";

export type MockErrorName =
  | "INVALID_REQUEST"
  | "INVALID_REPOSITORY_URL"
  | "REPOSITORY_ACCESS_DENIED"
  | "EVIDENCE_RETRIEVAL_FAILED"
  | "EVALUATION_FAILED"
  | "timeout";

export const caseFixtures: Record<MockCaseName, EvaluationResponse> = {
  mixed: {
    evaluation_id: "mock-mixed-001",
    project_name: "Community Tools",
    milestone_title: "Implement member registration",
    overall_summary:
      "Some sample evidence supports progress, but not every acceptance criterion is demonstrated by the available evidence.",
    criteria_results: [
      {
        criterion: "A user can submit the registration form.",
        status: "supported",
        explanation:
          "Sample evidence includes a pull request that describes the registration form implementation.",
        evidence: [
          {
            type: "pull_request",
            title: "Sample: add registration form (illustrative)",
            url: null,
          },
        ],
      },
      {
        criterion: "Invalid input produces understandable validation errors.",
        status: "insufficient_evidence",
        explanation:
          "The available evidence does not demonstrate the validation behavior.",
        evidence: [],
      },
      {
        criterion:
          "Automated tests cover successful and unsuccessful registration.",
        status: "uncertain",
        explanation:
          "Test-related changes are visible, but the available evidence does not establish that both scenarios are covered.",
        evidence: [
          {
            type: "test_result",
            title: "Sample: registration test notes (illustrative)",
            url: null,
          },
        ],
      },
    ],
    suggested_next_steps: [
      "Provide a demonstration or test result for invalid input.",
      "Review the registration tests for both success and failure cases.",
    ],
    limitations: [
      "Repository activity alone does not prove that the feature works in production.",
      "Sample evidence is synthetic and was not verified against a live repository.",
    ],
    human_review_required: true,
  },

  "all-supported": {
    evaluation_id: "mock-all-supported-001",
    project_name: "Community Tools",
    milestone_title: "Implement member registration",
    overall_summary:
      "The available sample evidence supports every acceptance criterion. A human reviewer must still confirm the result.",
    criteria_results: [
      {
        criterion: "A user can submit the registration form.",
        status: "supported",
        explanation:
          "Sample evidence includes a pull request describing the registration form implementation.",
        evidence: [
          {
            type: "pull_request",
            title: "Sample: add registration form (illustrative)",
            url: null,
          },
        ],
      },
      {
        criterion: "Invalid input produces understandable validation errors.",
        status: "supported",
        explanation:
          "Sample evidence includes a commit message describing clearer validation errors.",
        evidence: [
          {
            type: "commit",
            title: "Sample: improve validation error messages (illustrative)",
            url: null,
          },
        ],
      },
      {
        criterion:
          "Automated tests cover successful and unsuccessful registration.",
        status: "supported",
        explanation:
          "Sample evidence includes a test result covering both success and failure cases.",
        evidence: [
          {
            type: "test_result",
            title: "Sample: registration test run (illustrative)",
            url: null,
          },
        ],
      },
    ],
    suggested_next_steps: [
      "Present this sample report to a human reviewer for a recorded decision.",
    ],
    limitations: [
      "Sample evidence is synthetic and was not verified against a live repository.",
      "Supported means the available sample evidence, not production behavior.",
    ],
    human_review_required: true,
  },

  "all-insufficient": {
    evaluation_id: "mock-all-insufficient-001",
    project_name: "Community Tools",
    milestone_title: "Implement member registration",
    overall_summary:
      "The available sample evidence does not demonstrate any of the acceptance criteria.",
    criteria_results: [
      {
        criterion: "A user can submit the registration form.",
        status: "insufficient_evidence",
        explanation:
          "The available evidence does not demonstrate this behavior. This does not necessarily mean the work was not completed.",
        evidence: [],
      },
      {
        criterion: "Invalid input produces understandable validation errors.",
        status: "insufficient_evidence",
        explanation:
          "The available evidence does not demonstrate this behavior. This does not necessarily mean the work was not completed.",
        evidence: [],
      },
      {
        criterion:
          "Automated tests cover successful and unsuccessful registration.",
        status: "insufficient_evidence",
        explanation:
          "The available evidence does not demonstrate this behavior. This does not necessarily mean the work was not completed.",
        evidence: [],
      },
    ],
    suggested_next_steps: [
      "Provide evidence that demonstrates the agreed acceptance criteria.",
    ],
    limitations: [
      "Missing evidence is not proof that the work was not done.",
      "Sample evidence is synthetic and was not verified against a live repository.",
    ],
    human_review_required: true,
  },

  "sample-null-urls": {
    evaluation_id: "mock-sample-null-urls-001",
    project_name: "Community Tools",
    milestone_title: "Implement member registration",
    overall_summary:
      "Sample evidence is available for each criterion, but it has no genuine repository URL and remains unverified.",
    criteria_results: [
      {
        criterion: "A user can submit the registration form.",
        status: "supported",
        explanation:
          "Sample evidence describes the registration form implementation, without a verifiable link.",
        evidence: [
          {
            type: "pull_request",
            title: "Sample: add registration form (illustrative)",
            url: null,
          },
          {
            type: "commit",
            title: "Sample: wire registration route (illustrative)",
            url: null,
          },
        ],
      },
      {
        criterion: "Invalid input produces understandable validation errors.",
        status: "uncertain",
        explanation:
          "Sample evidence mentions validation, but sufficiency cannot be determined from a URL-less reference.",
        evidence: [
          {
            type: "commit",
            title: "Sample: tweak validation copy (illustrative)",
            url: null,
          },
        ],
      },
      {
        criterion:
          "Automated tests cover successful and unsuccessful registration.",
        status: "insufficient_evidence",
        explanation:
          "The available evidence does not demonstrate this behavior.",
        evidence: [],
      },
    ],
    suggested_next_steps: [
      "Attach genuine repository links so the evidence can be verified.",
    ],
    limitations: [
      "A null URL alone does not identify the source; the title is labelled Sample: to make this explicit.",
      "Sample evidence is synthetic and was not verified against a live repository.",
    ],
    human_review_required: true,
  },
};

export interface MockErrorFixture {
  status: number;
  code: string;
  message: string;
}

export const errorFixtures: Record<MockErrorName, MockErrorFixture> = {
  INVALID_REQUEST: {
    status: 400,
    code: "INVALID_REQUEST",
    message: "Provide a milestone title and at least one acceptance criterion.",
  },
  INVALID_REPOSITORY_URL: {
    status: 400,
    code: "INVALID_REPOSITORY_URL",
    message: "The repository URL is invalid or unsupported.",
  },
  REPOSITORY_ACCESS_DENIED: {
    status: 403,
    code: "REPOSITORY_ACCESS_DENIED",
    message: "The application cannot access the repository.",
  },
  EVIDENCE_RETRIEVAL_FAILED: {
    status: 502,
    code: "EVIDENCE_RETRIEVAL_FAILED",
    message: "Evidence could not be retrieved.",
  },
  EVALUATION_FAILED: {
    status: 502,
    code: "EVALUATION_FAILED",
    message: "Evaluation could not be completed.",
  },
  timeout: {
    status: 504,
    code: "EVALUATION_FAILED",
    message: "The evaluation timed out. No evaluation was performed.",
  },
};

export const MOCK_CASE_NAMES = Object.keys(caseFixtures) as MockCaseName[];
export const MOCK_ERROR_NAMES = Object.keys(errorFixtures) as MockErrorName[];
