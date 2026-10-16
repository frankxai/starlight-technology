import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { digitalProducts, getDigitalProduct, getFreeProduct, productSchema } from "@/lib/catalog";
import { gateSummary, resolveCheckoutState } from "@/lib/commerce/fulfilment-gates";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { CheckoutExplainer, CtaModule } from "@/components/shop/cta-module";
import { Faq } from "@/components/shop/faq";
import { JsonLd } from "@/components/shop/json-ld";
import { FileTree, Terminal, Transformation, WorkflowPipeline } from "@/components/shop/media-module";
import { PricingModule } from "@/components/shop/pricing-module";
import { ReadinessBoard } from "@/components/shop/readiness-board";
import { ShopEvent } from "@/components/shop/shop-event";
import styles from "@/components/shop/storefront.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return digitalProducts.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getDigitalProduct(slug);
  if (!product) return {};
  const title = `${product.name} ${product.edition} — €${product.price.amount} proposed`;
  return { title, description: product.outcome, alternates: { canonical: `/shop/products/${slug}` }, openGraph: { title: `${product.name} ${product.edition}`, description: product.tagline, url: `/shop/products/${slug}`, type: "website" } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getDigitalProduct(slug);
  if (!product) notFound();
  const free = getFreeProduct(product.freeEntry);
  const checkout = resolveCheckoutState(product);
  const gates = gateSummary();
  const path = `/shop/products/${slug}`;
  return <article className={`${styles.storefront} shell`}>
    <ShopEvent name="product_view" props={{ route: path, product: slug }} />
    <JsonLd schema={productSchema(product, checkout)} />
    <Breadcrumbs items={[{ name: "Agent workflow kits", path: "/shop/agent-workflow-kits" }, { name: `${product.name} ${product.edition}`, path }]} />

    <header className={styles.productHero}>
      <div>
        <p className="eyebrow">{product.kind.replace("-", " ")} · v{product.version} · {product.status === "live" ? "live" : "release candidate"}</p>
        <h1>{product.name}<small>{product.edition}</small></h1>
        <p className={styles.lede}>{product.outcome}</p>
        <div className={styles.metaRail}><span><strong>{product.format.split(" (")[0]}</strong></span><span>{product.runtime.split(" · ")[0]}</span><span>{product.licence.code}</span><span>Updates {product.updateCadence.split(";")[0].toLowerCase()}</span></div>
        <div style={{ marginTop: 24 }}><CheckoutExplainer checkout={checkout} /></div>
        <div style={{ marginTop: 26 }}><Transformation steps={product.media.transformation.slice(0, 1)} /></div>
      </div>
      <PricingModule product={product} checkout={checkout} gates={gates} />
    </header>

    <section className={styles.section} aria-labelledby="outcome">
      <div className={styles.sectionHead}><div><p className="eyebrow">Customer outcome</p><h2 id="outcome">{product.customerJob}</h2></div><p>{product.summary}</p></div>
      <WorkflowPipeline stages={product.media.workflow} />
    </section>

    <section className={styles.section} aria-labelledby="included">
      <div className={styles.sectionHead}><div><p className="eyebrow">What is included</p><h2 id="included">Every file in the download, named.</h2></div><p>The manifest below is the deliverable list. Paths are stable across patch releases within 1.x.</p></div>
      <div className={styles.mediaGrid}>
        <FileTree lines={product.media.fileTree} title={`${product.slug}@${product.version}`} />
        <ul className={styles.includeList}>{product.includes.map((item) => <li key={item.path}><div><code>{item.path}</code><small>{item.kind}</small></div><span>{item.description}</span></li>)}</ul>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="demo">
      <div className={styles.sectionHead}><div><p className="eyebrow">Worked example</p><h2 id="demo">What a run looks like.</h2></div><p>Transcript from the worked example that ships in <code className={styles.mono}>examples/quarterly-tooling-decision</code>. The free lab runs the same core on pasted text so you can test the transformation before buying.</p></div>
      <div className={styles.mediaGrid}>
        <Terminal entries={product.media.terminal} title="terminal · deterministic mode" />
        <Transformation steps={product.media.transformation.slice(1)} />
      </div>
      {free && <div className={styles.actions}><Link className={`${styles.btn} ${styles.btnCyan}`} href={`/shop/free/${free.slug}`}>Run the free lab on your own notes</Link></div>}
    </section>

    <section className={styles.section} aria-labelledby="fit">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Who it is for</p><h2 id="fit" style={{ fontSize: "1.6rem", marginBottom: 18 }}>Buy it when</h2><ul className={styles.checkList}>{product.forWhom.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><p className="eyebrow">Who it is not for</p><h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>Do not buy it when</h2><ul className={styles.checkList} data-tone="warn">{product.notForWhom.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="prereq">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Prerequisites and runtime</p><h2 id="prereq" style={{ fontSize: "1.6rem", marginBottom: 18 }}>What your machine needs</h2><dl className={styles.kv}>{product.prerequisites.map((item) => <div key={item.label}><dt>{item.label}{item.required ? "" : " (optional)"}</dt><dd>{item.detail}</dd></div>)}<div><dt>Runtime</dt><dd>{product.runtime}</dd></div><div><dt>Delivery</dt><dd>{product.delivery}</dd></div></dl></div>
        <div><p className="eyebrow">Known limitations</p><h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>What it does not do</h2><ul className={styles.checkList} data-tone="warn">{product.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="licence">
      <div className={styles.sectionHead}><div><p className="eyebrow">Licence and usage rights</p><h2 id="licence">{product.licence.name} · {product.licence.code}</h2></div><p>{product.licence.seats}. Full terms on the <Link href="/shop/licensing-and-support">licensing and support page</Link>.</p></div>
      <div className={styles.twoCol}>
        <div><h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>You may</h3><ul className={styles.checkList}>{product.licence.grants.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>You may not</h3><ul className={styles.checkList} data-tone="warn">{product.licence.restrictions.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="support">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Support scope</p><h2 id="support" style={{ fontSize: "1.6rem", marginBottom: 18 }}>{product.support.channel}</h2><dl className={styles.kv}><div><dt>Response target</dt><dd>{product.support.responseTarget}</dd></div><div><dt>Covers</dt><dd>{product.support.covers.join(" · ")}</dd></div><div><dt>Excludes</dt><dd>{product.support.excludes.join(" · ")}</dd></div><div><dt>Update cadence</dt><dd>{product.updateCadence}</dd></div></dl></div>
        <div><p className="eyebrow">Refunds and consumer rights</p><h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>Planned terms</h2><ul className={styles.checkList}>{product.refund.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="recovery">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Recovery guidance</p><h2 id="recovery" style={{ fontSize: "1.6rem", marginBottom: 18 }}>When something goes wrong</h2><ul className={styles.checkList}>{product.recovery.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><p className="eyebrow">Version and changelog</p><h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>Current: {product.version}</h2><div className={styles.changelog}>{product.changelog.map((entry) => <article key={entry.version}><div><span className={styles.version}>{entry.version}</span><time dateTime={entry.date}>{entry.date}</time></div><div><strong>{entry.summary}</strong><ul>{entry.changes.map((change) => <li key={change}>{change}</li>)}</ul></div></article>)}</div><p style={{ marginTop: 14 }}><Link href="/shop/updates">All shop updates →</Link></p></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="readiness-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Why there is no Buy button</p><h2 id="readiness-heading">Checkout opens when every gate is satisfied.</h2></div><p>The board is the real state of the fulfilment path. A satisfied gate must carry dated evidence. Until all ten pass, the only action is the availability list, which takes no payment.</p></div>
      <ReadinessBoard compact />
    </section>

    <section className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Questions</p><h2 id="faq-heading">Asked before buying.</h2></div></div>
      <Faq items={product.faq} />
    </section>

    <section className={`${styles.callout} ${styles.reveal}`}>
      <div><p className="eyebrow">Decide with evidence</p><h2>{product.tagline}</h2></div>
      <p>Two actions, nothing hidden: join the list to be told when checkout opens and at what price, or run the free lab on your own notes now.</p>
      <CtaModule product={product} checkout={checkout} />
    </section>
  </article>;
}
