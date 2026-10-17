import { describe, expect, it } from "vitest";
import {
  isNonBlank,
  validateAcceptanceCriteria,
  validateRepositoryUrl,
  validateRequired,
} from "./validation";

describe("isNonBlank", () => {
  it("accepts meaningful strings", () => {
    expect(isNonBlank("Registration")).toBe(true);
  });

  it("rejects empty and whitespace-only strings", () => {
    expect(isNonBlank("")).toBe(false);
    expect(isNonBlank("   ")).toBe(false);
    expect(isNonBlank("\t\n")).toBe(false);
  });
});

describe("validateRequired", () => {
  it("returns null for a non-blank value", () => {
    expect(validateRequired("Milestone", "a milestone title")).toBeNull();
  });

  it("returns a message for a blank value", () => {
    expect(validateRequired("  ", "a milestone title")).toBe(
      "Enter a milestone title.",
    );
  });
});

describe("validateRepositoryUrl", () => {
  it("accepts a repository root URL", () => {
    expect(
      validateRepositoryUrl("https://github.com/owner/repository"),
    ).toBeNull();
  });

  it("accepts an optional trailing slash", () => {
    expect(
      validateRepositoryUrl("https://github.com/owner/repository/"),
    ).toBeNull();
  });

  it("accepts hyphens, underscores, dots and mixed case owners", () => {
    expect(
      validateRepositoryUrl("https://github.com/My-Org/my_repo.v2"),
    ).toBeNull();
  });

  it("rejects an empty URL", () => {
    expect(validateRepositoryUrl("")).not.toBeNull();
    expect(validateRepositoryUrl("   ")).not.toBeNull();
  });

  it("rejects a missing repository owner", () => {
    expect(validateRepositoryUrl("https://github.com/repository")).not.toBeNull();
  });

  it("rejects a missing repository name", () => {
    expect(validateRepositoryUrl("https://github.com/owner")).not.toBeNull();
    expect(validateRepositoryUrl("https://github.com/owner/")).not.toBeNull();
  });

  it("rejects unsupported Git hosting domains", () => {
    expect(
      validateRepositoryUrl("https://gitlab.com/owner/repository"),
    ).not.toBeNull();
    expect(
      validateRepositoryUrl("https://gitbucket.com/owner/repository"),
    ).not.toBeNull();
    expect(
      validateRepositoryUrl("http://github.com/owner/repository"),
    ).not.toBeNull();
  });

  it("rejects query strings", () => {
    expect(
      validateRepositoryUrl("https://github.com/owner/repository?tab=readme"),
    ).not.toBeNull();
  });

  it("rejects fragments", () => {
    expect(
      validateRepositoryUrl("https://github.com/owner/repository#readme"),
    ).not.toBeNull();
  });

  it("rejects issue URLs", () => {
    expect(
      validateRepositoryUrl("https://github.com/owner/repository/issues/1"),
    ).not.toBeNull();
  });

  it("rejects pull request URLs", () => {
    expect(
      validateRepositoryUrl("https://github.com/owner/repository/pull/12"),
    ).not.toBeNull();
  });

  it("rejects file URLs", () => {
    expect(
      validateRepositoryUrl(
        "https://github.com/owner/repository/blob/main/src/index.ts",
      ),
    ).not.toBeNull();
  });

  it("does not alter the supplied wording", () => {
    const input = "https://github.com/owner/repository";
    validateRepositoryUrl(input);
    expect(input).toBe("https://github.com/owner/repository");
  });
});

describe("validateAcceptanceCriteria", () => {
  it("accepts a single non-blank criterion", () => {
    const result = validateAcceptanceCriteria(["Users can register"]);
    expect(result.formError).toBeNull();
    expect(result.itemErrors).toEqual([null]);
  });

  it("requires at least one criterion", () => {
    const result = validateAcceptanceCriteria([]);
    expect(result.formError).toBe("Add at least one acceptance criterion.");
  });

  it("rejects a list of only blank criteria", () => {
    const result = validateAcceptanceCriteria(["", "   "]);
    expect(result.formError).toBe("Add at least one acceptance criterion.");
    expect(result.itemErrors).toEqual([
      "Enter an acceptance criterion.",
      "Enter an acceptance criterion.",
    ]);
  });

  it("flags blank entries without altering non-blank wording", () => {
    const result = validateAcceptanceCriteria(["  Users can register  ", ""]);
    expect(result.formError).toBeNull();
    expect(result.itemErrors).toEqual([null, "Enter an acceptance criterion."]);
  });
});
