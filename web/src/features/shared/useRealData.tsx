"use client";

import { useState, useEffect } from "react";

export type UseRealDataOptions<T> = {
  /** API fetch function */
  fetchFn: () => Promise<T>;
  /** Mock data fallback */
  mockData: T;
  /** Hook dependency array */
  deps?: unknown[];
};

/**
 * 统一数据获取 Hook
 * 优先尝试获取真实数据，失败时降级到模拟数据
 *
 * @example
 * ```tsx
 * const { data, loading, usingMockData } = useRealData({
 *   fetchFn: () => apiFetch<DashboardData>('/api/dashboard'),
 *   mockData: MOCK_DASHBOARD,
 *   deps: [],
 * });
 * ```
 */
export function useRealData<T>({
  fetchFn,
  mockData,
  deps = [],
}: UseRealDataOptions<T>) {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchFn();
        if (mounted) {
          setData(result);
          setUsingMockData(false);
        }
      } catch (error) {
        console.warn("Failed to fetch real data, using mock data:", error);
        if (mounted) {
          setData(mockData);
          setUsingMockData(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, usingMockData };
}

/**
 * 模拟数据提示组件的 Props
 */
export interface MockDataBannerProps {
  usingMockData: boolean;
  message?: string;
}

/**
 * 简单的模拟数据提示 Banner
 * 用于在页面顶部显示当前使用的是模拟数据
 */
export function MockDataBanner({
  usingMockData,
  message = "当前显示模拟数据，正在尝试连接服务器获取真实数据...",
}: MockDataBannerProps) {
  if (!usingMockData) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-2">
      <div className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
        {message}
      </div>
    </div>
  );
}
