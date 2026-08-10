import { describe, expect, it } from "vitest";
import { recommendBuild } from "./decision-model";

describe("recommendBuild", () => {
  it("routes mobility constraints to the portable system", () => {
    expect(recommendBuild({ workload: "travel", budget: "3000", priority: "balance" }).href).toContain("portable");
  });
  it("routes performance plus high budget to a hybrid system", () => {
    expect(recommendBuild({ workload: "local-ai", budget: "7000", priority: "performance" }).href).toContain("hybrid");
  });
  it("uses the balanced build as the conservative default", () => {
    expect(recommendBuild({ workload: "studio", budget: "3000", priority: "balance" }).href).toContain("balanced");
  });
});
