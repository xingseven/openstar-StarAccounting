"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_CONSUMPTION } from "@/features/shared/mockData";
import { MockDataBanner } from "@/features/shared/useRealData";
import { fetchConsumptionData } from "@/features/consumption/api";
import { StatsCardSkeleton, ChartSkeleton, PieChartSkeleton, ListTableSkeleton, Skeleton } from "@/components/shared/Skeletons";

const SkeletonLoading = () => (
  <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-8">
    {/* 顶部标题与功能区骨架 */}
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-7 sm:h-9 w-24 sm:w-32 mb-1 sm:mb-2" />
          <Skeleton className="h-4 sm:h-5 w-36 sm:w-48" />
        </div>
        {/* AI 分析卡片占位 (仅 PC 端显示) */}
        <Skeleton className="max-w-xl w-full hidden md:block h-[42px] rounded-xl bg-blue-50/50" />
        {/* AI 记账按钮占位 */}
        <Skeleton className="h-10 w-[90px] sm:w-[100px] rounded-md shrink-0 bg-blue-500/20" />
      </div>
      
      {/* 筛选栏占位 */}
      <Skeleton className="h-[60px] sm:h-[66px] w-full rounded-xl" />
    </div>

    {/* 核心数据卡片骨架 */}
    <div className="grid gap-2 sm:gap-4 grid-cols-2 md:grid-cols-4">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
    
    {/* Row 2 图表区骨架 */}
    <div className="grid gap-2 sm:gap-4 grid-cols-2 md:grid-cols-4">
      <PieChartSkeleton className="col-span-1 min-h-[250px] md:min-h-[280px]" />
      <PieChartSkeleton className="col-span-1 min-h-[250px] md:min-h-[280px]" />
      <ChartSkeleton className="col-span-2 min-h-[250px] md:min-h-[280px]" />
    </div>

    {/* Row 3 图表区骨架 */}
    <div className="grid gap-4 md:grid-cols-2">
      <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
      <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
    </div>

    <ListTableSkeleton />
  </div>
);

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

  if (loading && consumptionData.transactions.length === 0) {
    return <SkeletonLoading />;
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
