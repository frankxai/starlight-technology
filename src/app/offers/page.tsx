import type { Metadata } from "next";
import Link from "next/link";
import { checkoutHref, digitalProducts, productActionLabel, saasTiers } from "@/lib/products";

export const metadata: Metadata = {
  title: "Offers",
  description: "SaaS membership and digital products for Starlight Technology."
};

export default function OffersPage() {
  const paid = [...saasTiers.filter((t) => t.billing !== "free"), ...digitalProducts];
  return (
    <div className="shell page-header offers-page">
      <p className="eyebrow">Proposed catalog · payment unavailable</p>
      <h1>SaaS membership + digital blueprints.</h1>
      <p className="lede">These offers are proposed and not available for purchase. Start with the free <Link href="/ai">AI System Brief Kit</Link>, or inspect the proposed scope on <Link href="/pricing">pricing</Link>.</p>
      <div className="offers-grid">
        {paid.map((p) => (
          <article className="offer-card" key={p.id}>
            <h2>{p.name}</h2>
            <p className="offer-price">Proposed: {p.priceLabel}{p.billing === "month" ? " / mo" : ""}</p>
            <p>{p.summary}</p>
            <a className="button button-primary" href={checkoutHref(p)}>{productActionLabel(p)}</a>
          </article>
        ))}
      </div>
    </div>
  );
}
