import { describe, it, expect } from "vitest";
import { getSources, sources } from "./sources";

describe("getSources", () => {
  it("should return the correct source records for valid ids", () => {
    const ids = ["nvidia-rtx-5090", "google-review-guidance"];
    const result = getSources(ids);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(sources.find(s => s.id === "nvidia-rtx-5090"));
    expect(result[1]).toEqual(sources.find(s => s.id === "google-review-guidance"));
  });

  it("should throw an error if a source id is missing", () => {
    const ids = ["nvidia-rtx-5090", "non-existent-id"];

    expect(() => getSources(ids)).toThrowError("Missing source: non-existent-id");
  });

  it("should return an empty array if empty array of ids is provided", () => {
    const result = getSources([]);
    expect(result).toEqual([]);
  });
});
