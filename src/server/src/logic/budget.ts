import { type TransactionType } from "@prisma/client";

type TransactionLike = {
  amount: string | number;
  type: string;
  category: string;
  date: Date | string;
};

type BudgetLike = {
  amount: string | number;
  category: string;
  period: "MONTHLY" | "YEARLY";
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
    if (budget.category !== "ALL" && t.category !== budget.category) continue;

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
