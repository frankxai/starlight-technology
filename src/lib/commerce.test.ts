import { describe, expect, it } from "vitest";
import { decidePurchase, getReleaseApproval, isPolarCheckoutUrl, releaseChecks, type ReleaseApproval } from "./commerce";
import { allProducts, checkoutHref, getProduct, type ProductSku } from "./products";

// Synthetic fixtures exercise decisions; they are never inserted in the registry.
const now = 1791000000000;
const url = "https://polar.sh/checkout/polar_c_SYNTHETIC";
const product: ProductSku = { id: "synthetic-kit", name: "Synthetic fixture", kind: "digital", billing: "once", edition: "test-only", artifactSha256: "a".repeat(64), amountCents: 9900, currency: "EUR", priceLabel: "Test only", summary: "Test only", includes: [], cta: "Test", productPath: "/builds" };
function approval(): ReleaseApproval {
  return { schemaVersion: 1, skuId: product.id, edition: product.edition!, artifactSha256: product.artifactSha256!, amountCents: product.amountCents!, currency: "EUR", checkoutUrl: url, reviewedAtMs: now - 1000, expiresAtMs: now + 60000, evidence: releaseChecks.map(check => ({ check, reference: `https://example.com/synthetic/${check}` })) };
}
describe("Release decisions", () => {
  it("preserves legacy SKU resolution and closes all current paid paths even with a provider URL", () => {
    for (const id of ["tech-free", "tech-studio", "tech-ops", "creator-blueprint", "stack-audit", "infrastructure-blueprint"]) expect(getProduct(id)?.id).toBe(id);
    for (const sku of allProducts.filter(sku => sku.billing !== "free")) {
      expect(checkoutHref(sku)).toBe(`/checkout/${sku.id}`);
      expect(decidePurchase(sku, url, getReleaseApproval(sku.id), now).status).toBe("unreleased");
    }
    expect(decidePurchase(getProduct("tech-free")!, undefined, undefined, now).status).toBe("free");
  });
  it("requires trusted acceptance and an exact artifact, price and checkout match", () => {
    expect(decidePurchase(product, url, undefined, now).status).toBe("unreleased");
    expect(decidePurchase(product, url, approval(), now)).toMatchObject({ status: "available", amountCents: 9900, currency: "EUR" });
    for (const change of [{ skuId: "other" }, { edition: "old" }, { artifactSha256: "b".repeat(64) }, { amountCents: 10000 }, { currency: "USD" }, { checkoutUrl: url + "?changed=1" }]) expect(decidePurchase(product, url, { ...approval(), ...change }, now).status).toBe("unreleased");
  });
  it("fails closed for stale, future, malformed and incomplete acceptance", () => {
    for (const change of [{ expiresAtMs: now }, { reviewedAtMs: now + 1 }, { expiresAtMs: now + 8 * 86400000 }, { schemaVersion: 99 }, { execute: true }, { evidence: approval().evidence.slice(1) }, { evidence: approval().evidence.map(() => approval().evidence[0]) }, { evidence: approval().evidence.map(item => ({ ...item, reference: "http://example.com/test" })) }]) expect(decidePurchase(product, url, { ...approval(), ...change }, now).status).toBe("unreleased");
    expect(decidePurchase(product, url, approval(), NaN).status).toBe("unreleased");
  });
  it("rejects unrelated or unsafe checkout destinations and unsupported recurring/service offers", () => {
    for (const destination of ["http://polar.sh/checkout/polar_c_TEST", "https://polar.sh.attacker.example/checkout/polar_c_TEST", "https://user:password@polar.sh/checkout/polar_c_TEST", "https://polar.sh:8443/checkout/polar_c_TEST", url + "#redirect", " " + url]) expect(isPolarCheckoutUrl(destination)).toBe(false);
    for (const sku of [{ ...product, kind: "service" as const }, { ...product, kind: "saas" as const, billing: "month" as const }]) expect(decidePurchase(sku, url, approval(), now).status).toBe("unreleased");
  });
});
