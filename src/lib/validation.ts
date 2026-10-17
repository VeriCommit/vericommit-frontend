// Pure validation helpers (no React) for the milestone input form.
// Source of truth: ../INTEGRATION_DECISIONS.md section 6 and the backend
// API contract (D2). These helpers never alter the user's wording.

const GITHUB_REPOSITORY_URL_PATTERN =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/i;

const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]+$/;

/** A required string is valid when it is not empty and not whitespace-only. */
export function isNonBlank(value: string): boolean {
  return value.trim().length > 0;
}

function isBlank(value: string): boolean {
  return !isNonBlank(value);
}

/**
 * Validate a required non-blank string. Returns an error message or null when valid.
 * `label` is used in the message; the value itself is not modified.
 */
export function validateRequired(value: string, label: string): string | null {
  return isBlank(value) ? `Enter ${label}.` : null;
}

/**
 * Validate a GitHub repository URL per INTEGRATION_DECISIONS.md section 6.
 * Accepts https://github.com/owner/repository with an optional trailing slash.
 * Rejects: empty, missing owner, missing repository name, non-GitHub domains,
 * query strings, fragments, and URLs pointing at issues, pull requests or files.
 * Returns an error message or null when valid. Does not normalize the input.
 */
export function validateRepositoryUrl(value: string): string | null {
  if (isBlank(value)) {
    return "Enter a GitHub repository URL.";
  }

  if (/[\s\u0000-\u001f]/.test(value)) {
    return "Enter a valid GitHub repository URL.";
  }

  const match = GITHUB_REPOSITORY_URL_PATTERN.exec(value);
  if (!match) {
    if (!value.toLowerCase().startsWith("https://github.com/")) {
      return "Enter a valid GitHub repository URL on github.com.";
    }

    return "Enter the repository root URL (e.g. https://github.com/owner/repository), not an issue, pull request or file.";
  }

  const owner = match[1];
  const repository = match[2];

  if (!OWNER_PATTERN.test(owner)) {
    return "Enter a GitHub repository URL with a valid owner.";
  }

  if (
    !REPOSITORY_PATTERN.test(repository) ||
    repository === "." ||
    repository === ".."
  ) {
    return "Enter a GitHub repository URL with a valid repository name.";
  }

  return null;
}

/**
 * Acceptance criteria must contain at least one non-blank entry, and no blank
 * entries. Returned errors are indexed per field; wording is never altered.
 */
export function validateAcceptanceCriteria(
  criteria: string[],
): { formError: string | null; itemErrors: (string | null)[] } {
  const itemErrors = criteria.map((criterion) =>
    isBlank(criterion) ? "Enter an acceptance criterion." : null,
  );

  const nonBlankCount = criteria.filter(isNonBlank).length;
  const formError =
    nonBlankCount === 0
      ? "Add at least one acceptance criterion."
      : null;

  return { formError, itemErrors };
}
