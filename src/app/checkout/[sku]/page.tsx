import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";

type Props = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const product = getProduct(sku);
  return {
    title: product ? `Checkout · ${product.name}` : "Checkout",
    robots: { index: false, follow: false },
    alternates: { canonical: `/checkout/${sku}` }
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { sku } = await params;
  const product = getProduct(sku);
  if (!product || product.billing === "free") notFound();
  const envUrl = product.checkoutEnvKey ? process.env[product.checkoutEnvKey] : undefined;
  const ready = Boolean(envUrl?.startsWith("http"));
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
    : `I want to purchase ${product.name}.`;

  return (
    <div className="shell checkout-page">
      <p className="eyebrow">Checkout · {product.kind}</p>
      <h1>{product.name}</h1>
      <div className="checkout-card">
        <div className="checkout-summary">
          <strong>{product.name}</strong>
          <span className="tier-price">{product.priceLabel}{product.billing === "month" ? " / mo" : ""}</span>
          <p>{product.summary}</p>
        </div>
        <ul>{product.includes.map((i) => <li key={i}>{i}</li>)}</ul>
        {ready ? (
          <a className="button button-primary" href={envUrl}>{isService ? "Continue to commercial checkout" : "Continue to payment"}</a>
        ) : (
          <>
            <p className="checkout-note">
              {isService
                ? "Commercial checkout is invoice-led. Submit the engagement intake; entity, scope, reliance boundaries and the Phase 0 SOW are confirmed before invoicing. No asset purchase, financing or production access is authorised by this request."
                : `Payment link pending (${product.checkoutEnvKey}). Request purchase to receive the current fulfillment instructions.`}
            </p>
            <a
              className="button button-primary"
              href={`mailto:hello@frankx.ai?subject=${encodeURIComponent(`${isService ? "Commission" : "Purchase"} ${product.name}`)}&body=${encodeURIComponent(inquiryBody)}`}
            >
              {isService ? "Submit engagement intake" : "Request purchase"} · {product.priceLabel}
            </a>
            {isService ? <Link className="button button-secondary" href="/infrastructure/contracts">Review contract architecture</Link> : null}
            <Link className="button button-secondary" href="/pricing">Back to pricing</Link>
          </>
        )}
      </div>
    </div>
  );
}
