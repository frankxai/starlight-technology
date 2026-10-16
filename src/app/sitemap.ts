import type { MetadataRoute } from "next";
import { builds, comparisons, guides } from "@/lib/content";

import { shopProducts } from "@/lib/shop";
import { collections, digitalProducts, freeProducts } from "@/lib/catalog";

const base = "https://starlight.technology";
const updated = new Date("2026-10-07");
const shopUpdated = new Date("2026-10-16");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.95 },
    { path: "/shop/how-it-works", priority: 0.7 },
    { path: "/shop/licensing-and-support", priority: 0.6 },
    { path: "/shop/updates", priority: 0.55 },
    { path: "/shop/availability", priority: 0.6 },
    { path: "/partners", priority: 0.7 },
    { path: "/builds", priority: 0.8 },
    { path: "/compare", priority: 0.8 },
    { path: "/guides", priority: 0.75 },
    { path: "/methodology", priority: 0.65 },
    { path: "/pricing", priority: 0.75 },
    { path: "/offers", priority: 0.65 },
    { path: "/blueprint", priority: 0.7 },
    { path: "/infrastructure", priority: 0.95 },
    { path: "/infrastructure/compose", priority: 0.85 },
    { path: "/infrastructure/system", priority: 0.8 },
    { path: "/infrastructure/contracts", priority: 0.75 },
    { path: "/infrastructure/operator", priority: 0.8 },
    { path: "/infrastructure/workspace", priority: 0.7 },
    { path: "/disclosure", priority: 0.45 },
    { path: "/privacy", priority: 0.4 },
    { path: "/about", priority: 0.5 }
  ];

  return [
    ...staticRoutes.map(({ path, priority }) => ({
      url: `${base}${path}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority
    })),
    ...collections.map(({ slug }) => ({
      url: `${base}/shop/${slug}`,
      lastModified: shopUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.85
    })),
    ...digitalProducts.map(({ slug }) => ({
      url: `${base}/shop/products/${slug}`,
      lastModified: shopUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.9
    })),
    ...freeProducts.map(({ slug }) => ({
      url: `${base}/shop/free/${slug}`,
      lastModified: shopUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.85
    })),
    ...shopProducts.map(({ slug }) => ({
      url: `${base}/shop/${slug}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...builds.map(({ slug }) => ({
      url: `${base}/builds/${slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...comparisons.map(({ slug }) => ({
      url: `${base}/compare/${slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...guides.map(({ slug }) => ({
      url: `${base}/guides/${slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.75
    }))
  ];
}
