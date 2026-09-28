import { describe, expect, it } from "vitest";
import { offerPublicationStatus, type MerchantOffer } from "./merchant-offer";
const offer: MerchantOffer = { id: "offer-1", merchantId: "retailer", productVariantId: "exact-variant", region: "NL", currency: "EUR", amountMinor: 100000, taxBasis: "included", shippingBasis: "included", sourceUrl: "https://merchant.example/feed", destinationUrl: "https://merchant.example/product", observedAt: "2026-09-28T10:00:00Z", expiresAt: "2026-09-29T10:00:00Z", rights: "approved-publication", reviewed: true };
const now = new Date("2026-09-28T12:00:00Z");
describe("offer publication gate", () => {
  it("requires an exact variant, rights and complete cost", () => {
    expect(offerPublicationStatus({ ...offer, productVariantId: "" }, now).publish).toBe(false);
    expect(offerPublicationStatus({ ...offer, rights: "research-only" }, now)).toEqual({ publish: false, reason: "rights-not-approved" });
    expect(offerPublicationStatus({ ...offer, shippingBasis: "unknown" }, now).publish).toBe(false);
  });
  it("expires stale offers and rejects future observations", () => {
    expect(offerPublicationStatus(offer, new Date("2026-09-30T00:00:00Z")).publish).toBe(false);
    expect(offerPublicationStatus({ ...offer, observedAt: "2026-09-29T12:00:00Z" }, now).publish).toBe(false);
  });
  it("allows a reviewed licensed observation inside its window", () => {
    expect(offerPublicationStatus(offer, now).publish).toBe(true);
  });
});
