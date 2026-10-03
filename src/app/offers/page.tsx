import type { Metadata } from "next";
import Link from "next/link";
import { candidateProducts, checkoutHref } from "@/lib/products";
export const metadata: Metadata = { title: "Creator tools", description: "Self-service creator tools in development and the open system library." };
export default function OffersPage() {
  return <div className="shell page-header offers-page"><p>Creator tools</p><h1>Tools for your next system and workflow.</h1><p className="lede">The library is open. The creator kit is in development, with price and release date pending.</p><div className="offers-grid">{candidateProducts.map(product => <article className="offer-card" key={product.id}><h2>{product.name}</h2><p>{product.summary}</p><p>Orders are not open.</p><Link className="button button-primary" href={checkoutHref(product)}>{product.cta}</Link></article>)}</div><Link className="button" href="/builds">Explore the free library</Link><Link className="button" href="/pricing">Product status</Link></div>;
}
