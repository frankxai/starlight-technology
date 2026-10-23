import { describe, expect, it } from "vitest";
import { digitalProducts, freeProducts } from "@/lib/catalog";
import { resolveCheckoutState } from "@/lib/commerce/fulfilment-gates";
import { embedSnippet, escapeHtml, renderEmbedCard } from "./embed";

describe("embed card", () => {
  const edition = digitalProducts[0];
  it("never renders a checkout button while the gates are open", () => {
    const html = renderEmbedCard({ kind: "edition", product: edition, checkout: resolveCheckoutState(edition, undefined, {}) });
    expect(html).not.toContain(">Checkout<");
    expect(html).toContain("Join the availability list");
    expect(html).toContain("proposed · test pricing");
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).not.toMatch(/<script/i);
  });
  it("renders the free lab card with no price basis claims", () => {
    const html = renderEmbedCard({ kind: "free", product: freeProducts[0] });
    expect(html).toContain("€0");
    expect(html).toContain("Open the free lab");
  });
  it("escapes html in catalogue strings and builds a stable snippet", () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe("&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;");
    expect(embedSnippet("source-to-brief-lab", "free")).toContain('src="https://starlight.technology/shop/embed/source-to-brief-lab"');
  });
});
