import { describe, expect, it } from "vitest";
import { BRIEF_SCHEMA, buildBrief, classifyLine, findContradictions, parseSources, renderJson, renderMarkdown, splitIntoLines } from "./core";
import { exampleSources, exampleSummary, exampleTitle } from "./example";

describe("source parsing", () => {
  it("splits bullets, numbered lines and sentences, dropping headings and fragments", () => {
    expect(splitIntoLines("# Heading\n- First bullet is here.\n1. Second numbered line here. Third sentence follows.\nok")).toEqual(["First bullet is here.", "Second numbered line here.", "Third sentence follows."]);
  });
  it("assigns stable ids and hashes per source", () => {
    const { sources, lines } = parseSources(exampleSources);
    expect(sources.map((s) => s.id)).toEqual(["S01", "S02", "S03"]);
    expect(lines[0].id).toBe("S01-L01");
    expect(sources[0].hash).toMatch(/^[0-9a-f]{8}$/);
    expect(lines.every((line) => sources.some((s) => s.id === line.sourceId))).toBe(true);
  });
});

describe("classification", () => {
  it("routes questions, decisions, actions and findings", () => {
    expect(classifyLine("Should we ask the vendor to match?").section).toBe("question");
    expect(classifyLine("Decided: no new 24-month commitments.").section).toBe("decision");
    expect(classifyLine("Action: Priya to request a quote by Friday.").section).toBe("action");
    expect(classifyLine("Vendor B quoted 40% less per seat.").section).toBe("finding");
  });
  it("holds ambiguous lines for review", () => {
    const mixed = classifyLine("Decided: owner: @sam must follow up by Friday");
    expect(mixed.confidence).toBeLessThan(0.6);
  });
});

describe("brief build, evaluation and export", () => {
  const { sources, lines } = parseSources(exampleSources);
  const reviewed = lines.map((line) => ({ ...line, status: "approved" as const }));
  const brief = buildBrief({ title: exampleTitle, summary: exampleSummary, sources, lines: reviewed, surface: "lab", now: new Date("2026-10-16T10:00:00Z") });

  it("produces the shared schema with sections, review record and evaluation", () => {
    expect(brief.schema).toBe(BRIEF_SCHEMA);
    expect(brief.sections.finding.length).toBeGreaterThan(0);
    expect(brief.sections.question.length).toBeGreaterThan(0);
    expect(brief.review.pending).toBe(0);
    expect(brief.evaluation.total).toBe(12);
    expect(brief.evaluation.checks.find((c) => c.id === "review-complete")?.pass).toBe(true);
  });
  it("flags the renewal date contradiction between the meeting notes and finance thread", () => {
    expect(findContradictions([{ id: "a", text: "Current vendor renews on 15 November at the existing rate." }, { id: "b", text: "Finance confirmed the renewal is not yet signed and the current vendor renews on 30 November." }]).length).toBe(1);
  });
  it("fails the review check while lines are pending and the owner check for unowned actions", () => {
    const pending = buildBrief({ title: "T", summary: exampleSummary, sources, lines, surface: "lab" });
    expect(pending.evaluation.checks.find((c) => c.id === "review-complete")?.pass).toBe(lines.every((l) => l.status !== "pending"));
    const unowned = buildBrief({ title: "T", summary: exampleSummary, sources, lines: [{ ...reviewed[0], section: "action", text: "Send the quote by Friday." }], surface: "lab" });
    expect(unowned.evaluation.checks.find((c) => c.id === "owners")?.pass).toBe(false);
  });
  it("renders markdown with citations and JSON that round-trips", () => {
    const md = renderMarkdown(brief);
    expect(md).toContain("# Q4 tooling decision");
    expect(md).toMatch(/\[S0[1-3]\]/);
    expect(md).toContain("## Sources");
    expect(md).toContain("## Evaluation");
    expect(JSON.parse(renderJson(brief)).schema).toBe(BRIEF_SCHEMA);
  });
});
