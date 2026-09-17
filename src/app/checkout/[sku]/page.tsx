import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";

type Props = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const product = getProduct(sku);
  return { title: product ? `Checkout · ${product.name}` : "Checkout", robots: { index: false, follow: false } };
}

export default async function CheckoutPage({ params }: Props) {
  const { sku } = await params;
  const product = getProduct(sku);
  if (!product || product.billing === "free" || product.billing === "waitlist") notFound();
  const envUrl = product.checkoutEnvKey ? process.env[product.checkoutEnvKey] : undefined;
  const ready = Boolean(envUrl?.startsWith("http"));
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
          <a className="button button-primary" href={envUrl}>Continue to payment</a>
        ) : (
          <>
            <p className="checkout-note">
              This is not on sale. There is no payment link configured, and a promise to invoice you by email is not a
              product — so we are not offering one. The configurator is free and needs no account.
            </p>
            <Link className="button button-primary" href="/studio">Open the configurator</Link>
            <Link className="button button-secondary" href="/pricing">Back to pricing</Link>
          </>
        )}
      </div>
    </div>
  );
}
