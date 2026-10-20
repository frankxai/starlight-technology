import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { shopProducts } from "./shop";
import { shopPhotos } from "./shop-photos";

const publicDir = join(process.cwd(), "public");

describe("shop product photographs", () => {
  it("only attaches photographs to products that exist", () => {
    const slugs = new Set(shopProducts.map((product) => product.slug));
    for (const slug of Object.keys(shopPhotos)) expect(slugs.has(slug)).toBe(true);
  });

  it("ships each file with a matching provenance sidecar", () => {
    for (const [slug, photo] of Object.entries(shopPhotos)) {
      const file = join(publicDir, photo.src);
      expect(existsSync(file), slug).toBe(true);
      const sidecar = JSON.parse(readFileSync(`${file}.vis.provenance.json`, "utf8"));
      expect(sidecar.source_url).toBe(photo.sourceUrl);
      expect(sidecar.rights.license).toBe(photo.license);
      expect(sidecar.rights.author).toBe(photo.author);
      expect(sidecar.dimensions).toEqual({ width: photo.width, height: photo.height });
    }
  });

  it("credits the photographer and links the licence and source", () => {
    for (const photo of Object.values(shopPhotos)) {
      expect(photo.author.length).toBeGreaterThan(1);
      expect(photo.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\/licenses\//);
      expect(photo.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(photo.alt.length).toBeGreaterThan(30);
      expect(photo.pictured.length).toBeGreaterThan(10);
    }
  });
});
