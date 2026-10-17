// Typed API client for the single MVP endpoint: POST /api/v1/evaluations.
//
// In real mode the client NEVER falls back to mock data: any failure is
// returned as an error result. In mock mode no network request is made at all.

import type { EvaluationRequest, EvaluationResponse } from "@/types/evaluation";
import { appConfig } from "@/lib/config";
import { mockEvaluate } from "@/lib/mock/evaluate";
import { isEvaluationResponse, parseErrorEnvelope } from "@/lib/api/schema";

export type EvaluateResult =
  | { ok: true; data: EvaluationResponse }
  | {
      ok: false;
      kind: "api";
      status: number;
      /** code is a plain string: the backend may send codes outside our union. */
      error: { code: string; message: string };
    }
  | { ok: false; kind: "network" };

/**
 * Evaluate a milestone. Routes to the mock layer or the real backend based on
 * configuration, so switching modes needs only environment changes.
 */
export async function evaluate(
  request: EvaluationRequest,
): Promise<EvaluateResult> {
  if (appConfig.useMock) {
    return mockEvaluate();
  }
  return evaluateAgainstBackend(request);
}

async function evaluateAgainstBackend(
  request: EvaluationRequest,
): Promise<EvaluateResult> {
  let response: Response;
  try {
    response = await fetch(`${appConfig.baseUrl}/api/v1/evaluations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The typed request is serialized as-is: exactly the contract fields.
      body: JSON.stringify(request),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, kind: "network" };
  }

  if (!response.ok) {
    const error = parseErrorEnvelope(payload);
    if (error === null) {
      return { ok: false, kind: "network" };
    }
    return { ok: false, kind: "api", status: response.status, error };
  }

  if (isEvaluationResponse(payload)) {
    return { ok: true, data: payload };
  }

  return { ok: false, kind: "network" };
}
