import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Purchase help", robots: { index: false, follow: false } };
export default function SuccessPage() {
  return <div className="shell success-page"><p>Purchase help</p><h1>Check your payment-provider receipt.</h1><p className="lede">This page cannot verify a payment or confirm access. Your provider receipt identifies the purchased product and payment status. Check it together with the original delivery instructions.</p><p>If those details are missing, contact hello@frankx.ai with the product name and receipt reference. Avoid sending card information.</p><div className="hero-actions" style={{ marginTop: "1.2rem" }}><a className="button button-primary" href="mailto:hello@frankx.ai?subject=Starlight%20existing%20purchase">Open a purchase question</a><Link className="button button-secondary" href="/builds">Free library</Link></div></div>;
}
