export const requestHosts = ["Codex", "Claude", "Local model tools", "Other"] as const;
export interface ReleaseRequest {
  schemaVersion: 1;
  productId: string;
  productName: string;
  preparedAt: string;
  outcome: string;
  currentTools: string;
  currentHost: typeof requestHosts[number];
  message: string;
  submitted: false;
}
export function prepareReleaseRequest(productId: string, productName: string, outcome: string, currentTools: string, currentHost: string, nowMs = Date.now()): ReleaseRequest {
  if (typeof productId !== "string" || !/^[a-z0-9-]{1,80}$/.test(productId) || typeof productName !== "string" || !productName.trim() || productName.length > 160) throw new Error("Unknown product.");
  if (typeof outcome !== "string" || !outcome.trim() || outcome.length > 2000) throw new Error("Describe your target outcome in 1 to 2,000 characters.");
  if (typeof currentTools !== "string" || currentTools.length > 1000 || !requestHosts.includes(currentHost as typeof requestHosts[number])) throw new Error("Check your tools and current host.");
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 || nowMs > 8640000000000000) throw new Error("Could not date this draft. Try again.");
  const message = [`Release request: ${productName}`, "", "Target outcome:", outcome.trim(), "", "Current tools or hardware:", currentTools.trim() || "Not specified", "", `Current host: ${currentHost}`, "", "I would like a reply about this product's release. This draft does not place an order or make a payment."].join("\n");
  return { schemaVersion: 1, productId, productName, preparedAt: new Date(nowMs).toISOString(), outcome: outcome.trim(), currentTools: currentTools.trim(), currentHost: currentHost as typeof requestHosts[number], message, submitted: false };
}
export function releaseRequestMailto(request: Pick<ReleaseRequest, "productName" | "message">) {
  // Text edited at a UTF-16 boundary can contain an unpaired surrogate. Repair
  // only the email representation; retain the original text in the JSON export.
  const base = `mailto:hello@frankx.ai?subject=${encodeURIComponent(`Release request: ${request.productName}`.toWellFormed())}`;
  const withBody = `${base}&body=${encodeURIComponent(request.message.toWellFormed())}`;
  return { href: withBody.length <= 1800 ? withBody : base, bodyIncluded: withBody.length <= 1800 };
}
