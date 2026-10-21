import type { DigitalProduct, FreeProduct } from "@/lib/catalog/types";
import type { CheckoutState } from "@/lib/commerce/fulfilment-gates";

// Self-contained HTML for the embeddable product card at /shop/embed/[slug].
// No framework, no fonts, no scripts: a single document a third-party page
// can iframe. Everything it states comes from the catalogue records and the
// checkout resolver, so it can never show a Buy button the storefront hides.

export const SITE = "https://starlight.technology";

export type EmbedSubject = { kind: "edition"; product: DigitalProduct; checkout: CheckoutState } | { kind: "free"; product: FreeProduct };

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);
}

const css = `
:root{color-scheme:dark}*{box-sizing:border-box}html,body{margin:0;background:#07090a;color:#f1f4ec;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.card{display:grid;gap:14px;min-height:100vh;padding:20px 22px;border:1px solid #34403a;border-radius:10px;background:linear-gradient(160deg,#0c1011,#07090a)}
.top{display:flex;justify-content:space-between;gap:10px;align-items:center;font:11px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#a9b0a4}
.status{padding:3px 8px;border:1px solid #34403a;border-radius:999px}.status[data-s="live"]{color:#c8f36b;border-color:#c8f36b55}.status[data-s="release-candidate"]{color:#ffbf69;border-color:#ffbf6955}
h1{margin:0;font-size:22px;line-height:1.1;letter-spacing:-.03em}h1 small{display:block;margin-top:4px;color:#a9b0a4;font-size:13px;font-weight:500;letter-spacing:0}
p{margin:0;color:#c8cdc3}.price{display:flex;gap:10px;align-items:baseline}.price strong{font-size:24px;letter-spacing:-.03em}.price span{font:11px ui-monospace,monospace;color:#ffbf69;letter-spacing:.06em;text-transform:uppercase}
.row{display:flex;flex-wrap:wrap;gap:8px}.btn{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border:1px solid #34403a;border-radius:4px;color:#f1f4ec;text-decoration:none;font-weight:700;font-size:13px}
.btn.p{color:#050607;background:#c8f36b;border-color:#c8f36b}.btn.c{color:#050607;background:#75d8ff;border-color:#75d8ff}
.fine{color:#a9b0a4;font-size:12px;line-height:1.5}.fine a{color:#a9b0a4}.brand{margin-top:auto;display:flex;justify-content:space-between;gap:10px;align-items:center;padding-top:12px;border-top:1px solid #1f2724;font:11px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#a9b0a4}.brand a{color:#f1f4ec;text-decoration:none}
`.trim();

export function renderEmbedCard(subject: EmbedSubject, base: string = SITE) {
  const link = (path: string) => `${base}${path}?utm_source=embed&utm_medium=iframe`;
  let title: string, sub: string, lede: string, price: string, actions: string, fine: string, status: string, statusLabel: string, canonical: string;
  if (subject.kind === "edition") {
    const { product, checkout } = subject;
    canonical = `/shop/products/${product.slug}`;
    title = product.name; sub = `${product.edition} · v${product.version}`; lede = product.outcome;
    status = product.status; statusLabel = product.status === "live" ? "Live" : product.status === "retired" ? "Retired" : "Release candidate";
    price = `<div class="price"><strong>€${product.price.amount}</strong><span>${product.price.basis === "verified" ? `verified ${escapeHtml(product.price.verifiedOn ?? "")}` : "proposed · test pricing"}</span></div>`;
    actions = checkout.mode === "checkout"
      ? `<a class="btn p" href="${escapeHtml(checkout.href)}" target="_top" rel="noopener">Checkout</a><a class="btn" href="${link(canonical)}" target="_top" rel="noopener">Inspect the edition</a>`
      : `<a class="btn p" href="${link(canonical)}" target="_top" rel="noopener">Inspect the edition</a><a class="btn" href="${link(`/shop/availability`)}&product=${encodeURIComponent(product.slug)}" target="_top" rel="noopener">Join the availability list</a>`;
    fine = checkout.mode === "checkout" ? `${escapeHtml(product.licence.name)} · ${escapeHtml(product.delivery.split(".")[0])}.` : `Checkout is closed until every fulfilment gate is satisfied. The availability list takes no payment and is not an order. ${escapeHtml(product.licence.name)}.`;
  } else {
    const { product } = subject;
    canonical = `/shop/free/${product.slug}`;
    title = product.name; sub = `Free · browser tool · v${product.version}`; lede = product.outcome;
    status = "live"; statusLabel = "Live";
    price = `<div class="price"><strong>€0</strong><span>no account · nothing uploaded</span></div>`;
    actions = `<a class="btn c" href="${link(canonical)}" target="_top" rel="noopener">Open the free lab</a><a class="btn" href="${link(`/shop/products/${product.pairedProduct}`)}" target="_top" rel="noopener">See the paid edition</a>`;
    fine = `${escapeHtml(product.licence.name)}. Runs entirely in the visitor&#39;s browser; no model is called.`;
  }
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} — Starlight Technology</title><link rel="canonical" href="${base}${canonical}"><style>${css}</style></head>
<body><article class="card">
<div class="top"><span>Starlight Technology · shop</span><span class="status" data-s="${status}">${statusLabel}</span></div>
<h1>${escapeHtml(title)}<small>${escapeHtml(sub)}</small></h1>
<p>${escapeHtml(lede)}</p>
${price}
<div class="row">${actions}</div>
<p class="fine">${fine}</p>
<div class="brand"><a href="${link("/shop")}" target="_top" rel="noopener">starlight.technology/shop</a><span>embedded card</span></div>
</article></body></html>
`;
}

/** The snippet shown to people who want to embed the card on their own page. */
export function embedSnippet(slug: string, kind: "edition" | "free", base: string = SITE) {
  const title = kind === "free" ? "Source-to-Brief Lab, free browser tool from Starlight Technology" : "Starlight Technology edition card";
  return `<iframe src="${base}/shop/embed/${slug}" title="${title}" width="100%" height="420" style="border:0;border-radius:10px;max-width:560px" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}
