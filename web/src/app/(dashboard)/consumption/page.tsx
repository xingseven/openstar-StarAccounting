"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_CONSUMPTION } from "@/features/shared/mockData";
import { ConsumptionLoadingShell } from "@/features/consumption/components/ConsumptionLoadingShell";
import { fetchConsumptionData } from "@/features/consumption/api";

const ConsumptionDefaultTheme = dynamic(
  () => import("@/features/consumption/components/ConsumptionDefaultTheme").then((mod) => mod.ConsumptionDefaultTheme),
  {
    ssr: false,
    loading: () => <ConsumptionLoadingShell />,
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

type DateRangeState = {
  startDate?: string;
  endDate?: string;
  label: string;
};

type CustomPeriodState = {
  mode: "year" | "month";
  year: string;
  month: string;
};

function getPreviousRange(
  dateFilter: "month" | "all" | "custom",
  currentMonthRange: ReturnType<typeof getCurrentMonthRange>,
  customPeriod: CustomPeriodState,
) {
  if (dateFilter === "month") {
    const currentStart = new Date(currentMonthRange.startDate);
    const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1, 0, 0, 0, 0);
    const previousEnd = new Date(currentStart.getFullYear(), currentStart.getMonth(), 0, 23, 59, 59, 999);
    return {
      startDate: previousStart.toISOString(),
      endDate: previousEnd.toISOString(),
      label: "较上月",
    };
  }

  if (dateFilter === "custom" && customPeriod.year) {
    const selectedYear = Number(customPeriod.year);
    if (!Number.isFinite(selectedYear)) return undefined;

    if (customPeriod.mode === "year") {
      const previousStart = new Date(selectedYear - 1, 0, 1, 0, 0, 0, 0);
      const previousEnd = new Date(selectedYear - 1, 11, 31, 23, 59, 59, 999);
      return {
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        label: "较上年",
      };
    }

    if (customPeriod.month) {
      const monthIndex = Number(customPeriod.month) - 1;
      if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return undefined;
      const previousStart = new Date(selectedYear, monthIndex - 1, 1, 0, 0, 0, 0);
      const previousEnd = new Date(selectedYear, monthIndex, 0, 23, 59, 59, 999);
      if (monthIndex === 0) {
        previousStart.setFullYear(selectedYear - 1);
        previousEnd.setFullYear(selectedYear - 1);
        previousStart.setMonth(11);
        previousEnd.setMonth(11);
      }
      return {
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        label: "较上月",
      };
    }
  }

  return undefined;
}

function buildCustomRange(customPeriod: CustomPeriodState): DateRangeState | null {
  if (!customPeriod.year) return null;

  const year = Number(customPeriod.year);
  if (!Number.isFinite(year)) return null;

  if (customPeriod.mode === "year") {
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      label: `${year} 年`,
    };
  }

  if (!customPeriod.month) return null;

  const monthIndex = Number(customPeriod.month) - 1;
  if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;

  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    label: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
  };
}

export default function ConsumptionPage() {
  const [consumptionData, setConsumptionData] = useState(MOCK_CONSUMPTION);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [dateFilter, setDateFilter] = useState<"month" | "all" | "custom">("month");
  const [customPeriod, setCustomPeriod] = useState<CustomPeriodState>({
    mode: "month",
    year: String(new Date().getFullYear()),
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
  });
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const [appliedRange, setAppliedRange] = useState<DateRangeState>(currentMonthRange);
  const [appliedComparisonRange, setAppliedComparisonRange] = useState<ReturnType<typeof getPreviousRange>>(
    () => getPreviousRange("month", currentMonthRange, { mode: "month", year: "", month: "" }),
  );

  const pendingRange = useMemo<DateRangeState | null>(() => {
    if (dateFilter === "month") {
      return currentMonthRange;
    }

    if (dateFilter === "all") {
      return { startDate: undefined, endDate: undefined, label: "全部时间" };
    }

    return buildCustomRange(customPeriod);
  }, [currentMonthRange, customPeriod, dateFilter]);

  const pendingComparisonRange = useMemo(
    () => getPreviousRange(dateFilter, currentMonthRange, customPeriod),
    [currentMonthRange, customPeriod, dateFilter],
  );
  const bucketMode = useMemo(
    () => (dateFilter === "all" || (dateFilter === "custom" && customPeriod.mode === "year") ? "month" : "day"),
    [customPeriod.mode, dateFilter],
  );

  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (!mainContent) return;
    const storageKey = "consumption-scroll-position";
    const savedPosition = sessionStorage.getItem(storageKey);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      if (!Number.isNaN(position) && position > 0) {
        requestAnimationFrame(() => {
          mainContent.scrollTop = position;
        });
      }
    }
  }, []);

  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (!mainContent) return;
    const storageKey = "consumption-scroll-position";
    const handleScroll = () => {
      sessionStorage.setItem(storageKey, mainContent.scrollTop.toString());
    };
    mainContent.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!pendingRange) return;

      const isInitialLoad = !hasLoadedOnce;
      if (isInitialLoad) setLoading(true);
      else setRefreshing(true);
      try {
        const realData = await fetchConsumptionData(
          pendingRange.startDate,
          pendingRange.endDate,
          pendingComparisonRange?.startDate,
          pendingComparisonRange?.endDate,
          bucketMode,
        );
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
          setAppliedRange(pendingRange);
          setAppliedComparisonRange(pendingComparisonRange);
          setHasLoadedOnce(true);
        });
      } catch (error) {
        console.warn("Failed to fetch consumption data, using mock data:", error);
        startTransition(() => {
          setConsumptionData(MOCK_CONSUMPTION);
          setUsingMockData(true);
          setAppliedRange(pendingRange);
          setAppliedComparisonRange(pendingComparisonRange);
          setHasLoadedOnce(true);
        });
      } finally {
        if (isInitialLoad) setLoading(false);
        else setRefreshing(false);
      }
    }

    void loadData();
  }, [bucketMode, hasLoadedOnce, pendingComparisonRange, pendingRange]);

  return (
    <div className="w-full">
      <ConsumptionDefaultTheme
        data={consumptionData}
        dateRangeLabel={appliedRange.label}
        comparisonLabel={appliedComparisonRange?.label}
        loading={loading}
        refreshing={refreshing}
        usingMockData={usingMockData}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customPeriod={customPeriod}
        onCustomPeriodChange={setCustomPeriod}
      />
    </div>
  );
}
