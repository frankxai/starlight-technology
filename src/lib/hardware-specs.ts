import record from "../../data/commerce/hardware-specs.json";

export interface HardwareSpec {
  sourceUrl: string;
  memory: string;
  gpu: string;
  power: string;
  noise: string;
  expansion: string;
}

export const hardwareSpecs = record as { verifiedOn: string; method: string; specs: Record<string, HardwareSpec> };

export function getHardwareSpec(slug: string): HardwareSpec | undefined {
  return hardwareSpecs.specs[slug];
}

/** True when a cell is a statement about absence rather than a value. */
export function isUnpublished(value: string) {
  return /^(not published|not applicable)/i.test(value);
}
