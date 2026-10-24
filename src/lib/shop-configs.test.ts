import { describe, it, expect } from "vitest";
import { shopConfigs, shopAlternatives } from "./shop-configs";

describe("shop-configs module", () => {
  describe("shopConfigs", () => {
    it("should export shopConfigs with correctly structured data", () => {
      expect(shopConfigs).toBeDefined();
      expect(Object.keys(shopConfigs).length).toBeGreaterThan(0);

      const config = shopConfigs["nvidia-dgx-spark"];
      expect(config).toBeDefined();
      expect(config.checkedOn).toBe("2026-10-20");
      expect(config.rows).toBeInstanceOf(Array);
      expect(config.rows.length).toBeGreaterThan(0);
      expect(config.rows[0].length).toBe(2);
    });

    it("should include optional select and pick properties on some configurations", () => {
      const appleConfig = shopConfigs["apple-mac-studio"];
      expect(appleConfig.pick).toBeDefined();
      expect(appleConfig.select).toBeDefined();

      const ugreenConfig = shopConfigs["ugreen-dxp4800-plus"];
      expect(ugreenConfig.pick).toBeUndefined();
    });
  });

  describe("shopAlternatives", () => {
    it("should export shopAlternatives with correctly structured data", () => {
      expect(shopAlternatives).toBeDefined();
      expect(Object.keys(shopAlternatives).length).toBeGreaterThan(0);

      const alts = shopAlternatives["nvidia-dgx-spark"];
      expect(alts).toBeDefined();
      expect(alts).toBeInstanceOf(Array);
      expect(alts.length).toBeGreaterThan(0);

      const alt = alts[0];
      expect(alt.slug).toBeDefined();
      expect(typeof alt.slug).toBe("string");
      expect(alt.tradeoff).toBeDefined();
      expect(typeof alt.tradeoff).toBe("string");
    });

    it("should define alternatives for items that exist in alternatives", () => {
      // Basic check that alternatives exist in a pair or logic flow
      const nvSpark = shopAlternatives["nvidia-dgx-spark"];
      expect(nvSpark.some(a => a.slug === "apple-mac-studio")).toBe(true);
    });
  });
});
