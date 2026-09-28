import { searchTechnology, searchIndexInfo } from "@/lib/technology-search";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 160) return Response.json({ error: "Query must be 1–160 characters." }, { status: 400 });
  return Response.json({ query, index: searchIndexInfo, results: searchTechnology(query).map(({ item, score }) => ({ slug: item.slug, name: item.name, category: item.category, score: Number(score.toFixed(4)), evidence: item.source, url: `/shop/${item.slug}` })) }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300" } });
}
