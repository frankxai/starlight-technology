import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Payment status", robots: { index: false, follow: false } };
export default function SuccessPage() {
  return (
    <div className="shell success-page">
      <p className="eyebrow">Commerce</p>
      <h1>Check your payment status.</h1>
      <p className="lede">This page does not verify a payment or create an entitlement. Self-serve purchasing and member activation are not active. When a commercial engagement is agreed, its invoice and delivery terms provide the record.</p>
      <div className="hero-actions" style={{ marginTop: "1.2rem" }}>
        <Link className="button button-primary" href="/ai">Free AI System Brief Kit</Link>
        <Link className="button button-secondary" href="/builds">Free library</Link>
      </div>
    </div>
  );
}
