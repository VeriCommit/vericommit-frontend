// Browser-only persistence for the human reviewer's recorded decision.
//
// Decisions are stored in this browser's localStorage only. They are never
// sent to a server, not shared across devices and not a formal audit record.
// See INTEGRATION_DECISIONS.md section 2.
//
// Every helper takes a storage object as a parameter so the logic can be
// tested without a browser. All storage calls are wrapped so unavailable or
// full storage fails quietly instead of throwing.

export type DecisionValue =
  | "milestone_accepted"
  | "needs_more_evidence"
  | "hold";

/** Exact UI labels and their stored values. */
export const DECISION_LABELS: Record<DecisionValue, string> = {
  milestone_accepted: "Milestone accepted",
  needs_more_evidence: "Needs more evidence",
  hold: "Hold",
};

/** Display and iteration order of the decision options. */
export const DECISION_OPTIONS: readonly DecisionValue[] = [
  "milestone_accepted",
  "needs_more_evidence",
  "hold",
];

export const STORAGE_KEY_PREFIX = "vericommit:decision:";

/** Minimal storage surface; matches the subset of the Storage API we use. */
export interface DecisionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SavedDecision {
  decision: DecisionValue;
  /** ISO timestamp of when the decision was saved. */
  savedAt: string;
}

function storageKey(evaluationId: string): string {
  return `${STORAGE_KEY_PREFIX}${evaluationId}`;
}

function isDecisionValue(value: unknown): value is DecisionValue {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(DECISION_LABELS, value)
  );
}

function isSavedDecision(value: unknown): value is SavedDecision {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return isDecisionValue(record.decision) && typeof record.savedAt === "string";
}

/**
 * Read the stored decision for an evaluation.
 * Returns null when nothing is stored, the JSON is corrupt, the shape is
 * wrong or the decision value is unknown. Never throws.
 */
export function load(
  storage: DecisionStorage,
  evaluationId: string,
): SavedDecision | null {
  try {
    const raw = storage.getItem(storageKey(evaluationId));
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isSavedDecision(parsed)) {
      return null;
    }
    return { decision: parsed.decision, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

/**
 * Persist a decision for an evaluation.
 * Returns the saved record (including its timestamp), or null if storage
 * rejected the write. Never throws.
 */
export function save(
  storage: DecisionStorage,
  evaluationId: string,
  decision: DecisionValue,
): SavedDecision | null {
  const record: SavedDecision = {
    decision,
    savedAt: new Date().toISOString(),
  };
  try {
    storage.setItem(storageKey(evaluationId), JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

/**
 * Remove any stored decision for an evaluation.
 * Returns true when the remove call completed, false otherwise. Never throws.
 */
export function clear(
  storage: DecisionStorage,
  evaluationId: string,
): boolean {
  try {
    storage.removeItem(storageKey(evaluationId));
    return true;
  } catch {
    return false;
  }
}
