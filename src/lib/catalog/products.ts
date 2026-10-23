import type { DigitalProduct } from "./types";

const singleOperatorLicence = {
  code: "SOL-1",
  name: "Single-operator licence",
  seats: "One named operator, unlimited personal projects and client deliverables",
  grants: [
    "Run the workflow on your own machines and private infrastructure.",
    "Modify templates, prompts and checks for your own use.",
    "Ship briefs and derived artifacts to clients without attribution.",
    "Receive updates for the edition's major version."
  ],
  restrictions: [
    "No redistribution or resale of the workflow, templates or checklists.",
    "No hosting the workflow as a service for third parties.",
    "Team use needs one licence per operator; a team licence is planned, not sold."
  ]
};

export const digitalProducts: DigitalProduct[] = [
  {
    slug: "source-to-brief-workflow-edition",
    sku: "ST-WE-S2B-001",
    kind: "workflow-edition",
    status: "release-candidate",
    collection: ["agent-workflow-kits", "research-and-decision-intelligence"],
    name: "Source-to-Brief",
    edition: "Workflow Edition",
    version: "1.0.0-rc.1",
    tagline: "Approved notes in. A reviewed, source-linked brief out.",
    outcome: "Turn a folder of approved source notes into a reviewed, source-linked, portable brief you can hand to a person or an agent.",
    summary:
      "An executable workflow that reads the sources you approve, extracts findings with their citations, routes them through a review gate, and exports a brief in Markdown and starlight.brief/v1 JSON. Every statement in the output points back to a source line.",
    customerJob: "Turn approved source notes into a reviewed, source-linked, portable brief or workflow artifact.",
    format: "Node.js CLI + agent skill + templates (zip, versioned)",
    runtime: "Node.js 22 or 24 · macOS, Linux, Windows · optional model provider for assisted extraction",
    delivery: "Private versioned download and licence key after entitlement. Not yet live: see the readiness board.",
    updateCadence: "Patch releases as needed; minor releases roughly quarterly; one year of updates within the 1.x line.",
    price: {
      amount: 149,
      currency: "EUR",
      basis: "proposed",
      note: "Proposed test pricing. Final price, VAT handling and consumer terms are confirmed before checkout opens."
    },
    licence: singleOperatorLicence,
    support: {
      channel: "Email, hello@frankx.ai",
      responseTarget: "Two business days for licence, installation and defect reports",
      covers: ["Installation and runtime diagnostics", "Defects in the shipped workflow, templates and schema", "Licence and update questions"],
      excludes: ["Writing or reviewing your briefs", "Custom integrations", "Model provider billing or outages", "Legal review of what you publish"]
    },
    includes: [
      { path: "workflow/source-to-brief.mjs", kind: "workflow", description: "Executable pipeline: collect → extract → review gate → render → export." },
      { path: "workflow/skill/SKILL.md", kind: "workflow", description: "Agent skill wrapper for Claude Code, Codex and Cursor with the same gates." },
      { path: "examples/quarterly-tooling-decision/", kind: "example", description: "Worked example: twelve source notes to a signed-off brief, with the review log." },
      { path: "templates/brief.md", kind: "template", description: "Brief template with required sections and citation style." },
      { path: "templates/source-note.md", kind: "template", description: "Source note front-matter so provenance survives the pipeline." },
      { path: "checks/evaluation-checklist.md", kind: "checklist", description: "Twelve-point evaluation a brief must pass before export." },
      { path: "bin/doctor.mjs", kind: "diagnostics", description: "Installation and runtime diagnostics: Node version, paths, provider keys, write permissions." },
      { path: "schema/starlight.brief.v1.json", kind: "schema", description: "Export format shared with the free lab, so artifacts move between them." },
      { path: "LICENCE.md", kind: "licence", description: "Single-operator licence text." },
      { path: "UPDATES.md", kind: "policy", description: "Update policy, support scope and the recovery guide." }
    ],
    forWhom: [
      "Founders and operators who already keep notes and need defensible briefs for decisions.",
      "Indie developers packaging research into agent context files.",
      "Small studios that hand work between people and agents and need provenance to survive the handoff."
    ],
    notForWhom: [
      "Anyone expecting the workflow to find sources for them. It works only on sources you approve.",
      "Teams needing shared hosted review. This edition runs locally.",
      "Buyers who need a guarantee that a model will never misread a source. The review gate exists because models do."
    ],
    prerequisites: [
      { label: "Node.js 22 or 24", detail: "Checked by bin/doctor.mjs before the first run.", required: true },
      { label: "A folder of source notes", detail: "Markdown or plain text. PDFs need a prior text export.", required: true },
      { label: "Model provider key", detail: "Optional. Assisted extraction uses your own key; the deterministic path needs none.", required: false },
      { label: "Git", detail: "Recommended so each brief export is a reviewable commit.", required: false }
    ],
    limitations: [
      "Extraction is sentence and bullet based. Tables and images are passed through as references, not parsed.",
      "Assisted extraction depends on the model you configure; the deterministic path never calls a model.",
      "No hosted collaboration, no account, no sync. Artifacts are files.",
      "English-first heuristics in the classifier; other languages fall back to manual section assignment."
    ],
    refund: [
      "EU consumers: a 14-day right of withdrawal applies to digital content until you ask for delivery to begin and acknowledge that the right then lapses. The checkout flow will record that consent explicitly.",
      "Defective or misdescribed deliverables are refunded or repaired regardless of the withdrawal window.",
      "These are the planned terms. They are finalised with the merchant-of-record setup before any payment is accepted."
    ],
    recovery: [
      "Lost download: re-issue from the entitlement record using your order email.",
      "Broken install: run bin/doctor.mjs and send the report; fixes ship as patch releases.",
      "Payment taken without delivery: the webhook and entitlement audit trail identify the order; delivery is replayed or the payment refunded.",
      "Licence revoked in error: the revocation record carries a reason and a reversal path."
    ],
    changelog: [
      {
        version: "1.0.0-rc.1",
        date: "2026-10-16",
        summary: "Release candidate defined publicly; export format and free lab published.",
        changes: [
          "starlight.brief/v1 export schema fixed and shared with the free Source-to-Brief Lab.",
          "Twelve-point evaluation checklist published.",
          "Product page, licence draft, support scope and recovery guide published for review.",
          "Paid checkout remains disabled until every fulfilment gate passes."
        ]
      }
    ],
    media: {
      fileTree: [
        "source-to-brief-workflow-edition/",
        "├── workflow/",
        "│   ├── source-to-brief.mjs",
        "│   └── skill/SKILL.md",
        "├── examples/quarterly-tooling-decision/",
        "│   ├── sources/ (12 notes)",
        "│   ├── review-log.md",
        "│   └── brief.md",
        "├── templates/",
        "│   ├── brief.md",
        "│   └── source-note.md",
        "├── checks/evaluation-checklist.md",
        "├── schema/starlight.brief.v1.json",
        "├── bin/doctor.mjs",
        "├── LICENCE.md",
        "└── UPDATES.md"
      ],
      terminal: [
        { command: "node bin/doctor.mjs", output: ["node 24.22.0 ✓", "sources/ readable (12 files) ✓", "out/ writable ✓", "provider key: not set → deterministic mode"] },
        { command: "node workflow/source-to-brief.mjs ./sources --title \"Q4 tooling decision\"", output: ["collected 12 sources · 184 candidate lines", "classified: 61 findings · 9 decisions · 14 open questions · 11 actions", "review gate: 7 lines held for approval", "waiting for review → out/review.md"] },
        { command: "node workflow/source-to-brief.mjs --resume out/review.md", output: ["review complete: 5 approved · 2 rejected", "evaluation: 12/12 checks passed", "wrote out/brief.md", "wrote out/brief.json (starlight.brief/v1)"] }
      ],
      workflow: [
        { id: "collect", label: "Collect", detail: "Read the approved source folder. Record path, hash and date per source." },
        { id: "extract", label: "Extract", detail: "Split into candidate lines. Keep the source id on every line." },
        { id: "review", label: "Review gate", detail: "Low-confidence lines wait for a person. Nothing unreviewed reaches the brief." },
        { id: "evaluate", label: "Evaluate", detail: "Twelve checks: citations, contradictions, open questions, next actions." },
        { id: "export", label: "Export", detail: "brief.md for people, brief.json for agents. Same content, same citations." }
      ],
      transformation: [
        { label: "A note", before: "meeting-0923.md: “Vendor B quoted 40% less but needs a 24-month term, Sam thinks we should wait for Q1 pricing.”", after: "Finding: Vendor B quote is 40% lower with a 24-month term. [S03]\nOpen question: wait for Q1 pricing? (raised by Sam) [S03]" },
        { label: "A folder", before: "12 notes, 3 formats, no shared structure, two of them contradict each other on the renewal date.", after: "One brief with 61 cited findings, a contradiction flagged with both sources, 14 open questions and 11 owners." },
        { label: "A handoff", before: "“Read the Drive folder before the call.”", after: "brief.json loaded as agent context; brief.md attached to the calendar invite." }
      ]
    },
    faq: [
      { question: "Does it search the web or my drive for sources?", answer: "No. It only reads the folder you point it at. Approval of sources is the first gate, and it is yours." },
      { question: "Do I need a model API key?", answer: "No. The deterministic path uses sentence and bullet extraction plus keyword classification. A key enables assisted extraction with your own provider." },
      { question: "What is the difference from the free lab?", answer: "The lab runs the same core in your browser on pasted text and exports the same formats. The edition adds the executable folder workflow, the review gate with a log, the evaluation checklist, templates, diagnostics, the agent skill and support." },
      { question: "Can I buy it today?", answer: "Not yet. Paid checkout opens only when every fulfilment gate on the readiness board is satisfied. Join the availability list and you will be told when it does, with the final price." }
    ],
    freeEntry: "source-to-brief-lab",
    checkoutEnvKey: "SHOP_CHECKOUT_URL_ST_WE_S2B_001"
  }
];

export function getDigitalProduct(slug: string) {
  return digitalProducts.find((product) => product.slug === slug);
}
