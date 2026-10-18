import Link from "next/link";
import { collectionSchema, collections, digitalProducts, freeProducts, getRecommendations, type Collection } from "@/lib/catalog";
import { resolveCheckoutState } from "@/lib/commerce/fulfilment-gates";
import { shopProducts, type ShopProduct } from "@/lib/shop";
import { resolveShopOffer, type ShopOffer } from "@/lib/shop-offers";
import { getHardwareSpec, hardwareSpecs, isUnpublished } from "@/lib/hardware-specs";
import { ShopExplorer } from "@/components/shop-explorer";
import { Breadcrumbs } from "./breadcrumbs";
import { DisclosureTag, disclosureCopy } from "./disclosure-tag";
import { Faq } from "./faq";
import { JsonLd } from "./json-ld";
import { FreeProductCard, ProductCard } from "./product-card";
import { TrackedLink } from "./tracked-link";
import { ShopEvent } from "./shop-event";
import styles from "./storefront.module.css";
import hw from "@/components/shop.module.css";

export function RecommendationGrid({ ids }: { ids: string[] }) {
  const items = getRecommendations(ids);
  if (items.length === 0) return null;
  return <div className={styles.recGrid}>{items.map((item) => <article className={`${styles.rec} ${styles.reveal}`} key={item.id}>
    <header><h3>{item.name}<small>{item.vendor} · {item.category.replace("-", " ")}</small></h3><DisclosureTag relationship={item.relationship} /></header>
    <p>{item.useCase}</p>
    <p><strong style={{ color: "var(--paper)", fontWeight: 600 }}>Why it is here.</strong> {item.why}</p>
    <ul aria-label="Verify before you rely on it">{item.verifyBefore.map((check) => <li key={check}>{check}</li>)}</ul>
    <footer><TrackedLink href={item.href} relationship={item.relationship} destination={new URL(item.href).hostname}>Official site ↗</TrackedLink><small>{disclosureCopy[item.relationship].split(".")[0]} · checked {item.verifiedOn}</small></footer>
  </article>)}</div>;
}

// Hardware criteria. Workload, total system cost and agent use case are
// editorial inference. Memory, GPU, power, noise and expansion come from
// data/commerce/hardware-specs.json, transcribed from the manufacturer page
// with a verification date; absent values are stated as such, never invented.
const agentUseCase: Record<string, string> = {
  "nvidia-dgx-spark": "Dedicated node for persistent agents and local model development on the NVIDIA stack.",
  "nvidia-rtx-5090": "CUDA inference inside a workstation that also renders and edits.",
  "minisforum-ms-s1-max": "Compact always-on host for local inference behind Ollama or llama.cpp, after runtime validation.",
  "apple-mac-studio": "macOS desk running the Workflow Edition and Apple-silicon inference backends.",
  "ugreen-dxp4800-plus": "Shared, backed-up source library the workflow reads from.",
  "samsung-990-pro-2tb": "Fast local store for models, indexes and brief exports.",
  "elgato-stream-deck-plus": "Physical triggers for repeated workflow runs and capture scenes.",
  "rode-podmic-usb": "Consistent voice capture for walkthroughs produced from briefs."
};

function HardwareCriteria({ products, offers }: { products: ShopProduct[]; offers: Record<string, ShopOffer> }) {
  return <div className={styles.tableWrap}>
    <table className={styles.table}>
      <caption className="sr-only">Hardware comparison criteria. Manufacturer-published specifications with verification date; unpublished values are stated as such.</caption>
      <thead><tr><th scope="col">Component</th><th scope="col">Workload</th><th scope="col">Memory</th><th scope="col">GPU / accelerator</th><th scope="col">Power</th><th scope="col">Noise</th><th scope="col">Expansion</th><th scope="col">Total system cost</th><th scope="col">Agent use case</th><th scope="col">Link</th></tr></thead>
      <tbody>{products.map((product) => {
        const offer = offers[product.slug];
        const spec = getHardwareSpec(product.slug);
        return <tr key={product.slug}>
          <th scope="row"><Link href={`/shop/${product.slug}`}>{product.brand} {product.name}</Link><br /><small className={styles.muted}>{product.category}</small></th>
          <td>{product.role}</td>
          {(["memory", "gpu", "power", "noise", "expansion"] as const).map((key) => { const value = spec?.[key] ?? "Not published"; return <td key={key} className={isUnpublished(value) ? styles.verify : undefined}>{value}</td>; })}
          <td>{product.systemCost}</td>
          <td>{agentUseCase[product.slug]}</td>
          <td><TrackedLink href={offer.href} relationship={offer.relationship} destination={new URL(offer.href).hostname}>{offer.relationship === "affiliate" ? "Merchant ↗" : "Official ↗"}</TrackedLink><br /><DisclosureTag relationship={offer.relationship} /></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

export function CollectionPage({ collection }: { collection: Collection }) {
  const index = collections.findIndex((item) => item.slug === collection.slug);
  const products = digitalProducts.filter((product) => collection.productSlugs.includes(product.slug));
  const free = freeProducts.filter((product) => collection.freeSlugs.includes(product.slug));
  const hardware = shopProducts.filter((product) => collection.hardwareSlugs?.includes(product.slug));
  const offers = Object.fromEntries(hardware.map((product) => [product.slug, resolveShopOffer(product)]));
  const items = [
    ...products.map((p) => ({ name: `${p.name} ${p.edition}`, path: `/shop/products/${p.slug}` })),
    ...free.map((p) => ({ name: p.name, path: `/shop/free/${p.slug}` })),
    ...hardware.map((p) => ({ name: `${p.brand} ${p.name}`, path: `/shop/${p.slug}` }))
  ];
  const hasHardware = hardware.length > 0;
  return <div className={`${styles.storefront} shell`}>
    <ShopEvent name="shop_view" props={{ route: `/shop/${collection.slug}`, collection: collection.slug }} />
    <JsonLd schema={collectionSchema(collection, items)} />
    <Breadcrumbs items={[{ name: collection.name, path: `/shop/${collection.slug}` }]} />
    <header className={styles.hero} style={{ paddingBlock: "clamp(36px, 5vw, 72px)" }}>
      <div>
        <p className="eyebrow">{collection.eyebrow} · {String(index + 1).padStart(2, "0")} of {collections.length}</p>
        <h1>{collection.name}</h1>
        <p className={styles.lede}>{collection.outcome}</p>
        <p className={styles.heroNote}>{collection.summary}</p>
      </div>
      <div className={styles.window}>
        <div className={styles.windowBar}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><span>what you can build</span></div>
        <ol className={`${styles.windowBody} ${styles.mono}`} style={{ margin: 0, paddingLeft: "2.4rem" }}>{collection.builds.map((build) => <li key={build}>{build}</li>)}</ol>
        <div className={styles.stageFoot}><span><b>{products.length}</b> edition{products.length === 1 ? "" : "s"} · <b>{free.length}</b> free · <b>{hasHardware ? hardware.length : collection.recommendationIds.length}</b> {hasHardware ? "hardware records" : "tools"}</span><span>{collection.planned.length > 0 ? `${collection.planned.length} planned` : "no planned items"}</span></div>
      </div>
    </header>

    {(products.length > 0 || free.length > 0) && <section className={styles.section} aria-labelledby={`${collection.slug}-editions`}>
      <div className={styles.sectionHead}><div><p className="eyebrow">Editions</p><h2 id={`${collection.slug}-editions`}>Native products in this collection.</h2></div><p>Each edition page lists what is included, who it is not for, licence, version, support scope and limitations before any call to action.</p></div>
      <div className={styles.productGrid}>
        {products.map((product) => <ProductCard key={product.slug} product={product} checkout={resolveCheckoutState(product)} featured />)}
        {free.map((product) => <FreeProductCard key={product.slug} product={product} />)}
      </div>
    </section>}

    {products.length === 0 && !hasHardware && <section className={styles.section} aria-labelledby={`${collection.slug}-state`}>
      <div className={styles.sectionHead}><div><p className="eyebrow">Status</p><h2 id={`${collection.slug}-state`}>Nothing for sale here yet.</h2></div><p>The planned items below are listed so you can tell us which matters. They carry no price, no date and no pre-order.</p></div>
      <p className={styles.notice}><span>No edition in this collection has passed the fulfilment gates. <Link href="/shop/availability">Join the availability list</Link> and tick this collection; that is the only signal we count. <Link href="/shop/free/source-to-brief-lab">The free lab</Link> is live now.</span></p>
    </section>}

    {hasHardware && <>
      <section className={styles.section} aria-labelledby="hardware-criteria">
        <div className={styles.sectionHead}><div><p className="eyebrow">Independent recommendations</p><h2 id="hardware-criteria">Compare by criteria, not by badge.</h2></div><p>No vendor listed here is a Starlight partner. Links go to official pages unless an approved, unexpired affiliate record exists; the label beside each link states which. No prices, stock or reviews are shown because the catalogue has no verified source for them.</p></div>
        <HardwareCriteria products={hardware} offers={offers} />
        <p className={styles.heroNote} style={{ marginTop: 14 }}>{`Memory, GPU capability, power, noise and expansion are transcribed from each manufacturer page, checked ${hardwareSpecs.verifiedOn}. Cells marked not published or not applicable are stated as such rather than filled in. Workload, total system cost and agent use case are Starlight editorial inference. Nothing is measured by Starlight.`}</p>
      </section>
      <ShopExplorer products={hardware} offers={offers} />
    </>}

    {collection.recommendationIds.length > 0 && <section className={styles.section} aria-labelledby={`${collection.slug}-tools`}>
      <div className={styles.sectionHead}><div><p className="eyebrow">Tooling</p><h2 id={`${collection.slug}-tools`}>Tools that pair with this collection.</h2></div><p>Independent recommendations with official links. Starlight earns nothing from them. Verify the items listed before relying on a tool.</p></div>
      <RecommendationGrid ids={collection.recommendationIds} />
    </section>}

    {collection.planned.length > 0 && <section className={styles.section} aria-labelledby={`${collection.slug}-planned`}>
      <div className={styles.sectionHead}><div><p className="eyebrow">Planned · not for sale</p><h2 id={`${collection.slug}-planned`}>What is being scoped.</h2></div><p>Listed for transparency. No price, no date, no pre-order. Say which matters on the availability list.</p></div>
      <div className={styles.planned}>{collection.planned.map((item) => <article key={item.name}><span>{item.state.replace("-", " ")}</span><h3>{item.name}</h3><p>{item.outcome}</p></article>)}</div>
    </section>}

    <section className={styles.section} aria-labelledby={`${collection.slug}-faq`}>
      <div className={styles.sectionHead}><div><p className="eyebrow">Questions</p><h2 id={`${collection.slug}-faq`}>Before you go further.</h2></div></div>
      <Faq items={collection.faq} />
    </section>

    <section className={`${styles.callout} ${styles.reveal}`}>
      <div><p className="eyebrow">Next</p><h2>Start with the free lab. Decide with an artifact in hand.</h2></div>
      <p>The lab exports the same format the editions produce. If the artifact is useful, the edition is the folder-scale version with gates, diagnostics and support.</p>
      <Link className={`${styles.btn} ${styles.btnCyan}`} href="/shop/free/source-to-brief-lab">Open the lab</Link>
    </section>
    {hasHardware && <div className={hw.shopFootnote} style={{ marginTop: 40 }}><p>Product identities and manufacturer pages checked 7 October 2026. Buying fit and constraints are Starlight editorial inference. No independent performance testing is claimed.</p><p>Prices, stock, delivery, warranty and final configuration are confirmed by the merchant. <Link href="/disclosure">Commercial disclosure →</Link></p></div>}
  </div>;
}
