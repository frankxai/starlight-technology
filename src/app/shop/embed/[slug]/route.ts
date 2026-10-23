import { digitalProducts, freeProducts, getDigitalProduct, getFreeProduct } from "@/lib/catalog";
import { resolveCheckoutState } from "@/lib/commerce/fulfilment-gates";
import { renderEmbedCard } from "@/lib/shop/embed";

// Embeddable product card. Framable from any origin (that is its purpose),
// never indexed, cached briefly so a checkout-state change propagates.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateStaticParams() { return [...digitalProducts, ...freeProducts].map(({ slug }) => ({ slug })); }

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const edition = getDigitalProduct(slug);
  const free = edition ? undefined : getFreeProduct(slug);
  if (!edition && !free) return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  const html = edition ? renderEmbedCard({ kind: "edition", product: edition, checkout: resolveCheckoutState(edition) }) : renderEmbedCard({ kind: "free", product: free! });
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors *; base-uri 'none'; form-action 'none'",
      "x-robots-tag": "noindex",
      "referrer-policy": "strict-origin-when-cross-origin"
    }
  });
}
