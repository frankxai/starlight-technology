export const assetKinds = ["Computer", "Phone", "Display", "Spatial", "Robot", "Other"] as const;
export const assetStates = ["Owned", "Evaluating", "Retired"] as const;
export type AssetKind = typeof assetKinds[number];
export type AssetState = typeof assetStates[number];
export interface OwnedAsset { id: string; kind: AssetKind; name: string; capabilities: string; location: string; state: AssetState; updatedAt: string; }

export function isOwnedAsset(value: unknown): value is OwnedAsset {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(item.id)
    && assetKinds.includes(item.kind as AssetKind)
    && typeof item.name === "string" && item.name.trim().length > 0 && item.name.length <= 100
    && typeof item.capabilities === "string" && item.capabilities.length <= 300
    && typeof item.location === "string" && item.location.length <= 80
    && assetStates.includes(item.state as AssetState)
    && typeof item.updatedAt === "string" && !Number.isNaN(Date.parse(item.updatedAt));
}

export function readAssetImport(value: unknown): OwnedAsset[] | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Record<string, unknown>;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.assets) || parsed.assets.length > 100 || !parsed.assets.every(isOwnedAsset)) return null;
  const ids = parsed.assets.map((item: OwnedAsset) => item.id);
  return new Set(ids).size === ids.length ? parsed.assets as OwnedAsset[] : null;
}

export function mergeAssets(current: OwnedAsset[], imported: OwnedAsset[]) {
  const ids = new Set(current.map((item) => item.id));
  const additions = imported.filter((item) => !ids.has(item.id));
  return { assets: [...current, ...additions].slice(0, 100), added: Math.min(additions.length, Math.max(0, 100 - current.length)), skipped: imported.length - Math.min(additions.length, Math.max(0, 100 - current.length)) };
}
