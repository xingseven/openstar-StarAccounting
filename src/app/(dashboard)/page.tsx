"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState, useMemo, startTransition } from "react";
import dynamic from "next/dynamic";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";
import { DashboardLoadingShell } from "@/features/dashboard/components/themes/DashboardLoadingShell";
import { isSavingsGoalSyncedToAssets } from "@/features/savings/plan-config";
import type { SavingsGoal } from "@/types";

const DashboardDefaultTheme = dynamic(
  () => import("@/features/dashboard/components/themes/DefaultDashboard").then(mod => mod.DashboardDefaultTheme),
  {
    ssr: false,
    loading: () => <DashboardLoadingShell />
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
  lastMonthExpense: number;
  lastMonthIncome: number;
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

type SavingsMetricItem = Pick<SavingsGoal, "planConfig"> & {
  currentAmount: number | string;
};

type DateRangeState = {
  startDate?: string;
  endDate?: string;
  label: string;
};

type CustomPeriodState = {
  mode: "year" | "month";
  year: string;
  month: string;
};

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const formatLabel = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    label: `${formatLabel(start)} - ${formatLabel(end)}`,
  };
}

function getPreviousRange(
  dateFilter: "month" | "all" | "custom",
  currentMonthRange: ReturnType<typeof getCurrentMonthRange>,
  customPeriod: CustomPeriodState,
): DateRangeState | undefined {
  if (dateFilter === "month") {
    const currentStart = new Date(currentMonthRange.startDate!);
    const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1, 0, 0, 0, 0);
    const previousEnd = new Date(currentStart.getFullYear(), currentStart.getMonth(), 0, 23, 59, 59, 999);
    return {
      startDate: previousStart.toISOString(),
      endDate: previousEnd.toISOString(),
      label: "较上月",
    };
  }

  if (dateFilter === "custom" && customPeriod.year) {
    const selectedYear = Number(customPeriod.year);
    if (!Number.isFinite(selectedYear)) return undefined;

    if (customPeriod.mode === "year") {
      const previousStart = new Date(selectedYear - 1, 0, 1, 0, 0, 0, 0);
      const previousEnd = new Date(selectedYear - 1, 11, 31, 23, 59, 59, 999);
      return {
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        label: "较上年",
      };
    }

    if (customPeriod.month) {
      const monthIndex = Number(customPeriod.month) - 1;
      if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return undefined;
      const previousStart = new Date(selectedYear, monthIndex - 1, 1, 0, 0, 0, 0);
      const previousEnd = new Date(selectedYear, monthIndex, 0, 23, 59, 59, 999);
      if (monthIndex === 0) {
        previousStart.setFullYear(selectedYear - 1);
        previousEnd.setFullYear(selectedYear - 1);
        previousStart.setMonth(11);
        previousEnd.setMonth(11);
      }
      return {
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        label: "较上月",
      };
    }
  }

  return undefined;
}

function buildCustomRange(customPeriod: CustomPeriodState): DateRangeState | null {
  if (!customPeriod.year) return null;

  const year = Number(customPeriod.year);
  if (!Number.isFinite(year)) return null;

  if (customPeriod.mode === "year") {
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      label: `${year} 年`,
    };
  }

  if (!customPeriod.month) return null;

  const monthIndex = Number(customPeriod.month) - 1;
  if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;

  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    label: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
  };
}

async function fetchDashboardData(
  startDate?: string,
  endDate?: string,
  compareStartDate?: string,
  compareEndDate?: string,
): Promise<DashboardData> {
  const now = new Date();
  const currentMonthStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const currentMonthEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  const lastMonthStart = compareStartDate || new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = compareEndDate || new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

  const qsExpense = new URLSearchParams({ type: "EXPENSE", startDate: currentMonthStart, endDate: currentMonthEnd });
  const qsIncome = new URLSearchParams({ type: "INCOME", startDate: currentMonthStart, endDate: currentMonthEnd });
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
    .filter(t => t.type === "INCOME" && new Date(t.date) >= new Date(currentMonthStart))
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const monthSavingsExpense = savingsTxs
    .filter(t => t.type === "EXPENSE" && new Date(t.date) >= new Date(currentMonthStart))
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
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const initialComparisonRange = useMemo(
    () => getPreviousRange("month", currentMonthRange, { mode: "month", year: "", month: "" }),
    [currentMonthRange],
  );
  const [data, setData] = useState<DashboardData>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<"month" | "all" | "custom">("month");
  const [customPeriod, setCustomPeriod] = useState<CustomPeriodState>({
    mode: "month",
    year: String(new Date().getFullYear()),
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
  });
  const [appliedRange, setAppliedRange] = useState<DateRangeState>(currentMonthRange);
  const [appliedComparisonRange, setAppliedComparisonRange] = useState(initialComparisonRange);

  const pendingRange = useMemo<DateRangeState | null>(() => {
    if (dateFilter === "month") {
      return currentMonthRange;
    }

    if (dateFilter === "all") {
      return { startDate: undefined, endDate: undefined, label: "全部时间" };
    }

    return buildCustomRange(customPeriod);
  }, [currentMonthRange, customPeriod, dateFilter]);

  const pendingComparisonRange = useMemo(
    () => getPreviousRange(dateFilter, currentMonthRange, customPeriod),
    [currentMonthRange, customPeriod, dateFilter],
  );

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!pendingRange) return;

      const showBusyState = !loading;
      if (showBusyState) {
        setRefreshing(true);
      }

      try {
        const realData = await fetchDashboardData(
          pendingRange.startDate,
          pendingRange.endDate,
          pendingComparisonRange?.startDate,
          pendingComparisonRange?.endDate,
        );
        if (!active) return;

        const hasNoData =
          realData.totalAssets === 0 &&
          realData.totalDebt === 0 &&
          realData.monthExpense === 0 &&
          realData.monthIncome === 0 &&
          realData.lastMonthExpense === 0 &&
          realData.lastMonthIncome === 0 &&
          realData.recentTransactions.length === 0;

        startTransition(() => {
          if (hasNoData) {
            setData(MOCK_DASHBOARD);
          } else {
            setData(realData);
          }
          setAppliedRange(pendingRange);
          setAppliedComparisonRange(pendingComparisonRange);
        });
      } catch (error) {
        console.warn("Failed to fetch dashboard data, using mock data:", error);
        if (!active) return;
        startTransition(() => {
          setData(MOCK_DASHBOARD);
        });
      } finally {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [pendingRange, pendingComparisonRange]);

  return (
    <div>
      <DashboardDefaultTheme
        data={data}
        loading={loading}
        refreshing={refreshing}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customPeriod={customPeriod}
        onCustomPeriodChange={setCustomPeriod}
        dateRangeLabel={appliedRange.label}
        comparisonLabel={appliedComparisonRange?.label}
      />
    </div>
  );
}
