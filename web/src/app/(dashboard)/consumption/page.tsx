"use client";

import { useMemo } from "react";
import { ConsumptionDefaultTheme, ConsumptionData } from "@/features/consumption/components/ConsumptionDefaultTheme";
import {
  MOCK_SUMMARY,
  MOCK_PLATFORM_DISTRIBUTION,
  MOCK_INCOME_EXPENSE,
  MOCK_MERCHANTS,
  MOCK_TREND,
  MOCK_STACKED_BAR,
  MOCK_PARETO,
  MOCK_WEEKDAY_WEEKEND,
  MOCK_CALENDAR,
  MOCK_HEATMAP,
  MOCK_SANKEY,
  MOCK_SCATTER,
  MOCK_HISTOGRAM,
  MOCK_TRANSACTIONS
} from "@/features/consumption/mockData";

export default function ConsumptionPage() {
  // In a real application, you would fetch data here and pass it to the theme component.
  // This separates the data fetching/logic from the presentation/layout.
  
  const consumptionData = useMemo<ConsumptionData>(() => ({
    summary: MOCK_SUMMARY,
    platformDistribution: MOCK_PLATFORM_DISTRIBUTION,
    incomeExpense: MOCK_INCOME_EXPENSE,
    merchants: MOCK_MERCHANTS,
    trend: MOCK_TREND,
    stackedBar: MOCK_STACKED_BAR,
    pareto: MOCK_PARETO,
    weekdayWeekend: MOCK_WEEKDAY_WEEKEND,
    calendar: MOCK_CALENDAR,
    heatmap: MOCK_HEATMAP,
    sankey: MOCK_SANKEY,
    scatter: MOCK_SCATTER,
    histogram: MOCK_HISTOGRAM,
    transactions: MOCK_TRANSACTIONS,
  }), []);

  return (
    <ConsumptionDefaultTheme 
      data={consumptionData} 
      dateRangeLabel="2024-03-01 - 2024-03-31" 
    />
  );
}
