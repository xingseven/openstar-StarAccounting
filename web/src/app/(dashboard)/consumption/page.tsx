"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_CONSUMPTION } from "@/features/shared/mockData";
import { MockDataBanner } from "@/features/shared/useRealData";
import { fetchConsumptionData } from "@/features/consumption/api";
import SkeletonLoading from "./loading";

const ConsumptionDefaultTheme = dynamic(
  () => import("@/features/consumption/components/ConsumptionDefaultTheme").then(mod => mod.ConsumptionDefaultTheme),
  {
    ssr: false,
    loading: () => <SkeletonLoading />
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

  return (
    <div className="w-full">
      <MockDataBanner usingMockData={usingMockData} />
      {loading && consumptionData.transactions.length === 0 ? (
        <SkeletonLoading />
      ) : (
        <ConsumptionDefaultTheme
          data={consumptionData}
          dateRangeLabel={dateRangeLabel}
        />
      )}
    </div>
  );
}
