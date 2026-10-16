import { ImageResponse } from "next/og";
import { digitalProducts, getDigitalProduct } from "@/lib/catalog";

export function generateStaticParams() { return digitalProducts.map(({ slug }) => ({ slug })); }

export const alt = "Starlight Technology shop — workflow edition";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getDigitalProduct(slug);
  const name = product ? `${product.name} ${product.edition}` : "Starlight Technology Shop";
  const line = product ? product.tagline : "Workflow editions, agent skills and research systems.";
  const rail = product ? `€${product.price.amount} proposed · v${product.version} · ${product.licence.code}` : "starlight.technology/shop";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px", background: "#050607", color: "#f4f6ef", fontFamily: "Arial" }}><div style={{ display: "flex", alignItems: "center", fontSize: 24, letterSpacing: 3 }}><span style={{ width: 14, height: 14, borderRadius: 20, background: "#c8f36b", marginRight: 18 }} />STARLIGHT / TECHNOLOGY / SHOP</div><div style={{ display: "flex", flexDirection: "column", gap: 18 }}><div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 700, maxWidth: 1000, letterSpacing: -2 }}>{name}</div><div style={{ fontSize: 30, color: "#c8f36b", maxWidth: 1000 }}>{line}</div></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#a6ac9d" }}><span>{rail}</span><span>SOURCES → REVIEW GATE → CITED BRIEF</span></div></div>, size);
}
