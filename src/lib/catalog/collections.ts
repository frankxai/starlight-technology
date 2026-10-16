import type { Collection, CollectionSlug } from "./types";

export const collections: Collection[] = [
  {
    slug: "agent-workflow-kits",
    name: "Agent workflow kits",
    eyebrow: "Collection 01",
    outcome: "Executable workflows with review gates, so agents and people hand work to each other without losing provenance.",
    summary: "Each kit is a folder you run: inputs you approve, gates you control, artifacts you can diff. The Source-to-Brief Workflow Edition is the first.",
    builds: ["Source notes → reviewed brief", "Decision log → agent context file", "Meeting notes → owners and actions"],
    productSlugs: ["source-to-brief-workflow-edition"],
    freeSlugs: ["source-to-brief-lab"],
    recommendationIds: ["obsidian", "claude-code"],
    planned: [
      { name: "Brief-to-Spec Workflow Edition", kind: "workflow-edition", outcome: "Turn an approved brief into a scoped implementation spec with acceptance checks.", state: "scoping" }
    ],
    faq: [
      { question: "What makes something a kit rather than a prompt?", answer: "A kit runs. It has an entry point, gates that stop it, an export format and a diagnostics command. A prompt has none of those." },
      { question: "Which runtimes do kits target?", answer: "Node.js for the executable path, plus a skill wrapper for terminal agents. Each product page lists its exact runtime." }
    ]
  },
  {
    slug: "mcp-and-agent-skills",
    name: "MCP and agent skills",
    eyebrow: "Collection 02",
    outcome: "Tools and skills your agents can load, with permissions and failure modes written down.",
    summary: "This collection is in development. The Workflow Edition ships the first skill wrapper; standalone MCP servers and skill packs follow once they pass the same gates.",
    builds: ["MCP server exposing your notes as resources", "Skill that enforces a review gate", "Tool manifests with explicit permissions"],
    productSlugs: [],
    freeSlugs: ["source-to-brief-lab"],
    recommendationIds: ["claude-code", "mcp-spec", "ollama"],
    planned: [
      { name: "Source Vault MCP Server", kind: "skill-pack", outcome: "Expose an approved source folder to agents as read-only resources with provenance metadata.", state: "in-development" },
      { name: "Review Gate Skill Pack", kind: "skill-pack", outcome: "Portable skill that holds low-confidence output for a person before an agent continues.", state: "scoping" }
    ],
    faq: [
      { question: "Is anything in this collection for sale today?", answer: "No. The planned items are listed so you can tell us which matters; they carry no price and no date." },
      { question: "Can I get the skill wrapper now?", answer: "It ships inside the Source-to-Brief Workflow Edition when that product's checkout opens." }
    ]
  },
  {
    slug: "research-and-decision-intelligence",
    name: "Research and decision intelligence",
    eyebrow: "Collection 03",
    outcome: "Research that ends in a decision someone can defend, with every claim traceable to a source.",
    summary: "The Source-to-Brief core lives here: sources in, cited findings, flagged contradictions, open questions with owners. Start with the free lab.",
    builds: ["Vendor comparison brief", "Quarterly decision memo", "Research digest an agent can load"],
    productSlugs: ["source-to-brief-workflow-edition"],
    freeSlugs: ["source-to-brief-lab"],
    recommendationIds: ["obsidian"],
    planned: [
      { name: "Contradiction Radar", kind: "research-system", outcome: "Surface conflicting claims across a growing source set before they reach a brief.", state: "scoping" }
    ],
    faq: [
      { question: "Does the workflow judge whether a source is trustworthy?", answer: "No. You approve sources. The workflow preserves the link from every claim back to the source so a reader can judge." }
    ]
  },
  {
    slug: "creative-production",
    name: "Creative production",
    eyebrow: "Collection 04",
    outcome: "Production pipelines for demos, soundtracks and visual assets that run on a schedule, not on inspiration.",
    summary: "In development. The first kit will turn a brief into a recorded walkthrough with captions and a transcript. Independent tool recommendations are live now.",
    builds: ["Brief → scripted walkthrough", "Batch audio render with captions", "Asset manifest an editor can import"],
    productSlugs: [],
    freeSlugs: [],
    recommendationIds: ["obs-studio", "reaper", "davinci-resolve"],
    planned: [
      { name: "Brief-to-Walkthrough Production Kit", kind: "production-kit", outcome: "Script, record and caption a product walkthrough from an approved brief.", state: "scoping" }
    ],
    faq: [
      { question: "Will these kits generate media with models?", answer: "Where they do, the page will say which model, where it runs and what it costs. Nothing generated is passed off as recorded." }
    ]
  },
  {
    slug: "local-ai-hardware",
    name: "Local AI hardware",
    eyebrow: "Collection 05",
    outcome: "Machines that can actually run the workflows above, chosen by workload rather than by spec sheet.",
    summary: "Independent recommendations with manufacturer links. Starlight does not sell hardware here and does not show prices or stock; the merchant confirms both.",
    builds: ["Local inference desk", "Shared source library with backup", "Capture-ready creator station"],
    productSlugs: [],
    freeSlugs: [],
    recommendationIds: ["ollama", "lm-studio", "llama-cpp"],
    planned: [],
    hardwareSlugs: ["nvidia-dgx-spark", "nvidia-rtx-5090", "minisforum-ms-s1-max", "apple-mac-studio", "ugreen-dxp4800-plus", "samsung-990-pro-2tb", "elgato-stream-deck-plus", "rode-podmic-usb"],
    faq: [
      { question: "Are these vendors partners?", answer: "No. Every link is labelled with its actual status. An affiliate label appears only when an approved record and a vendor-issued tracking link exist. None are active in this release." },
      { question: "Why no prices?", answer: "A price needs a merchant source, region, currency and verification time. The catalogue has none of those fields on purpose; the merchant page is the source." }
    ]
  }
];

export function getCollection(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

export const collectionSlugs = collections.map((collection) => collection.slug) as CollectionSlug[];
