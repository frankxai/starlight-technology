import { describe, expect, it } from "vitest";
import { allProducts, checkoutHref, productActionLabel, productAvailability } from "./products";

describe("unverified self-serve commerce", () => {
  it("cannot turn a configured URL into fulfilment readiness", () => {
    for (const product of allProducts.filter(product => product.billing !== "free")) {
      // Even a vendor-looking URL must not bypass the product's readiness boundary.
      const previous = product.checkoutEnvKey ? process.env[product.checkoutEnvKey] : undefined;
      if (product.checkoutEnvKey) process.env[product.checkoutEnvKey] = "https://checkout.example.test/configured-link";
      try {
        expect(checkoutHref(product)).toBe(`/checkout/${product.id}`);
        expect(productAvailability(product)).not.toBe("free");
        expect(productActionLabel(product)).not.toMatch(/buy|subscribe|purchase/i);
      } finally {
        if (product.checkoutEnvKey) {
          if (previous === undefined) delete process.env[product.checkoutEnvKey];
          else process.env[product.checkoutEnvKey] = previous;
        }
      }
    }
  });
  it("keeps free access usable and separates service inquiry from purchase", () => {
    const free = allProducts.find(product => product.billing === "free")!;
    const service = allProducts.find(product => product.kind === "service")!;
    expect(checkoutHref(free)).toBe(free.productPath);
    expect(productAvailability(free)).toBe("free");
    expect(productAvailability(service)).toBe("scope-inquiry");
    expect(productActionLabel(service)).toBe("Discuss the scope");
  });
});
