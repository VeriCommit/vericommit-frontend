// Mock evaluation entry point. Returns the same result shape as the real
// client (including error envelopes) after a short artificial delay so that
// loading states can be exercised. No network request is made.

import type { EvaluateResult } from "@/lib/api/client";
import { appConfig } from "@/lib/config";
import { caseFixtures, errorFixtures } from "@/lib/mock/fixtures";

export const MOCK_DELAY_MS = 800;

function isMockErrorName(name: string): name is keyof typeof errorFixtures {
  return name in errorFixtures;
}

export async function mockEvaluate(): Promise<EvaluateResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const scenario = appConfig.mockScenario;

  if (isMockErrorName(scenario)) {
    const { status, code, message } = errorFixtures[scenario];
    return { ok: false, kind: "api", status, error: { code, message } };
  }

  const fixture =
    caseFixtures[scenario as keyof typeof caseFixtures] ?? caseFixtures.mixed;
  return { ok: true, data: fixture };
}
