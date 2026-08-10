import type { MetadataRoute } from "next";
import { builds, comparisons, guides } from "@/lib/content";
const base = "https://starlight.technology";
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/builds", "/compare", "/guides", "/methodology", "/disclosure", "/privacy", "/about", "/blueprint"];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, lastModified: new Date("2026-07-19"), changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...builds.map(({ slug }) => ({ url: `${base}/builds/${slug}`, lastModified: new Date("2026-07-19"), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...comparisons.map(({ slug }) => ({ url: `${base}/compare/${slug}`, lastModified: new Date("2026-07-19"), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...guides.map(({ slug }) => ({ url: `${base}/guides/${slug}`, lastModified: new Date("2026-07-19"), changeFrequency: "monthly" as const, priority: 0.75 }))
  ];
}
