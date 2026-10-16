import Link from "next/link";
import type { DigitalProduct, FreeProduct } from "@/lib/catalog/types";
import type { CheckoutState } from "@/lib/commerce/fulfilment-gates";
import styles from "./storefront.module.css";

export function PriceLine({ product }: { product: DigitalProduct }) {
  return <div className={styles.priceLine}>
    <strong>€{product.price.amount}<small>{product.price.currency}</small></strong>
    <span className={styles.basis} data-basis={product.price.basis}>{product.price.basis === "proposed" ? "Proposed · test pricing" : `Verified ${product.price.verifiedOn}`}</span>
  </div>;
}

export function ProductCard({ product, checkout, featured = false }: { product: DigitalProduct; checkout: CheckoutState; featured?: boolean }) {
  const href = `/shop/products/${product.slug}`;
  const statusLabel = product.status === "live" ? "Live" : product.status === "retired" ? "Retired" : "Release candidate";
  return <article className={`${styles.productCard} ${styles.reveal}`} data-featured={featured}>
    <div className={styles.productTop}><span>{product.kind.replace("-", " ")} · v{product.version}</span><span className={styles.status} data-status={product.status}>{statusLabel}</span></div>
    <div className={styles.productBody}>
      <h3><Link href={href}>{product.name}</Link><small>{product.edition}</small></h3>
      <p>{product.outcome}</p>
      <dl className={styles.specGrid}>
        <div><dt>Format</dt><dd>{product.format}</dd></div>
        <div><dt>Runtime</dt><dd>{product.runtime.split(" · ")[0]}</dd></div>
        <div><dt>Licence</dt><dd>{product.licence.name}</dd></div>
        <div><dt>Delivery</dt><dd>{product.delivery.split(".")[0]}</dd></div>
      </dl>
      <PriceLine product={product} />
    </div>
    <div className={styles.productActions}>
      <Link className={`${styles.btn} ${styles.btnPrimary}`} href={href}>Inspect the edition</Link>
      <Link className={`${styles.btn} ${styles.btnQuiet}`} href={checkout.mode === "checkout" ? checkout.href : `/shop/free/${product.freeEntry}`}>{checkout.mode === "checkout" ? "Checkout" : "Try the free lab"}</Link>
    </div>
  </article>;
}

export function FreeProductCard({ product }: { product: FreeProduct }) {
  const href = `/shop/free/${product.slug}`;
  return <article className={`${styles.productCard} ${styles.reveal}`}>
    <div className={styles.productTop}><span>Free · browser tool · v{product.version}</span><span className={styles.status} data-status="free">Live</span></div>
    <div className={styles.productBody}>
      <h3><Link href={href}>{product.name}</Link><small>Free entry</small></h3>
      <p>{product.outcome}</p>
      <dl className={styles.specGrid}>
        <div><dt>Format</dt><dd>{product.format}</dd></div>
        <div><dt>Runtime</dt><dd>{product.runtime}</dd></div>
        <div><dt>Licence</dt><dd>{product.licence.name}</dd></div>
        <div><dt>Produces</dt><dd>brief.md · brief.json</dd></div>
      </dl>
      <div className={styles.priceLine}><strong>€0</strong><span className={styles.basis} data-basis="free">No account · nothing uploaded</span></div>
    </div>
    <div className={styles.productActions}>
      <Link className={`${styles.btn} ${styles.btnCyan}`} href={href}>Open the lab</Link>
      <Link className={`${styles.btn} ${styles.btnQuiet}`} href={`/shop/products/${product.pairedProduct}`}>See the paid edition</Link>
    </div>
  </article>;
}
