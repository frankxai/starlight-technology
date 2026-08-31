import { describe, expect, it } from "vitest";
import { composeDeal } from "./infrastructure";

describe("composeDeal", () => {
  it("defaults an operating-company mandate to a productivity node", () => {
    const result = composeDeal({
      contribution: "site-power",
      demand: "internal",
      capital: "operating-cash",
      control: "owner-led",
      sensitivity: "confidential"
    });
    expect(result.model.id).toBe("productivity-node");
    expect(result.firstPurchase).toContain("Partnership Blueprint");
  });

  it("requires offtake before an offtake-backed node", () => {
    const result = composeDeal({
      contribution: "operator-capability",
      demand: "external-offtake",
      capital: "leasing",
      control: "operator-led",
      sensitivity: "standard"
    });
    expect(result.model.id).toBe("offtake-backed-node");
    expect(result.proofRequired[0]).toContain("offtake");
  });

  it("treats a split-control capital partnership as NodeCo only with contracted demand", () => {
    const result = composeDeal({
      contribution: "capital",
      demand: "contracted",
      capital: "mixed",
      control: "split",
      sensitivity: "regulated"
    });
    expect(result.model.id).toBe("nodeco");
    expect(result.riskPosture).toContain("independent legal");
  });
});
