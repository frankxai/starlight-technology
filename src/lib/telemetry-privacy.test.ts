import { describe, expect, it } from "vitest";
import { filterPublicTelemetry } from "./telemetry-privacy";

describe("Studio telemetry boundary", () => {
  it("rejects Studio pageviews and performance events", () => {
    for (const path of ["/studio", "/studio/", "/studio/recovery", "/%73tudio"]) {
      expect(filterPublicTelemetry({ url: `https://starlight.technology${path}?note=private`, type: "pageview" }, "/atlas")).toBeNull();
    }
  });

  it("rejects queued public-page metrics once navigation enters Studio", () => {
    expect(filterPublicTelemetry({ url: "https://starlight.technology/atlas", value: 23 }, "/studio")).toBeNull();
  });

  it("strips public URL queries and fragments without changing the measurement", () => {
    const event = { url: "https://starlight.technology/atlas?email=private@example.invalid#private", value: 23 };
    expect(filterPublicTelemetry(event, "/atlas")).toEqual({ url: "https://starlight.technology/atlas", value: 23 });
    expect(event.url).toContain("private@example.invalid");
  });

  it("fails closed for malformed or non-web URLs", () => {
    for (const url of ["not a URL", "javascript:alert(1)", "file:///studio"]) {
      expect(filterPublicTelemetry({ url }, "/atlas")).toBeNull();
    }
  });

  it("preserves public editorial paths sharing the Studio prefix", () => {
    expect(filterPublicTelemetry({ url: "https://starlight.technology/studio-guide" }, "/studio-guide")).not.toBeNull();
  });

  it("fails closed when the current browser path cannot be decoded", () => {
    expect(filterPublicTelemetry({ url: "https://starlight.technology/atlas" }, "/%zz")).toBeNull();
  });
});
