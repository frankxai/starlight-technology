import { parseCreatorPlan } from "./creator-plan";

type DraftStorage = Pick<Storage, "getItem" | "setItem">;
export type DraftLock = <T>(operation: () => T | Promise<T>) => Promise<T>;
export type DraftSaveResult =
  | { status: "saved"; raw: string }
  | { status: "conflict"; raw: string | null }
  | { status: "unavailable" | "cancelled" };

function samePlan(left: string, right: string): boolean {
  try {
    return JSON.stringify({ ...parseCreatorPlan(left), savedAt: null }) === JSON.stringify({ ...parseCreatorPlan(right), savedAt: null });
  } catch { return false; }
}

/** Only cooperating writers holding this origin's lock may replace the observed draft.
 * Legacy tabs or external storage changes are detected by exact raw-value comparison.
 * No lock support means memory/export only, never a silently weaker save.
 */
export async function saveCreatorDraft(storage: DraftStorage, key: string, expected: string | null | (() => string | null), payload: string, lock: DraftLock | null, isCurrent: () => boolean = () => true, onSaved: (raw: string) => void = () => undefined): Promise<DraftSaveResult> {
  if (!lock) return { status: "unavailable" };
  try {
    return await lock(() => {
      if (!isCurrent()) return { status: "cancelled" };
      const raw = storage.getItem(key);
      if (raw !== (typeof expected === "function" ? expected() : expected)) return { status: "conflict", raw };
      // Merely opening another tab must not create a timestamp-only conflicting write.
      if (raw !== null && samePlan(raw, payload)) { onSaved(raw); return { status: "saved", raw }; }
      storage.setItem(key, payload);
      onSaved(payload);
      return { status: "saved", raw: payload };
    });
  } catch { return { status: "unavailable" }; }
}
