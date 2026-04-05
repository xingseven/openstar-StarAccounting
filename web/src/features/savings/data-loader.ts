import { apiFetch } from "@/lib/api";
import { getWarmCacheData, loadWarmCache, preloadWarmCache } from "@/lib/warm-cache";
import type { SavingsGoal } from "@/types";

const SAVINGS_CACHE_KEY = "route-data:savings";
const SAVINGS_CACHE_TTL_MS = 45_000;

export type SavingsTransactionItem = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
};

type SavingsApiItem = Omit<SavingsGoal, "targetAmount" | "currentAmount"> & {
  targetAmount: number | string;
  currentAmount: number | string;
};

export type SavingsSnapshot = {
  items: SavingsGoal[];
  transactions: SavingsTransactionItem[];
};

async function fetchSavingsData(): Promise<SavingsSnapshot> {
  const [goalsData, transactionsData] = await Promise.all([
    apiFetch<{ items: SavingsApiItem[] }>("/api/savings"),
    apiFetch<{ items: SavingsTransactionItem[] }>("/api/transactions?pageSize=100"),
  ]);

  const items: SavingsGoal[] = goalsData.items.map((item) => ({
    ...item,
    targetAmount: Number(item.targetAmount),
    currentAmount: Number(item.currentAmount),
  }));

  return {
    items,
    transactions: transactionsData.items,
  };
}

async function loadSavingsSnapshotInternal() {
  try {
    return await fetchSavingsData();
  } catch (error) {
    console.warn("Failed to fetch savings data:", error);
    return {
      items: [],
      transactions: [],
    };
  }
}

export function getCachedSavingsData() {
  return getWarmCacheData<SavingsSnapshot>(SAVINGS_CACHE_KEY);
}

export function loadSavingsData() {
  return loadWarmCache(SAVINGS_CACHE_KEY, loadSavingsSnapshotInternal, SAVINGS_CACHE_TTL_MS);
}

export function preloadSavingsData() {
  preloadWarmCache(SAVINGS_CACHE_KEY, loadSavingsSnapshotInternal, SAVINGS_CACHE_TTL_MS);
}
