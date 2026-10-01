import { describe, expect, it } from "vitest";
import { POST } from "../app/api/xr/ask/route";

function ask(body: unknown, origin = "https://starlight.technology") {
  return POST(new Request("https://starlight.technology/api/xr/ask", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body)
  }));
}

describe("XR follow-up boundary", () => {
  it("answers from dated catalog evidence when paid AI is disabled", async () => {
    const response = await ask({ question: "Is it available in the Netherlands?", selection: { goal: "future", timing: "later", host: "none" } });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.mode).toBe("catalog");
    expect(data.answer).toMatch(/unverified/);
    expect(data.sources).toHaveLength(1);
    expect(data.sources[0].checked).toBe("2026-09-24");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("rejects an invalid question and cross-origin requests", async () => {
    expect((await ask({ question: "" })).status).toBe(400);
    expect((await ask({ question: "Is this real?" }, "https://outside.example")).status).toBe(403);
  });
});
