"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MOCK_DASHBOARD } from "@/features/shared/mockData";
import {
  getCachedDashboardData,
  loadDashboardData,
  type DashboardQuery,
} from "@/features/dashboard/data-loader";
import { useTheme } from "@/components/shared/theme-provider";
import { getDashboardEntryFileName, getDashboardThemeComponent } from "@/themes/dashboard-registry";
import { getDashboardRoutePath, isDashboardRoutePath } from "@/themes/dashboard-routes";
import type { DashboardData } from "@/types";

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

function formatDateLabel(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentMonthRange(): DateRangeState {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    label: `${formatDateLabel(start)} - ${formatDateLabel(end)}`,
  };
}

function getPreviousRange(
  dateFilter: "month" | "all" | "custom",
  currentMonthRange: DateRangeState,
  customPeriod: CustomPeriodState,
) {
  if (dateFilter === "month") {
    const currentStart = new Date(currentMonthRange.startDate!);
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

export function DashboardPageShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { themeId } = useTheme();
  const dashboardEntryFileName = getDashboardEntryFileName(themeId);
  const dashboardRoutePath = getDashboardRoutePath(themeId);
  const DashboardTheme = getDashboardThemeComponent(themeId);
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const initialCustomPeriod = useMemo<CustomPeriodState>(
    () => ({
      mode: "month",
      year: String(new Date().getFullYear()),
      month: String(new Date().getMonth() + 1).padStart(2, "0"),
    }),
    [],
  );
  const initialComparisonRange = useMemo(
    () => getPreviousRange("month", currentMonthRange, initialCustomPeriod),
    [currentMonthRange, initialCustomPeriod],
  );
  const initialQuery = useMemo<DashboardQuery>(
    () => ({
      startDate: currentMonthRange.startDate,
      endDate: currentMonthRange.endDate,
      compareStartDate: initialComparisonRange?.startDate,
      compareEndDate: initialComparisonRange?.endDate,
    }),
    [currentMonthRange, initialComparisonRange],
  );
  const initialData = useMemo(() => getCachedDashboardData(initialQuery), [initialQuery]);
  const [data, setData] = useState<DashboardData>(initialData ?? MOCK_DASHBOARD);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(Boolean(initialData));
  const [dateFilter, setDateFilter] = useState<"month" | "all" | "custom">("month");
  const [customPeriod, setCustomPeriod] = useState<CustomPeriodState>(initialCustomPeriod);
  const [platform, setPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const [appliedRange, setAppliedRange] = useState<DateRangeState>(currentMonthRange);
  const [appliedComparisonRange, setAppliedComparisonRange] = useState(initialComparisonRange);

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
  const activeQuery = useMemo<DashboardQuery | null>(
    () =>
      pendingRange
        ? {
            startDate: pendingRange.startDate,
            endDate: pendingRange.endDate,
            compareStartDate: pendingComparisonRange?.startDate,
            compareEndDate: pendingComparisonRange?.endDate,
            platform: platform === "all" ? undefined : platform,
            search: deferredSearchQuery || undefined,
          }
        : null,
    [deferredSearchQuery, pendingComparisonRange, pendingRange, platform],
  );

  useEffect(() => {
    const needsDashboardAliasCorrection =
      pathname !== "/" &&
      pathname !== dashboardRoutePath &&
      isDashboardRoutePath(pathname);

    if (needsDashboardAliasCorrection) {
      router.replace(dashboardRoutePath);
    }
  }, [dashboardRoutePath, pathname, router]);

  useEffect(() => {
    if (!pendingRange || !activeQuery) return;

    let active = true;
    const cachedData = getCachedDashboardData(activeQuery);
    const isInitialLoad = !hasLoadedOnce;
    const showBusyState = !cachedData;

    if (showBusyState) {
      if (isInitialLoad) setLoading(true);
      else setRefreshing(true);
    }

    void loadDashboardData(activeQuery)
      .then((nextData) => {
        if (!active) return;

        startTransition(() => {
          setData(nextData);
          setAppliedRange(pendingRange);
          setAppliedComparisonRange(pendingComparisonRange);
          setHasLoadedOnce(true);
        });
      })
      .finally(() => {
        if (!active || !showBusyState) return;
        if (isInitialLoad) setLoading(false);
        else setRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, [activeQuery, hasLoadedOnce, pendingComparisonRange, pendingRange]);

  return (
    <div
      className="relative"
      data-dashboard-entry-file={dashboardEntryFileName}
      data-dashboard-route={dashboardRoutePath}
    >
      <DashboardTheme
        data={data}
        loading={loading}
        refreshing={refreshing}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customPeriod={customPeriod}
        onCustomPeriodChange={setCustomPeriod}
        dateRangeLabel={appliedRange.label}
        comparisonLabel={appliedComparisonRange?.label}
        platform={platform}
        onPlatformChange={setPlatform}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </div>
  );
}
