"use client";

import { useEffect, useState } from "react";
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";

const FILTER_BAR_TEXT = {
  searchPlaceholder: "搜索商户或分类",
  allPlatform: "全部平台",
  wechat: "微信",
  alipay: "支付宝",
  cloudpay: "云闪付",
  allDate: "全部时间",
  currentMonth: "本月",
  countSuffix: "笔",
};

function clampYear(year: number) {
  return Math.min(2099, Math.max(2000, year));
}

function YearStepper({
  year,
  onYearChange,
}: {
  year: string;
  onYearChange: (value: string) => void;
}) {
  const fallbackYear = new Date().getFullYear();

  function parseYearValue(value: string) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallbackYear;
  }

  function updateByStep(step: number) {
    const nextYear = clampYear(parseYearValue(year) + step);
    onYearChange(String(nextYear));
  }

  function handleInputChange(value: string) {
    const normalized = value.replace(/\D/g, "").slice(0, 4);
    onYearChange(normalized);
  }

  function handleBlur() {
    if (!year) {
      onYearChange(String(clampYear(fallbackYear)));
      return;
    }

    onYearChange(String(clampYear(parseYearValue(year))));
  }

  return (
    <div className="grid h-11 min-w-[150px] grid-cols-[48px_minmax(0,1fr)_48px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
      <button
        type="button"
        onClick={() => updateByStep(-1)}
        className="flex items-center justify-center border-r border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="上一年"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={year}
        onChange={(event) => handleInputChange(event.target.value)}
        onBlur={handleBlur}
        placeholder="年份"
        className="w-full min-w-0 bg-transparent px-3 text-center text-base font-medium tabular-nums outline-none"
      />

      <button
        type="button"
        onClick={() => updateByStep(1)}
        className="flex items-center justify-center border-l border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="下一年"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function MonthStepper({
  month,
  onMonthChange,
}: {
  month: string;
  onMonthChange: (value: string) => void;
}) {
  const fallbackMonth = new Date().getMonth() + 1;

  function parseMonthValue(value: string) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return fallbackMonth;
    return Math.min(12, Math.max(1, parsed));
  }

  function updateByStep(step: number) {
    const currentMonth = parseMonthValue(month);
    let nextMonth = currentMonth + step;
    if (nextMonth < 1) nextMonth = 12;
    if (nextMonth > 12) nextMonth = 1;
    onMonthChange(String(nextMonth).padStart(2, "0"));
  }

  function handleInputChange(value: string) {
    const normalized = value.replace(/\D/g, "").slice(0, 2);
    onMonthChange(normalized);
  }

  function handleBlur() {
    if (!month) {
      onMonthChange(String(fallbackMonth).padStart(2, "0"));
      return;
    }

    onMonthChange(String(parseMonthValue(month)).padStart(2, "0"));
  }

  return (
    <div className="grid h-11 min-w-[124px] grid-cols-[42px_minmax(0,1fr)_42px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
      <button
        type="button"
        onClick={() => updateByStep(-1)}
        className="flex items-center justify-center border-r border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="上个月"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={month}
        onChange={(event) => handleInputChange(event.target.value)}
        onBlur={handleBlur}
        placeholder="月份"
        className="w-full min-w-0 bg-transparent px-2 text-center text-base font-medium tabular-nums outline-none"
      />

      <button
        type="button"
        onClick={() => updateByStep(1)}
        className="flex items-center justify-center border-l border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="下个月"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export interface FloatingFilterProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionCount: number;
  dateFilter?: "month" | "all" | "custom";
  onDateFilterChange?: (value: "month" | "all" | "custom") => void;
  customPeriod?: {
    mode: "year" | "month";
    year: string;
    month: string;
  };
  onCustomPeriodChange?: (period: { mode: "year" | "month"; year: string; month: string }) => void;
  platform?: string;
  onPlatformChange?: (value: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function resolveCustomPeriod(
  customPeriod: FloatingFilterProps["customPeriod"],
  overrides: Partial<NonNullable<FloatingFilterProps["customPeriod"]>> = {},
) {
  const now = new Date();

  return {
    mode: overrides.mode ?? customPeriod?.mode ?? "month",
    year: overrides.year ?? customPeriod?.year ?? String(now.getFullYear()),
    month: overrides.month ?? customPeriod?.month ?? String(now.getMonth() + 1).padStart(2, "0"),
  };
}

function useControllableState<T>(
  value: T | undefined,
  onChange: ((nextValue: T) => void) | undefined,
  fallbackValue: T,
) {
  const isControlled = value !== undefined && onChange !== undefined;
  const [internalValue, setInternalValue] = useState<T>(() => value ?? fallbackValue);

  useEffect(() => {
    if (isControlled && value !== undefined) {
      setInternalValue(value);
    }
  }, [isControlled, value]);

  const currentValue = isControlled ? (value as T) : internalValue;

  const setValue = (nextValue: T) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  return [currentValue, setValue] as const;
}

/* ── 时间筛选按钮组（桌面 & 手机共用） ── */

function DateFilterButtons({
  dateFilter,
  onDateFilterChange,
  customPeriod,
  onCustomPeriodChange,
  activeClassName = "bg-blue-600 text-white",
  inactiveClassName = "bg-slate-100 text-slate-600 hover:bg-slate-200",
}: {
  dateFilter: "month" | "all" | "custom";
  onDateFilterChange?: (value: "month" | "all" | "custom") => void;
  customPeriod: FloatingFilterProps["customPeriod"];
  onCustomPeriodChange?: (period: { mode: "year" | "month"; year: string; month: string }) => void;
  activeClassName?: string;
  inactiveClassName?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onDateFilterChange?.("month")}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition",
          dateFilter === "month" ? activeClassName : inactiveClassName
        )}
      >
        {FILTER_BAR_TEXT.currentMonth}
      </button>
      <button
        type="button"
        onClick={() => onDateFilterChange?.("all")}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition",
          dateFilter === "all" ? activeClassName : inactiveClassName
        )}
      >
        {FILTER_BAR_TEXT.allDate}
      </button>
      <button
        type="button"
        onClick={() => {
          onDateFilterChange?.("custom");
          onCustomPeriodChange?.(resolveCustomPeriod(customPeriod, { mode: "month" }));
        }}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition",
          dateFilter === "custom" ? activeClassName : inactiveClassName
        )}
      >
        自定义
      </button>
    </div>
  );
}

/* ── 自定义时间范围选择（桌面 & 手机共用） ── */

function CustomPeriodPicker({
  customPeriod,
  onCustomPeriodChange,
  activeClassName = "bg-blue-600 text-white",
  inactiveClassName = "bg-slate-100 text-slate-600 hover:bg-slate-200",
  variant = "mobile",
}: {
  customPeriod: NonNullable<FloatingFilterProps["customPeriod"]>;
  onCustomPeriodChange?: (period: { mode: "year" | "month"; year: string; month: string }) => void;
  activeClassName?: string;
  inactiveClassName?: string;
  variant?: "mobile" | "desktop";
}) {
  const isDesktop = variant === "desktop";

  return (
    <div className={cn("space-y-3", isDesktop && "space-y-2.5 rounded-xl border border-slate-200 bg-white p-3")}>
      {isDesktop && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">时间范围</p>
          <p className="mt-1 text-xs text-slate-500">可查看全年，也可以定位到某个月。</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCustomPeriodChange?.(resolveCustomPeriod(customPeriod, { mode: "year" }))}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            customPeriod.mode === "year" ? activeClassName : inactiveClassName
          )}
        >
          全年
        </button>
        <button
          type="button"
          onClick={() => onCustomPeriodChange?.(resolveCustomPeriod(customPeriod, { mode: "month" }))}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            customPeriod.mode === "month" ? activeClassName : inactiveClassName
          )}
        >
          按月
        </button>
      </div>

      {isDesktop ? (
        <div className={cn("grid gap-3", customPeriod.mode === "month" ? "grid-cols-[minmax(0,1fr)_112px]" : "grid-cols-1")}>
          <YearStepper
            year={customPeriod.year || String(new Date().getFullYear())}
            onYearChange={(value) => onCustomPeriodChange?.(resolveCustomPeriod(customPeriod, { year: value }))}
          />
          {customPeriod.mode === "month" && (
            <MonthStepper
              month={customPeriod.month || "01"}
              onMonthChange={(value) => onCustomPeriodChange?.(resolveCustomPeriod(customPeriod, { mode: "month", month: value }))}
            />
          )}
        </div>
      ) : (
        <div className={cn("grid gap-3", customPeriod.mode === "month" ? "grid-cols-2" : "grid-cols-1")}>
          <Input
            type="number"
            min="2000"
            max="2099"
            value={customPeriod.year}
            onChange={(event) => onCustomPeriodChange?.(resolveCustomPeriod(customPeriod, { year: event.target.value }))}
            placeholder="年份"
            className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
          />
          {customPeriod.mode === "month" ? (
            <Select
              value={customPeriod.month}
              onValueChange={(value) => onCustomPeriodChange?.(resolveCustomPeriod(customPeriod, { mode: "month", month: value }))}
            >
              <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return (
                    <SelectItem key={value} value={value}>
                      {value} 月
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ── 手机端 BottomSheet 筛选面板 ── */

function MobileFilterSheet({
  open,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  platform,
  onPlatformChange,
  dateFilter,
  onDateFilterChange,
  customPeriod,
  onCustomPeriodChange,
  transactionCount,
}: FloatingFilterProps & { open: boolean }) {
  const resolvedCustomPeriod = customPeriod ?? { mode: "month" as const, year: "", month: "" };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-w-md">
        <BottomSheetHeader>
          <BottomSheetTitle>筛选流水</BottomSheetTitle>
        </BottomSheetHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => onSearchQueryChange?.(event.target.value)}
                placeholder={FILTER_BAR_TEXT.searchPlaceholder}
                className="h-11 rounded-2xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Select value={platform} onValueChange={onPlatformChange}>
              <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{FILTER_BAR_TEXT.allPlatform}</SelectItem>
                <SelectItem value="wechat">{FILTER_BAR_TEXT.wechat}</SelectItem>
                <SelectItem value="alipay">{FILTER_BAR_TEXT.alipay}</SelectItem>
                <SelectItem value="cloudpay">{FILTER_BAR_TEXT.cloudpay}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DateFilterButtons
            dateFilter={dateFilter ?? "month"}
            onDateFilterChange={onDateFilterChange}
            customPeriod={customPeriod}
            onCustomPeriodChange={onCustomPeriodChange}
          />

          {dateFilter === "custom" ? (
            <CustomPeriodPicker
              customPeriod={resolvedCustomPeriod}
              onCustomPeriodChange={onCustomPeriodChange}
              variant="mobile"
            />
          ) : null}

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            {`${transactionCount} ${FILTER_BAR_TEXT.countSuffix}`}
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

/* ── 桌面端浮窗筛选面板 ── */

function DesktopFilterFloat({
  open,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  platform,
  onPlatformChange,
  dateFilter,
  onDateFilterChange,
  customPeriod,
  onCustomPeriodChange,
  transactionCount,
}: FloatingFilterProps & { open: boolean }) {
  if (!open) return null;

  const resolvedDateFilter = dateFilter ?? "month";
  const desktopActiveClassName = "bg-blue-600 text-white";
  const desktopInactiveClassName = "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100";

  return (
    <div className="fixed bottom-24 right-6 z-50 hidden w-[432px] rounded-2xl border border-slate-200 bg-white p-3.5 shadow-md md:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">筛选数据</p>
          <p className="mt-1 text-xs text-slate-500">按平台、时间和关键词快速缩小范围。</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
          <Filter className="h-3.5 w-3.5" />
          {transactionCount} 笔
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="rounded-xl bg-slate-50/90 p-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder={FILTER_BAR_TEXT.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
              className="h-11 rounded-2xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-xl bg-slate-50/90 p-2.5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">平台</p>
            <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-3">
              <Select value={platform} onValueChange={onPlatformChange}>
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{FILTER_BAR_TEXT.allPlatform}</SelectItem>
                  <SelectItem value="wechat">{FILTER_BAR_TEXT.wechat}</SelectItem>
                  <SelectItem value="alipay">{FILTER_BAR_TEXT.alipay}</SelectItem>
                  <SelectItem value="cloudpay">{FILTER_BAR_TEXT.cloudpay}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600">
                {transactionCount} 笔
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">时间</p>
          <DateFilterButtons
            dateFilter={resolvedDateFilter}
            onDateFilterChange={onDateFilterChange}
            customPeriod={customPeriod}
            onCustomPeriodChange={onCustomPeriodChange}
            activeClassName={desktopActiveClassName}
            inactiveClassName={desktopInactiveClassName}
          />
        </div>
      </div>

      {resolvedDateFilter === "custom" && customPeriod ? (
        <div className="mt-3">
          <CustomPeriodPicker
            customPeriod={customPeriod}
            onCustomPeriodChange={onCustomPeriodChange}
            activeClassName={desktopActiveClassName}
            inactiveClassName={desktopInactiveClassName}
            variant="desktop"
          />
        </div>
      ) : null}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          完成
        </button>
      </div>
    </div>
  );
}

/* ── 主组件 ── */

export function FloatingFilter(props: FloatingFilterProps) {
  const { isOpen, onOpenChange } = props;
  const isMobile = useIsMobile();
  const [resolvedDateFilter, setResolvedDateFilter] = useControllableState(
    props.dateFilter,
    props.onDateFilterChange,
    "month",
  );
  const [resolvedCustomPeriod, setResolvedCustomPeriod] = useControllableState(
    props.customPeriod,
    props.onCustomPeriodChange,
    resolveCustomPeriod(props.customPeriod),
  );
  const [resolvedPlatform, setResolvedPlatform] = useControllableState(
    props.platform,
    props.onPlatformChange,
    "all",
  );
  const [resolvedSearchQuery, setResolvedSearchQuery] = useControllableState(
    props.searchQuery,
    props.onSearchQueryChange,
    "",
  );
  const normalizedProps: FloatingFilterProps = {
    ...props,
    dateFilter: resolvedDateFilter,
    onDateFilterChange: setResolvedDateFilter,
    customPeriod: resolvedCustomPeriod,
    onCustomPeriodChange: setResolvedCustomPeriod,
    platform: resolvedPlatform,
    onPlatformChange: setResolvedPlatform,
    searchQuery: resolvedSearchQuery,
    onSearchQueryChange: setResolvedSearchQuery,
  };

  return (
    <>
      {/* 手机端悬浮按钮 */}
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-28 right-3 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-md transition hover:border-slate-300 hover:text-slate-950 md:hidden"
      >
        <Filter className="h-4 w-4" />
        筛选
      </button>

      {/* 手机端 BottomSheet - 仅手机端渲染 */}
      {isMobile && <MobileFilterSheet {...normalizedProps} open={isOpen} />}

      {/* 桌面端遮罩层 */}
      {isOpen && !isMobile ? (
        <button
          type="button"
          aria-label="关闭筛选"
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-30 bg-transparent"
        />
      ) : null}

      {/* 桌面端悬浮按钮 */}
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-8 right-6 z-40 hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_18px_44px_rgba(15,23,42,0.16)] transition hover:border-slate-300 hover:text-slate-950 md:inline-flex"
      >
        <Filter className="h-4 w-4" />
        筛选
      </button>

      {/* 桌面端浮窗 - 仅桌面端渲染 */}
      {!isMobile && <DesktopFilterFloat {...normalizedProps} open={isOpen} />}
    </>
  );
}
