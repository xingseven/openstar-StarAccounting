import { getWarmCacheData, loadWarmCache, preloadWarmCache } from "@/lib/warm-cache";
import { MOCK_CONSUMPTION } from "@/features/shared/mockData";
import { fetchConsumptionData } from "@/features/consumption/api";
import type { ConsumptionData } from "@/features/consumption/components/ConsumptionDefaultTheme";

const CONSUMPTION_CACHE_TTL_MS = 45_000;

export type ConsumptionQuery = {
  startDate?: string;
  endDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
  bucketMode: "day" | "month";
};

function getConsumptionCacheKey(query: ConsumptionQuery) {
  return [
    "route-data:consumption",
    query.startDate ?? "all",
    query.endDate ?? "all",
    query.compareStartDate ?? "none",
    query.compareEndDate ?? "none",
    query.bucketMode,
  ].join(":");
}

async function loadConsumptionSnapshotInternal(query: ConsumptionQuery): Promise<ConsumptionData> {
  try {
    const data = await fetchConsumptionData(
      query.startDate,
      query.endDate,
      query.compareStartDate,
      query.compareEndDate,
      query.bucketMode,
    );

    const hasNoData =
      data.transactions.length === 0 &&
      data.summary.totalExpense === 0 &&
      data.summary.totalIncome === 0;

    return hasNoData ? MOCK_CONSUMPTION : data;
  } catch (error) {
    console.warn("Failed to fetch consumption data, using mock data:", error);
    return MOCK_CONSUMPTION;
  }
}

export function getCachedConsumptionData(query: ConsumptionQuery) {
  return getWarmCacheData<ConsumptionData>(getConsumptionCacheKey(query));
}

export function loadConsumptionData(query: ConsumptionQuery) {
  return loadWarmCache(
    getConsumptionCacheKey(query),
    () => loadConsumptionSnapshotInternal(query),
    CONSUMPTION_CACHE_TTL_MS,
  );
}

export function preloadConsumptionData(query: ConsumptionQuery) {
  preloadWarmCache(
    getConsumptionCacheKey(query),
    () => loadConsumptionSnapshotInternal(query),
    CONSUMPTION_CACHE_TTL_MS,
  );
}
