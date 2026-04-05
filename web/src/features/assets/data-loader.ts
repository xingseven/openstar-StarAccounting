import { apiFetch } from "@/lib/api";
import { getWarmCacheData, loadWarmCache, preloadWarmCache } from "@/lib/warm-cache";
import type { Asset } from "@/types";

const ASSETS_CACHE_TTL_MS = 45_000;

async function fetchAssetsData(currency: string): Promise<Asset[]> {
  const data = await apiFetch<{ items: Asset[] }>(`/api/assets?currency=${currency}`);
  return data.items.map((item) => ({
    ...item,
    balance: Number(item.balance),
    estimatedValue: Number(item.estimatedValue ?? item.balance),
  }));
}

function getAssetsCacheKey(currency: string) {
  return `route-data:assets:${currency}`;
}

async function loadAssetsSnapshotInternal(currency: string) {
  try {
    return await fetchAssetsData(currency);
  } catch (error) {
    console.warn("Failed to fetch assets data:", error);
    return [];
  }
}

export function getCachedAssetsData(currency: string) {
  return getWarmCacheData<Asset[]>(getAssetsCacheKey(currency));
}

export function loadAssetsData(currency: string) {
  return loadWarmCache(
    getAssetsCacheKey(currency),
    () => loadAssetsSnapshotInternal(currency),
    ASSETS_CACHE_TTL_MS,
  );
}

export function preloadAssetsData(currency: string) {
  preloadWarmCache(
    getAssetsCacheKey(currency),
    () => loadAssetsSnapshotInternal(currency),
    ASSETS_CACHE_TTL_MS,
  );
}
