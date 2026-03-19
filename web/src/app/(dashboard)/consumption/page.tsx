"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_CONSUMPTION } from "@/features/shared/mockData";
import { MockDataBanner } from "@/features/shared/useRealData";
import { fetchConsumptionData } from "@/features/consumption/api";

const ConsumptionDefaultTheme = dynamic(
  () => import("@/features/consumption/components/ConsumptionDefaultTheme").then(mod => mod.ConsumptionDefaultTheme),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }
);

export default function ConsumptionPage() {
  const [consumptionData, setConsumptionData] = useState(MOCK_CONSUMPTION);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

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

  if (loading && consumptionData.transactions.length === 0) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <MockDataBanner usingMockData={usingMockData} />
      <ConsumptionDefaultTheme
        data={consumptionData}
        dateRangeLabel={dateRangeLabel}
      />
    </div>
  );
}
