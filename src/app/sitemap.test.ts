import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

const required = ["/shop", "/shop/agent-workflow-kits", "/shop/mcp-and-agent-skills", "/shop/research-and-decision-intelligence", "/shop/creative-production", "/shop/local-ai-hardware", "/shop/products/source-to-brief-workflow-edition", "/shop/free/source-to-brief-lab", "/shop/how-it-works", "/shop/licensing-and-support", "/shop/updates", "/shop/availability"];

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);
  it.each(required)("lists %s", (path) => { expect(urls).toContain(`https://starlight.technology${path}`); });
  it("has no duplicate urls", () => { expect(new Set(urls).size).toBe(urls.length); });
});
