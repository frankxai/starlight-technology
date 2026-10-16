"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackShopEvent } from "@/lib/shop/analytics-client";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { relationship: "independent" | "affiliate" | "official"; destination: string };

/** External recommendation link. Records affiliate_link_click only for affiliate relationships; independent links are not counted as anything. */
export function TrackedLink({ relationship, destination, children, onClick, ...rest }: Props) {
  return <a
    {...rest}
    rel={relationship === "affiliate" ? "sponsored noopener" : "noopener"}
    target="_blank"
    onClick={(event) => {
      if (relationship === "affiliate") trackShopEvent("affiliate_link_click", { destination, relationship });
      onClick?.(event);
    }}
  >{children}</a>;
}
