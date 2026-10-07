import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";

type Props = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const product = getProduct(sku);
  return {
    title: product ? `${product.kind === "service" ? "Scope inquiry" : "Proposed offer"} · ${product.name}` : "Offer",
    robots: { index: false, follow: false },
    alternates: { canonical: `/checkout/${sku}` }
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { sku } = await params;
  const product = getProduct(sku);
  if (!product || product.billing === "free") notFound();
  const isService = product.kind === "service";
  const inquiryBody = isService
    ? [
        `I want to commission: ${product.name}`,
        "",
        "Organisation / entities:",
        "Decision owner:",
        "Site / warehouse / energy assets:",
        "Primary operating workflows:",
        "Current ERP / shop / CRM / IT estate:",
        "Capital posture (cash / lease / bank / mixed):",
        "Target decision date:",
        "",
        "I understand that the initial engagement is a fixed-scope underwriting mandate and does not itself authorise hardware, financing, legal advice or production-system access."
      ].join("\n")
    : `I want to discuss the proposed scope of ${product.name}. I understand it is not currently available for purchase.`;

  return (
    <div className="shell checkout-page">
      <p className="eyebrow">{isService ? "Scope inquiry · B2B service" : "Proposed offer · payment unavailable"}</p>
      <h1>{product.name}</h1>
      <div className="checkout-card">
        <div className="checkout-summary">
          <strong>{product.name}</strong>
          <span className="tier-price">{isService ? "Scope guide: " : "Proposed: "}{product.priceLabel}{product.billing === "month" ? " / mo" : ""}</span>
          <p>{product.summary}</p>
        </div>
        <ul>{product.includes.map((i) => <li key={i}>{i}</li>)}</ul>
        <>
            <p className="checkout-note">
              {isService
                ? "Submit a scope inquiry. Entity, capacity, delivery scope, reliance boundaries and a written agreement must be confirmed before invoicing. This request does not purchase an engagement or authorise an asset purchase, financing or production access."
                : "This offer is proposed and not available for purchase. Payment, entitlement and fulfilment have not been verified. The free AI System Brief Kit and public library are available now."}
            </p>
            <a
              className="button button-primary"
              href={`mailto:hello@frankx.ai?subject=${encodeURIComponent(`Scope inquiry: ${product.name}`)}&body=${encodeURIComponent(inquiryBody)}`}
            >
              {isService ? "Send a scope inquiry" : "Discuss the proposed scope"}
            </a>
            {isService ? <Link className="button button-secondary" href="/infrastructure/contracts">Review contract architecture</Link> : null}
            {!isService ? <Link className="button button-primary" href="/ai">Get the free AI brief kit</Link> : null}
            <Link className="button button-secondary" href="/pricing">Back to pricing</Link>
        </>
      </div>
    </div>
  );
}
