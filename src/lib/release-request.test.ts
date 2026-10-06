import { describe, expect, it } from "vitest";
import { prepareReleaseRequest, releaseRequestMailto } from "./release-request";

describe("User-owned release request", () => {
  it("preserves Unicode and creates an unsent editable document with an exact short email body", () => {
    const request = prepareReleaseRequest("synthetic-kit", "Synthetic artifact", "Ship a renderer 🎨", "32 GB host", "Codex", 1791000000000);
    expect(request.submitted).toBe(false);
    expect(request.message).toContain("Ship a renderer 🎨");
    const email = releaseRequestMailto(request);
    expect(email.bodyIncluded).toBe(true);
    expect(new URL(email.href).searchParams.get("body")).toBe(request.message);
  });
  it("keeps a long edited draft intact and asks the user to paste it instead of truncating", () => {
    const request = { productName: "Synthetic artifact", message: "é".repeat(3000) };
    const email = releaseRequestMailto(request);
    expect(email.bodyIncluded).toBe(false);
    expect(new URL(email.href).searchParams.has("body")).toBe(false);
    expect(request.message).toHaveLength(3000);
  });
  it("repairs malformed Unicode for the email URI without changing the exported text", () => {
    const request = { productName: "Synthetic", message: "Edited text \uD83C" };
    expect(new URL(releaseRequestMailto(request).href).searchParams.get("body")).toBe("Edited text \uFFFD");
    expect(request.message).toBe("Edited text \uD83C");
  });
  it("rejects invalid fields and clocks before preparing a draft", () => {
    expect(() => prepareReleaseRequest("bad/id", "Product", "Outcome", "", "Codex")).toThrow();
    expect(() => prepareReleaseRequest("id", "Product", " ", "", "Codex")).toThrow();
    expect(() => prepareReleaseRequest("id", "Product", "x".repeat(2001), "", "Codex")).toThrow();
    expect(() => prepareReleaseRequest("id", "Product", "Outcome", "x".repeat(1001), "Codex")).toThrow();
    expect(() => prepareReleaseRequest("id", "Product", "Outcome", "", "Unknown")).toThrow();
    expect(() => prepareReleaseRequest("id", "Product", "Outcome", "", "Codex", NaN)).toThrow();
  });
});
