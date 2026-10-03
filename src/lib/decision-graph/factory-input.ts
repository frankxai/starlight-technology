export interface FactoryInputLimits { scale: number; min: number; max: number; optional: boolean }
export type FactoryInputResult = { ok: true; value: number | null } | { ok: false; error: string };

export function readFactoryInput(text: string, limits: FactoryInputLimits): FactoryInputResult {
  const places = limits.scale === 1 ? 0 : limits.scale === 100 ? 2 : limits.scale === 1_000_000 ? 6 : null;
  const minimum = limits.min * limits.scale, maximum = limits.max * limits.scale;
  if (places === null || !Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || minimum < 0 || maximum < minimum) {
    return { ok: false, error: "This field’s range is unavailable. The saved assumption is unchanged." };
  }
  if (text === "" && limits.optional) return { ok: true, value: null };
  if (text.length > 64 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
    return { ok: false, error: "Use digits and a period for the decimal point, up to 64 characters. The saved assumption is unchanged." };
  }
  const [whole, rawFraction = ""] = text.split(".");
  const fraction = rawFraction.replace(/0+$/, "");
  if (fraction.length > places) {
    return { ok: false, error: `${places === 0 ? "Enter a whole number" : `Use at most ${places} decimal places`}. The saved assumption is unchanged.` };
  }
  const units = BigInt(whole || "0") * BigInt(limits.scale) + BigInt(fraction.padEnd(places, "0") || "0");
  if (units < BigInt(minimum) || units > BigInt(maximum)) {
    return { ok: false, error: `Enter a value from ${limits.min} to ${limits.max}. The saved assumption is unchanged.` };
  }
  return { ok: true, value: Number(units) };
}
