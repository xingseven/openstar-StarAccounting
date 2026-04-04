import { describe, it, expect } from "vitest";
import { calculateAssetValue } from "../src/logic/asset.js";
import { type ExchangeRate } from "../src/lib/currency.js";

describe("Asset Logic", () => {
  const rates: ExchangeRate[] = [
    { from: "USD", to: "CNY", rate: 7.2 },
    { from: "EUR", to: "CNY", rate: 7.8 },
  ];

  it("should return original balance if currencies match", () => {
    const asset = { balance: 1000, currency: "CNY" };
    const val = calculateAssetValue(asset, "CNY", rates);
    expect(val).toBe(1000);
  });

  it("should convert currency using rates", () => {
    const asset = { balance: 100, currency: "USD" };
    const val = calculateAssetValue(asset, "CNY", rates);
    expect(val).toBe(720);
  });

  it("should handle string balance input", () => {
    const asset = { balance: "100", currency: "USD" };
    const val = calculateAssetValue(asset, "CNY", rates);
    expect(val).toBe(720);
  });

  it("should default to CNY if currency missing", () => {
    const asset = { balance: 100, currency: "" };
    const val = calculateAssetValue(asset, "CNY", rates);
    expect(val).toBe(100);
  });
});
