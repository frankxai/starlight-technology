import { test, expect } from "vitest";
import { builds, comparisons, guides } from "./lib/content";
import { shopProducts } from "./lib/shop";
import * as fs from "fs";
import * as path from "path";

test("all public routes have unique metadata", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const canonicals = new Set<string>();

  const track = (title: string, desc: string, canonical: string, ogUrl: string, ogTitle: string, ogDesc: string, route: string) => {
    expect(title).toBeTruthy();
    expect(desc).toBeTruthy();
    expect(canonical).toBeTruthy();
    expect(ogUrl).toBeTruthy();
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();

    if (titles.has(title)) throw new Error(`Duplicate title: ${title} at ${route}`);
    if (descriptions.has(desc)) throw new Error(`Duplicate description: ${desc} at ${route}`);
    if (canonicals.has(canonical)) throw new Error(`Duplicate canonical: ${canonical} at ${route}`);

    titles.add(title);
    descriptions.add(desc);
    canonicals.add(canonical);
  };

  const pages = [
    { file: "page.tsx", route: "/" },
    { file: "guides/page.tsx", route: "/guides" },
    { file: "compare/page.tsx", route: "/compare" },
    { file: "blueprint/page.tsx", route: "/blueprint" },
    { file: "about/page.tsx", route: "/about" },
    { file: "builds/page.tsx", route: "/builds" },
    { file: "offers/page.tsx", route: "/offers" },
    { file: "methodology/page.tsx", route: "/methodology" },
    { file: "privacy/page.tsx", route: "/privacy" },
    { file: "disclosure/page.tsx", route: "/disclosure" },
    { file: "shop/page.tsx", route: "/shop" },
    { file: "partners/page.tsx", route: "/partners" },
    { file: "pricing/page.tsx", route: "/pricing" },
    { file: "infrastructure/page.tsx", route: "/infrastructure" },
    { file: "infrastructure/compose/page.tsx", route: "/infrastructure/compose" },
    { file: "infrastructure/contracts/page.tsx", route: "/infrastructure/contracts" },
    { file: "infrastructure/operator/page.tsx", route: "/infrastructure/operator" },
    { file: "infrastructure/system/page.tsx", route: "/infrastructure/system" },
    { file: "infrastructure/workspace/page.tsx", route: "/infrastructure/workspace" },
  ];

  for (const page of pages) {
    const content = fs.readFileSync(path.join(__dirname, "app", page.file), "utf8");
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    const descMatch = content.match(/description:\s*"([^"]+)"/);
    const canonicalMatch = content.match(/canonical:\s*"([^"]+)"/);
    const ogTitleMatch = content.match(/openGraph:\s*\{[^}]*title:\s*"([^"]+)"/);
    const ogDescMatch = content.match(/openGraph:\s*\{[^}]*description:\s*"([^"]+)"/);
    const ogUrlMatch = content.match(/openGraph:\s*\{[^}]*url:\s*"([^"]+)"/);

    if (titleMatch && descMatch && canonicalMatch && ogTitleMatch && ogDescMatch && ogUrlMatch) {
      track(titleMatch[1], descMatch[1], canonicalMatch[1], ogUrlMatch[1], ogTitleMatch[1], ogDescMatch[1], page.route);
    } else {
       // Just fallback to test missing
       expect(titleMatch, `Missing title on ${page.file}`).toBeTruthy();
       expect(descMatch, `Missing description on ${page.file}`).toBeTruthy();
       expect(canonicalMatch, `Missing canonical on ${page.file}`).toBeTruthy();
       expect(ogTitleMatch, `Missing openGraph title on ${page.file}`).toBeTruthy();
       expect(ogDescMatch, `Missing openGraph description on ${page.file}`).toBeTruthy();
       expect(ogUrlMatch, `Missing openGraph url on ${page.file}`).toBeTruthy();
    }
  }

  // Dynamic routes
  for (const guide of guides) {
    track(guide.title, guide.summary, `/guides/${guide.slug}`, `/guides/${guide.slug}`, guide.title, guide.summary, `/guides/${guide.slug}`);
  }
  for (const comp of comparisons) {
    track(comp.title, comp.summary, `/compare/${comp.slug}`, `/compare/${comp.slug}`, comp.title, comp.summary, `/compare/${comp.slug}`);
  }
  for (const build of builds) {
    track(build.title, build.summary, `/builds/${build.slug}`, `/builds/${build.slug}`, build.title, build.summary, `/builds/${build.slug}`);
  }
  for (const product of shopProducts) {
    track(`${product.brand} ${product.name} — Buying decision`, product.summary, `/shop/${product.slug}`, `/shop/${product.slug}`, `${product.brand} ${product.name}`, product.summary, `/shop/${product.slug}`);
  }
});
