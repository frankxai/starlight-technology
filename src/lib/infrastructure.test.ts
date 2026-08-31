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
    expect(result.architecture).toContain("Private-data workloads");
  });

  it("selects hosted capacity when a site is available but demand remains exploratory", () => {
    const result = composeDeal({
      contribution: "site-power",
      demand: "exploratory",
      capital: "operating-cash",
      control: "owner-led",
      sensitivity: "standard"
    });
    expect(result.model.id).toBe("hosted-capacity");
    expect(result.firstPurchase).toContain("Do not buy compute yet");
    expect(result.proofRequired[0]).toContain("Named workloads");
  });

  it("selects financed transformation when bank capital follows real demand", () => {
    const result = composeDeal({
      contribution: "workload",
      demand: "contracted",
      capital: "bank",
      control: "owner-led",
      sensitivity: "confidential"
    });
    expect(result.model.id).toBe("financed-transformation");
    expect(result.contractFocus).toContain("Finance-ready sources-and-uses schedule");
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

  it("keeps standard data on a hybrid routing posture", () => {
    const result = composeDeal({
      contribution: "operator-capability",
      demand: "internal",
      capital: "leasing",
      control: "operator-led",
      sensitivity: "standard"
    });
    expect(result.model.id).toBe("productivity-node");
    expect(result.architecture).toContain("hybrid model");
  });
});
