// Environment configuration for the evaluation client.
//
// NEXT_PUBLIC_* variables are inlined by Next.js at build time, so they must be
// referenced as literal `process.env.NEXT_PUBLIC_...` expressions. Dynamic
// access such as `process.env[name]` is not inlined and would be undefined in
// the browser. The pure parsers below are exported so they can be unit tested
// without touching the real environment.

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export type MockScenario =
  | "mixed"
  | "all-supported"
  | "all-insufficient"
  | "sample-null-urls"
  | "INVALID_REQUEST"
  | "INVALID_REPOSITORY_URL"
  | "REPOSITORY_ACCESS_DENIED"
  | "EVIDENCE_RETRIEVAL_FAILED"
  | "EVALUATION_FAILED"
  | "timeout";

export const MOCK_SCENARIOS: readonly MockScenario[] = [
  "mixed",
  "all-supported",
  "all-insufficient",
  "sample-null-urls",
  "INVALID_REQUEST",
  "INVALID_REPOSITORY_URL",
  "REPOSITORY_ACCESS_DENIED",
  "EVIDENCE_RETRIEVAL_FAILED",
  "EVALUATION_FAILED",
  "timeout",
];

/**
 * Mock mode is ON unless the trimmed, lowercased value is exactly "false".
 * An unset value therefore means mock mode (the demo default).
 */
export function parseMockMode(raw: string | undefined): boolean {
  return raw?.trim().toLowerCase() !== "false";
}

/**
 * Resolve the API base URL. Falls back to the local backend default when unset
 * or blank, and strips any trailing slashes. The input is otherwise preserved.
 */
export function parseBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? "";
  if (trimmed === "") {
    return DEFAULT_API_BASE_URL;
  }
  return trimmed.replace(/\/+$/, "");
}

/**
 * Select a mock scenario. Unknown or unset values fall back to "mixed".
 * Matching is case-insensitive against the known scenario names.
 */
export function parseMockScenario(raw: string | undefined): MockScenario {
  const trimmed = raw?.trim().toLowerCase() ?? "";
  const match = MOCK_SCENARIOS.find(
    (scenario) => scenario.toLowerCase() === trimmed,
  );
  return match ?? "mixed";
}

export interface AppConfig {
  useMock: boolean;
  baseUrl: string;
  mockScenario: MockScenario;
}

export const appConfig: AppConfig = {
  useMock: parseMockMode(process.env.NEXT_PUBLIC_USE_MOCK),
  baseUrl: parseBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
  mockScenario: parseMockScenario(process.env.NEXT_PUBLIC_MOCK_SCENARIO),
};
