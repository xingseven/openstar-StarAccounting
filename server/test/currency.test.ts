import { describe, it, expect } from "vitest";
import { convertCurrency, type ExchangeRate } from "../src/lib/currency.js";

describe("Currency Conversion", () => {
  const rates: ExchangeRate[] = [
    { from: "USD", to: "CNY", rate: 7.2 },
    { from: "EUR", to: "CNY", rate: 7.8 },
  ];

  it("should return original amount if currencies are same", () => {
    expect(convertCurrency(100, "CNY", "CNY", rates)).toBe(100);
  });

  it("should convert using direct rate", () => {
    expect(convertCurrency(100, "USD", "CNY", rates)).toBe(720);
  });

  it("should convert using inverse rate", () => {
    // 720 CNY -> USD should be 100
    const res = convertCurrency(720, "CNY", "USD", rates);
    expect(res).toBeCloseTo(100);
  });

  it("should return original amount if rate not found", () => {
    expect(convertCurrency(100, "JPY", "CNY", rates)).toBe(100);
  });
});
