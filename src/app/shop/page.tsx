import type { Metadata } from "next";
import Link from "next/link";
import { collections, digitalProducts, freeProducts, organizationSchema, collectionSchema } from "@/lib/catalog";
import { gateSummary, resolveCheckoutState } from "@/lib/commerce/fulfilment-gates";
import { buildBrief, exampleSources, exampleSummary, exampleTitle, parseSources, renderMarkdown } from "@/lib/brief";
import { shopProducts } from "@/lib/shop";
import { HardwareDiagram } from "@/components/hardware-diagram";
import { CollectionCard } from "@/components/shop/collection-card";
import { RecommendationGrid } from "@/components/shop/collection-page";
import { CheckoutExplainer, CtaModule } from "@/components/shop/cta-module";
import { DisclosureTag } from "@/components/shop/disclosure-tag";
import { Faq } from "@/components/shop/faq";
import { JsonLd } from "@/components/shop/json-ld";
import { Transformation } from "@/components/shop/media-module";
import { ReadinessBoard } from "@/components/shop/readiness-board";
import { ShopEvent } from "@/components/shop/shop-event";
import { StorefrontPreview } from "@/components/shop/storefront-preview";
import styles from "@/components/shop/storefront.module.css";
import hw from "@/components/shop.module.css";

export const metadata: Metadata = {
  title: "Shop — Workflow editions, agent skills and research systems",
  description: "Native digital products that turn approved notes, research and prompts into production AI workflows, agent skills and briefs. Free lab first; paid checkout only when the fulfilment path is proven.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "From approved notes to systems that run.", description: "Workflow editions, agent skills, research systems. Try the free Source-to-Brief Lab.", url: "/shop" }
};

const shopFaq = [
  { question: "What is actually for sale today?", answer: "Nothing yet. One flagship edition is defined, priced provisionally at €149, and waiting on ten fulfilment gates. The free lab is live and exports a real artifact." },
  { question: "Why show a price if I cannot buy?", answer: "So you can judge the offer. The price is marked proposed; it is confirmed with VAT handling and consumer terms before checkout opens, and the availability list tells you when." },
  { question: "Are the hardware and tools affiliate links?", answer: "Each link carries its status. In this release every destination is an official vendor page and Starlight earns nothing. An affiliate label appears only when an approved record and a vendor-issued link exist." },
  { question: "What do you collect?", answer: "Nothing from the lab; it runs in your browser. The availability form collects an email and your stated interest. Analytics events are off until the measurement contract is enabled, and a lab export is never counted as demand or revenue." }
];

const trust = [
  { title: "Licensing", copy: "Single-operator licence: run anywhere you work, modify for your use, ship client deliverables. No resale, no hosting as a service.", href: "/shop/licensing-and-support", label: "Licence terms" },
  { title: "Updates", copy: "Dated changelogs per edition and for the shop. Updates within the major version for a year; every version you received stays yours.", href: "/shop/updates", label: "All updates" },
  { title: "Support", copy: "Email support with a two-business-day target for installation, defects and licence questions. Not a writing service.", href: "/shop/licensing-and-support#support", label: "Support scope" },
  { title: "Privacy", copy: "The lab uploads nothing. The availability list collects an email. No tracking vendors, no cookies for marketing.", href: "/privacy", label: "Privacy posture" },
  { title: "Refund boundaries", copy: "EU withdrawal rights are honoured with explicit consent recording at checkout. Defects are refunded or repaired at any time.", href: "/shop/licensing-and-support#refunds", label: "Refund terms" },
  { title: "Honest limitations", copy: "No testimonials, rankings, revenue claims or partner badges. Hardware specs not in a source record are marked as not measured.", href: "/disclosure", label: "Disclosure" }
];

export default function ShopPage() {
  const flagship = digitalProducts[0];
  const lab = freeProducts[0];
  const checkout = resolveCheckoutState(flagship);
  const gates = gateSummary();
  const example = parseSources(exampleSources);
  const exampleBrief = buildBrief({ title: exampleTitle, summary: exampleSummary, sources: example.sources, lines: example.lines.map((line) => ({ ...line, status: "approved" as const })), surface: "lab", now: new Date("2026-10-16T09:00:00Z") });
  const exampleMarkdown = renderMarkdown(exampleBrief).split("\n").slice(0, 26).join("\n");
  const hardwarePicks = [shopProducts[2], shopProducts[4], shopProducts[0]];
  const itemList = collectionSchema({ ...collections[0], slug: "agent-workflow-kits", name: "Starlight Technology shop collections" }, collections.map((collection) => ({ name: collection.name, path: `/shop/${collection.slug}` })));
  return <div className={`${styles.storefront} shell`}>
    <ShopEvent name="shop_view" props={{ route: "/shop" }} />
    <JsonLd schema={organizationSchema()} />
    <JsonLd schema={{ ...itemList, url: "https://starlight.technology/shop" }} />

    <section className={styles.hero} aria-labelledby="shop-title">
      <div>
        <p className="eyebrow">Starlight Technology / Shop</p>
        <h1 id="shop-title">From approved notes to systems that <em>run.</em></h1>
        <p className={styles.lede}>Workflow editions, agent skills and research systems for founders, indie developers and small studios. One rule across all of them: every output traces back to a source you approved.</p>
        <div className={styles.actions}>
          <Link className={`${styles.btn} ${styles.btnPrimary}`} href={`/shop/products/${flagship.slug}`}>Inspect the flagship edition</Link>
          <Link className={`${styles.btn} ${styles.btnQuiet}`} href={`/shop/free/${lab.slug}`}>Open the free lab</Link>
        </div>
        <div className={styles.metaRail}><span><strong>€{flagship.price.amount}</strong> proposed</span><span>v{flagship.version}</span><span>Node 22 / 24</span><span>{flagship.licence.code} licence</span><span>Checkout {gates.satisfied}/{gates.total} gates</span></div>
        <p className={styles.heroNote}>Native products first. Third-party hardware and tools second, each link labelled with its real commercial status. No marketplace, no reselling, no fake Buy button.</p>
      </div>
      <StorefrontPreview />
    </section>

    <section className={styles.section} aria-labelledby="build-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">What you can build</p><h2 id="build-heading">Five collections. One provenance rule.</h2></div><p>Each collection names what you can build with it, what is for sale, what is free and what is only planned. Planned items are never priced.</p></div>
      <div className={styles.collectionGrid}>{collections.map((collection, index) => <CollectionCard key={collection.slug} collection={collection} index={index} productCount={collection.productSlugs.length} freeCount={collection.freeSlugs.length} />)}</div>
    </section>

    <section className={styles.section} aria-labelledby="flagship-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Flagship edition</p><h2 id="flagship-heading">{flagship.name} {flagship.edition}</h2></div><p>{flagship.customerJob}</p></div>
      <div className={styles.spotlight}>
        <div>
          <Transformation steps={flagship.media.transformation} />
        </div>
        <div className={styles.prose}>
          <p>{flagship.summary}</p>
          <ul className={styles.checkList}>{flagship.includes.slice(0, 6).map((item) => <li key={item.path}><span><code className={styles.mono} style={{ color: "var(--cyan)" }}>{item.path}</code> · {item.description}</span></li>)}</ul>
          <p className={styles.muted} style={{ fontSize: ".84rem" }}>{flagship.includes.length} deliverables in total. Runtime {flagship.runtime}. {flagship.licence.name}.</p>
          <CheckoutExplainer checkout={checkout} />
          <CtaModule product={flagship} checkout={checkout} />
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="lab-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Free · live now</p><h2 id="lab-heading">{lab.name}: {lab.tagline}</h2></div><p>{lab.outcome}</p></div>
      <div className={styles.spotlight}>
        <figure className={styles.window} style={{ margin: 0 }}>
          <figcaption className={styles.windowBar}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><span>brief.md · generated from the worked example</span></figcaption>
          <pre className={styles.windowBody} style={{ maxHeight: 460, whiteSpace: "pre-wrap" }} aria-label="Excerpt of the brief the free lab exports from the worked example"><code>{exampleMarkdown}{"\n…"}</code></pre>
        </figure>
        <div className={styles.prose}>
          <h3>What you leave with</h3>
          <ul className={styles.checkList}>{lab.produces.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>What it is not</h3>
          <ul className={styles.checkList} data-tone="warn">{lab.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
          <div className={styles.actions}><Link className={`${styles.btn} ${styles.btnCyan}`} href={`/shop/free/${lab.slug}`}>Open the lab</Link><Link className={`${styles.btn} ${styles.btnQuiet}`} href={`/shop/products/${flagship.slug}`}>Compare with the edition</Link></div>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="hardware-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Curated hardware and tooling</p><h2 id="hardware-heading">Machines and tools that run the work.</h2></div><p>Recommendations, not listings. No vendor here is a partner; every link states its status. Prices, stock and reviews are absent because the catalogue has no verified source for them.</p></div>
      <div className={hw.productGrid}>{hardwarePicks.map((product) => <article className={hw.productCard} key={product.slug}>
        <div className={hw.cardTop}><span>{product.category}</span><DisclosureTag relationship="official" /></div>
        <Link href={`/shop/${product.slug}`} className={hw.diagram} aria-label={`Category schematic, not a product image. Read the buying decision for ${product.name}`}><HardwareDiagram shape={product.shape} /><span>Category schematic · not a product image</span></Link>
        <div className={hw.cardBody}><p className={hw.brand}>{product.brand}</p><h3><Link href={`/shop/${product.slug}`}>{product.name}</Link></h3><p>{product.summary}</p><div className={hw.fit}><span>RUNTIME</span><p>{product.runtime}</p></div></div>
        <div className={hw.cardFoot}><Link href={`/shop/${product.slug}`}>Inspect the decision →</Link><Link href="/shop/local-ai-hardware">Compare criteria →</Link><small>Independent recommendation · manufacturer link on the decision page · no commission</small></div>
      </article>)}</div>
      <div style={{ marginTop: 28 }}><RecommendationGrid ids={["ollama", "obsidian", "claude-code"]} /></div>
      <div className={styles.actions}><Link className={`${styles.btn} ${styles.btnQuiet}`} href="/shop/local-ai-hardware">All hardware, with criteria table</Link><Link className={`${styles.btn} ${styles.btnQuiet}`} href="/disclosure">How links are labelled</Link></div>
    </section>

    <section className={styles.section} aria-labelledby="trust-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Trust and delivery</p><h2 id="trust-heading">The boring parts, written down.</h2></div><p>Licence, updates, support, privacy, refunds and limits are product facts, so they sit on the product page and here, not in a footer link nobody opens.</p></div>
      <div className={styles.trustGrid}>{trust.map((item) => <article key={item.title} className={styles.reveal}><h3>{item.title}</h3><p>{item.copy}</p><Link href={item.href}>{item.label} →</Link></article>)}</div>
    </section>

    <section className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Questions</p><h2 id="faq-heading" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", marginBottom: 22 }}>Asked before buying.</h2><Faq items={shopFaq} /></div>
        <div><p className="eyebrow">Availability</p><h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", marginBottom: 22 }}>Checkout opens when the board is green.</h2><ReadinessBoard compact /><div className={styles.actions}><Link className={`${styles.btn} ${styles.btnPrimary}`} href="/shop/availability">Join the availability list</Link><Link className={`${styles.btn} ${styles.btnQuiet}`} href="/shop/how-it-works">How it works</Link></div></div>
      </div>
    </section>
  </div>;
}
