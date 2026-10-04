import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { decisionGraph } from "./dataset";
import { productVisualFor, productVisuals } from "./product-visuals";
import { getTechnology } from "../technology";

describe("Public catalog media boundaries", () => {
  it("binds unique product identities to official HTTPS sources and existing Atlas records", () => {
    expect(new Set(productVisuals.map((item) => item.nodeId)).size).toBe(productVisuals.length);
    for (const item of productVisuals) {
      expect(decisionGraph.nodes.some((node) => node.id === item.nodeId)).toBe(true);
      expect(new URL(item.officialUrl).protocol).toBe("https:");
      if (item.atlasSlug) expect(getTechnology(item.atlasSlug)).toBeDefined();
    }
    expect(productVisualFor("private-user-note")).toBeUndefined();
  });
  it("keeps the Framework 395 separate from the current manufacturer's 495", () => {
    const item = productVisualFor("dev-framework-desktop-395")!;
    expect(item.officialUrl).toContain("introducing-the-framework-desktop");
    expect(item.notice).toContain("495");
    expect(item.image).toBeUndefined();
  });
  it("ships only local licensed photographs with matching provenance and bytes", () => {
    for (const item of productVisuals) {
      if (!item.image) continue;
      const image = item.image;
      expect(image.src).toMatch(/^\/images\/products\/[a-z0-9-]+\.jpg$/);
      expect(image.author).not.toBe("");
      expect(image.license).toBe("CC BY 4.0");
      expect(new URL(image.licenseUrl).protocol).toBe("https:");
      const file = resolve("public", `.${image.src}`);
      expect(existsSync(file)).toBe(true);
      const provenance = JSON.parse(readFileSync(`${file}.vis.provenance.json`, "utf8"));
      expect(provenance.sha256).toBe(createHash("sha256").update(readFileSync(file)).digest("hex"));
      expect(provenance.source_url).toBe(image.sourceUrl);
      expect(provenance.rights.license).toBe(image.license);
      expect(provenance.rights.author).toBe(image.author);
    }
  });
});
