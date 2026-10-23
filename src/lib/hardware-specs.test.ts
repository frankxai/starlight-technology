import { describe, expect, it } from "vitest";
import { hardwareSpecs, getHardwareSpec, isUnpublished } from "./hardware-specs";
import { shopProducts } from "./shop";

describe("hardware specs record", () => {
  it("covers every hardware record with a dated manufacturer source", () => {
    expect(Number.isFinite(Date.parse(hardwareSpecs.verifiedOn))).toBe(true);
    for (const product of shopProducts) {
      const spec = getHardwareSpec(product.slug);
      expect(spec, product.slug).toBeDefined();
      expect(spec?.sourceUrl).toBe(product.sourceUrl);
      for (const key of ["memory", "gpu", "power", "noise", "expansion"] as const) expect(spec?.[key].trim().length, `${product.slug}.${key}`).toBeGreaterThan(0);
    }
  });
  it("never carries a price, stock or review claim", () => {
    expect(JSON.stringify(hardwareSpecs.specs)).not.toMatch(/€|\$\d|\bin stock\b|\bout of stock\b|\brating\b|\breviews?\b/i);
  });
  it("distinguishes unpublished and not-applicable cells", () => {
    expect(isUnpublished("Not published")).toBe(true);
    expect(isUnpublished("Not applicable")).toBe(true);
    expect(isUnpublished("240 W")).toBe(false);
  });
});
