import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HardwareDiagram } from "@/components/hardware-diagram";
import { getShopProduct } from "@/lib/shop";
import { resolveShopOffer } from "@/lib/shop-offers";
import styles from "@/components/shop.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getShopProduct(slug);
  if (!product) return {};
  return { title: `${product.brand} ${product.name} — Buying decision`, description: product.summary, alternates: { canonical: `/shop/${slug}` }, openGraph: { title: `${product.brand} ${product.name}`, description: product.summary, url: `/shop/${slug}` } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getShopProduct(slug);
  if (!product) notFound();
  const offer = resolveShopOffer(product);
  const schema = { "@context": "https://schema.org", "@type": "Product", name: `${product.brand} ${product.name}`, description: product.summary, brand: { "@type": "Brand", name: product.brand }, url: `https://starlight.technology/shop/${slug}` };
  return <article className={`${styles.shop} shell`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/shop">Studio Shop</Link><span>/</span><span>{product.category}</span></nav>
    <header className={styles.productHero}><div><p className="eyebrow">{product.brand} / {product.category}</p><h1>{product.name}</h1><p className={styles.lede}>{product.summary}</p><p className={styles.evidence}>Manufacturer source checked {product.verifiedOn}<br />Buying fit: editorial inference · no hands-on benchmark</p></div><figure className={styles.productFigure}><HardwareDiagram shape={product.shape} /><figcaption>Original category schematic. This is not a photograph or model-accurate product render.</figcaption></figure></header>
    <div className={styles.purchaseLayout}><div><section className={styles.fitPanel}><p className="eyebrow">The decision</p><h2>{product.role}</h2><div><h3>Choose when</h3><p>{product.fit}</p><h3>Avoid when</h3><p>{product.avoid}</p></div></section><section className={styles.detailSection}><p className="eyebrow">Before checkout</p><h2>Verify the whole system.</h2><ol>{product.checks.map((check) => <li key={check}>{check}</li>)}</ol><h3>Complete-system cost</h3><p>{product.systemCost}</p><h3>Runtime boundary</h3><p>{product.runtime}</p></section></div>
      <aside className={styles.merchantBox}><p className="eyebrow">{offer.relationship === "affiliate" ? "Merchant destination" : "Official product source"}</p><h2>{offer.merchant}</h2><p>Current price, configuration and availability are confirmed on the linked site.</p><a className="button button-primary" href={offer.href} target="_blank" rel={offer.relationship === "affiliate" ? "sponsored noopener" : "noopener"}>{offer.relationship === "affiliate" ? "View at merchant ↗" : "Visit official site ↗"}</a><p className={styles.linkDisclosure}>{offer.relationship === "affiliate" ? "Affiliate link. We may earn a commission when you buy through this link." : "Manufacturer link. Starlight earns no commission from this link."}</p><dl><div><dt>Destination</dt><dd>{new URL(offer.href).hostname}</dd></div><div><dt>Region</dt><dd>{offer.region}</dd></div><div><dt>Relationship</dt><dd>{offer.relationship === "affiliate" ? "Approved affiliate link" : "Ordinary source link"}</dd></div><div><dt>Link record</dt><dd>{offer.verifiedAt.slice(0, 10)}</dd></div></dl><Link href="/disclosure">Commercial disclosure →</Link></aside>
    </div>
    <section className={styles.detailSources}><div><p className="eyebrow">Evidence</p><h2>Read the manufacturer source.</h2><p>Manufacturer documentation establishes product identity and advertised capabilities. It does not establish independent performance, current stock or Starlight ownership.</p></div><a href={product.sourceUrl} target="_blank" rel="noopener">{product.brand} · official product page ↗</a></section>
    <section className={styles.bottomCallout}><div><p className="eyebrow">Place it in the system</p><h2>Make the next purchase<br />serve the whole studio.</h2></div><Link className="button button-primary" href={product.buildPath}>Explore the decision library →</Link></section>
  </article>;
}
