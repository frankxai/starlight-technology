import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getSources, sources } from "./sources";

// Mock network, filesystem, and time as requested
vi.mock("node:fs", () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-20T00:00:00Z"));
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response())));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("sources", () => {
  it("exports a non-empty list of sources", () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0]).toHaveProperty("id");
  });
});

describe("getSources", () => {
  it("returns sources for valid ids (success path)", () => {
    const validId = sources[0].id;
    const result = getSources([validId]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(validId);
  });

  it("handles boundary values correctly", () => {
    const firstId = sources[0].id;
    const lastId = sources[sources.length - 1].id;
    const result = getSources([firstId, lastId]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(firstId);
    expect(result[1].id).toBe(lastId);
  });

  it("returns empty array when given an empty array", () => {
    const result = getSources([]);
    expect(result).toEqual([]);
  });

  it("handles null/undefined input gracefully", () => {
    const resultNull = getSources(null as unknown as string[]);
    expect(resultNull).toEqual([]);

    const resultUndefined = getSources(undefined as unknown as string[]);
    expect(resultUndefined).toEqual([]);
  });

  it("throws an error when a source is not found (error path)", () => {
    expect(() => getSources(["non-existent-id"])).toThrow("Missing source: non-existent-id");
  });
});
