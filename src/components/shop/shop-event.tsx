"use client";

import { useEffect } from "react";
import { trackShopEvent } from "@/lib/shop/analytics-client";
import type { ShopEventName, ShopEventProps } from "@/lib/shop/analytics";

/** Fires one view event per mount. Renders nothing. Off unless the measurement contract is enabled. */
export function ShopEvent({ name, props }: { name: Extract<ShopEventName, "shop_view" | "product_view">; props: ShopEventProps }) {
  const serialized = JSON.stringify(props);
  useEffect(() => { trackShopEvent(name, JSON.parse(serialized) as ShopEventProps); }, [name, serialized]);
  return null;
}
