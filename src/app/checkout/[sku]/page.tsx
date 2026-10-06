import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { candidateProducts, getProduct } from "@/lib/products";
import { decidePurchase, getReleaseApproval } from "@/lib/commerce";
import { ReleaseRequest } from "@/components/release-request";

type Props = { params: Promise<{ sku: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params; const product = getProduct(sku);
  return { title: product ? `Product access · ${product.name}` : "Product access", robots: { index: false, follow: false }, alternates: { canonical: `/checkout/${sku}` } };
}
export default async function CheckoutPage({ params }: Props) {
  const { sku } = await params; const product = getProduct(sku);
  if (!product || product.billing === "free") notFound();
  const checkoutUrl = product.checkoutEnvKey ? process.env[product.checkoutEnvKey] : undefined;
  const state = decidePurchase(product, checkoutUrl, getReleaseApproval(product.id));
  const isCandidate = candidateProducts.some(item => item.id === product.id);
  return <div className="shell checkout-page">
    <p>{state.status === "available" ? "Released digital product" : isCandidate ? "In development" : "Earlier offer under review"}</p>
    <h1>{product.name}</h1>
    <div className="checkout-card">
      {state.status === "available" ? <><p>{product.summary}</p><ul>{product.includes.map(item => <li key={item}>{item}</li>)}</ul><p className="tier-price">{new Intl.NumberFormat("nl-NL", { style: "currency", currency: state.currency }).format(state.amountCents / 100)}</p><a className="button button-primary" href={state.href}>Continue to payment</a><p>Payment and the receipt are handled by Polar. Confirm the product and final amount there.</p></>
        : isCandidate ? <><p>{product.summary}</p><p>Orders are not open. You can prepare a release request describing the work you need to complete.</p><ReleaseRequest productId={product.id} productName={product.name} /></>
        : <><p>New orders for this earlier offer are not enabled here while its release and delivery are being reconciled.</p><p>If you have already purchased it, use the payment-provider receipt and original delivery details.</p><Link className="button" href="/success">Purchase help</Link><Link className="button button-primary" href="/pricing">Current products</Link></>}
      <Link className="button" href="/builds">Explore the free library</Link>
    </div>
  </div>;
}
