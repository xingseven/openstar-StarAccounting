"use client";

import { startTransition, useMemo, useEffect, useState } from "react";
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

export default function ConsumptionPage() {
  const [consumptionData, setConsumptionData] = useState(MOCK_CONSUMPTION);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [dateFilter, setDateFilter] = useState<"month" | "all">("month");
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const activeRange = useMemo(
    () =>
      dateFilter === "month"
        ? currentMonthRange
        : { startDate: undefined, endDate: undefined, label: "全部时间" },
    [currentMonthRange, dateFilter]
  );

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
        const realData = await fetchConsumptionData(activeRange.startDate, activeRange.endDate);
        // 如果 API 返回空数据（没有交易记录），使用 mock 数据用于展示
        const hasNoData =
          realData.transactions.length === 0 &&
          realData.summary.totalExpense === 0 &&
          realData.summary.totalIncome === 0;
        startTransition(() => {
          if (hasNoData) {
            setConsumptionData(MOCK_CONSUMPTION);
            setUsingMockData(true);
          } else {
            setConsumptionData(realData);
            setUsingMockData(false);
          }
        });
      } catch (error) {
        console.warn("Failed to fetch consumption data, using mock data:", error);
        startTransition(() => {
          setConsumptionData(MOCK_CONSUMPTION);
          setUsingMockData(true);
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeRange.endDate, activeRange.startDate]);

  const dateRangeLabel = activeRange.label;

  return (
    <div className="w-full">
      <ConsumptionDefaultTheme
        data={consumptionData}
        dateRangeLabel={dateRangeLabel}
        loading={loading}
        usingMockData={usingMockData}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />
    </div>
  );
}
