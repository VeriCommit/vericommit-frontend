import { describe, expect, it } from "vitest";
import type { EvaluateFailure } from "./errors";
import {
  getUserMessage,
  NETWORK_MESSAGE,
  TIMEOUT_MESSAGE,
  UNKNOWN_MESSAGE,
} from "./errors";

function apiFailure(status: number, code: string): EvaluateFailure {
  return {
    ok: false,
    kind: "api",
    status,
    error: { code, message: "Backend detail message" },
  };
}

const networkFailure: EvaluateFailure = { ok: false, kind: "network" };

describe("getUserMessage", () => {
  it.each([
    ["INVALID_REQUEST", "Please check the submitted information and try again."],
    ["INVALID_REPOSITORY_URL", "Enter a valid GitHub repository URL."],
    [
      "REPOSITORY_ACCESS_DENIED",
      "This repository cannot be accessed. Check its visibility and permissions.",
    ],
    ["EVIDENCE_RETRIEVAL_FAILED", "We couldn't retrieve the repository evidence. Please try again."],
    ["EVALUATION_FAILED", "The evaluation could not be completed. Please try again later."],
  ])("maps %s to its exact message", (code, message) => {
    expect(getUserMessage(apiFailure(400, code))).toBe(message);
  });

  it("gives the timeout message for HTTP 504", () => {
    expect(getUserMessage(apiFailure(504, "EVALUATION_FAILED"))).toBe(
      TIMEOUT_MESSAGE,
    );
  });

  it("prefers the 504 timeout over a known code", () => {
    expect(getUserMessage(apiFailure(504, "EVIDENCE_RETRIEVAL_FAILED"))).toBe(
      TIMEOUT_MESSAGE,
    );
  });

  it("uses the code message for a non-504 status even when it is a 502 code", () => {
    expect(getUserMessage(apiFailure(502, "EVALUATION_FAILED"))).toBe(
      "The evaluation could not be completed. Please try again later.",
    );
  });

  it("gives the network message for kind network", () => {
    expect(getUserMessage(networkFailure)).toBe(NETWORK_MESSAGE);
  });

  it("gives the generic message for an unknown code", () => {
    expect(getUserMessage(apiFailure(400, "SOMETHING_ELSE"))).toBe(
      UNKNOWN_MESSAGE,
    );
  });

  it("gives the generic message when the code is not a string", () => {
    const failure = {
      ok: false,
      kind: "api",
      status: 400,
      error: { code: 123, message: "odd" },
    } as unknown as EvaluateFailure;
    expect(getUserMessage(failure)).toBe(UNKNOWN_MESSAGE);
  });

  it("does not match on the backend message text", () => {
    const failure: EvaluateFailure = {
      ok: false,
      kind: "api",
      status: 500,
      error: {
        code: "UNKNOWN_CODE",
        message: "Please check the submitted information and try again.",
      },
    };
    expect(getUserMessage(failure)).toBe(UNKNOWN_MESSAGE);
  });
});
