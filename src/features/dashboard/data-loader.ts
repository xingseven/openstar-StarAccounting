import { apiFetch } from "@/lib/api";
import { getWarmCacheData, loadWarmCache, preloadWarmCache } from "@/lib/warm-cache";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";
import { isSavingsGoalSyncedToAssets } from "@/features/savings/plan-config";
import type { SavingsGoal } from "@/types";

const DASHBOARD_CACHE_KEY = "route-data:dashboard";
const DASHBOARD_CACHE_TTL_MS = 45_000;

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

  const [
    assetsData,
    loansData,
    savingsData,
    expenseData,
    incomeData,
    lastMonthExpenseData,
    lastMonthIncomeData,
    transactionsData,
    savingsTxData,
    budgetAlertsData,
  ] = await Promise.all([
    apiFetch<{ items: Asset[] }>("/api/assets"),
    apiFetch<{ items: Loan[] }>("/api/loans"),
    apiFetch<{ items: SavingsMetricItem[] }>("/api/savings"),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsExpense}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsIncome}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsLastMonthExpense}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsLastMonthIncome}`),
    apiFetch<{ items: Transaction[] }>("/api/transactions?page=1&pageSize=5"),
    apiFetch<{ items: Transaction[] }>("/api/transactions?pageSize=100"),
    apiFetch<{ alerts: BudgetAlert[] }>("/api/budgets/alerts"),
  ]);

  const savingsKeywords = ["储蓄", "存款"];
  const savingsTransactions = savingsTxData.items.filter((item) =>
    savingsKeywords.some((keyword) => item.category?.includes(keyword) || item.merchant?.includes(keyword)),
  );
  const monthStart = new Date(start);
  const monthSavingsIncome = savingsTransactions
    .filter((item) => item.type === "INCOME" && new Date(item.date) >= monthStart)
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const monthSavingsExpense = savingsTransactions
    .filter((item) => item.type === "EXPENSE" && new Date(item.date) >= monthStart)
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const assetsTotal = assetsData.items.reduce((sum, item) => sum + Number(item.estimatedValue ?? item.balance), 0);
  const unsyncedSavingsTotal = savingsData.items.reduce(
    (sum, item) => sum + (isSavingsGoalSyncedToAssets(item) ? 0 : Number(item.currentAmount)),
    0,
  );

  return {
    totalAssets: assetsTotal + unsyncedSavingsTotal,
    totalDebt: loansData.items.reduce((sum, item) => sum + Number(item.remainingAmount), 0),
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

function normalizeDashboardData(data: DashboardData) {
  const hasNoData =
    data.totalAssets === 0 &&
    data.totalDebt === 0 &&
    data.monthExpense === 0 &&
    data.monthIncome === 0 &&
    data.lastMonthExpense === 0 &&
    data.lastMonthIncome === 0 &&
    data.recentTransactions.length === 0;

  return hasNoData ? MOCK_DASHBOARD : data;
}

async function loadDashboardSnapshotInternal() {
  try {
    return normalizeDashboardData(await fetchDashboardData());
  } catch (error) {
    console.warn("Failed to fetch dashboard data, using mock data:", error);
    return MOCK_DASHBOARD;
  }
}

export function getCachedDashboardData() {
  return getWarmCacheData<DashboardData>(DASHBOARD_CACHE_KEY);
}

export function loadDashboardData() {
  return loadWarmCache(DASHBOARD_CACHE_KEY, loadDashboardSnapshotInternal, DASHBOARD_CACHE_TTL_MS);
}

export function preloadDashboardData() {
  preloadWarmCache(DASHBOARD_CACHE_KEY, loadDashboardSnapshotInternal, DASHBOARD_CACHE_TTL_MS);
}
