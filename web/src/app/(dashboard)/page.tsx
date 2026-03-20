"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";
import { MockDataBanner } from "@/features/shared/useRealData";
import { StatsCardSkeleton, ChartSkeleton, CardListSkeleton } from "@/components/shared/Skeletons";

const DashboardDefaultTheme = dynamic(
  () => import("@/features/dashboard/components/themes/DefaultDashboard").then(mod => mod.DashboardDefaultTheme),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <div>
            <CardListSkeleton count={5} />
          </div>
        </div>
      </div>
    )
  }
);

export type BudgetAlert = {
  id: string;
  category: string;
  platform?: string | null;
  period: string;
  scopeType: string;
  amount: string;
  used: string;
  percent: number;
  status: "normal" | "warning" | "overdue";
  alertPercent: number;
};

export type DashboardData = {
  totalAssets: number;
  totalDebt: number;
  monthExpense: number;
  monthIncome: number;
  monthSavingsIncome: number;
  monthSavingsExpense: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    type: "EXPENSE" | "INCOME";
    amount: string;
    category: string;
    platform: string;
    merchant?: string;
  }>;
  budgetAlerts: BudgetAlert[];
};

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

async function fetchDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  const qsExpense = new URLSearchParams({ type: "EXPENSE", startDate: start, endDate: end });
  const qsIncome = new URLSearchParams({ type: "INCOME", startDate: start, endDate: end });

  const [assetsData, loansData, savingsData, expenseData, incomeData, transactionsData, savingsTxData, budgetAlertsData] = await Promise.all([
    apiFetch<{ items: Asset[] }>("/api/assets"),
    apiFetch<{ items: Loan[] }>("/api/loans"),
    apiFetch<{ items: any[] }>("/api/savings"),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsExpense}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsIncome}`),
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
  const savingsTotal = savingsData.items.reduce((acc, cur) => acc + Number(cur.currentAmount), 0);

  return {
    totalAssets: assetsTotal + savingsTotal,
    totalDebt: loansData.items.reduce((acc, cur) => acc + Number(cur.remainingAmount), 0),
    monthExpense: Number(expenseData.totalExpense),
    monthIncome: Number(incomeData.totalExpense),
    monthSavingsIncome,
    monthSavingsExpense,
    recentTransactions: transactionsData.items,
    budgetAlerts: budgetAlertsData.alerts || [],
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const realData = await fetchDashboardData();
        // 如果所有数据都是 0 或空，使用 mock 数据用于展示
        const hasNoData =
          realData.totalAssets === 0 &&
          realData.totalDebt === 0 &&
          realData.monthExpense === 0 &&
          realData.monthIncome === 0 &&
          realData.recentTransactions.length === 0;
        if (hasNoData) {
          setData(MOCK_DASHBOARD);
          setUsingMockData(true);
        } else {
          setData(realData);
          setUsingMockData(false);
        }
      } catch (error) {
        console.warn("Failed to fetch dashboard data, using mock data:", error);
        setData(MOCK_DASHBOARD);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div>
      <MockDataBanner usingMockData={usingMockData} />
      <DashboardDefaultTheme data={data} loading={loading} />
    </div>
  );
}
