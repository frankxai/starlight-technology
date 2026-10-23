import { collections, digitalProducts, freeProducts, recommendations } from "@/lib/catalog";
import { fulfilmentContract, resolveCheckoutState } from "@/lib/commerce/fulfilment-gates";
import { SITE } from "@/lib/shop/embed";

// Machine-readable catalogue for programmatic embeds. Mirrors the pages:
// a checkout URL appears only when the resolver opens it; prices carry their
// basis; recommendations carry their relationship label. No stock, no reviews.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const generatedAt = new Date().toISOString();
  const editions = digitalProducts.map((product) => {
    const checkout = resolveCheckoutState(product);
    return {
      slug: product.slug, sku: product.sku, name: product.name, edition: product.edition, version: product.version, status: product.status,
      outcome: product.outcome, price: product.price, licence: product.licence.code, format: product.format, runtime: product.runtime,
      url: `${SITE}/shop/products/${product.slug}`, embed: `${SITE}/shop/embed/${product.slug}`,
      availability: checkout.mode === "checkout" ? { mode: "checkout", checkoutUrl: checkout.href } : { mode: "availability-list", url: `${SITE}${checkout.href}`, openGates: checkout.openGates.length }
    };
  });
  const free = freeProducts.map((product) => ({ slug: product.slug, name: product.name, version: product.version, outcome: product.outcome, licence: product.licence.code, url: `${SITE}/shop/free/${product.slug}`, embed: `${SITE}/shop/embed/${product.slug}`, pairedProduct: product.pairedProduct }));
  return Response.json(
    {
      schema: "starlight.shop.catalog/v1", generatedAt, contractVersion: fulfilmentContract.contractVersion,
      editions, free,
      collections: collections.map((collection) => ({ slug: collection.slug, name: collection.name, url: `${SITE}/shop/${collection.slug}` })),
      recommendations: recommendations.map((item) => ({ id: item.id, name: item.name, relationship: item.relationship, url: item.href, verifiedOn: item.verifiedOn }))
    },
    { headers: { "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400", "access-control-allow-origin": "*" } }
  );
}
