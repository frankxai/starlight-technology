import { describe, expect, it } from "vitest";
import { answerFromEvidence, getXRAdvice, parseXRSelection } from "./xr-decision";
import { xrDevices } from "./xr-catalog";

describe("XR decision boundaries", () => {
  it("never recommends the announced device for a purchase needed now", () => {
    for (const goal of ["prototype", "workspace", "capture", "future"] as const) {
      for (const host of ["laptop", "phone", "none"] as const) {
        expect(getXRAdvice({ goal, host, timing: "now" }).deviceId).not.toBe("meta-vr-glasses");
      }
    }
  });

  it("marks the future device as watchlist, and explains unsupported hosts", () => {
    expect(getXRAdvice({ goal: "future", host: "none", timing: "later" }).state).toBe("watchlist");
    const workspace = getXRAdvice({ goal: "workspace", host: "none", timing: "now" });
    expect(workspace.deviceId).toBe("quest-3");
    expect(workspace.constraint).toMatch(/app|comfort/i);
  });

  it("treats user selection as untrusted and only cites catalog sources", () => {
    const selection = parseXRSelection({ goal: "invalid", timing: "later", host: "invalid" });
    expect(selection.goal).toBe("prototype");
    expect(selection.host).toBe("laptop");
    const response = answerFromEvidence("Is it available in the Netherlands?", { goal: "future", timing: "later", host: "laptop" });
    expect(response.answer).toMatch(/unverified/);
    expect(xrDevices.some((device) => device.source.url === response.sources[0].url)).toBe(true);
  });
});
