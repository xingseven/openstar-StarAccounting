import { type ExchangeRate } from "../lib/currency.js";
import { convertCurrency } from "../lib/currency.js";

type AssetLike = {
  balance: string | number;
  currency: string;
};

export function calculateAssetValue(
  asset: AssetLike,
  targetCurrency: string,
  rates: ExchangeRate[]
): number {
  const balance = Number(asset.balance);
  const currency = asset.currency || "CNY";

  if (currency === targetCurrency) return balance;

  return convertCurrency(balance, currency, targetCurrency, rates);
}

