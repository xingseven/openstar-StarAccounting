import { convertCurrency } from "../lib/currency.js";
export function calculateAssetValue(asset, targetCurrency, rates) {
    const balance = Number(asset.balance);
    const currency = asset.currency || "CNY";
    if (currency === targetCurrency)
        return balance;
    return convertCurrency(balance, currency, targetCurrency, rates);
}
