import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { editorialRecommendations, recommendationDestination } from "./editorial-recommendations";

vi.mock("node:net", () => ({}));
vi.mock("node:fs", () => ({}));

describe("editorialRecommendations", () => {
  it("should contain standard recommendations", () => {
    expect(editorialRecommendations).toBeDefined();
    expect(Object.keys(editorialRecommendations).length).toBeGreaterThan(0);
    expect(editorialRecommendations["gpu-comparison"].title).toBe("Compare two memory capacities");
  });
});

describe("recommendationDestination", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should return sponsored true for a valid active partner", () => {
    const item = {
      title: "Test",
      reason: "Test",
      url: "/test",
      label: "Test",
      partner: {
        status: "active" as const,
        url: "https://example.com/partner",
        verifiedOn: "2023-10-25"
      }
    };
    expect(recommendationDestination(item)).toEqual({
      href: "https://example.com/partner",
      sponsored: true
    });
  });

  it("should return sponsored false and fallback to item URL if partner URL throws on parse", () => {
    const item = {
      title: "Test",
      reason: "Test",
      url: "/test",
      label: "Test",
      partner: {
        status: "active" as const,
        url: "not-a-valid-url-format://",
        verifiedOn: "2023-10-25"
      }
    };
    expect(recommendationDestination(item)).toEqual({
      href: "/test",
      sponsored: false
    });
  });

  it("should return sponsored false if partner URL includes username/password", () => {
    const item = {
      title: "Test",
      reason: "Test",
      url: "/test",
      label: "Test",
      partner: {
        status: "active" as const,
        url: "https://user:pass@example.com/partner",
        verifiedOn: "2023-10-25"
      }
    };
    expect(recommendationDestination(item)).toEqual({
      href: "/test",
      sponsored: false
    });
  });

  it("should return sponsored false if partner URL protocol is not https", () => {
    const item = {
      title: "Test",
      reason: "Test",
      url: "/test",
      label: "Test",
      partner: {
        status: "active" as const,
        url: "http://example.com/partner",
        verifiedOn: "2023-10-25"
      }
    };
    expect(recommendationDestination(item)).toEqual({
      href: "/test",
      sponsored: false
    });
  });

  it("should return sponsored false if partner verifiedOn date is invalid format", () => {
    const item = {
      title: "Test",
      reason: "Test",
      url: "/test",
      label: "Test",
      partner: {
        status: "active" as const,
        url: "https://example.com/partner",
        verifiedOn: "2023/10/25"
      }
    };
    expect(recommendationDestination(item)).toEqual({
      href: "/test",
      sponsored: false
    });
  });

  it("should return sponsored false if partner status is not active", () => {
    const item: typeof editorialRecommendations[string] = {
      title: "Test",
      reason: "Test",
      url: "/test",
      label: "Test",
      partner: {
        // @ts-expect-error Testing invalid partner status
        status: "inactive",
        url: "https://example.com/partner",
        verifiedOn: "2023-10-25"
      }
    };
    expect(recommendationDestination(item)).toEqual({
      href: "/test",
      sponsored: false
    });
  });

  it("should handle null or undefined input correctly", () => {
    // @ts-expect-error Testing invalid input
    expect(() => recommendationDestination(null)).toThrow(TypeError);
    // @ts-expect-error Testing invalid input
    expect(() => recommendationDestination(undefined)).toThrow(TypeError);
  });
});
