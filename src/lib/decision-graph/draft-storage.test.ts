import { describe, expect, it } from "vitest";
import { encodeCreatorPlan, newCreatorPlan } from "./creator-plan";
import { saveCreatorDraft, type DraftLock } from "./draft-storage";

const key = "synthetic-draft";
const first = encodeCreatorPlan(newCreatorPlan(), "2026-10-03T09:00:00.000Z");
const changed = encodeCreatorPlan({ ...newCreatorPlan(), privateContext: "Synthetic owner edit" }, "2026-10-03T09:01:00.000Z");
function store(raw: string | null) {
  return { raw, writes: 0, getItem() { return this.raw; }, setItem(_key: string, value: string) { this.raw = value; this.writes++; } };
}
const immediate: DraftLock = async (operation) => operation();

describe("private draft concurrency", () => {
  it("saves against the exact observed draft", async () => {
    const storage = store(first);
    expect(await saveCreatorDraft(storage, key, first, changed, immediate)).toEqual({ status: "saved", raw: changed });
    expect(storage.writes).toBe(1);
  });
  it.each(["{broken foreign draft", null, changed])("preserves foreign edits or removal without a write: %s", async (remote) => {
    const storage = store(remote);
    expect(await saveCreatorDraft(storage, key, first, changed, immediate)).toEqual({ status: "conflict", raw: remote });
    expect(storage.writes).toBe(0);
  });
  it("does not turn a timestamp-only tab opening into a conflicting write", async () => {
    const storage = store(first), later = encodeCreatorPlan(newCreatorPlan(), "2026-10-03T09:02:00.000Z");
    expect(await saveCreatorDraft(storage, key, first, later, immediate)).toEqual({ status: "saved", raw: first });
    expect(storage.writes).toBe(0);
  });
  it("serializes competing writes, preserving the losing writer's draft", async () => {
    const storage = store(first);
    let queue: Promise<unknown> = Promise.resolve();
    const serial: DraftLock = (operation) => {
      const next = queue.then(operation); queue = next.catch(() => undefined); return next;
    };
    const other = encodeCreatorPlan({ ...newCreatorPlan(), title: "Second writer" }, "2026-10-03T09:03:00.000Z");
    const results = await Promise.all([saveCreatorDraft(storage, key, first, changed, serial), saveCreatorDraft(storage, key, first, other, serial)]);
    expect(results).toEqual([{ status: "saved", raw: changed }, { status: "conflict", raw: changed }]);
    expect(storage.writes).toBe(1);
  });
  it("cancels an obsolete edit after waiting for the lock", async () => {
    const storage = store(first);
    expect(await saveCreatorDraft(storage, key, first, changed, immediate, () => false)).toEqual({ status: "cancelled" });
    expect(storage.writes).toBe(0);
  });
  it("advances its cursor inside the lock so queued edits in one tab see their own last save", async () => {
    const storage = store(first);
    let observed: string | null = first, queue: Promise<unknown> = Promise.resolve();
    const serial: DraftLock = (operation) => { const next = queue.then(operation); queue = next.catch(() => undefined); return next; };
    const next = encodeCreatorPlan({ ...newCreatorPlan(), title: "Later same-tab edit" }, "2026-10-03T09:04:00.000Z");
    const save = (payload: string) => saveCreatorDraft(storage, key, () => observed, payload, serial, () => true, (raw) => { observed = raw; });
    const results = await Promise.all([save(changed), save(next)]);
    expect(results.map((result) => result.status)).toEqual(["saved", "saved"]);
    expect(storage.raw).toBe(next);
  });
  it("keeps memory/export available when locks or storage access fail", async () => {
    const storage = store(first);
    expect(await saveCreatorDraft(storage, key, first, changed, null)).toEqual({ status: "unavailable" });
    const deny: DraftLock = async () => { throw new Error("Synthetic lock denied"); };
    expect(await saveCreatorDraft(storage, key, first, changed, deny)).toEqual({ status: "unavailable" });
    expect(storage.writes).toBe(0);
    storage.getItem = () => { throw new Error("Synthetic storage denied"); };
    expect(await saveCreatorDraft(storage, key, first, changed, immediate)).toEqual({ status: "unavailable" });
  });
  it("permits a deliberate replacement only if the acknowledged remote value still matches", async () => {
    const storage = store(changed), acknowledged = storage.raw;
    storage.raw = "newer foreign edit";
    expect(await saveCreatorDraft(storage, key, acknowledged, first, immediate)).toEqual({ status: "conflict", raw: "newer foreign edit" });
    expect(storage.writes).toBe(0);
  });
});
