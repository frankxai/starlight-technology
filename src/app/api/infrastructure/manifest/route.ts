import { NextResponse } from "next/server";
import { contractStack, dealModels, executionGates, infrastructureSkills, proofFields } from "@/lib/infrastructure";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    product: "Starlight Infrastructure Partnership OS",
    version: "2026.08.31",
    canonical: "https://starlight.technology/infrastructure",
    status: "reference architecture",
    offer: {
      id: "infrastructure-blueprint",
      name: "Partnership Blueprint",
      professionalFeeEurExVat: 6500,
      targetBusinessDaysAfterCompleteInputs: 15,
      excludes: ["hardware", "financing", "legal advice", "tax advice", "production credentials"]
    },
    dealModels,
    executionGates,
    skills: infrastructureSkills,
    contractStack: contractStack.map(([code, name, purpose]) => ({ code, name, purpose })),
    proofFields,
    authorityPrinciple: "Observe broadly. Act narrowly. Bind never by accident.",
    generatedAt: "2026-08-31T00:00:00.000Z"
  });
}
