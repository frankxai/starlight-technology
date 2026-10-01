import { describe, expect, it } from "vitest";
import { agentRegistry } from "./agentic-engine";
import { toolRegistry, validateToolSelection } from "./tool-contracts";

describe("tool contracts", () => {
  it("registers every tool referenced by every agent", () => {
    for (const agent of Object.values(agentRegistry)) {
      for (const toolId of agent.tools) expect(toolRegistry[toolId], `${agent.id} -> ${toolId}`).toBeDefined();
    }
  });

  it("never enables consequential tools by default", () => {
    for (const tool of Object.values(toolRegistry)) {
      if (tool.sideEffect === "consequential") {
        expect(tool.enabledByDefault).toBe(false);
        expect(tool.approval).toBe("always");
      }
    }
  });

  it("requires explicit authority for non-observe tools", () => {
    expect(validateToolSelection(["supplier.search", "repo.write"], ["research"])).toEqual([
      "tool authority not granted: repo.write requires external-write"
    ]);
  });

  it("keeps purchase and settlement as separate authorities", () => {
    expect(toolRegistry["purchase.execute"].authority).toBe("purchase");
    expect(toolRegistry["settlement.execute"].authority).toBe("settlement");
  });
});
