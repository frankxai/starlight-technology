import { indexGraph } from "./graph";
import { assessFreshness, DEFAULT_MAX_PRICE_AGE_DAYS } from "./staleness";
import type { ConfiguratorInput, ConfiguredSystem } from "./configurator";
import type { ComponentClass, DecisionGraph, EvidenceSourceNode } from "./schema";

export type PurchaseReview = {
  schema: "StarlightPurchaseReview.v1";
  checkedAt: string;
  inputsHash: string;
  systemId: string;
  label: string;
  destination: ConfiguratorInput["regionCode"];
  missingAssemblySlots: string[];
  listedTotalsMinor: Record<string, number>;
  deliveredTotalMinor: number | null;
  currency: string | null;
  budgetVerdict: "within" | "over" | "unknown";
  unresolved: string[];
  quotes: {
    observationId: string;
    subjectId: string;
    amountMinor: number | null;
    currency: string;
    observedAt: string;
    region: string;
    basis: string;
    merchantSku: string | null;
    kind: "listing" | "delivered-quote" | "unspecified";
    vatIncluded: boolean | null;
    shippingMinor: number | null;
    importDutyMinor: number | null;
    sourceId: string;
  }[];
  sources: Pick<EvidenceSourceNode, "id" | "publisher" | "title" | "url" | "retrievedAt">[];
  scope: string;
};

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function money(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function formatMinor(value: number): string {
  const digits = String(value).padStart(3, "0");
  return `${digits.slice(0, -2)}.${digits.slice(-2)}`;
}

/** A compatibility review is separate from a complete delivered quote. This proves neither installation nor model speed. */
export function assessPurchase(system: ConfiguredSystem, input: ConfiguratorInput, graph: DecisionGraph, now: string): PurchaseReview {
  if (!validDate(now)) throw new Error("Purchase review needs a real YYYY-MM-DD date.");
  const index = indexGraph(graph);
  const missingAssemblySlots: string[] = [];
  const unresolved: string[] = [];
  const physical = system.lines.map((line) => index.get(line.nodeId));
  const prebuilt = physical.some((node) => node?.kind === "Device");
  if (!prebuilt) {
    const required: ComponentClass[] = ["gpu", "cpu", "motherboard", "memory", "storage", "psu", "case", "cooling"];
    const specified = new Set(physical.filter((node) => node?.kind === "Component").map((node) => node.componentClass));
    missingAssemblySlots.push(...required.filter((slot) => !specified.has(slot)));
  }
  if (system.lines.some((line) => line.role.startsWith("External") && index.get(line.nodeId)?.kind === "Component")) {
    missingAssemblySlots.push("external-storage-enclosure");
  }
  if (missingAssemblySlots.length) unresolved.push(`Specify or document ownership of: ${missingAssemblySlots.join(", ")}. Listed parts are not a complete assembled build.`);
  const freshness = assessFreshness(system, { now, graph });
  unresolved.push(...freshness.reasons);
  const quotes: PurchaseReview["quotes"] = [];
  const listedTotalsMinor: Record<string, number> = {};
  const sourceIds = new Set<string>();
  const budget = index.get(input.budgetId);
  let budgetListedSubtotalMinor = 0;
  let deliveredTotalMinor = 0;
  let currency: string | null = null;
  let complete = missingAssemblySlots.length === 0 && freshness.valid;

  for (const line of system.lines) {
    const observation = line.priceObservationId ? index.get(line.priceObservationId) : undefined;
    if (!observation || observation.kind !== "PriceObservation" || observation.subjectId !== line.nodeId || observation.amountMinor !== line.priceMinor || observation.currency !== line.currency || !money(observation.amountMinor) || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      unresolved.push(`Obtain an exact-variant, quantity-matched quote for ${line.label}.`);
      complete = false;
      continue;
    }
    const terms = observation.purchaseTerms;
    sourceIds.add(observation.sourceId);
    quotes.push({ observationId: observation.id, subjectId: observation.subjectId, amountMinor: observation.amountMinor, currency: observation.currency, observedAt: observation.observedAt, region: observation.region, basis: observation.basis, merchantSku: terms?.merchantSku ?? null, kind: terms?.kind ?? "unspecified", vatIncluded: terms?.vatIncluded ?? null, shippingMinor: terms?.shippingMinor ?? null, importDutyMinor: terms?.importDutyMinor ?? null, sourceId: observation.sourceId });
    const subtotal = observation.amountMinor * line.quantity;
    if (!Number.isSafeInteger(subtotal) || !Number.isSafeInteger((listedTotalsMinor[observation.currency] ?? 0) + subtotal)) throw new Error("Quote arithmetic exceeds safe monetary bounds.");
    listedTotalsMinor[observation.currency] = (listedTotalsMinor[observation.currency] ?? 0) + subtotal;
    const source = index.get(observation.sourceId);
    const dateOkay = validDate(observation.observedAt) && observation.observedAt <= now;
    const priceAgeDays = (Date.parse(now) - Date.parse(observation.observedAt)) / 86_400_000;
    if (budget?.kind === "Budget" && observation.currency === budget.currency && observation.basis !== "unverified" && source?.kind === "EvidenceSource" && dateOkay && priceAgeDays <= DEFAULT_MAX_PRICE_AGE_DAYS) {
      budgetListedSubtotalMinor += subtotal;
    }
    const expiryOkay = terms && validDate(terms.expiresAt) && terms.expiresAt >= now && terms.expiresAt >= observation.observedAt;
    const deliveryOkay = terms?.kind === "delivered-quote" && terms.destinationRegion === input.regionCode && terms.quantity === line.quantity && terms.vatIncluded === true && money(terms.shippingMinor) && money(terms.importDutyMinor) && !!terms.merchantSku.trim();
    if (!dateOkay || !expiryOkay || !deliveryOkay || source?.kind !== "EvidenceSource") {
      complete = false;
      unresolved.push(`${line.label}: ${terms?.kind === "listing" ? "a dated listing is available" : "delivery terms are incomplete"}; confirm destination, VAT, shipping/import costs, exact SKU, quantity and quote expiry.`);
    }
    if (currency !== null && currency !== observation.currency) {
      complete = false;
      unresolved.push("Quotes use different currencies; no exchange rate is assumed.");
    }
    currency ??= observation.currency;
    if (deliveryOkay) {
      deliveredTotalMinor += subtotal + (terms?.shippingMinor ?? 0) + (terms?.importDutyMinor ?? 0);
      if (!Number.isSafeInteger(deliveredTotalMinor)) throw new Error("Delivered quote exceeds safe monetary bounds.");
    }
  }
  if (!system.lines.length) complete = false;
  let budgetVerdict: PurchaseReview["budgetVerdict"] = "unknown";
  if (!complete && budget?.kind === "Budget" && money(budget.ceilingMinor) && budgetListedSubtotalMinor > budget.ceilingMinor) {
    unresolved.push(`Recorded ${budget.currency} ${formatMinor(budgetListedSubtotalMinor)} subtotal exceeds the ${budget.currency} ${formatMinor(budget.ceilingMinor)} budget. Confirm current prices and delivered terms.`);
  }
  if (complete && budget?.kind === "Budget" && currency === budget.currency) {
    budgetVerdict = deliveredTotalMinor <= budget.ceilingMinor ? "within" : "over";
  } else if (budget?.kind !== "Budget" || currency !== budget.currency) {
    unresolved.push("The budget currency does not match a complete delivered quote.");
  }
  return {
    schema: "StarlightPurchaseReview.v1", checkedAt: now, inputsHash: system.recommendation.inputsHash, systemId: system.node.id, label: system.label, destination: input.regionCode, missingAssemblySlots,
    listedTotalsMinor, deliveredTotalMinor: complete ? deliveredTotalMinor : null, currency, budgetVerdict,
    unresolved: [...new Set(unresolved)], quotes,
    sources: [...sourceIds].map((id) => index.get(id)).filter((source): source is EvidenceSourceNode => source?.kind === "EvidenceSource").map(({ id, publisher, title, url, retrievedAt }) => ({ id, publisher, title, url, retrievedAt })),
    scope: "Dated listing and assembly review. A complete quote does not prove hardware compatibility, runtime/model support, measured capacity, financing eligibility or a purchase. Confirm existing display/input/network equipment and software separately."
  };
}
