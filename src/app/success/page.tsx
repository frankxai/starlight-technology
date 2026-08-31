import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Purchase received", robots: { index: false, follow: false } };
export default function SuccessPage() {
  return (
    <div className="shell success-page">
      <p className="eyebrow">Commerce</p>
      <h1>Purchase received.</h1>
      <p className="lede">Polar receipts arrive by email. Digital blueprints fulfill within 1 business day. Membership activates when seat auth is provisioned.</p>
      <div className="hero-actions" style={{ marginTop: "1.2rem" }}>
        <Link className="button button-primary" href="/app">Member app</Link>
        <Link className="button button-secondary" href="/builds">Free library</Link>
      </div>
    </div>
  );
}
