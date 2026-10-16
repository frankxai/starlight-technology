import gateRecords from "../../../data/commerce/fulfilment-gates.json";
import type { DigitalProduct } from "../catalog/types";

export type GateStatus = "open" | "satisfied";

export interface FulfilmentGate {
  id: string;
  label: string;
  requirement: string;
  status: GateStatus;
  owner: string;
  /** A satisfied gate must point at evidence: a dated record, test run or document. */
  evidence: { reference: string; verifiedOn: string } | null;
}

export interface FulfilmentContract {
  contractVersion: string;
  gates: FulfilmentGate[];
}

export type CheckoutState =
  | { mode: "checkout"; href: string; openGates: [] }
  | { mode: "availability-list"; href: string; openGates: FulfilmentGate[]; reasons: string[] };

export const fulfilmentContract = gateRecords as FulfilmentContract;

export const requiredGateIds = ["rights", "merchant", "terms", "webhook", "entitlement", "delivery", "recovery", "support", "reconciliation", "portal"] as const;

function gateIsSatisfied(gate: FulfilmentGate, now: Date) {
  if (gate.status !== "satisfied" || !gate.evidence) return false;
  const verified = Date.parse(gate.evidence.verifiedOn);
  return Number.isFinite(verified) && verified <= now.getTime() && gate.evidence.reference.trim().length > 0;
}

function paymentUrl(product: DigitalProduct, env: Record<string, string | undefined>) {
  const raw = env[product.checkoutEnvKey];
  if (!raw || raw !== raw.trim()) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Fail-closed checkout resolution. Paid checkout renders only when every
 * required gate is satisfied with dated evidence, the product is live, the
 * price is verified and a valid https payment URL is configured. Any other
 * state returns the availability list with the open gates listed, so the UI
 * can explain the actual next step instead of showing a fake Buy button.
 */
export function resolveCheckoutState(
  product: DigitalProduct,
  contract: FulfilmentContract = fulfilmentContract,
  env: Record<string, string | undefined> = process.env,
  now: Date = new Date()
): CheckoutState {
  const byId = new Map(contract.gates.map((gate) => [gate.id, gate]));
  const openGates: FulfilmentGate[] = [];
  const reasons: string[] = [];

  for (const id of requiredGateIds) {
    const gate = byId.get(id);
    if (!gate) {
      openGates.push({ id, label: id, requirement: "Gate missing from the fulfilment contract.", status: "open", owner: "Engineering", evidence: null });
      continue;
    }
    if (!gateIsSatisfied(gate, now)) openGates.push(gate);
  }

  if (openGates.length > 0) reasons.push(`${openGates.length} of ${requiredGateIds.length} fulfilment gates are open.`);
  if (product.status !== "live") reasons.push(`Product status is ${product.status}, not live.`);
  if (product.price.basis !== "verified") reasons.push("Price is proposed, not commercially verified.");
  const href = paymentUrl(product, env);
  if (!href) reasons.push("No verified payment URL is configured.");

  if (openGates.length === 0 && product.status === "live" && product.price.basis === "verified" && href) {
    return { mode: "checkout", href, openGates: [] };
  }
  return { mode: "availability-list", href: `/shop/availability?product=${encodeURIComponent(product.slug)}`, openGates, reasons };
}

export function gateSummary(contract: FulfilmentContract = fulfilmentContract, now: Date = new Date()) {
  const satisfied = contract.gates.filter((gate) => gateIsSatisfied(gate, now)).length;
  return { satisfied, total: contract.gates.length, contractVersion: contract.contractVersion };
}
