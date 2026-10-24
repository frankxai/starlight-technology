import { describe, it, expect } from "vitest";
import { recommendationDestination } from "./editorial-recommendations";

describe("recommendationDestination", () => {
  it("returns original url when partner is missing", () => {
    const item = {
      title: "Test",
      reason: "Testing",
      url: "/original",
      label: "Read",
    };
    expect(recommendationDestination(item)).toEqual({ href: "/original", sponsored: false });
  });

  it("returns original url when partner status is not active", () => {
    const item = {
      title: "Test",
      reason: "Testing",
      url: "/original",
      label: "Read",
      partner: {
        status: "inactive",
        url: "https://partner.com",
        verifiedOn: "2024-01-01",
      },
    };
    // @ts-expect-error testing invalid status
    expect(recommendationDestination(item)).toEqual({ href: "/original", sponsored: false });
  });

  it("returns original url when partner date format is invalid", () => {
    const item = {
      title: "Test",
      reason: "Testing",
      url: "/original",
      label: "Read",
      partner: {
        status: "active" as const,
        url: "https://partner.com",
        verifiedOn: "2024/01/01",
      },
    };
    expect(recommendationDestination(item)).toEqual({ href: "/original", sponsored: false });
  });

  it("returns original url when partner url is non-https", () => {
    const item = {
      title: "Test",
      reason: "Testing",
      url: "/original",
      label: "Read",
      partner: {
        status: "active" as const,
        url: "http://partner.com",
        verifiedOn: "2024-01-01",
      },
    };
    expect(recommendationDestination(item)).toEqual({ href: "/original", sponsored: false });
  });

  it("returns original url when partner url contains credentials", () => {
    const item = {
      title: "Test",
      reason: "Testing",
      url: "/original",
      label: "Read",
      partner: {
        status: "active" as const,
        url: "https://user:pass@partner.com",
        verifiedOn: "2024-01-01",
      },
    };
    expect(recommendationDestination(item)).toEqual({ href: "/original", sponsored: false });
  });

  it("returns partner url and sponsored: true when partner is valid", () => {
    const item = {
      title: "Test",
      reason: "Testing",
      url: "/original",
      label: "Read",
      partner: {
        status: "active" as const,
        url: "https://partner.com/ref",
        verifiedOn: "2024-01-01",
      },
    };
    expect(recommendationDestination(item)).toEqual({ href: "https://partner.com/ref", sponsored: true });
  });

  it("returns original url when partner url is completely invalid", () => {
    const item = {
      title: "Test",
      reason: "Testing",
      url: "/original",
      label: "Read",
      partner: {
        status: "active" as const,
        url: "not-a-url",
        verifiedOn: "2024-01-01",
      },
    };
    expect(recommendationDestination(item)).toEqual({ href: "/original", sponsored: false });
  });
});
