import { describe, expect, it } from "vitest";
import { collections, digitalProducts, freeProducts, recommendations, getRecommendations } from "./index";
import { shopProducts } from "../shop";
import { productSchema, faqSchema, breadcrumbSchema } from "./schema";
import { resolveCheckoutState } from "../commerce/fulfilment-gates";

const forbidden = /\b(testimonial|rated #1|best-selling|bestseller|only \d+ left|limited stock|selling fast|\d+% of customers|customers love|trusted by \d|revenue of|made \€|guaranteed results)\b/i;

function allText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(allText).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(allText).join("\n");
  return "";
}

describe("catalog integrity", () => {
  it("has unique slugs across products, free products, collections and recommendations", () => {
    const slugs = [...digitalProducts.map((p) => p.slug), ...freeProducts.map((p) => p.slug), ...collections.map((c) => c.slug), ...recommendations.map((r) => r.id)];
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("collections only reference records that exist", () => {
    for (const collection of collections) {
      for (const slug of collection.productSlugs) expect(digitalProducts.some((p) => p.slug === slug), `${collection.slug} → ${slug}`).toBe(true);
      for (const slug of collection.freeSlugs) expect(freeProducts.some((p) => p.slug === slug), `${collection.slug} → ${slug}`).toBe(true);
      expect(getRecommendations(collection.recommendationIds)).toHaveLength(collection.recommendationIds.length);
      for (const slug of collection.hardwareSlugs ?? []) expect(shopProducts.some((p) => p.slug === slug), `${collection.slug} → ${slug}`).toBe(true);
    }
  });

  it("every product lists its collections back-referenced", () => {
    for (const product of digitalProducts) for (const slug of product.collection) expect(collections.find((c) => c.slug === slug)?.productSlugs).toContain(product.slug);
    for (const product of freeProducts) {
      for (const slug of product.collection) expect(collections.find((c) => c.slug === slug)?.freeSlugs).toContain(product.slug);
      expect(digitalProducts.some((p) => p.slug === product.pairedProduct)).toBe(true);
    }
  });

  it("every digital product carries every required product-page field", () => {
    for (const product of digitalProducts) {
      expect(product.outcome.length).toBeGreaterThan(20);
      expect(product.includes.length).toBeGreaterThanOrEqual(8);
      expect(product.forWhom.length).toBeGreaterThan(0);
      expect(product.notForWhom.length).toBeGreaterThan(0);
      expect(product.prerequisites.some((p) => p.required)).toBe(true);
      expect(product.licence.grants.length).toBeGreaterThan(0);
      expect(product.changelog.length).toBeGreaterThan(0);
      expect(product.updateCadence.length).toBeGreaterThan(0);
      expect(product.delivery.length).toBeGreaterThan(0);
      expect(product.support.covers.length).toBeGreaterThan(0);
      expect(product.limitations.length).toBeGreaterThan(0);
      expect(product.refund.length).toBeGreaterThan(0);
      expect(product.recovery.length).toBeGreaterThan(0);
      expect(product.media.fileTree.length).toBeGreaterThan(5);
      expect(product.media.terminal.length).toBeGreaterThan(0);
      expect(product.media.workflow.length).toBeGreaterThanOrEqual(4);
      expect(product.media.transformation.length).toBeGreaterThan(0);
      expect(freeProducts.some((f) => f.slug === product.freeEntry)).toBe(true);
      expect(product.checkoutEnvKey).toMatch(/^SHOP_CHECKOUT_URL_/);
    }
  });

  it("proposed prices are labelled as proposed and no price is marked verified without a date", () => {
    for (const product of digitalProducts) {
      if (product.price.basis === "proposed") expect(product.price.note.toLowerCase()).toContain("proposed");
      if (product.price.basis === "verified") expect(product.price.verifiedOn).toBeTruthy();
    }
  });

  it("contains no fabricated social proof, scarcity, ranking or revenue claims", () => {
    expect(allText({ digitalProducts, freeProducts, collections, recommendations })).not.toMatch(forbidden);
  });

  it("recommendations link to https official pages and are independent unless an affiliate record exists", () => {
    for (const item of recommendations) {
      expect(item.href.startsWith("https://")).toBe(true);
      expect(item.relationship).toBe("independent");
      expect(Number.isFinite(Date.parse(item.verifiedOn))).toBe(true);
    }
  });

  it("planned editions never carry a price or a date", () => {
    for (const collection of collections) for (const planned of collection.planned) expect(allText(planned)).not.toMatch(/€|\b20\d\d\b|\bQ[1-4]\b/);
  });
});

describe("structured data", () => {
  it("omits Offer while checkout is closed and the price is proposed", () => {
    const product = digitalProducts[0];
    const schema = productSchema(product, resolveCheckoutState(product, undefined, {}));
    expect(schema.offers).toBeUndefined();
    expect(schema["@type"]).toBe("Product");
  });
  it("builds FAQ and breadcrumb lists", () => {
    expect(faqSchema([])).toBeNull();
    expect((faqSchema(digitalProducts[0].faq) as { mainEntity: unknown[] }).mainEntity.length).toBe(digitalProducts[0].faq.length);
    expect((breadcrumbSchema([{ name: "Shop", path: "/shop" }]) as { itemListElement: { item: string }[] }).itemListElement[0].item).toBe("https://starlight.technology/shop");
  });
});
