import type { Collection, DigitalProduct, Faq, FreeProduct } from "./types";
import type { CheckoutState } from "../commerce/fulfilment-gates";

export const siteOrigin = "https://starlight.technology";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Starlight Technology",
    url: siteOrigin,
    logo: `${siteOrigin}/icon`,
    sameAs: ["https://www.frankx.ai/stack"],
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: "hello@frankx.ai", availableLanguage: ["en"] }]
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${siteOrigin}${item.path}` }))
  };
}

export function faqSchema(faq: Faq[]): JsonLd | null {
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({ "@type": "Question", name: entry.question, acceptedAnswer: { "@type": "Answer", text: entry.answer } }))
  };
}

/**
 * Product schema. An Offer is attached only when checkout is actually open,
 * because a proposed price with no purchasable offer is not an Offer.
 */
export function productSchema(product: DigitalProduct, checkout: CheckoutState): JsonLd {
  const base: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.edition}`,
    sku: product.sku,
    description: product.outcome,
    brand: { "@type": "Brand", name: "Starlight Technology" },
    category: product.kind,
    url: `${siteOrigin}/shop/products/${product.slug}`,
    releaseNotes: product.changelog[0]?.summary,
    additionalProperty: [
      { "@type": "PropertyValue", name: "version", value: product.version },
      { "@type": "PropertyValue", name: "licence", value: product.licence.name },
      { "@type": "PropertyValue", name: "runtime", value: product.runtime }
    ]
  };
  if (checkout.mode === "checkout" && product.price.basis === "verified") {
    base.offers = {
      "@type": "Offer",
      price: product.price.amount,
      priceCurrency: product.price.currency,
      availability: "https://schema.org/InStock",
      url: `${siteOrigin}/shop/products/${product.slug}`,
      seller: { "@type": "Organization", name: "Starlight Technology" }
    };
  }
  return base;
}

export function freeProductSchema(product: FreeProduct): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: product.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    url: `${siteOrigin}/shop/free/${product.slug}`,
    description: product.outcome,
    offers: { "@type": "Offer", price: 0, priceCurrency: "EUR", availability: "https://schema.org/InStock" }
  };
}

export function collectionSchema(collection: Collection, items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.name,
    url: `${siteOrigin}/shop/${collection.slug}`,
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: `${siteOrigin}${item.path}` }))
  };
}

export function serializeJsonLd(schema: JsonLd | null) {
  return schema ? JSON.stringify(schema).replace(/</g, "\\u003c") : "";
}
