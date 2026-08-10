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
  if (!product || product.billing === "free") notFound();
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
            <p className="checkout-note">Polar link pending (`{product.checkoutEnvKey}`). Request purchase for 1-business-day fulfillment.</p>
            <a className="button button-primary" href={`mailto:hello@frankx.ai?subject=${encodeURIComponent(`Purchase ${product.name}`)}`}>Request purchase · {product.priceLabel}</a>
            <Link className="button button-secondary" href="/pricing">Back to pricing</Link>
          </>
        )}
      </div>
    </div>
  );
}
