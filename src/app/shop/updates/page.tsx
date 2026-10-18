import type { Metadata } from "next";
import Link from "next/link";
import { digitalProducts, freeProducts } from "@/lib/catalog";
import { fulfilmentContract } from "@/lib/commerce/fulfilment-gates";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { ShopEvent } from "@/components/shop/shop-event";
import styles from "@/components/shop/storefront.module.css";

export const metadata: Metadata = { title: "Updates — Shop", description: "Dated changelog for the Starlight Technology shop, its editions and the free lab.", alternates: { canonical: "/shop/updates" }, openGraph: { title: "Shop updates", description: "Every release, dated.", url: "/shop/updates" } };

const shopReleases = [
  { version: "shop 2.1.0-preview", date: "2026-10-17", summary: "Verified hardware specs, edition comparison, real artifact preview, lab round-trip and draft saving.", changes: ["Local AI hardware criteria table now carries manufacturer-published memory, GPU, power, noise and expansion values with a verification date; unpublished values are stated as such.", "Edition comparison (free lab, Workflow Edition, planned team licence) on the storefront and the product page.", "Product page and storefront show the worked example's brief.md, brief.json and evaluation in a CSS-only tabbed preview.", "Free lab imports a starlight.brief/v1 file to continue a review, offers opt-in browser-only draft saving with explicit restore, lists flagged contradictions, and can reject all held lines.", "Sticky section navigation on the storefront."] },
  { version: "shop 2.0.0-preview", date: "2026-10-16", summary: "Production shop structure, flagship edition, free lab, fail-closed checkout.", changes: ["Five collections with typed catalogue records.", "Source-to-Brief Workflow Edition page with manifest, licence, support, limitations, refund and recovery sections.", "Free Source-to-Brief Lab exporting starlight.brief/v1.", "Public checkout readiness board; paid checkout disabled until every gate passes.", "Hardware recommendations moved under Local AI hardware with criteria table and per-link disclosure; existing decision pages unchanged."] },
  { version: "shop 1.0.0", date: "2026-10-07", summary: "Studio Shop: eight source-backed hardware records with the affiliate approval boundary.", changes: ["Category filters, studio shortlists, three-component comparison.", "Approval record plus partner-issued URL required before any affiliate label."] }
];

export default function UpdatesPage() {
  const entries = [
    ...shopReleases.map((entry) => ({ ...entry, scope: "Shop" })),
    ...digitalProducts.flatMap((product) => product.changelog.map((entry) => ({ ...entry, scope: `${product.name} ${product.edition}`, href: `/shop/products/${product.slug}` }))),
    ...freeProducts.flatMap((product) => product.changelog.map((entry) => ({ ...entry, scope: product.name, href: `/shop/free/${product.slug}` })))
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return <article className={`${styles.storefront} shell`}>
    <ShopEvent name="shop_view" props={{ route: "/shop/updates" }} />
    <Breadcrumbs items={[{ name: "Updates", path: "/shop/updates" }]} />
    <header className={styles.productHero} style={{ alignItems: "end" }}>
      <div><p className="eyebrow">Updates</p><h1>Every release, dated.</h1><p className={styles.lede}>Shop, editions and the free lab share one changelog. Fulfilment contract version {fulfilmentContract.contractVersion}.</p></div>
      <div className={styles.notice}><span>Release notes describe what shipped in this repository. They do not describe sales, customers or demand; there is none to report while checkout is closed.</span></div>
    </header>
    <section className={styles.section} aria-labelledby="log">
      <h2 id="log" className="sr-only">Changelog</h2>
      <div className={styles.changelog}>{entries.map((entry) => <article key={`${entry.scope}-${entry.version}`}><div><span className={styles.version}>{entry.version}</span><time dateTime={entry.date}>{entry.date}</time><span className={styles.muted} style={{ fontSize: ".72rem" }}>{"href" in entry && entry.href ? <Link href={entry.href}>{entry.scope}</Link> : entry.scope}</span></div><div><strong>{entry.summary}</strong><ul>{entry.changes.map((change) => <li key={change}>{change}</li>)}</ul></div></article>)}</div>
    </section>
  </article>;
}
