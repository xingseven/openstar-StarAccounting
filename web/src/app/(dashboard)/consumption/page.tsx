"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_CONSUMPTION } from "@/features/shared/mockData";
import { fetchConsumptionData } from "@/features/consumption/api";

const ConsumptionDefaultTheme = dynamic(
  () => import("@/features/consumption/components/ConsumptionDefaultTheme").then((mod) => mod.ConsumptionDefaultTheme),
  {
    ssr: false,
    loading: () => null,
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
  const [dateFilter, setDateFilter] = useState<"month" | "all" | "custom">("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);

  const activeRange = useMemo(() => {
    if (dateFilter === "month") {
      return currentMonthRange;
    }

    if (dateFilter === "all") {
      return { startDate: undefined, endDate: undefined, label: "全部时间" };
    }

    const startDate = customDateRange.startDate
      ? new Date(`${customDateRange.startDate}T00:00:00`).toISOString()
      : undefined;
    const endDate = customDateRange.endDate
      ? new Date(`${customDateRange.endDate}T23:59:59.999`).toISOString()
      : undefined;

    let label = "自定义时间段";
    if (customDateRange.startDate && customDateRange.endDate) {
      label = `${customDateRange.startDate} - ${customDateRange.endDate}`;
    } else if (customDateRange.startDate) {
      label = `${customDateRange.startDate} - 至今`;
    } else if (customDateRange.endDate) {
      label = `开始 - ${customDateRange.endDate}`;
    }

    return {
      startDate,
      endDate,
      label,
    };
  }, [currentMonthRange, customDateRange.endDate, customDateRange.startDate, dateFilter]);

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
      setLoading(true);
      try {
        const realData = await fetchConsumptionData(activeRange.startDate, activeRange.endDate);
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

    void loadData();
  }, [activeRange.endDate, activeRange.startDate]);

  return (
    <div className="w-full">
      <ConsumptionDefaultTheme
        data={consumptionData}
        dateRangeLabel={activeRange.label}
        loading={loading}
        usingMockData={usingMockData}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customStartDate={customDateRange.startDate}
        customEndDate={customDateRange.endDate}
        onCustomDateRangeChange={setCustomDateRange}
      />
    </div>
  );
}
