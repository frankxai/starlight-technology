import { describe, expect, it } from "vitest";
import { readFactoryInput } from "./factory-input";

const cap = { scale: 100, min: 0, max: 1_000_000, optional: true };
const fee = { scale: 1_000_000, min: 0, max: 1_000_000, optional: true };
describe("exact factory assumptions", () => {
  it.each(["99.995", "0.001", "72.590001"])("keeps unsupported cap precision out of the saved plan: %s", (text) => {
    expect(readFactoryInput(text, cap).ok).toBe(false);
  });
  it("does not turn a nonzero sub-micro fee into a known zero", () => {
    expect(readFactoryInput("0.0000004", fee).ok).toBe(false);
  });
  it.each([["99.99", 9999], ["72.59", 7259], [".29", 29], ["0001.20", 120], ["1.2300", 123], ["1.", 100], ["0", 0]])("preserves exact cents: %s", (text, value) => {
    expect(readFactoryInput(text as string, cap)).toEqual({ ok: true, value });
  });
  it("preserves exact micro-dollar fees at the range boundary", () => {
    expect(readFactoryInput("999999.999999", fee)).toEqual({ ok: true, value: 999_999_999_999 });
    expect(readFactoryInput("1000000.000001", fee).ok).toBe(false);
    expect(readFactoryInput("0.000001", fee)).toEqual({ ok: true, value: 1 });
  });
  it("keeps blank unknown distinct from explicit zero and from invalid text", () => {
    expect(readFactoryInput("", fee)).toEqual({ ok: true, value: null });
    expect(readFactoryInput("0", fee)).toEqual({ ok: true, value: 0 });
    for (const text of ["1e", "NaN", "Infinity", "-0.01", " ", "1,25", "1e2", "+1"]) expect(readFactoryInput(text, fee).ok).toBe(false);
    expect(readFactoryInput("", { ...fee, optional: false }).ok).toBe(false);
  });
  it("applies whole-number and percentage bounds without rounding", () => {
    const whole = { scale: 1, min: 1, max: 31, optional: false };
    expect(readFactoryInput("1.5", whole).ok).toBe(false);
    expect(readFactoryInput("0", whole).ok).toBe(false);
    expect(readFactoryInput("31", whole)).toEqual({ ok: true, value: 31 });
    const percent = { scale: 100, min: 0, max: 100, optional: false };
    expect(readFactoryInput("99.99", percent)).toEqual({ ok: true, value: 9999 });
    expect(readFactoryInput("99.999", percent).ok).toBe(false);
    expect(readFactoryInput("100.01", percent).ok).toBe(false);
  });
  it("rejects oversized inputs and invalid unit contracts", () => {
    expect(readFactoryInput("0".repeat(10_000), fee).ok).toBe(false);
    expect(readFactoryInput("1", { ...fee, scale: 3 }).ok).toBe(false);
    expect(readFactoryInput("1", { ...fee, max: Infinity }).ok).toBe(false);
  });
  it("rejects a long paste whose last significant digit would be lost by a browser maxlength", () => {
    expect(readFactoryInput("5." + "0".repeat(62) + "1", fee).ok).toBe(false);
  });
  it("accepts the exact minimum exchange rate and rejects zero", () => {
    const fx = { scale: 1_000_000, min: 0.000001, max: 100, optional: true };
    expect(readFactoryInput("0.000001", fx)).toEqual({ ok: true, value: 1 });
    expect(readFactoryInput("0", fx).ok).toBe(false);
  });
});
