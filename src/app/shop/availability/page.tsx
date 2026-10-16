import type { Metadata } from "next";
import Link from "next/link";
import { collections, digitalProducts } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { AvailabilityForm } from "@/components/shop/availability-form";
import { ReadinessBoard } from "@/components/shop/readiness-board";
import { ShopEvent } from "@/components/shop/shop-event";
import styles from "@/components/shop/storefront.module.css";

export const metadata: Metadata = { title: "Availability list — Shop", description: "Ask to be told when an edition's checkout opens, at what price and under which terms. No payment, no reservation.", alternates: { canonical: "/shop/availability" }, openGraph: { title: "Join the availability list", description: "One email when checkout opens. No payment, no pre-order.", url: "/shop/availability" } };

export default async function AvailabilityPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  const defaultProduct = digitalProducts.some((item) => item.slug === product) ? (product as string) : digitalProducts[0].slug;
  const interests = collections.filter((collection) => collection.slug !== "local-ai-hardware").map((collection) => ({ id: collection.slug, label: collection.name }));
  return <article className={`${styles.storefront} shell`}>
    <ShopEvent name="shop_view" props={{ route: "/shop/availability", product: defaultProduct }} />
    <Breadcrumbs items={[{ name: "Availability", path: "/shop/availability" }]} />
    <header className={styles.productHero} style={{ alignItems: "start" }}>
      <div>
        <p className="eyebrow">Availability list</p>
        <h1>Be told when checkout opens. Nothing more.</h1>
        <p className={styles.lede}>One email with the final price, the licence and the terms when an edition passes every fulfilment gate. No payment is taken, nothing is reserved, and a request is not counted as a sale or as demand in any public number.</p>
        <div style={{ marginTop: 28 }}><AvailabilityForm products={digitalProducts.map((item) => ({ slug: item.slug, name: `${item.name} ${item.edition}` }))} defaultProduct={defaultProduct} interests={interests} /></div>
      </div>
      <div>
        <ReadinessBoard compact />
        <p className={styles.heroNote} style={{ marginTop: 16 }}>While you wait: <Link href="/shop/free/source-to-brief-lab">the free lab</Link> produces the same artifact format now, and the <Link href="/shop/products/source-to-brief-workflow-edition">edition page</Link> lists everything the download contains.</p>
      </div>
    </header>
  </article>;
}
