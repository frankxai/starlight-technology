import Link from "next/link";
import type { DigitalProduct } from "@/lib/catalog/types";
import type { CheckoutState } from "@/lib/commerce/fulfilment-gates";
import styles from "./storefront.module.css";

export function CtaModule({ product, checkout, size = "default" }: { product: DigitalProduct; checkout: CheckoutState; size?: "default" | "compact" }) {
  const primary = checkout.mode === "checkout"
    ? { href: checkout.href, label: `Continue to checkout · €${product.price.amount}`, external: true }
    : { href: checkout.href, label: "Join the availability list", external: false };
  const secondary = { href: `/shop/free/${product.freeEntry}`, label: "Try the free lab first" };
  const cls = `${styles.btn} ${size === "compact" ? styles.btnSmall : ""}`;
  return <div className={styles.actions}>
    {primary.external ? <a className={`${cls} ${styles.btnPrimary}`} href={primary.href}>{primary.label}</a> : <Link className={`${cls} ${styles.btnPrimary}`} href={primary.href}>{primary.label}</Link>}
    <Link className={`${cls} ${styles.btnQuiet}`} href={secondary.href}>{secondary.label}</Link>
  </div>;
}

export function CheckoutExplainer({ checkout }: { checkout: CheckoutState }) {
  if (checkout.mode === "checkout") return null;
  return <p className={styles.notice}>
    <span>Paid checkout is not open. {checkout.reasons.join(" ")} The availability list tells you when it opens and at what price; it is not a pre-order and takes no payment. <Link href="/shop/how-it-works#readiness">See the readiness board</Link>.</span>
  </p>;
}
