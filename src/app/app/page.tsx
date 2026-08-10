import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Member app", robots: { index: false, follow: false } };

export default function MemberAppPage() {
  return (
    <div className="shell page-header" style={{ paddingBottom: "5rem" }}>
      <p className="eyebrow">SaaS product surface</p>
      <h1>Studio Member workspace</h1>
      <p className="lede">Shortlists, blueprint history, and alerts unlock after subscription. Free library stays open.</p>
      <div className="sku-grid" style={{ marginTop: "1.5rem" }}>
        <article className="sku-card">
          <h2>Free library</h2>
          <p>Builds and comparisons without an account.</p>
          <Link className="button button-primary" href="/builds">Open builds</Link>
        </article>
        <article className="sku-card">
          <h2>Subscribe</h2>
          <p>Studio Member and Ops plans.</p>
          <Link className="button button-primary" href="/pricing">Pricing</Link>
        </article>
      </div>
    </div>
  );
}
