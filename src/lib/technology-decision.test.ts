import { describe, expect, it } from "vitest";
import { decideSystem, isSystemBrief } from "./technology-decision";
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
