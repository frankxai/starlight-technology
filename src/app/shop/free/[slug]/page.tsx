import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { freeProductSchema, freeProducts, getDigitalProduct, getFreeProduct } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { JsonLd } from "@/components/shop/json-ld";
import { ShopEvent } from "@/components/shop/shop-event";
import { SourceToBriefLab } from "@/components/shop/source-to-brief-lab";
import styles from "@/components/shop/storefront.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return freeProducts.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getFreeProduct(slug);
  if (!product) return {};
  return { title: `${product.name} — free`, description: product.outcome, alternates: { canonical: `/shop/free/${slug}` }, openGraph: { title: product.name, description: product.tagline, url: `/shop/free/${slug}` } };
}

export default async function FreeProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getFreeProduct(slug);
  if (!product) notFound();
  const paired = getDigitalProduct(product.pairedProduct);
  const path = `/shop/free/${slug}`;
  return <article className={`${styles.storefront} shell`}>
    <ShopEvent name="product_view" props={{ route: path, product: slug }} />
    <JsonLd schema={freeProductSchema(product)} />
    <Breadcrumbs items={[{ name: "Free", path: "/shop/free/source-to-brief-lab" }, { name: product.name, path }]} />
    <header className={styles.productHero} style={{ paddingBottom: 24 }}>
      <div>
        <p className="eyebrow">Free · v{product.version} · browser tool</p>
        <h1>{product.name}<small>{product.tagline}</small></h1>
        <p className={styles.lede}>{product.outcome}</p>
        <div className={styles.metaRail}><span><strong>€0</strong></span><span>No account</span><span>Nothing uploaded</span><span>No model call</span><span>{product.licence.code}</span></div>
      </div>
      <div className={styles.window}>
        <div className={styles.windowBar}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><span>you leave with</span></div>
        <ul className={styles.checkList} style={{ padding: "16px 18px" }}>{product.produces.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className={styles.stageFoot}><span><b>Limits:</b> {product.limitations[0]}</span></div>
      </div>
    </header>

    <section className={styles.sectionTight} aria-labelledby="lab-heading" id="lab">
      <h2 id="lab-heading" className="sr-only">Source-to-Brief Lab</h2>
      <SourceToBriefLab />
    </section>

    <section className={styles.section} aria-labelledby="lab-limits">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Limitations</p><h2 id="lab-limits" style={{ fontSize: "1.6rem", marginBottom: 18 }}>What the free lab does not do</h2><ul className={styles.checkList} data-tone="warn">{product.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><p className="eyebrow">Licence</p><h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>{product.licence.name}</h2><ul className={styles.checkList}>{product.licence.grants.map((item) => <li key={item}>{item}</li>)}</ul><ul className={styles.checkList} data-tone="warn" style={{ marginTop: 10 }}>{product.licence.restrictions.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>

    {paired && <section className={`${styles.callout} ${styles.reveal}`}>
      <div><p className="eyebrow">The paid edition</p><h2>{paired.name} {paired.edition}: the folder-scale version.</h2></div>
      <p>{paired.summary}</p>
      <Link className={`${styles.btn} ${styles.btnPrimary}`} href={`/shop/products/${paired.slug}`}>Inspect the edition · €{paired.price.amount} proposed</Link>
    </section>}
  </article>;
}
