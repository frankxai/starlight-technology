import { describe, expect, it } from "vitest";
import { mergeAssets, readAssetImport, type OwnedAsset } from "./owned-assets";
const asset: OwnedAsset = { id: "asset-1234", kind: "Computer", name: "Studio workstation", capabilities: "USB4", location: "Desk", state: "Owned", updatedAt: "2026-09-28T00:00:00Z" };
describe("portable asset ledger", () => {
  it("rejects duplicate IDs and malformed imports", () => {
    expect(readAssetImport({ schemaVersion: 1, assets: [asset, asset] })).toBeNull();
    expect(readAssetImport({ schemaVersion: 1, assets: [{ ...asset, name: "" }] })).toBeNull();
  });
  it("merges new IDs without overwriting local edits", () => {
    const result = mergeAssets([{ ...asset, name: "My edited name" }], [asset, { ...asset, id: "asset-5678" }]);
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.assets[0].name).toBe("My edited name");
  });
});
