import { describe, expect, it } from "vitest";
import {
  caseFixtures,
  errorFixtures,
  MOCK_CASE_NAMES,
  MOCK_ERROR_NAMES,
} from "./fixtures";
import { isCriterionStatus, isEvaluationResponse } from "@/lib/api/schema";

const ALLOWED_STATUSES = ["supported", "insufficient_evidence", "uncertain"];

describe("case fixtures", () => {
  it("provides the expected cases", () => {
    expect(MOCK_CASE_NAMES).toEqual([
      "mixed",
      "all-supported",
      "all-insufficient",
      "sample-null-urls",
    ]);
  });

  it.each(MOCK_CASE_NAMES)("%s matches the EvaluationResponse shape", (name) => {
    expect(isEvaluationResponse(caseFixtures[name])).toBe(true);
  });

  it.each(MOCK_CASE_NAMES)("%s uses only allowed criterion statuses", (name) => {
    for (const result of caseFixtures[name].criteria_results) {
      expect(isCriterionStatus(result.status)).toBe(true);
      expect(ALLOWED_STATUSES).toContain(result.status);
    }
  });

  it.each(MOCK_CASE_NAMES)("%s requires human review", (name) => {
    expect(caseFixtures[name].human_review_required).toBe(true);
  });

  it.each(MOCK_CASE_NAMES)("%s has string-or-null evidence URLs", (name) => {
    for (const result of caseFixtures[name].criteria_results) {
      for (const evidence of result.evidence) {
        expect(
          typeof evidence.url === "string" || evidence.url === null,
        ).toBe(true);
      }
    }
  });

  it("has distinct, stable evaluation_ids", () => {
    const ids = MOCK_CASE_NAMES.map((name) => caseFixtures[name].evaluation_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mixed has one of each status", () => {
    const statuses = caseFixtures.mixed.criteria_results.map(
      (result) => result.status,
    );
    expect(statuses).toEqual([
      "supported",
      "insufficient_evidence",
      "uncertain",
    ]);
  });

  it("all-insufficient includes criteria with empty evidence arrays", () => {
    for (const result of caseFixtures["all-insufficient"].criteria_results) {
      expect(result.status).toBe("insufficient_evidence");
      expect(result.evidence).toEqual([]);
    }
  });

  it("sample-null-urls uses null URLs with Sample: titles", () => {
    const evidence = caseFixtures["sample-null-urls"].criteria_results.flatMap(
      (result) => result.evidence,
    );
    const urlLess = evidence.filter((item) => item.url === null);
    expect(urlLess.length).toBeGreaterThan(0);
    for (const item of urlLess) {
      expect(item.title.startsWith("Sample:")).toBe(true);
    }
  });
});

describe("error fixtures", () => {
  it("provides the expected error scenarios", () => {
    expect(MOCK_ERROR_NAMES).toEqual([
      "INVALID_REQUEST",
      "INVALID_REPOSITORY_URL",
      "REPOSITORY_ACCESS_DENIED",
      "EVIDENCE_RETRIEVAL_FAILED",
      "EVALUATION_FAILED",
      "timeout",
    ]);
  });

  it.each(MOCK_ERROR_NAMES)("%s has a code and message", (name) => {
    const fixture = errorFixtures[name];
    expect(typeof fixture.code).toBe("string");
    expect(fixture.code.length).toBeGreaterThan(0);
    expect(typeof fixture.message).toBe("string");
    expect(fixture.message.length).toBeGreaterThan(0);
  });

  it("maps statuses to the approved HTTP codes", () => {
    expect(errorFixtures.INVALID_REQUEST.status).toBe(400);
    expect(errorFixtures.INVALID_REPOSITORY_URL.status).toBe(400);
    expect(errorFixtures.REPOSITORY_ACCESS_DENIED.status).toBe(403);
    expect(errorFixtures.EVIDENCE_RETRIEVAL_FAILED.status).toBe(502);
    expect(errorFixtures.EVALUATION_FAILED.status).toBe(502);
  });

  it("models the timeout as 504 reusing EVALUATION_FAILED", () => {
    expect(errorFixtures.timeout.status).toBe(504);
    expect(errorFixtures.timeout.code).toBe("EVALUATION_FAILED");
  });
});
