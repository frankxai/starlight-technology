import type { Recommendation } from "./types";

// Software and tooling recommendations. Every entry links to the official
// vendor page. relationship is "independent" unless an approved affiliate
// record and issued tracking link exist; none do in this release.
export const recommendations: Recommendation[] = [
  {
    id: "ollama", collection: ["local-ai-hardware", "mcp-and-agent-skills"], name: "Ollama", vendor: "Ollama", category: "model-host",
    useCase: "Run open-weight models locally behind a stable HTTP API for agents and workflows.",
    why: "Simplest path from a mini workstation to a local model endpoint the Workflow Edition's assisted mode can target.",
    verifyBefore: ["GPU or unified-memory support for your platform", "Model licence terms for commercial use", "Context length and memory at your chosen quantisation"],
    href: "https://ollama.com", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "lm-studio", collection: ["local-ai-hardware"], name: "LM Studio", vendor: "LM Studio", category: "model-host",
    useCase: "Desktop model browser and local server for evaluating models before committing hardware.",
    why: "Useful for measuring tokens per second on the exact machine you intend to buy or keep.",
    verifyBefore: ["Current licence terms for your use", "Runtime backend for your GPU", "Server mode compatibility with your tools"],
    href: "https://lmstudio.ai", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "llama-cpp", collection: ["local-ai-hardware"], name: "llama.cpp", vendor: "ggml community", category: "runtime",
    useCase: "Low-level inference runtime when you need control over quantisation, batching and hardware backends.",
    why: "The reference for measuring what a given memory budget can actually serve.",
    verifyBefore: ["Backend build flags for your GPU", "Model format conversion", "Maintenance burden versus a packaged host"],
    href: "https://github.com/ggml-org/llama.cpp", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "obsidian", collection: ["research-and-decision-intelligence", "agent-workflow-kits"], name: "Obsidian", vendor: "Dynalist Inc.", category: "editor",
    useCase: "Keep source notes as plain Markdown files with front-matter the workflow can read.",
    why: "Files on disk are the only input format the Source-to-Brief workflow needs. No export step.",
    verifyBefore: ["Commercial licence requirement for your organisation", "Sync choice and where notes physically live"],
    href: "https://obsidian.md", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "claude-code", collection: ["mcp-and-agent-skills", "agent-workflow-kits"], name: "Claude Code", vendor: "Anthropic", category: "orchestration",
    useCase: "Terminal agent that loads skills and MCP servers; the edition ships a skill wrapper for it.",
    why: "The skill wrapper keeps the same review gates when an agent runs the workflow instead of a person.",
    verifyBefore: ["Plan and usage limits", "Which directories the agent may read", "Your organisation's data policy for model providers"],
    href: "https://claude.com/claude-code", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "mcp-spec", collection: ["mcp-and-agent-skills"], name: "Model Context Protocol", vendor: "MCP project", category: "orchestration",
    useCase: "The protocol for exposing tools and resources to agents; the MCP skills collection will target it.",
    why: "Build tools once, expose them to several agent runtimes.",
    verifyBefore: ["Transport and auth model for your deployment", "Runtime support for the spec version you target"],
    href: "https://modelcontextprotocol.io", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "obs-studio", collection: ["creative-production"], name: "OBS Studio", vendor: "OBS Project", category: "capture",
    useCase: "Record walkthroughs and demos of your workflows with scenes you can script.",
    why: "Free, scriptable and the usual capture surface for creator production kits.",
    verifyBefore: ["Hardware encoder support on your GPU", "Audio routing on your OS"],
    href: "https://obsproject.com", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "reaper", collection: ["creative-production"], name: "REAPER", vendor: "Cockos", category: "audio",
    useCase: "Scriptable DAW for voice, soundtrack and batch audio processing in production pipelines.",
    why: "Scripting and render queues suit automated creative production better than most consumer editors.",
    verifyBefore: ["Licence tier for your revenue", "Plug-in compatibility on your platform"],
    href: "https://www.reaper.fm", relationship: "independent", verifiedOn: "2026-10-16"
  },
  {
    id: "davinci-resolve", collection: ["creative-production"], name: "DaVinci Resolve", vendor: "Blackmagic Design", category: "capture",
    useCase: "Edit, grade and deliver video from captured demos and generated assets.",
    why: "The free tier covers most creator production; the paid tier is a known upgrade path.",
    verifyBefore: ["GPU memory for your timeline resolution", "Codec support on your platform"],
    href: "https://www.blackmagicdesign.com/products/davinciresolve", relationship: "independent", verifiedOn: "2026-10-16"
  }
];

export function getRecommendations(ids: string[]) {
  return ids.map((id) => recommendations.find((item) => item.id === id)).filter((item): item is Recommendation => Boolean(item));
}
