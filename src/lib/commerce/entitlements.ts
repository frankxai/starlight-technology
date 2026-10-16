import { createHmac, timingSafeEqual } from "node:crypto";

// Fulfilment state machines and verification primitives. Pure functions only.
// No provider, database or email vendor is wired here; see
// docs/shop/FULFILMENT_ARCHITECTURE.md for the designed topology.

export type OrderState = "created" | "pending_payment" | "paid" | "declined" | "refunded" | "disputed";
export type EntitlementState = "active" | "suspended" | "revoked";
export type DeliveryState = "queued" | "sent" | "failed" | "replayed";

export type OrderEvent =
  | { type: "payment.succeeded" }
  | { type: "payment.declined" }
  | { type: "payment.pending" }
  | { type: "refund.succeeded" }
  | { type: "dispute.opened" }
  | { type: "dispute.closed" };

const orderTransitions: Record<OrderState, Partial<Record<OrderEvent["type"], OrderState>>> = {
  created: { "payment.succeeded": "paid", "payment.declined": "declined", "payment.pending": "pending_payment" },
  pending_payment: { "payment.succeeded": "paid", "payment.declined": "declined" },
  paid: { "refund.succeeded": "refunded", "dispute.opened": "disputed" },
  declined: { "payment.succeeded": "paid", "payment.pending": "pending_payment" },
  refunded: {},
  disputed: { "dispute.closed": "paid", "refund.succeeded": "refunded" }
};

export function transitionOrder(state: OrderState, event: OrderEvent): { state: OrderState; changed: boolean } {
  const next = orderTransitions[state][event.type];
  // Unknown or repeated events are ignored (idempotent), never thrown.
  return next ? { state: next, changed: next !== state } : { state, changed: false };
}

export function entitlementForOrder(state: OrderState): EntitlementState | null {
  if (state === "paid") return "active";
  if (state === "disputed") return "suspended";
  if (state === "refunded") return "revoked";
  return null;
}

/** One entitlement per (provider, event id). Replays derive the same key and are no-ops. */
export function idempotencyKey(provider: string, eventId: string, sku: string) {
  const trimmed = [provider, eventId, sku].map((part) => part.trim());
  if (trimmed.some((part) => part.length === 0)) throw new Error("idempotency key requires provider, eventId and sku");
  return createHmac("sha256", "starlight-entitlement").update(trimmed.join("|")).digest("hex");
}

export interface SignatureCheck {
  payload: string;
  signatureHeader: string | null;
  secret: string | undefined;
  timestamp?: string | null;
  now?: Date;
  toleranceSeconds?: number;
}

/**
 * Generic HMAC-SHA256 verification over `${timestamp}.${payload}` (or the raw
 * payload when no timestamp scheme is used). Constant-time compare. Any
 * missing input fails closed.
 */
export function verifyWebhookSignature({ payload, signatureHeader, secret, timestamp, now = new Date(), toleranceSeconds = 300 }: SignatureCheck): { ok: boolean; reason?: string } {
  if (!secret) return { ok: false, reason: "secret not configured" };
  if (!signatureHeader) return { ok: false, reason: "signature missing" };
  if (timestamp !== undefined && timestamp !== null) {
    const sent = Number(timestamp);
    if (!Number.isFinite(sent)) return { ok: false, reason: "timestamp invalid" };
    if (Math.abs(now.getTime() / 1000 - sent) > toleranceSeconds) return { ok: false, reason: "timestamp outside tolerance" };
  }
  const signed = timestamp ? `${timestamp}.${payload}` : payload;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");
  const provided = signatureHeader.replace(/^(sha256=|v1=)/, "").trim();
  if (provided.length !== expected.length) return { ok: false, reason: "signature mismatch" };
  const ok = timingSafeEqual(Buffer.from(provided, "utf8"), Buffer.from(expected, "utf8"));
  return ok ? { ok: true } : { ok: false, reason: "signature mismatch" };
}

export interface AuditEntry {
  at: string;
  actor: "webhook" | "admin" | "customer" | "system";
  action: string;
  orderId: string;
  idempotencyKey?: string;
  detail?: Record<string, string | number | boolean | null>;
}

export function auditEntry(entry: Omit<AuditEntry, "at">, now: Date = new Date()): AuditEntry {
  return { at: now.toISOString(), ...entry };
}
