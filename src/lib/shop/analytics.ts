// Measurement contract v1 for the shop. See docs/shop/MEASUREMENT_CONTRACT.md.
// Emission is off until NEXT_PUBLIC_SHOP_ANALYTICS equals the contract version,
// so adding events to the code does not start collection on its own.

export const SHOP_MEASUREMENT_CONTRACT = "v1" as const;

export const shopEventNames = [
  "shop_view",
  "product_view",
  "free_lab_start",
  "free_artifact_exported",
  "availability_request_started",
  "availability_request_completed",
  "affiliate_link_click"
] as const;

export type ShopEventName = (typeof shopEventNames)[number];

export type ShopEventProps = Partial<Record<"route" | "product" | "collection" | "format" | "destination" | "relationship", string>>;

/** Events that must never be reported as activation, demand, conversion or revenue. */
export const nonCommercialEvents: ReadonlySet<ShopEventName> = new Set(["shop_view", "product_view", "free_lab_start", "free_artifact_exported", "affiliate_link_click"]);

export function analyticsEnabled(env: Record<string, string | undefined> = process.env) {
  return env.NEXT_PUBLIC_SHOP_ANALYTICS === SHOP_MEASUREMENT_CONTRACT;
}

export function isShopEvent(name: string): name is ShopEventName {
  return (shopEventNames as readonly string[]).includes(name);
}

/** Strips anything that is not in the allow-listed property set. No free text, no emails. */
export function sanitizeProps(props: ShopEventProps): ShopEventProps {
  const allowed: (keyof ShopEventProps)[] = ["route", "product", "collection", "format", "destination", "relationship"];
  const out: ShopEventProps = {};
  for (const key of allowed) {
    const value = props[key];
    if (typeof value === "string" && value.length <= 120 && !value.includes("@")) out[key] = value;
  }
  return out;
}

type Tracker = (name: string, props?: Record<string, string>) => void;

export function emitShopEvent(name: ShopEventName, props: ShopEventProps, tracker: Tracker, env: Record<string, string | undefined> = process.env) {
  if (!analyticsEnabled(env) || !isShopEvent(name)) return false;
  tracker(name, sanitizeProps(props) as Record<string, string>);
  return true;
}
