import { apiFetch } from "@/lib/api";
import { getWarmCacheData, loadWarmCache, preloadWarmCache } from "@/lib/warm-cache";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";

const DASHBOARD_CACHE_KEY = "route-data:dashboard";
const DASHBOARD_CACHE_TTL_MS = 45_000;
const RECENT_TRANSACTIONS_PAGE_SIZE = 100;

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

function buildDashboardSummaryParams(query: DashboardQuery) {
  const params = new URLSearchParams({
    pageSize: String(RECENT_TRANSACTIONS_PAGE_SIZE),
  });

  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  if (query.compareStartDate) params.set("compareStartDate", query.compareStartDate);
  if (query.compareEndDate) params.set("compareEndDate", query.compareEndDate);
  if (query.platform) params.set("platform", query.platform);
  if (query.search) params.set("search", query.search);

  return params;
}

async function fetchDashboardData(query?: DashboardQuery): Promise<DashboardData> {
  const normalizedQuery = normalizeDashboardQuery(query);
  const params = buildDashboardSummaryParams(normalizedQuery);
  return apiFetch<DashboardData>(`/api/dashboard/summary?${params}`);
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
