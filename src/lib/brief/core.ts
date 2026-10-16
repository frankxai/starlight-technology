// Source-to-Brief core. Deterministic, dependency-free, runs in the browser
// (free lab) and in Node (Workflow Edition). Shared export format
// starlight.brief/v1.

export const BRIEF_SCHEMA = "starlight.brief/v1" as const;
export const BRIEF_GENERATOR = { name: "source-to-brief-core", version: "1.0.0" } as const;

export type BriefSection = "finding" | "decision" | "question" | "action";
export const briefSections: BriefSection[] = ["finding", "decision", "question", "action"];
export const sectionTitles: Record<BriefSection, string> = { finding: "Findings", decision: "Decisions", question: "Open questions", action: "Next actions" };

export interface SourceInput { label: string; url?: string; text: string }
export interface BriefSource { id: string; label: string; url?: string; lineCount: number; hash: string }
export type LineStatus = "pending" | "approved" | "rejected";
export interface CandidateLine {
  id: string;
  sourceId: string;
  index: number;
  text: string;
  section: BriefSection;
  /** 0–1. Lines below the review threshold are held for a person. */
  confidence: number;
  status: LineStatus;
  edited?: string;
}

export const REVIEW_THRESHOLD = 0.6;

export function hashText(text: string) {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  return hash.toString(16).padStart(8, "0");
}

const sourceId = (index: number) => `S${String(index + 1).padStart(2, "0")}`;

export function splitIntoLines(text: string): string[] {
  const out: string[] = [];
  for (const rawParagraph of text.replace(/\r\n/g, "\n").split(/\n+/)) {
    const paragraph = rawParagraph.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim();
    if (!paragraph || /^#{1,6}\s/.test(rawParagraph.trim())) continue;
    const sentences = paragraph.split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/);
    for (const sentence of sentences) {
      const clean = sentence.trim();
      if (clean.length >= 12) out.push(clean);
    }
  }
  return out;
}

const patterns: { section: BriefSection; weight: number; test: RegExp }[] = [
  { section: "question", weight: 0.95, test: /\?\s*$/ },
  { section: "question", weight: 0.8, test: /^(should|can|could|do we|does|is it|are we|what if|whether|how do|why|open question|unclear|unknown)\b/i },
  { section: "decision", weight: 0.9, test: /\b(decided|decision:|we will|we won't|we will not|agreed|chosen|go with|approved|committed to|signed off|final answer)\b/i },
  { section: "action", weight: 0.9, test: /\b(todo|to do|next step|action item|action:|owner:|follow up|follow-up|due\b|deadline|by (monday|tuesday|wednesday|thursday|friday|saturday|sunday|end of|eod|q[1-4]|the \d))/i },
  { section: "action", weight: 0.7, test: /\b(need to|needs to|must|schedule|send|ship|draft|prepare|book|confirm|verify|review)\b/i },
  { section: "finding", weight: 0.75, test: /\b(\d+(\.\d+)?\s?(%|percent|ms|gb|tb|€|eur|usd|\$|x)|quoted|measured|reported|found|shows|showed|costs?|takes|requires|supports)\b/i }
];

export function classifyLine(text: string): { section: BriefSection; confidence: number } {
  const scores: Record<BriefSection, number> = { finding: 0.5, decision: 0, question: 0, action: 0 };
  for (const pattern of patterns) if (pattern.test.test(text)) scores[pattern.section] = Math.max(scores[pattern.section], pattern.weight);
  const ranked = (Object.entries(scores) as [BriefSection, number][]).sort((a, b) => b[1] - a[1]);
  const [best, second] = ranked;
  const margin = best[1] - second[1];
  // Two strong signals in one line is exactly the case a person should see.
  const confidence = margin < 0.15 && second[1] >= 0.7 ? 0.5 : best[1] === 0.5 ? 0.55 : Math.min(0.98, best[1] + margin / 4);
  return { section: best[0], confidence: Number(confidence.toFixed(2)) };
}

export function parseSources(inputs: SourceInput[]): { sources: BriefSource[]; lines: CandidateLine[] } {
  const sources: BriefSource[] = [];
  const lines: CandidateLine[] = [];
  inputs.forEach((input, sIndex) => {
    const id = sourceId(sIndex);
    const split = splitIntoLines(input.text);
    sources.push({ id, label: input.label.trim() || `Source ${sIndex + 1}`, url: input.url?.trim() || undefined, lineCount: split.length, hash: hashText(input.text) });
    split.forEach((text, lIndex) => {
      const { section, confidence } = classifyLine(text);
      lines.push({ id: `${id}-L${String(lIndex + 1).padStart(2, "0")}`, sourceId: id, index: lIndex, text, section, confidence, status: confidence >= REVIEW_THRESHOLD ? "approved" : "pending" });
    });
  });
  return { sources, lines };
}

export interface EvaluationCheck { id: string; label: string; pass: boolean; detail: string }

export interface Brief {
  schema: typeof BRIEF_SCHEMA;
  title: string;
  summary: string;
  generatedAt: string;
  generator: typeof BRIEF_GENERATOR & { surface: "lab" | "workflow" };
  sources: BriefSource[];
  sections: Record<BriefSection, { lineId: string; sourceId: string; text: string }[]>;
  review: { approved: number; rejected: number; edited: number; pending: number };
  contradictions: { a: string; b: string; shared: string[] }[];
  evaluation: { passed: number; total: number; checks: EvaluationCheck[] };
}

const stopWords = new Set("the a an and or of to in on for with by at from is are was were be been it this that we our they their not no never without than then into as if but so do does did have has had will would should can could may might".split(" "));

export function significantWords(text: string) {
  return Array.from(new Set(text.toLowerCase().replace(/[^a-z0-9€%.\s-]/g, " ").split(/\s+/).filter((word) => word.length > 3 && !stopWords.has(word))));
}

const negation = /\b(not|no longer|never|without|cancel+ed|reversed|instead|rather than|won't|isn't|aren't|doesn't|didn't)\b/i;

export function findContradictions(lines: { id: string; text: string }[]) {
  const flagged: Brief["contradictions"] = [];
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const a = lines[i];
      const b = lines[j];
      if (negation.test(a.text) === negation.test(b.text)) continue;
      const wordsA = significantWords(a.text);
      const wordsB = new Set(significantWords(b.text));
      const shared = wordsA.filter((word) => wordsB.has(word));
      if (shared.length >= 3) flagged.push({ a: a.id, b: b.id, shared: shared.slice(0, 5) });
    }
  }
  return flagged;
}

export function evaluateBrief(brief: Omit<Brief, "evaluation">): Brief["evaluation"] {
  const approvedLines = briefSections.flatMap((section) => brief.sections[section]);
  const sourceIds = new Set(brief.sources.map((source) => source.id));
  const actions = brief.sections.action;
  const ownerPattern = /(@\w+|owner:|\b(owned by|assigned to)\b)/i;
  const unownedActions = actions.filter((line) => !ownerPattern.test(line.text));
  const nonQuestionQuestions = brief.sections.question.filter((line) => !/\?\s*$/.test(line.text));
  const usedSources = new Set(approvedLines.map((line) => line.sourceId));
  const unusedSources = brief.sources.filter((source) => !usedSources.has(source.id));
  const checks: EvaluationCheck[] = [
    { id: "title", label: "Brief has a title", pass: brief.title.trim().length >= 3, detail: brief.title.trim() ? `“${brief.title.trim()}”` : "No title set" },
    { id: "summary", label: "Summary written by a person", pass: brief.summary.trim().length >= 20, detail: brief.summary.trim().length >= 20 ? `${brief.summary.trim().split(/\s+/).length} words` : "Write at least one sentence that states the decision or purpose" },
    { id: "sources", label: "At least one source", pass: brief.sources.length > 0, detail: `${brief.sources.length} source(s)` },
    { id: "approved", label: "At least one approved line", pass: approvedLines.length > 0, detail: `${approvedLines.length} approved line(s)` },
    { id: "citations", label: "Every line cites a known source", pass: approvedLines.every((line) => sourceIds.has(line.sourceId)), detail: approvedLines.every((line) => sourceIds.has(line.sourceId)) ? "All citations resolve" : "A line cites a source that is not in the register" },
    { id: "review-complete", label: "Review complete, nothing pending", pass: brief.review.pending === 0, detail: brief.review.pending === 0 ? `${brief.review.approved} approved · ${brief.review.rejected} rejected` : `${brief.review.pending} line(s) still waiting for review` },
    { id: "findings", label: "At least one finding", pass: brief.sections.finding.length > 0, detail: `${brief.sections.finding.length} finding(s)` },
    { id: "questions", label: "Open questions read as questions", pass: nonQuestionQuestions.length === 0, detail: nonQuestionQuestions.length === 0 ? `${brief.sections.question.length} open question(s)` : `${nonQuestionQuestions.length} entr${nonQuestionQuestions.length === 1 ? "y" : "ies"} under open questions do not end with a question mark` },
    { id: "owners", label: "Every next action names an owner", pass: unownedActions.length === 0, detail: unownedActions.length === 0 ? `${actions.length} action(s) owned` : `${unownedActions.length} action(s) without @owner or owner:` },
    { id: "source-coverage", label: "Every source contributed or is marked unused", pass: true, detail: unusedSources.length === 0 ? "All sources contributed" : `${unusedSources.length} source(s) listed as unused: ${unusedSources.map((source) => source.id).join(", ")}` },
    { id: "contradictions", label: "Contradiction scan recorded", pass: true, detail: brief.contradictions.length === 0 ? "No candidate contradictions" : `${brief.contradictions.length} candidate pair(s) flagged for a reader` },
    { id: "provenance", label: "Generator and timestamp recorded", pass: Boolean(brief.generatedAt) && Boolean(brief.generator.version), detail: `${brief.generator.name}@${brief.generator.version} · ${brief.generatedAt}` }
  ];
  return { passed: checks.filter((check) => check.pass).length, total: checks.length, checks };
}

export interface BuildBriefInput {
  title: string;
  summary: string;
  sources: BriefSource[];
  lines: CandidateLine[];
  surface: "lab" | "workflow";
  now?: Date;
}

export function buildBrief({ title, summary, sources, lines, surface, now = new Date() }: BuildBriefInput): Brief {
  const sections: Brief["sections"] = { finding: [], decision: [], question: [], action: [] };
  let edited = 0;
  for (const line of lines) {
    if (line.status !== "approved") continue;
    if (line.edited && line.edited !== line.text) edited += 1;
    sections[line.section].push({ lineId: line.id, sourceId: line.sourceId, text: (line.edited ?? line.text).trim() });
  }
  const review = {
    approved: lines.filter((line) => line.status === "approved").length,
    rejected: lines.filter((line) => line.status === "rejected").length,
    pending: lines.filter((line) => line.status === "pending").length,
    edited
  };
  const contradictions = findContradictions([...sections.finding, ...sections.decision].map((line) => ({ id: line.lineId, text: line.text })));
  const partial: Omit<Brief, "evaluation"> = { schema: BRIEF_SCHEMA, title: title.trim(), summary: summary.trim(), generatedAt: now.toISOString(), generator: { ...BRIEF_GENERATOR, surface }, sources, sections, review, contradictions };
  return { ...partial, evaluation: evaluateBrief(partial) };
}

export function renderMarkdown(brief: Brief): string {
  const out: string[] = [];
  out.push(`# ${brief.title || "Untitled brief"}`, "");
  out.push(`Generated ${brief.generatedAt} by ${brief.generator.name}@${brief.generator.version} (${brief.generator.surface}) · ${brief.sources.length} source(s) · ${brief.review.approved} approved line(s) · evaluation ${brief.evaluation.passed}/${brief.evaluation.total}`, "");
  out.push("## Summary", "", brief.summary || "_No summary written._", "");
  for (const section of briefSections) {
    out.push(`## ${sectionTitles[section]}`, "");
    const entries = brief.sections[section];
    if (entries.length === 0) out.push("_None._");
    for (const entry of entries) out.push(`- ${entry.text} [${entry.sourceId}]`);
    out.push("");
  }
  if (brief.contradictions.length > 0) {
    out.push("## Flagged for contradiction", "");
    for (const pair of brief.contradictions) out.push(`- ${pair.a} vs ${pair.b} (shared: ${pair.shared.join(", ")})`);
    out.push("");
  }
  out.push("## Sources", "");
  for (const source of brief.sources) out.push(`- [${source.id}] ${source.label}${source.url ? ` — ${source.url}` : ""} · ${source.lineCount} line(s) · sha ${source.hash}`);
  out.push("", "## Review record", "", `- Approved: ${brief.review.approved}`, `- Rejected: ${brief.review.rejected}`, `- Edited: ${brief.review.edited}`, `- Pending: ${brief.review.pending}`, "");
  out.push("## Evaluation", "");
  for (const check of brief.evaluation.checks) out.push(`- [${check.pass ? "x" : " "}] ${check.label} — ${check.detail}`);
  out.push("");
  return out.join("\n");
}

export function renderJson(brief: Brief): string {
  return JSON.stringify(brief, null, 2);
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "brief";
}
