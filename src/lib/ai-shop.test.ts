import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aiKit, aiSoftware, planAiSetup, setupPlanMarkdown, type AiSetupInput } from "./ai-shop";

describe("AI setup planning boundaries", () => {
  it("keeps a local-only request local even for workflow automation", () => {
    const plan = planAiSetup({ goal: "automation", dataBoundary: "local", startingPoint: "new-setup" });
    expect(plan.runtime).toContain("local runtime");
    expect(plan.constraint).toContain("extensions, telemetry, retrieval and backups");
    expect(plan.constraint).toContain("retries must not duplicate");
  });
  it("requires explicit approval before using sensitive cloud inputs", () => {
    const plan = planAiSetup({ goal: "knowledge", dataBoundary: "approved-cloud", startingPoint: "existing-tools" });
    expect(plan.runtime).toContain("data-processing boundary");
    expect(plan.constraint).toContain("sensitive or restricted inputs out");
    expect(plan.constraint).toContain("source or an explicit uncertainty label");
  });
  it("routes existing-tool trials before purchases and keeps build release authority scoped", () => {
    const plan = planAiSetup({ goal: "build", dataBoundary: "public", startingPoint: "existing-tools" });
    expect(plan.steps[0]).toContain("before buying");
    expect(plan.constraint).toContain("passing test is not release authority");
  });
  it("exports every planning combination as a usable brief with explicit missing fields", () => {
    const goals: AiSetupInput["goal"][] = ["knowledge", "automation", "build"];
    const boundaries: AiSetupInput["dataBoundary"][] = ["public", "approved-cloud", "local"];
    const starts: AiSetupInput["startingPoint"][] = ["existing-tools", "new-setup"];
    for (const goal of goals) for (const dataBoundary of boundaries) for (const startingPoint of starts) {
      const exported = setupPlanMarkdown({ goal, dataBoundary, startingPoint });
      expect(exported).not.toMatch(/undefined|\[object Object\]/);
      expect(exported).toContain("Owner:");
      expect(exported).toContain("Monthly cost ceiling:");
      expect(exported).toContain("Recovery owner:");
      expect(exported).toContain("No provider account or hardware purchase is included");
    }
  });
});

describe("AI shop publication contract", () => {
  it("ships every advertised file and labels the worked example as unrun fiction", () => {
    for (const file of aiKit.files) expect(readFileSync(`public${file.href}`, "utf8").length).toBeGreaterThan(600);
    const example = readFileSync("public/downloads/ai-system-brief-example.md", "utf8");
    expect(example).toContain("Fictional example");
    expect(example).toContain("has not been run against a model");
    const worksheet = readFileSync("public/downloads/ai-acceptance-worksheet.csv", "utf8");
    expect(worksheet).not.toContain(",passed,");
    expect(worksheet.split("\n").filter(line => line.includes(",not-run,")).length).toBe(11);
  });
  it("references official documentation without attribution or checkout parameters", () => {
    const officialHosts = ["docs.ollama.com", "lmstudio.ai", "support.n8n.io", "huggingface.co"];
    for (const tool of aiSoftware) {
      const url = new URL(tool.sourceUrl);
      expect(url.protocol).toBe("https:");
      expect(officialHosts).toContain(url.hostname);
      expect(url.search).toBe("");
      expect(tool.checkedOn).toBe("2026-10-07");
    }
  });
});
