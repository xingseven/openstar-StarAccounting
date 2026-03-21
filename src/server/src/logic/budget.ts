type TransactionLike = {
  amount: string | number;
  type: string;
  category: string;
  platform?: string;
  date: Date | string;
};

type BudgetLike = {
  amount: string | number;
  category: string;
  platform?: string | null;
  period: "MONTHLY" | "YEARLY";
  scopeType?: "GLOBAL" | "CATEGORY" | "PLATFORM";
  alertPercent?: number;
};

export type BudgetStatus = "normal" | "warning" | "overdue";

export type BudgetHealthResult = {
  used: number;
  percent: number;
  status: BudgetStatus;
  alertPercent: number;
};

export function calculateBudgetUsage(
  budget: BudgetLike,
  transactions: TransactionLike[],
  now: Date = new Date()
): number {
  let used = 0;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    
    const scopeType = budget.scopeType || "GLOBAL";
    
    if (scopeType === "CATEGORY" && budget.category !== "ALL" && t.category !== budget.category) continue;
    if (scopeType === "PLATFORM" && budget.platform && t.platform !== budget.platform) continue;
    if (scopeType === "GLOBAL" && budget.category !== "ALL" && t.category !== budget.category) continue;

    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) continue;

    if (budget.period === "MONTHLY") {
      if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) continue;
    } else {
      if (d.getFullYear() !== currentYear) continue;
    }

    used += Number(t.amount);
  }
  return used;
}

export function calculateBudgetHealth(
  budget: BudgetLike,
  transactions: TransactionLike[],
  now: Date = new Date()
): BudgetHealthResult {
  const used = calculateBudgetUsage(budget, transactions, now);
  const budgetAmount = Number(budget.amount);
  const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0;
  const alertPercent = budget.alertPercent ?? 80;

  let status: BudgetStatus = "normal";
  if (percent >= 100) {
    status = "overdue";
  } else if (percent >= alertPercent) {
    status = "warning";
  }

  return {
    used,
    percent,
    status,
    alertPercent,
  };
}
