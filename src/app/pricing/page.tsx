import type { Metadata } from "next";
import Link from "next/link";
import { candidateProducts, checkoutHref } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products and release status",
  description: "Explore the free system library and the AI Creator Studio kit in development.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: "Products and release status · Starlight Technology", description: "Free buying intelligence and customer-owned creator tools in development.", url: "/pricing" }
};

export default function PricingPage() {
  return <div className="shell pricing-page">
    <section className="pricing-hero page-header">
      <p>Products and release status</p>
      <h1>Choose tools around the work you need to finish.</h1>
      <p className="lede">The system library is open. We are developing self-service creator tools and collecting the workflows they need to support.</p>
    </section>
    <section className="sku-section" aria-label="Available and planned products">
      <div className="sku-grid">
        <article className="sku-card"><p>Available free</p><h2>System library</h2><p>Explore complete builds, comparisons and field guides with sources and explicit evidence states.</p><Link className="button button-primary" href="/builds">Explore builds</Link><Link className="button" href="/compare">Compare systems</Link></article>
        {candidateProducts.map(product => <article className="sku-card" key={product.id}><p>In development</p><h2>{product.name}</h2><p>{product.summary}</p><h3>Planned scope</h3><ul>{product.includes.map(item => <li key={item}>{item}</li>)}</ul><p>The price and release date have not been announced. Orders are not open.</p><Link className="button button-primary" href={checkoutHref(product)}>{product.cta}</Link></article>)}
      </div>
    </section>
    <section className="method-callout" style={{ marginTop: "3rem" }}><div><h2>Already purchased an earlier offer?</h2></div><p>Use your payment-provider receipt to identify the product and its original delivery details. This page does not change an existing purchase or subscription.</p><Link className="button" href="/success">Purchase help</Link></section>
  </div>;
}
