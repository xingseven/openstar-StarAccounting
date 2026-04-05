"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";
import { useTheme } from "@/components/shared/theme-provider";
import { isSavingsGoalSyncedToAssets } from "@/features/savings/plan-config";
import { getDashboardEntryFileName, getDashboardThemeComponent } from "@/themes/dashboard-registry";
import type { BudgetAlert, DashboardData, SavingsGoal } from "@/types";

type Asset = {
  id: string;
  name: string;
  balance: number;
  estimatedValue?: string;
};

type Loan = {
  id: string;
  remainingAmount: number;
};

type ConsumptionSummary = {
  totalExpense: string;
  expenseCount: number;
  avgExpense: string;
};

type Transaction = {
  id: string;
  date: string;
  type: "EXPENSE" | "INCOME";
  amount: string;
  category: string;
  platform: string;
  merchant?: string;
};

type SavingsMetricItem = Pick<SavingsGoal, "planConfig"> & {
  currentAmount: number | string;
};

async function fetchDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

  const qsExpense = new URLSearchParams({ type: "EXPENSE", startDate: start, endDate: end });
  const qsIncome = new URLSearchParams({ type: "INCOME", startDate: start, endDate: end });
  const qsLastMonthExpense = new URLSearchParams({ type: "EXPENSE", startDate: lastMonthStart, endDate: lastMonthEnd });
  const qsLastMonthIncome = new URLSearchParams({ type: "INCOME", startDate: lastMonthStart, endDate: lastMonthEnd });

  const [assetsData, loansData, savingsData, expenseData, incomeData, lastMonthExpenseData, lastMonthIncomeData, transactionsData, savingsTxData, budgetAlertsData] = await Promise.all([
    apiFetch<{ items: Asset[] }>("/api/assets"),
    apiFetch<{ items: Loan[] }>("/api/loans"),
    apiFetch<{ items: SavingsMetricItem[] }>("/api/savings"),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsExpense}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsIncome}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsLastMonthExpense}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsLastMonthIncome}`),
    apiFetch<{ items: Transaction[] }>(`/api/transactions?page=1&pageSize=5`),
    apiFetch<{ items: Transaction[] }>(`/api/transactions?pageSize=100`),
    apiFetch<{ alerts: BudgetAlert[] }>("/api/budgets/alerts"),
  ]);

  const savingsKeywords = ["储蓄", "存款"];
  const savingsTxs = savingsTxData.items.filter(t =>
    savingsKeywords.some(k => t.category?.includes(k) || t.merchant?.includes(k))
  );
  const monthSavingsIncome = savingsTxs
    .filter(t => t.type === "INCOME" && new Date(t.date) >= new Date(start))
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const monthSavingsExpense = savingsTxs
    .filter(t => t.type === "EXPENSE" && new Date(t.date) >= new Date(start))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const assetsTotal = assetsData.items.reduce((acc, cur) => acc + Number(cur.estimatedValue ?? cur.balance), 0);
  const unsyncedSavingsTotal = savingsData.items.reduce(
    (acc, cur) => acc + (isSavingsGoalSyncedToAssets(cur) ? 0 : Number(cur.currentAmount)),
    0,
  );

  return {
    totalAssets: assetsTotal + unsyncedSavingsTotal,
    totalDebt: loansData.items.reduce((acc, cur) => acc + Number(cur.remainingAmount), 0),
    monthExpense: Number(expenseData.totalExpense),
    monthIncome: Number(incomeData.totalExpense),
    lastMonthExpense: Number(lastMonthExpenseData.totalExpense),
    lastMonthIncome: Number(lastMonthIncomeData.totalExpense),
    monthSavingsIncome,
    monthSavingsExpense,
    recentTransactions: transactionsData.items,
    budgetAlerts: budgetAlertsData.alerts || [],
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const { themeId } = useTheme();
  const dashboardEntryFileName = getDashboardEntryFileName(themeId);
  const DashboardTheme = getDashboardThemeComponent(themeId);
  const shouldShowDashboardEntryHint = process.env.NODE_ENV !== "production";

  useEffect(() => {
    async function loadData() {
      try {
        const realData = await fetchDashboardData();
        const hasNoData =
          realData.totalAssets === 0 &&
          realData.totalDebt === 0 &&
          realData.monthExpense === 0 &&
          realData.monthIncome === 0 &&
          realData.lastMonthExpense === 0 &&
          realData.lastMonthIncome === 0 &&
          realData.recentTransactions.length === 0;
        if (hasNoData) {
          setData(MOCK_DASHBOARD);
        } else {
          setData(realData);
        }
      } catch (error) {
        console.warn("Failed to fetch dashboard data, using mock data:", error);
        setData(MOCK_DASHBOARD);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div
      className="relative"
      data-dashboard-entry-file={dashboardEntryFileName}
    >
      {shouldShowDashboardEntryHint ? (
        <div className="mb-3 flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/92 px-3 py-2 text-xs text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Dashboard Source
          </div>
          <div className="shrink-0 rounded-xl bg-white px-2 py-1 font-mono font-semibold text-slate-900">
            {dashboardEntryFileName}
          </div>
          <div className="shrink-0 text-[11px] text-slate-500">
            当前主题：{themeId}
          </div>
        </div>
      ) : null}
      <DashboardTheme data={data} loading={loading} />
    </div>
  );
}
