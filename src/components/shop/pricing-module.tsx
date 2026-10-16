import Link from "next/link";
import type { DigitalProduct } from "@/lib/catalog/types";
import type { CheckoutState } from "@/lib/commerce/fulfilment-gates";
import { CtaModule } from "./cta-module";
import { PriceLine } from "./product-card";
import styles from "./storefront.module.css";

export function PricingModule({ product, checkout, gates }: { product: DigitalProduct; checkout: CheckoutState; gates: { satisfied: number; total: number } }) {
  return <aside className={styles.pricing} aria-labelledby="pricing-heading">
    <p className="eyebrow" id="pricing-heading">Edition and price</p>
    <PriceLine product={product} />
    <small>{product.price.note}</small>
    <dl>
      <div><dt>Version</dt><dd>{product.version} · {product.changelog[0]?.date}</dd></div>
      <div><dt>Status</dt><dd>{product.status === "live" ? "Live" : "Release candidate · availability list open"}</dd></div>
      <div><dt>Licence</dt><dd>{product.licence.name} ({product.licence.code})</dd></div>
      <div><dt>Runtime</dt><dd>{product.runtime}</dd></div>
      <div><dt>Delivery</dt><dd>{product.delivery}</dd></div>
      <div><dt>Updates</dt><dd>{product.updateCadence}</dd></div>
      <div><dt>Checkout</dt><dd>{checkout.mode === "checkout" ? "Open" : `Closed · ${gates.satisfied} of ${gates.total} fulfilment gates satisfied`}</dd></div>
    </dl>
    <CtaModule product={product} checkout={checkout} />
    <small>No payment is taken on this page. <Link href="/shop/licensing-and-support">Licence, refund and support terms</Link> · <Link href="/shop/how-it-works#readiness">What has to be true before checkout opens</Link>.</small>
  </aside>;
}
