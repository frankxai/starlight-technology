import type { FreeProduct } from "./types";

export const freeProducts: FreeProduct[] = [
  {
    slug: "source-to-brief-lab",
    collection: ["agent-workflow-kits", "research-and-decision-intelligence"],
    name: "Source-to-Brief Lab",
    tagline: "Paste your notes. Leave with a cited brief.",
    outcome: "Produce a source-linked brief from pasted notes, review each line, and export Markdown and starlight.brief/v1 JSON. Runs in your browser; nothing is uploaded.",
    summary:
      "The free lab runs the same deterministic core as the Workflow Edition on text you paste. You approve lines, assign sections, and export a real artifact with citations, a review record and the evaluation result.",
    version: "1.0.0",
    format: "Browser tool · exports .md and .json",
    runtime: "Any modern browser. No account, no upload, no model call.",
    licence: {
      code: "FREE-USE",
      name: "Free use",
      seats: "Anyone",
      grants: ["Use the lab without an account.", "Keep and publish every artifact you export.", "Reuse the starlight.brief/v1 format in your own tools."],
      restrictions: ["Do not present exported briefs as reviewed by Starlight.", "The lab's source code is not licensed for redistribution as a product."]
    },
    produces: [
      "brief.md with findings, decisions, open questions, next actions and a sources register",
      "brief.json in starlight.brief/v1, loadable as agent context",
      "A review record: which lines were approved, rejected or edited",
      "An evaluation result against the same twelve-point checklist the edition ships"
    ],
    limitations: [
      "Pasted text only. The folder workflow, review log and diagnostics are in the Workflow Edition.",
      "Deterministic extraction. No model is called, so classification is keyword based and you should correct it.",
      "Nothing is saved between visits. Export before you leave."
    ],
    pairedProduct: "source-to-brief-workflow-edition",
    changelog: [
      { version: "1.0.0", date: "2026-10-16", summary: "First public release of the lab.", changes: ["Source parsing, classification, review, evaluation and export.", "Worked example loads with one action.", "Exports share the schema with the Workflow Edition."] }
    ]
  }
];

export function getFreeProduct(slug: string) {
  return freeProducts.find((product) => product.slug === slug);
}
