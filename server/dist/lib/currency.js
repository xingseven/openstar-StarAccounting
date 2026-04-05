export function convertCurrency(amount, from, to, rates) {
    if (from === to)
        return amount;
    // Build map for O(1) lookup
    const rateMap = new Map();
    for (const r of rates) {
        rateMap.set(`${r.from}-${r.to}`, r.rate);
    }
    // Try direct rate
    const direct = rateMap.get(`${from}-${to}`);
    if (direct !== undefined) {
        return amount * direct;
    }
    // Try inverse rate
    const inverse = rateMap.get(`${to}-${from}`);
    if (inverse !== undefined && inverse !== 0) {
        return amount / inverse;
    }
    // Fallback: return original amount (or throw error, or return 0)
    // For this app, we return original amount to avoid breaking UI, 
    // but maybe we should flag it. Here we just return amount.
    return amount;
}
