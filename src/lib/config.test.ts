import { describe, expect, it } from "vitest";
import {
  parseBaseUrl,
  parseMockMode,
  parseMockScenario,
} from "./config";

describe("parseMockMode", () => {
  it("defaults to on when unset", () => {
    expect(parseMockMode(undefined)).toBe(true);
  });

  it("treats 'true' as on", () => {
    expect(parseMockMode("true")).toBe(true);
  });

  it("treats exactly 'false' as off", () => {
    expect(parseMockMode("false")).toBe(false);
  });

  it("trims and lowercases before comparing", () => {
    expect(parseMockMode(" FALSE ")).toBe(false);
    expect(parseMockMode("False")).toBe(false);
  });

  it("treats any other value as on", () => {
    expect(parseMockMode("")).toBe(true);
    expect(parseMockMode("0")).toBe(true);
    expect(parseMockMode("no")).toBe(true);
    expect(parseMockMode("yes")).toBe(true);
    expect(parseMockMode("falsey")).toBe(true);
  });
});

describe("parseBaseUrl", () => {
  it("defaults to the local backend when unset", () => {
    expect(parseBaseUrl(undefined)).toBe("http://127.0.0.1:8000");
  });

  it("defaults when blank", () => {
    expect(parseBaseUrl("")).toBe("http://127.0.0.1:8000");
    expect(parseBaseUrl("   ")).toBe("http://127.0.0.1:8000");
  });

  it("removes a trailing slash", () => {
    expect(parseBaseUrl("http://localhost:8000/")).toBe("http://localhost:8000");
  });

  it("removes multiple trailing slashes", () => {
    expect(parseBaseUrl("http://localhost:8000///")).toBe(
      "http://localhost:8000",
    );
  });

  it("preserves a URL without a trailing slash", () => {
    expect(parseBaseUrl("https://api.example.com")).toBe(
      "https://api.example.com",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(parseBaseUrl("  http://localhost:9000/ ")).toBe(
      "http://localhost:9000",
    );
  });
});

describe("parseMockScenario", () => {
  it("defaults to mixed when unset or unknown", () => {
    expect(parseMockScenario(undefined)).toBe("mixed");
    expect(parseMockScenario("")).toBe("mixed");
    expect(parseMockScenario("does-not-exist")).toBe("mixed");
  });

  it("accepts a known case name", () => {
    expect(parseMockScenario("all-supported")).toBe("all-supported");
  });

  it("accepts a known error name case-insensitively", () => {
    expect(parseMockScenario("invalid_request")).toBe("INVALID_REQUEST");
  });
});
