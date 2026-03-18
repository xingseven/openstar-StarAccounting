export type Transaction = {
  id: string;
  amount: number;
  category: string;
  merchant: string | null;
  date: Date | string;
  type: string;
};

export type AnomalyResult = {
  id: string;
  type: "LARGE_EXPENSE" | "HIGH_FREQUENCY" | "UNUSUAL_CATEGORY" | "UNUSUAL_TIME";
  severity: "LOW" | "MEDIUM" | "HIGH";
  amount: number;
  category: string;
  merchant: string | null;
  reason: string;
  date: Date | string;
};

export type AnomalyConfig = {
  largeExpenseThreshold: number;
  highFrequencyThreshold: number;
  unusualCategoryThreshold: number;
  recentDays: number;
};

const DEFAULT_CONFIG: AnomalyConfig = {
  largeExpenseThreshold: 1000,
  highFrequencyThreshold: 10,
  unusualCategoryThreshold: 3,
  recentDays: 30,
};

export function detectLargeExpenses(
  transactions: Transaction[],
  config: AnomalyConfig = DEFAULT_CONFIG
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  
  for (const tx of transactions) {
    if (tx.type !== "EXPENSE") continue;
    
    const amount = Number(tx.amount);
    if (amount >= config.largeExpenseThreshold) {
      let severity: AnomalyResult["severity"] = "LOW";
      if (amount >= config.largeExpenseThreshold * 5) {
        severity = "HIGH";
      } else if (amount >= config.largeExpenseThreshold * 2) {
        severity = "MEDIUM";
      }
      
      anomalies.push({
        id: tx.id,
        type: "LARGE_EXPENSE",
        severity,
        amount,
        category: tx.category,
        merchant: tx.merchant,
        reason: `单笔支出 ¥${amount.toFixed(2)} 超过阈值 ¥${config.largeExpenseThreshold}`,
        date: tx.date,
      });
    }
  }
  
  return anomalies;
}

export function detectHighFrequency(
  transactions: Transaction[],
  config: AnomalyConfig = DEFAULT_CONFIG
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  const now = new Date();
  const recentDate = new Date(now.getTime() - config.recentDays * 24 * 60 * 60 * 1000);
  
  const recentTx = transactions.filter((tx) => {
    if (tx.type !== "EXPENSE") return false;
    const txDate = new Date(tx.date);
    return txDate >= recentDate;
  });
  
  const categoryCount = new Map<string, { count: number; total: number; txs: Transaction[] }>();
  
  for (const tx of recentTx) {
    const cat = tx.category || "其他";
    const existing = categoryCount.get(cat) || { count: 0, total: 0, txs: [] };
    existing.count++;
    existing.total += Number(tx.amount);
    existing.txs.push(tx);
    categoryCount.set(cat, existing);
  }
  
  for (const [category, data] of categoryCount) {
    if (data.count >= config.highFrequencyThreshold) {
      const avgAmount = data.total / data.count;
      anomalies.push({
        id: `freq-${category}`,
        type: "HIGH_FREQUENCY",
        severity: data.count >= config.highFrequencyThreshold * 2 ? "HIGH" : "MEDIUM",
        amount: data.total,
        category,
        merchant: null,
        reason: `近${config.recentDays}天内 "${category}" 消费 ${data.count} 次，平均 ¥${avgAmount.toFixed(2)}`,
        date: now,
      });
    }
  }
  
  return anomalies;
}

export function detectUnusualPatterns(
  transactions: Transaction[],
  config: AnomalyConfig = DEFAULT_CONFIG
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  const now = new Date();
  const recentDate = new Date(now.getTime() - config.recentDays * 24 * 60 * 60 * 1000);
  
  const recentTx = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= recentDate;
  });
  
  const categorySet = new Set<string>();
  for (const tx of recentTx) {
    if (tx.category) categorySet.add(tx.category);
  }
  
  const olderDate = new Date(recentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
  const olderTx = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= olderDate && txDate < recentDate;
  });
  
  const olderCategories = new Set<string>();
  for (const tx of olderTx) {
    if (tx.category) olderCategories.add(tx.category);
  }
  
  for (const cat of categorySet) {
    if (!olderCategories.has(cat)) {
      const catTx = recentTx.filter((tx) => tx.category === cat);
      const total = catTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      if (catTx.length >= config.unusualCategoryThreshold) {
        anomalies.push({
          id: `unusual-${cat}`,
          type: "UNUSUAL_CATEGORY",
          severity: "LOW",
          amount: total,
          category: cat,
          merchant: null,
          reason: `近${config.recentDays}天出现新消费类别 "${cat}"，共 ${catTx.length} 笔`,
          date: now,
        });
      }
    }
  }
  
  return anomalies;
}

export function detectAnomalies(
  transactions: Transaction[],
  config: AnomalyConfig = DEFAULT_CONFIG
): AnomalyResult[] {
  const largeExpenses = detectLargeExpenses(transactions, config);
  const highFrequency = detectHighFrequency(transactions, config);
  const unusualPatterns = detectUnusualPatterns(transactions, config);
  
  return [...largeExpenses, ...highFrequency, ...unusualPatterns]
    .sort((a, b) => {
      const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

export function generateAnomalyReport(anomalies: AnomalyResult[]): {
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    totalAmount: number;
  };
  byCategory: Map<string, { count: number; total: number }>;
  byType: Map<string, number>;
} {
  const summary = {
    total: anomalies.length,
    high: anomalies.filter((a) => a.severity === "HIGH").length,
    medium: anomalies.filter((a) => a.severity === "MEDIUM").length,
    low: anomalies.filter((a) => a.severity === "LOW").length,
    totalAmount: anomalies.reduce((sum, a) => sum + a.amount, 0),
  };
  
  const byCategory = new Map<string, { count: number; total: number }>();
  for (const a of anomalies) {
    const existing = byCategory.get(a.category) || { count: 0, total: 0 };
    existing.count++;
    existing.total += a.amount;
    byCategory.set(a.category, existing);
  }
  
  const byType = new Map<string, number>();
  for (const a of anomalies) {
    byType.set(a.type, (byType.get(a.type) || 0) + 1);
  }
  
  return { summary, byCategory, byType };
}
