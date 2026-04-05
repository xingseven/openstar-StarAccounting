import { apiFetch } from "@/lib/api";
import { getWarmCacheData, loadWarmCache, preloadWarmCache } from "@/lib/warm-cache";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";
import { isSavingsGoalSyncedToAssets } from "@/features/savings/plan-config";
import type { SavingsGoal } from "@/types";

const DASHBOARD_CACHE_KEY = "route-data:dashboard";
const DASHBOARD_CACHE_TTL_MS = 45_000;
const RECENT_TRANSACTIONS_PAGE_SIZE = 100;
const EMPTY_SUMMARY = {
  totalExpense: "0",
  expenseCount: 0,
  avgExpense: "0",
};

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

export type DashboardQuery = {
  startDate?: string;
  endDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
  platform?: string;
  search?: string;
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

function getCurrentMonthRange() {
  const now = new Date();
  return {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
  };
}

function getPreviousMonthRange(currentRange: ReturnType<typeof getCurrentMonthRange>) {
  const currentStart = new Date(currentRange.startDate);
  return {
    startDate: new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1, 0, 0, 0, 0).toISOString(),
    endDate: new Date(currentStart.getFullYear(), currentStart.getMonth(), 0, 23, 59, 59, 999).toISOString(),
  };
}

function getDefaultDashboardQuery(): DashboardQuery {
  const currentMonthRange = getCurrentMonthRange();
  const previousMonthRange = getPreviousMonthRange(currentMonthRange);
  return {
    startDate: currentMonthRange.startDate,
    endDate: currentMonthRange.endDate,
    compareStartDate: previousMonthRange.startDate,
    compareEndDate: previousMonthRange.endDate,
  };
}

function normalizeDashboardQuery(query?: DashboardQuery) {
  if (!query) {
    const fallback = getDefaultDashboardQuery();
    return {
      startDate: fallback.startDate,
      endDate: fallback.endDate,
      compareStartDate: fallback.compareStartDate,
      compareEndDate: fallback.compareEndDate,
      platform: undefined,
      search: undefined,
    };
  }

  const normalizedSearch = query.search?.trim();
  const normalizedPlatform = query.platform && query.platform !== "all" ? query.platform : undefined;

  return {
    startDate: query.startDate,
    endDate: query.endDate,
    compareStartDate: query.compareStartDate,
    compareEndDate: query.compareEndDate,
    platform: normalizedPlatform,
    search: normalizedSearch ? normalizedSearch : undefined,
  };
}

function createDashboardCacheKey(query?: DashboardQuery) {
  const normalized = normalizeDashboardQuery(query);
  return [
    DASHBOARD_CACHE_KEY,
    normalized.startDate ?? "all",
    normalized.endDate ?? "all",
    normalized.compareStartDate ?? "none",
    normalized.compareEndDate ?? "none",
    normalized.platform ?? "all",
    normalized.search ?? "",
  ].join("|");
}

function buildSummaryParams(
  type: "EXPENSE" | "INCOME",
  startDate?: string,
  endDate?: string,
  platform?: string,
  search?: string,
) {
  const params = new URLSearchParams({ type });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (platform) params.set("platform", platform);
  if (search) params.set("search", search);
  return params;
}

function buildTransactionsParams(query: DashboardQuery) {
  const params = new URLSearchParams({
    page: "1",
    pageSize: String(RECENT_TRANSACTIONS_PAGE_SIZE),
  });

  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  if (query.platform) params.set("platform", query.platform);
  if (query.search) params.set("search", query.search);

  return params;
}

async function fetchDashboardData(query?: DashboardQuery): Promise<DashboardData> {
  const normalizedQuery = normalizeDashboardQuery(query);
  const expenseSummaryParams = buildSummaryParams(
    "EXPENSE",
    normalizedQuery.startDate,
    normalizedQuery.endDate,
    normalizedQuery.platform,
    normalizedQuery.search,
  );
  const incomeSummaryParams = buildSummaryParams(
    "INCOME",
    normalizedQuery.startDate,
    normalizedQuery.endDate,
    normalizedQuery.platform,
    normalizedQuery.search,
  );
  const compareExpenseSummaryParams =
    normalizedQuery.compareStartDate || normalizedQuery.compareEndDate
      ? buildSummaryParams(
          "EXPENSE",
          normalizedQuery.compareStartDate,
          normalizedQuery.compareEndDate,
          normalizedQuery.platform,
          normalizedQuery.search,
        )
      : null;
  const compareIncomeSummaryParams =
    normalizedQuery.compareStartDate || normalizedQuery.compareEndDate
      ? buildSummaryParams(
          "INCOME",
          normalizedQuery.compareStartDate,
          normalizedQuery.compareEndDate,
          normalizedQuery.platform,
          normalizedQuery.search,
        )
      : null;
  const transactionParams = buildTransactionsParams(normalizedQuery);

  const [
    assetsData,
    loansData,
    savingsData,
    expenseData,
    incomeData,
    compareExpenseData,
    compareIncomeData,
    transactionsData,
    budgetAlertsData,
  ] = await Promise.all([
    apiFetch<{ items: Asset[] }>("/api/assets"),
    apiFetch<{ items: Loan[] }>("/api/loans"),
    apiFetch<{ items: SavingsMetricItem[] }>("/api/savings"),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${expenseSummaryParams}`),
    apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${incomeSummaryParams}`),
    compareExpenseSummaryParams
      ? apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${compareExpenseSummaryParams}`)
      : Promise.resolve(EMPTY_SUMMARY),
    compareIncomeSummaryParams
      ? apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${compareIncomeSummaryParams}`)
      : Promise.resolve(EMPTY_SUMMARY),
    apiFetch<{ items: Transaction[] }>(`/api/transactions?${transactionParams}`),
    apiFetch<{ alerts: BudgetAlert[] }>("/api/budgets/alerts"),
  ]);

  const savingsKeywords = ["储蓄", "存款"];
  const savingsTransactions = transactionsData.items.filter((item) =>
    savingsKeywords.some((keyword) => item.category?.includes(keyword) || item.merchant?.includes(keyword)),
  );
  const savingsIncome = savingsTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const savingsExpense = savingsTransactions
    .filter((item) => item.type === "EXPENSE")
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
    lastMonthExpense: Number(compareExpenseData.totalExpense),
    lastMonthIncome: Number(compareIncomeData.totalExpense),
    monthSavingsIncome: savingsIncome,
    monthSavingsExpense: savingsExpense,
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

async function loadDashboardSnapshotInternal(query?: DashboardQuery) {
  try {
    return normalizeDashboardData(await fetchDashboardData(query));
  } catch (error) {
    console.warn("Failed to fetch dashboard data, using mock data:", error);
    return MOCK_DASHBOARD;
  }
}

export function getCachedDashboardData(query?: DashboardQuery) {
  return getWarmCacheData<DashboardData>(createDashboardCacheKey(query));
}

export function loadDashboardData(query?: DashboardQuery) {
  return loadWarmCache(
    createDashboardCacheKey(query),
    () => loadDashboardSnapshotInternal(query),
    DASHBOARD_CACHE_TTL_MS,
  );
}

export function preloadDashboardData(query?: DashboardQuery) {
  preloadWarmCache(
    createDashboardCacheKey(query),
    () => loadDashboardSnapshotInternal(query),
    DASHBOARD_CACHE_TTL_MS,
  );
}
