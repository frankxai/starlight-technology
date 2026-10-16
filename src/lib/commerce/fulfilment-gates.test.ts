import { describe, expect, it } from "vitest";
import { digitalProducts } from "../catalog/products";
import { fulfilmentContract, requiredGateIds, resolveCheckoutState, gateSummary, type FulfilmentContract } from "./fulfilment-gates";

const product = digitalProducts[0];
const now = new Date("2026-10-16T12:00:00Z");
const live = { ...product, status: "live" as const, price: { ...product.price, basis: "verified" as const, verifiedOn: "2026-10-15" } };
const env = { [product.checkoutEnvKey]: "https://pay.example.com/checkout/st-we-s2b-001" };
const allSatisfied: FulfilmentContract = { contractVersion: "test", gates: requiredGateIds.map((id) => ({ id, label: id, requirement: "", owner: "", status: "satisfied", evidence: { reference: `docs/${id}.md`, verifiedOn: "2026-10-10" } })) };

describe("fail-closed checkout", () => {
  it("repository contract keeps every gate open with no evidence", () => {
    expect(fulfilmentContract.gates.every((gate) => gate.status === "open" && gate.evidence === null)).toBe(true);
    expect(gateSummary(fulfilmentContract, now)).toMatchObject({ satisfied: 0, total: 10 });
  });
  it("renders the availability list in the shipped state and explains why", () => {
    const state = resolveCheckoutState(product, fulfilmentContract, env, now);
    expect(state.mode).toBe("availability-list");
    if (state.mode === "availability-list") {
      expect(state.openGates).toHaveLength(10);
      expect(state.reasons.join(" ")).toMatch(/gates are open/);
      expect(state.reasons.join(" ")).toMatch(/proposed/);
      expect(state.href).toContain("/shop/availability?product=");
    }
  });
  it("opens checkout only when gates, status, price and URL all pass", () => {
    expect(resolveCheckoutState(live, allSatisfied, env, now)).toMatchObject({ mode: "checkout", href: env[product.checkoutEnvKey] });
  });
  it.each(requiredGateIds)("stays closed when gate %s is open", (id) => {
    const contract = { ...allSatisfied, gates: allSatisfied.gates.map((gate) => (gate.id === id ? { ...gate, status: "open" as const } : gate)) };
    expect(resolveCheckoutState(live, contract, env, now).mode).toBe("availability-list");
  });
  it("rejects satisfied gates without evidence, with future evidence or missing from the contract", () => {
    const noEvidence = { ...allSatisfied, gates: allSatisfied.gates.map((gate) => (gate.id === "webhook" ? { ...gate, evidence: null } : gate)) };
    const future = { ...allSatisfied, gates: allSatisfied.gates.map((gate) => (gate.id === "webhook" ? { ...gate, evidence: { reference: "x", verifiedOn: "2027-01-01" } } : gate)) };
    const missing = { ...allSatisfied, gates: allSatisfied.gates.filter((gate) => gate.id !== "portal") };
    for (const contract of [noEvidence, future, missing]) expect(resolveCheckoutState(live, contract, env, now).mode).toBe("availability-list");
  });
  it.each(["", "http://pay.example.com/x", "https://user:pw@pay.example.com/x", " https://pay.example.com/x", "javascript:alert(1)"])("rejects payment URL %j", (url) => {
    expect(resolveCheckoutState(live, allSatisfied, { [product.checkoutEnvKey]: url }, now).mode).toBe("availability-list");
  });
  it("never opens for a release candidate or a proposed price", () => {
    expect(resolveCheckoutState({ ...live, status: "release-candidate" }, allSatisfied, env, now).mode).toBe("availability-list");
    expect(resolveCheckoutState({ ...live, price: product.price }, allSatisfied, env, now).mode).toBe("availability-list");
  });
});
