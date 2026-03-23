"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_CONSUMPTION } from "@/features/shared/mockData";
import { fetchConsumptionData } from "@/features/consumption/api";

const ConsumptionDefaultTheme = dynamic(
  () => import("@/features/consumption/components/ConsumptionDefaultTheme").then(mod => mod.ConsumptionDefaultTheme),
  {
    ssr: false,
    loading: () => null
  }
);

export default function ConsumptionPage() {
  const [consumptionData, setConsumptionData] = useState(MOCK_CONSUMPTION);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  // 恢复滚动位置 - 页面级别执行
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    const STORAGE_KEY = 'consumption-scroll-position';
    const savedPosition = sessionStorage.getItem(STORAGE_KEY);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      if (!isNaN(position) && position > 0) {
        requestAnimationFrame(() => {
          mainContent.scrollTop = position;
        });
      }
    }
  }, []);

  // 保存滚动位置 - 页面级别执行
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    const STORAGE_KEY = 'consumption-scroll-position';
    const handleScroll = () => {
      sessionStorage.setItem(STORAGE_KEY, mainContent.scrollTop.toString());
    };
    mainContent.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const realData = await fetchConsumptionData();
        // 如果 API 返回空数据（没有交易记录），使用 mock 数据用于展示
        const hasNoData =
          realData.transactions.length === 0 &&
          realData.summary.totalExpense === 0 &&
          realData.summary.totalIncome === 0;
        if (hasNoData) {
          setConsumptionData(MOCK_CONSUMPTION);
          setUsingMockData(true);
        } else {
          setConsumptionData(realData);
          setUsingMockData(false);
        }
      } catch (error) {
        console.warn("Failed to fetch consumption data, using mock data:", error);
        setConsumptionData(MOCK_CONSUMPTION);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const dateRangeLabel = useMemo(() => {
    if (consumptionData.trend.length > 0) {
      const firstDay = consumptionData.trend[0].day;
      const lastDay = consumptionData.trend[consumptionData.trend.length - 1].day;
      return `${firstDay} - ${lastDay}`;
    }
    return "2024-03-01 - 2024-03-31";
  }, [consumptionData.trend]);

  return (
    <div className="w-full">
      <ConsumptionDefaultTheme
        data={consumptionData}
        dateRangeLabel={dateRangeLabel}
        loading={loading}
        usingMockData={usingMockData}
      />
    </div>
  );
}
