import { describe, it, expect } from "vitest";
import { getShopProduct, filterShopProducts, shopProducts } from "./shop";

describe("shop", () => {
  describe("getShopProduct", () => {
    it("returns the product for a known slug", () => {
      const product = getShopProduct("nvidia-rtx-5090");
      expect(product).toBeDefined();
      expect(product?.name).toBe("GeForce RTX 5090");
    });

    it("returns undefined for an unknown slug", () => {
      const product = getShopProduct("unknown-product-slug");
      expect(product).toBeUndefined();
    });
  });

  describe("filterShopProducts", () => {
    it("returns all products when category is All and query is empty", () => {
      const result = filterShopProducts(shopProducts, "All", "");
      expect(result.length).toBe(shopProducts.length);
    });

    it("filters products by category when query is empty", () => {
      const result = filterShopProducts(shopProducts, "Compute", "");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((p) => expect(p.category).toBe("Compute"));
    });

    it("filters products by text query regardless of category if category is All", () => {
      const result = filterShopProducts(shopProducts, "All", "CUDA");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((p) => {
        const text = `${p.brand} ${p.name} ${p.role} ${p.runtime}`.toLowerCase();
        expect(text).toContain("cuda");
      });
    });

    it("filters products by both category and text query", () => {
      const computeResult = filterShopProducts(shopProducts, "Compute", "nvidia");
      expect(computeResult.length).toBeGreaterThan(0);
      computeResult.forEach((p) => {
        expect(p.category).toBe("Compute");
        const text = `${p.brand} ${p.name} ${p.role} ${p.runtime}`.toLowerCase();
        expect(text).toContain("nvidia");
      });

      const audioResult = filterShopProducts(shopProducts, "Audio", "nvidia");
      expect(audioResult.length).toBe(0);
    });

    it("is case-insensitive for text queries", () => {
      const resultLower = filterShopProducts(shopProducts, "All", "nvidia");
      const resultUpper = filterShopProducts(shopProducts, "All", "NVIDIA");
      expect(resultLower).toEqual(resultUpper);
      expect(resultLower.length).toBeGreaterThan(0);
    });
  });
});
