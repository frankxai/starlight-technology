import { describe, expect, it, vi } from "vitest";
import { analyticsEnabled, emitShopEvent, nonCommercialEvents, sanitizeProps, shopEventNames } from "./analytics";

describe("measurement contract", () => {
  it("is off by default and on only for the exact contract version", () => {
    expect(analyticsEnabled({})).toBe(false);
    expect(analyticsEnabled({ NEXT_PUBLIC_SHOP_ANALYTICS: "v2" })).toBe(false);
    expect(analyticsEnabled({ NEXT_PUBLIC_SHOP_ANALYTICS: "v1" })).toBe(true);
  });
  it("defines exactly the seven contracted events and marks the non-commercial ones", () => {
    expect(shopEventNames).toHaveLength(7);
    expect(nonCommercialEvents.has("free_artifact_exported")).toBe(true);
    expect(nonCommercialEvents.has("availability_request_completed")).toBe(false);
  });
  it("does not emit when disabled and strips disallowed or personal properties", () => {
    const tracker = vi.fn();
    expect(emitShopEvent("shop_view", { route: "/shop" }, tracker, {})).toBe(false);
    expect(tracker).not.toHaveBeenCalled();
    expect(emitShopEvent("product_view", { product: "x", route: "/shop/products/x" }, tracker, { NEXT_PUBLIC_SHOP_ANALYTICS: "v1" })).toBe(true);
    expect(tracker).toHaveBeenCalledWith("product_view", { product: "x", route: "/shop/products/x" });
    expect(sanitizeProps({ destination: "someone@example.com", route: "/x" })).toEqual({ route: "/x" });
  });
});
