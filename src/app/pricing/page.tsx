import type { Metadata } from "next";
import Link from "next/link";
import { checkoutHref, digitalProducts, saasTiers } from "@/lib/products";

export const metadata: Metadata = {
  title: "Pricing",
  description: "SaaS membership and digital blueprints for AI-native studio buying intelligence."
};

export default function PricingPage() {
  return (
    <div className="shell pricing-page">
      <section className="pricing-hero page-header">
        <p className="eyebrow">SaaS + digital</p>
        <h1>Membership for buyers. Blueprints when you need a human.</h1>
        <p className="lede">Free library forever. Subscribe for decision models and alerts. Buy fixed digital work for blueprint/audit delivery.</p>
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
      <section className="method-callout" style={{ marginTop: "3rem" }}>
        <div>
          <p className="eyebrow">Fulfillment</p>
          <h2>Polar for self-serve. Stripe invoices on request.</h2>
        </div>
        <p>Affiliate links never rewrite verdicts. Membership content stays evidence-labeled. No fake hands-on claims.</p>
        <Link className="button button-primary" href="/builds">Browse free builds</Link>
      </section>
    </div>
  );
}
