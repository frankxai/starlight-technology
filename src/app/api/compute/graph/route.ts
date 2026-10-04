import { NextResponse } from "next/server";
import { graph, researchDate } from "@/lib/compute";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    product: "Starlight compute atlas",
    status: "research only, no hands-on testing",
    researchDate,
    regionAssumption: "NL/EU (open)",
    note: "Prices are dated snapshots. Edges carry an evidence tag: documented, inferred or rumor.",
    graph
  });
}
