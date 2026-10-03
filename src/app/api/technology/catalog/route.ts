import { technology } from "@/lib/technology";
import { searchIndexInfo } from "@/lib/technology-search";

export function GET() {
  return Response.json({ schemaVersion: 1, status: "manufacturer-sourced-research", search: searchIndexInfo, records: technology }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
