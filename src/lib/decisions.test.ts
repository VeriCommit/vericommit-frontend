import { describe, expect, it } from "vitest";
import type { DecisionStorage } from "./decisions";
import {
  clear,
  load,
  save,
  STORAGE_KEY_PREFIX,
} from "./decisions";

interface MemoryStorage extends DecisionStorage {
  map: Map<string, string>;
}

function createMemoryStorage(): MemoryStorage {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function throwingStorage(): DecisionStorage {
  return {
    getItem() {
      throw new Error("storage unavailable");
    },
    setItem() {
      throw new Error("storage unavailable");
    },
    removeItem() {
      throw new Error("storage unavailable");
    },
  };
}

describe("save / load", () => {
  it("round trips a saved decision", () => {
    const storage = createMemoryStorage();

    const saved = save(storage, "eval-1", "milestone_accepted");

    expect(saved).not.toBeNull();
    expect(saved?.decision).toBe("milestone_accepted");
    expect(load(storage, "eval-1")).toEqual(saved);
  });

  it("writes an ISO timestamp", () => {
    const storage = createMemoryStorage();
    const saved = save(storage, "eval-1", "hold");

    expect(saved).not.toBeNull();
    expect(Number.isNaN(Date.parse(saved?.savedAt ?? ""))).toBe(false);
  });

  it("uses the documented key format", () => {
    const storage = createMemoryStorage();
    save(storage, "abc", "hold");

    expect(storage.map.has(`${STORAGE_KEY_PREFIX}abc`)).toBe(true);
    expect(storage.map.has("vericommit:decision:abc")).toBe(true);
  });

  it("returns null when nothing is stored", () => {
    const storage = createMemoryStorage();
    expect(load(storage, "eval-1")).toBeNull();
  });

  it("returns null for corrupted JSON", () => {
    const storage = createMemoryStorage();
    storage.setItem(`${STORAGE_KEY_PREFIX}eval-1`, "{not valid json");

    expect(load(storage, "eval-1")).toBeNull();
  });

  it("returns null for a wrong shape", () => {
    const storage = createMemoryStorage();
    storage.setItem(
      `${STORAGE_KEY_PREFIX}eval-1`,
      JSON.stringify({ decision: "hold" }),
    );
    storage.setItem(
      `${STORAGE_KEY_PREFIX}eval-2`,
      JSON.stringify({ savedAt: new Date().toISOString() }),
    );

    expect(load(storage, "eval-1")).toBeNull();
    expect(load(storage, "eval-2")).toBeNull();
  });

  it("returns null for an unknown decision value", () => {
    const storage = createMemoryStorage();
    storage.setItem(
      `${STORAGE_KEY_PREFIX}eval-1`,
      JSON.stringify({ decision: "approved", savedAt: new Date().toISOString() }),
    );

    expect(load(storage, "eval-1")).toBeNull();
  });
});

describe("clear", () => {
  it("removes a stored decision", () => {
    const storage = createMemoryStorage();
    save(storage, "eval-1", "needs_more_evidence");

    expect(clear(storage, "eval-1")).toBe(true);
    expect(load(storage, "eval-1")).toBeNull();
  });

  it("is safe when nothing is stored", () => {
    const storage = createMemoryStorage();
    expect(clear(storage, "missing")).toBe(true);
  });
});

describe("multiple evaluations", () => {
  it("keeps decisions for different evaluation IDs separate", () => {
    const storage = createMemoryStorage();
    save(storage, "eval-1", "milestone_accepted");
    save(storage, "eval-2", "hold");

    expect(load(storage, "eval-1")?.decision).toBe("milestone_accepted");
    expect(load(storage, "eval-2")?.decision).toBe("hold");

    clear(storage, "eval-1");
    expect(load(storage, "eval-1")).toBeNull();
    expect(load(storage, "eval-2")?.decision).toBe("hold");
  });
});

describe("unavailable storage", () => {
  it("does not throw and fails quietly", () => {
    const storage = throwingStorage();

    expect(() => load(storage, "eval-1")).not.toThrow();
    expect(() => save(storage, "eval-1", "hold")).not.toThrow();
    expect(() => clear(storage, "eval-1")).not.toThrow();

    expect(load(storage, "eval-1")).toBeNull();
    expect(save(storage, "eval-1", "hold")).toBeNull();
    expect(clear(storage, "eval-1")).toBe(false);
  });
});
