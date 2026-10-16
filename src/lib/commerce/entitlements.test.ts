import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { entitlementForOrder, idempotencyKey, transitionOrder, verifyWebhookSignature } from "./entitlements";

describe("order state machine", () => {
  it("walks the happy path and ignores replays", () => {
    const paid = transitionOrder("created", { type: "payment.succeeded" });
    expect(paid).toEqual({ state: "paid", changed: true });
    expect(transitionOrder("paid", { type: "payment.succeeded" })).toEqual({ state: "paid", changed: false });
    expect(entitlementForOrder("paid")).toBe("active");
  });
  it("suspends on dispute, revokes on refund, and recovers a declined order that later succeeds", () => {
    expect(entitlementForOrder(transitionOrder("paid", { type: "dispute.opened" }).state)).toBe("suspended");
    expect(entitlementForOrder(transitionOrder("paid", { type: "refund.succeeded" }).state)).toBe("revoked");
    expect(transitionOrder("declined", { type: "payment.succeeded" }).state).toBe("paid");
    expect(transitionOrder("refunded", { type: "payment.succeeded" })).toEqual({ state: "refunded", changed: false });
  });
});

describe("idempotency", () => {
  it("derives the same key for the same event and different keys otherwise", () => {
    expect(idempotencyKey("polar", "evt_1", "SKU")).toBe(idempotencyKey("polar", "evt_1", "SKU"));
    expect(idempotencyKey("polar", "evt_1", "SKU")).not.toBe(idempotencyKey("polar", "evt_2", "SKU"));
    expect(() => idempotencyKey("", "evt", "SKU")).toThrow();
  });
});

describe("webhook signature", () => {
  const secret = "whsec_test";
  const payload = JSON.stringify({ id: "evt_1" });
  const now = new Date("2026-10-16T12:00:00Z");
  const ts = String(Math.floor(now.getTime() / 1000));
  const sig = createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  it("accepts a valid timestamped signature with either prefix", () => {
    expect(verifyWebhookSignature({ payload, signatureHeader: `v1=${sig}`, secret, timestamp: ts, now })).toEqual({ ok: true });
    expect(verifyWebhookSignature({ payload, signatureHeader: `sha256=${sig}`, secret, timestamp: ts, now })).toEqual({ ok: true });
  });
  it("fails closed on missing secret, missing header, tampered payload, stale timestamp", () => {
    expect(verifyWebhookSignature({ payload, signatureHeader: sig, secret: undefined, timestamp: ts, now }).ok).toBe(false);
    expect(verifyWebhookSignature({ payload, signatureHeader: null, secret, timestamp: ts, now }).ok).toBe(false);
    expect(verifyWebhookSignature({ payload: payload + " ", signatureHeader: sig, secret, timestamp: ts, now }).ok).toBe(false);
    expect(verifyWebhookSignature({ payload, signatureHeader: sig, secret, timestamp: String(Number(ts) - 3600), now }).reason).toBe("timestamp outside tolerance");
    expect(verifyWebhookSignature({ payload, signatureHeader: "abc", secret, timestamp: ts, now }).reason).toBe("signature mismatch");
  });
});
