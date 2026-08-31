import type { Metadata } from "next";
import Link from "next/link";
import { checkoutHref, digitalProducts, saasTiers, serviceProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Pricing",
  description: "SaaS membership, digital blueprints and fixed-scope infrastructure architecture for AI-native systems."
};

export default function PricingPage() {
  return (
    <div className="shell pricing-page">
      <section className="pricing-hero page-header">
        <p className="eyebrow">SaaS + digital + B2B systems</p>
        <h1>Membership for buyers. Blueprints when the decision carries capital.</h1>
        <p className="lede">Free library forever. Subscribe for decision models and alerts. Commission fixed-scope work when hardware, organisations, contracts or financing must close together.</p>
      </section>
      <div className="tier-grid">
        {saasTiers.map((tier) => (
          <article className={`tier-card${tier.featured ? " is-featured" : ""}`} key={tier.id}>
            {tier.featured ? <span className="tier-badge">SaaS</span> : null}
            <p className="eyebrow">{tier.billing === "free" ? "Free" : "Monthly"}</p>
            <h2>{tier.name}</h2>
            <p className="tier-price">{tier.priceLabel}{tier.billing === "month" ? <small> / mo</small> : null}</p>
            <p>{tier.summary}</p>
            <ul>{tier.includes.map((i) => <li key={i}>{i}</li>)}</ul>
            <a className="button button-primary" href={checkoutHref(tier)}>{tier.cta}</a>
          </article>
        ))}
      </div>
      <section className="sku-section">
        <h2>Digital products</h2>
        <div className="sku-grid">
          {digitalProducts.map((sku) => (
            <article className="sku-card" key={sku.id}>
              <div className="sku-meta"><span className="sku-chip digital">Digital</span><span className="sku-chip">One-time</span></div>
              <h3>{sku.name}</h3>
              <p className="tier-price">{sku.priceLabel}</p>
              <p>{sku.summary}</p>
              <ul>{sku.includes.map((i) => <li key={i}>{i}</li>)}</ul>
              <a className="button button-primary" href={checkoutHref(sku)}>{sku.cta}</a>
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
              <a className="button button-primary" href={checkoutHref(sku)}>{sku.cta}</a>
              <Link className="button" href={sku.productPath}>Inspect system first</Link>
            </article>
          ))}
        </div>
      </section>
      <section className="method-callout" style={{ marginTop: "3rem" }}>
        <div>
          <p className="eyebrow">Fulfillment</p>
          <h2>Polar for self-serve. Commercial invoice and SOW for B2B.</h2>
        </div>
        <p>Commercial links never rewrite the recommendation. B2B work begins only after scope, entities, evidence access, reliance boundaries and acceptance are explicit.</p>
        <Link className="button button-primary" href="/infrastructure">Inspect Infrastructure OS</Link>
      </section>
    </div>
  );
}
