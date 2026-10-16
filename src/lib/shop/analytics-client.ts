"use client";

import { track } from "@vercel/analytics";
import { emitShopEvent, type ShopEventName, type ShopEventProps } from "./analytics";

// NEXT_PUBLIC_* is inlined at build time; it must be referenced literally.
const env = { NEXT_PUBLIC_SHOP_ANALYTICS: process.env.NEXT_PUBLIC_SHOP_ANALYTICS };

export function trackShopEvent(name: ShopEventName, props: ShopEventProps = {}) {
  return emitShopEvent(name, props, (eventName, properties) => track(eventName, properties), env);
}
