"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";
import { useTheme } from "@/components/shared/theme-provider";
import { isSavingsGoalSyncedToAssets } from "@/features/savings/plan-config";
import { getDashboardEntryFileName, getDashboardThemeComponent } from "@/themes/dashboard-registry";
import { getDashboardRoutePath } from "@/themes/dashboard-routes";
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
  const savingsTxs = savingsTxData.items.filter((transaction) =>
    savingsKeywords.some((keyword) => transaction.category?.includes(keyword) || transaction.merchant?.includes(keyword))
  );
  const monthSavingsIncome = savingsTxs
    .filter((transaction) => transaction.type === "INCOME" && new Date(transaction.date) >= new Date(start))
    .reduce((accumulator, transaction) => accumulator + Number(transaction.amount), 0);
  const monthSavingsExpense = savingsTxs
    .filter((transaction) => transaction.type === "EXPENSE" && new Date(transaction.date) >= new Date(start))
    .reduce((accumulator, transaction) => accumulator + Number(transaction.amount), 0);

  const assetsTotal = assetsData.items.reduce((accumulator, current) => accumulator + Number(current.estimatedValue ?? current.balance), 0);
  const unsyncedSavingsTotal = savingsData.items.reduce(
    (accumulator, current) => accumulator + (isSavingsGoalSyncedToAssets(current) ? 0 : Number(current.currentAmount)),
    0,
  );

  return {
    totalAssets: assetsTotal + unsyncedSavingsTotal,
    totalDebt: loansData.items.reduce((accumulator, current) => accumulator + Number(current.remainingAmount), 0),
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

export function DashboardPageShell() {
  const [data, setData] = useState<DashboardData>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { themeId } = useTheme();
  const dashboardEntryFileName = getDashboardEntryFileName(themeId);
  const dashboardRoutePath = getDashboardRoutePath(themeId);
  const DashboardTheme = getDashboardThemeComponent(themeId);

  useEffect(() => {
    if (pathname !== dashboardRoutePath) {
      router.replace(dashboardRoutePath);
    }
  }, [dashboardRoutePath, pathname, router]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const realData = await fetchDashboardData();
        if (!active) {
          return;
        }

        const hasNoData =
          realData.totalAssets === 0 &&
          realData.totalDebt === 0 &&
          realData.monthExpense === 0 &&
          realData.monthIncome === 0 &&
          realData.lastMonthExpense === 0 &&
          realData.lastMonthIncome === 0 &&
          realData.recentTransactions.length === 0;

        setData(hasNoData ? MOCK_DASHBOARD : realData);
      } catch (error) {
        console.warn("Failed to fetch dashboard data, using mock data:", error);
        if (!active) {
          return;
        }
        setData(MOCK_DASHBOARD);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="relative"
      data-dashboard-entry-file={dashboardEntryFileName}
      data-dashboard-route={dashboardRoutePath}
    >
      <DashboardTheme data={data} loading={loading} />
    </div>
  );
}
