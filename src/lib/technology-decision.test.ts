import { describe, expect, it } from "vitest";
import { constraints, decideSystem, defaultBrief, environments, isSystemBrief, readSystemBriefImport, workloads } from "./technology-decision";
import { searchTechnology } from "./technology-search";

describe("technology decision boundary", () => {
  it("holds unattended robotics without suggesting a device", () => {
    const result = decideSystem({ workload: "Robotics research", environment: "Controlled site", constraint: "Unattended operation", existingAssets: "" });
    expect(result.status).toBe("hold");
    expect(result.candidateSlugs).toEqual([]);
  });
  it("does not cast a desktop GPU as a mobile system", () => {
    const result = decideSystem({ workload: "Local AI", environment: "Mobile", constraint: "CUDA required", existingAssets: "" });
    expect(result.status).toBe("hold");
  });
  it("rejects unbounded or malformed imported briefs", () => {
    expect(isSystemBrief({ workload: "Local AI", environment: "Desk", constraint: "None", existingAssets: "x".repeat(1001) })).toBe(false);
    expect(isSystemBrief({ workload: "Launch rocket", environment: "Desk", constraint: "None", existingAssets: "" })).toBe(false);
  });
  it("accepts raw briefs and v1 exports but rejects unsupported envelope versions", () => {
    expect(readSystemBriefImport(defaultBrief)).toEqual(defaultBrief);
    expect(readSystemBriefImport({ schemaVersion: 1, brief: defaultBrief })).toEqual(defaultBrief);
    for (const schemaVersion of [0, 2, 99, "1", null, undefined]) {
      expect(readSystemBriefImport({ schemaVersion, brief: defaultBrief })).toBeNull();
    }
    expect(readSystemBriefImport({ ...defaultBrief, unsupportedField: true })).toBeNull();
  });
  it("never ignores an unsupported hard constraint across the full input matrix", () => {
    for (const workload of workloads) for (const environment of environments) for (const constraint of constraints) {
      const result = decideSystem({ workload, environment, constraint, existingAssets: "" });
      if (constraint === "Unattended operation" || (workload !== "Local AI" && constraint !== "None")) {
        expect(result.status, `${workload}/${environment}/${constraint}`).toBe("hold");
        expect(result.candidateSlugs).toEqual([]);
      }
    }
  });
  it("retains the existing research boundaries without mutating a brief", () => {
    const input = Object.freeze({ ...defaultBrief, existingAssets: "Synthetic equipment" });
    expect(decideSystem({ ...input, constraint: "CUDA required" }).candidateSlugs).toEqual(["geforce-rtx-5090"]);
    expect(decideSystem({ ...input, constraint: "Large shared memory" }).candidateSlugs).toEqual(["framework-desktop-ryzen-ai-max"]);
    expect(decideSystem({ ...input, workload: "Robotics research", environment: "Controlled site" }).status).toBe("candidate");
    expect(input).toEqual({ ...defaultBrief, existingAssets: "Synthetic equipment" });
  });
});

describe("local vector retrieval", () => {
  it("returns sourced robotics evidence for a robot query", () => {
    const result = searchTechnology("quadruped robotics operator");
    expect(result[0]?.item.slug).toBe("unitree-go2");
    expect(result[0]?.item.source.url).toMatch(/^https:\/\//);
  });
  it("does not manufacture results for out-of-vocabulary queries", () => {
    expect(searchTechnology("xyzzyplugh")).toEqual([]);
  });
});
