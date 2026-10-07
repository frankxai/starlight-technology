import type { Metadata } from "next";
import Link from "next/link";
import { checkoutHref, digitalProducts, productActionLabel, saasTiers, serviceProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Pricing",
  description: "SaaS membership, digital blueprints and fixed-scope infrastructure architecture for AI-native systems.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing · Starlight Technology",
    description: "Membership, decision products and fixed-scope infrastructure architecture for AI-native systems.",
    url: "/pricing"
  }
};

export default function PricingPage() {
  return (
    <div className="shell pricing-page">
      <section className="pricing-hero page-header">
        <p className="eyebrow">SaaS + digital + B2B systems</p>
        <h1>Membership for buyers. Blueprints when the decision carries capital.</h1>
        <p className="lede">The public library and AI System Brief Kit are available now. Paid memberships and digital offers below are proposed; payment and member fulfilment are not active. Infrastructure work starts with a scope discussion.</p>
      </section>
      <div className="tier-grid">
        {saasTiers.map((tier) => (
          <article className={`tier-card${tier.featured ? " is-featured" : ""}`} key={tier.id}>
            {tier.featured ? <span className="tier-badge">SaaS</span> : null}
            <p className="eyebrow">{tier.billing === "free" ? "Available free" : "Proposed membership · unavailable"}</p>
            <h2>{tier.name}</h2>
            <p className="tier-price">{tier.billing === "free" ? "" : "Proposed: "}{tier.priceLabel}{tier.billing === "month" ? <small> / mo</small> : null}</p>
            <p>{tier.summary}</p>
            <ul>{tier.includes.map((i) => <li key={i}>{i}</li>)}</ul>
            <a className="button button-primary" href={checkoutHref(tier)}>{productActionLabel(tier)}</a>
          </article>
        ))}
      </div>
      <section className="sku-section">
        <h2>Proposed digital offers</h2>
        <div className="sku-grid">
          {digitalProducts.map((sku) => (
            <article className="sku-card" key={sku.id}>
              <div className="sku-meta"><span className="sku-chip digital">Proposed</span><span className="sku-chip">Not available for purchase</span></div>
              <h3>{sku.name}</h3>
              <p className="tier-price">Proposed: {sku.priceLabel}</p>
              <p>{sku.summary}</p>
              <ul>{sku.includes.map((i) => <li key={i}>{i}</li>)}</ul>
              <a className="button button-primary" href={checkoutHref(sku)}>{productActionLabel(sku)}</a>
            </article>
          ))}
        </div>
      </section>
      <section className="sku-section">
        <h2>Infrastructure architecture</h2>
        <div className="sku-grid">
          {serviceProducts.map((sku) => (
            <article className="sku-card" key={sku.id}>
              <div className="sku-meta"><span className="sku-chip digital">B2B service</span><span className="sku-chip">Fixed scope</span></div>
              <h3>{sku.name}</h3>
              <p className="tier-price">{sku.priceLabel}</p>
              <p>{sku.summary}</p>
              <ul>{sku.includes.map((i) => <li key={i}>{i}</li>)}</ul>
              <a className="button button-primary" href={checkoutHref(sku)}>{productActionLabel(sku)}</a>
              <Link className="button" href={sku.productPath}>Inspect system first</Link>
            </article>
          ))}
        </div>
      </section>
      <section className="method-callout" style={{ marginTop: "3rem" }}>
        <div>
          <p className="eyebrow">Fulfillment</p>
          <h2>Delivery before payment. Scope before engagement.</h2>
        </div>
        <p>Self-serve payment remains unavailable until delivery and access are verified. B2B work begins only after scope, entities, evidence access, reliance boundaries and acceptance are explicit.</p>
        <Link className="button button-primary" href="/infrastructure">Inspect Infrastructure OS</Link>
      </section>
    </div>
  );
}
