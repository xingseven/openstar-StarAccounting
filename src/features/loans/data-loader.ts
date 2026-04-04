import { apiFetch } from "@/lib/api";
import { getWarmCacheData, loadWarmCache, preloadWarmCache } from "@/lib/warm-cache";
import {
  MOCK_LOANS,
  MOCK_LOANS_PAID_VS_REMAINING,
  MOCK_LOANS_PLATFORM_DATA,
} from "@/features/shared/mockData";
import type { Loan } from "@/types";

const LOANS_CACHE_KEY = "route-data:loans";
const LOANS_CACHE_TTL_MS = 45_000;

export type LoansSnapshot = {
  items: Loan[];
  platformData: Array<{ name: string; value: number; fill: string }>;
  paidVsRemainingData: Array<{ platform: string; paid: number; remaining: number }>;
};

async function fetchLoansData(): Promise<Loan[]> {
  const data = await apiFetch<{ items: Array<Record<string, unknown>> }>("/api/loans");
  return data.items.map((item) => ({
    ...item,
    totalAmount: Number(item.totalAmount),
    remainingAmount: Number(item.remainingAmount),
    monthlyPayment: Number(item.monthlyPayment),
  })) as Loan[];
}

function computeLoansDerivedData(items: Loan[]) {
  const platformData = items
    .reduce((accumulator, item) => {
      const existing = accumulator.find((entry) => entry.name === item.platform);
      if (existing) {
        existing.value += item.remainingAmount;
      } else {
        accumulator.push({ name: item.platform, value: item.remainingAmount });
      }
      return accumulator;
    }, [] as Array<{ name: string; value: number }>)
    .map((item, index) => ({
      ...item,
      fill: `var(--color-chart-${(index % 5) + 1})`,
    }));

  const paidVsRemainingData = items.map((item) => ({
    platform: item.platform,
    paid: item.totalAmount - item.remainingAmount,
    remaining: item.remainingAmount,
  }));

  return { platformData, paidVsRemainingData };
}

async function loadLoansSnapshotInternal(): Promise<LoansSnapshot> {
  try {
    const items = await fetchLoansData();
    if (items.length === 0) {
      return {
        items: MOCK_LOANS,
        platformData: MOCK_LOANS_PLATFORM_DATA,
        paidVsRemainingData: MOCK_LOANS_PAID_VS_REMAINING,
      };
    }

    return {
      items,
      ...computeLoansDerivedData(items),
    };
  } catch (error) {
    console.warn("Failed to fetch loans data, using mock data:", error);
    return {
      items: MOCK_LOANS,
      platformData: MOCK_LOANS_PLATFORM_DATA,
      paidVsRemainingData: MOCK_LOANS_PAID_VS_REMAINING,
    };
  }
}

export function getCachedLoansData() {
  return getWarmCacheData<LoansSnapshot>(LOANS_CACHE_KEY);
}

export function loadLoansData() {
  return loadWarmCache(LOANS_CACHE_KEY, loadLoansSnapshotInternal, LOANS_CACHE_TTL_MS);
}

export function preloadLoansData() {
  preloadWarmCache(LOANS_CACHE_KEY, loadLoansSnapshotInternal, LOANS_CACHE_TTL_MS);
}
