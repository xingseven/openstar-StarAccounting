"use client";

import Image from "next/image";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  Grid3X3,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { apiFetch } from "@/lib/api";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  mergeCategoryOptions,
  useTransactionCategories,
} from "@/lib/transaction-categories";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { EmptyState } from "@/components/shared/EmptyState";
import { CompactTransactionRow, formatCompactTransactionDateTime } from "@/components/shared/compact-transaction-row";
import {
  THEME_SURFACE_CLASS,
  THEME_TEXTAREA_CLASS,
  ThemeHero,
  getThemeModuleStyle,
} from "@/components/shared/theme-primitives";
import { ConsumptionLoadingShell } from "./ConsumptionLoadingShell";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
const CHART_RENDERER_OPTS = { renderer: "canvas" as const };
const RECENT_TRANSACTION_LIMIT = 5;
const FILTER_BAR_TEXT = {
  searchPlaceholder: "\u641c\u7d22\u5546\u6237\u6216\u5206\u7c7b",
  allPlatform: "\u5168\u90e8\u5e73\u53f0",
  wechat: "\u5fae\u4fe1",
  alipay: "\u652f\u4ed8\u5b9d",
  cloudpay: "\u4e91\u95ea\u4ed8",
  allDate: "\u5168\u90e8\u65f6\u95f4",
  currentMonth: "\u672c\u6708",
  countSuffix: "\u7b14",
};

export type ConsumptionData = {
  summary: {
    totalExpense: number;
    totalIncome: number;
    expenseCount: number;
    wechat: { expense: number; income: number };
    alipay: { expense: number; income: number };
    comparison: {
      totalExpenseRate: number | null;
      totalIncomeRate: number | null;
      wechatExpenseRate: number | null;
      wechatIncomeRate: number | null;
      alipayExpenseRate: number | null;
      alipayIncomeRate: number | null;
    };
  };
  platformDistribution: Array<{ name: string; value: number; fill: string }>;
  incomeExpense: Array<{ name: string; value: number; fill: string }>;
  merchants: Array<{ merchant: string; total: number; fill: string }>;
  trend: Array<{ day: string; expense: number; income: number; total: number }>;
  trendYearly: Array<{ day: string; expense: number; income: number; total: number }>;
  stackedBar: Array<{ day: string; [key: string]: string | number }>;
  pareto: Array<{ name: string; value: number; cumulativePercentage: number; fill: string }>;
  weekdayWeekend: Array<{ name: string; value: number; fill: string }>;
  calendar: Array<{ date: string; day: number; value: number }>;
  heatmap: {
    platforms: string[];
    categories: string[];
    data: Array<{ platform: string; category: string; total: number }>;
  };
  sankey: {
    nodes: Array<{ name: string }>;
    links: Array<{ source: number; target: number; value: number }>;
  };
  scatter: Array<{ id: number; hour: number; amount: number; category: string }>;
  histogram: Array<{ range: string; count: number; fill: string }>;
  transactions: Array<{
    id: string;
    merchant: string;
    date: string;
    category: string;
    platform: string;
    type: string;
    amount: string;
    description?: string;
  }>;
  insights: {
    spendingStyle: Array<{ name: string; value: number; share: number; fill: string; description: string }>;
    necessitySplit: Array<{ name: string; value: number; share: number; fill: string }>;
    transactionNature: Array<{ name: string; value: number; share: number; fill: string }>;
    recurringMerchants: Array<{
      merchant: string;
      total: number;
      count: number;
      cadenceLabel: string;
      tag: string;
      category: string;
    }>;
    budgetVariance: Array<{
      name: string;
      budget: number;
      spent: number;
      variance: number;
      percent: number;
      status: "healthy" | "warning" | "over";
    }>;
    budgetContext: {
      applicable: boolean;
      label: string;
    };
    remarkOverview: {
      total: number;
      count: number;
      distinctCount: number;
      share: number;
    };
    remarkBreakdown: Array<{
      name: string;
      total: number;
      count: number;
      share: number;
      category: string;
      merchant: string;
      fill: string;
    }>;
    timeCategoryHotspots: Array<{
      label: string;
      bucket: string;
      category: string;
      total: number;
      count: number;
    }>;
    weekendPreference: Array<{
      name: string;
      weekend: number;
      weekday: number;
      weekendShare: number;
    }>;
    largeExpenses: Array<{
      merchant: string;
      category: string;
      amount: number;
      date: string;
      reason: string;
    }>;
    concentration: {
      topMerchant: string;
      topMerchantShare: number;
      top3MerchantShare: number;
      topCategory: string;
      topCategoryShare: number;
      repeatMerchantShare: number;
    };
  };
};

interface ConsumptionViewProps {
  data: ConsumptionData;
  dateRangeLabel: string;
  comparisonLabel?: string;
  loading?: boolean;
  refreshing?: boolean;
  usingMockData?: boolean;
  dateFilter?: "month" | "all" | "custom";
  onDateFilterChange?: (value: "month" | "all" | "custom") => void;
  customPeriod?: {
    mode: "year" | "month";
    year: string;
    month: string;
  };
  onCustomPeriodChange?: (value: { mode: "year" | "month"; year: string; month: string }) => void;
}

type FilterBarProps = {
  compact?: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  dateFilter: "month" | "all" | "custom";
  onDateFilterChange?: (value: "month" | "all" | "custom") => void;
  customPeriod?: {
    mode: "year" | "month";
    year: string;
    month: string;
  };
  onCustomPeriodChange?: (value: { mode: "year" | "month"; year: string; month: string }) => void;
  filteredCount: number;
};

type ScanResponse = {
  amount: number;
  currency: string;
  merchant?: string;
  date?: string;
  category?: string;
  description?: string;
  platform?: string;
  tradeName?: string;
  payeeFullName?: string;
  product?: string;
  tradeTime?: string;
  paymentTime?: string;
  remark?: string;
};

type TransactionFormState = {
  amount: string;
  merchant: string;
  date: string;
  category: string;
  description: string;
  platform: "alipay" | "wechat" | "unionpay";
};

const SURFACE_CLASS = THEME_SURFACE_CLASS;

const PLATFORM_LABELS: Record<string, string> = {
  wechat: "微信",
  alipay: "支付宝",
  cloudpay: "云闪付",
  unionpay: "云闪付",
  bankcard: "银行卡",
  cash: "现金",
  unknown: "其他",
};

const SANKEY_NODE_FALLBACK_COLORS = [
  "#2563eb",
  "#60a5fa",
  "#f59e0b",
  "#16a34a",
  "#0f766e",
  "#a78bfa",
  "#ef4444",
  "#94a3b8",
];

function getSankeyNodeColor(name: string, index: number) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("支付宝") || normalizedName.includes("alipay")) {
    return "#1677ff";
  }

  if (normalizedName.includes("微信") || normalizedName.includes("wechat")) {
    return "#16a34a";
  }

  if (
    normalizedName.includes("云闪付") ||
    normalizedName.includes("unionpay") ||
    normalizedName.includes("cloudpay")
  ) {
    return "#f59e0b";
  }

  return SANKEY_NODE_FALLBACK_COLORS[index % SANKEY_NODE_FALLBACK_COLORS.length];
}

function getPlatformLabel(platform: string) {
  return PLATFORM_LABELS[platform] ?? platform;
}

function SummaryLegendRow({
  label,
  value,
  color,
  detail,
}: {
  label: string;
  value: string;
  color: string;
  detail?: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2.5"
      style={{ background: "var(--theme-dialog-section-bg)" }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ backgroundColor: color }} />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium sm:text-sm" style={{ color: "var(--theme-label-text)" }}>
            {label}
          </p>
          {detail ? (
            <p className="mt-0.5 text-[10px] sm:text-xs" style={{ color: "var(--theme-muted-text)" }}>
              {detail}
            </p>
          ) : null}
        </div>
      </div>
      <span className="text-[11px] font-semibold sm:text-sm" style={{ color: "var(--theme-body-text)" }}>
        {value}
      </span>
    </div>
  );
}

function buildInsightDonutOption(
  items: Array<{ name: string; value: number; fill: string }>
) {
  return {
    tooltip: {
      trigger: "item",
      formatter: (params: { name: string; value: number }) => `${params.name}<br/>${formatCurrency(params.value)}`,
    },
    series: [
      {
        type: "pie",
        radius: ["56%", "80%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: "#ffffff", borderWidth: 4 },
        data: items,
      },
    ],
  };
}

function AnalysisCard({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(SURFACE_CLASS, "p-3.5 sm:p-4", className)}>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>
          {eyebrow}
        </p>
        <h2 className="mt-0.5 text-lg font-semibold" style={{ color: "var(--theme-body-text)" }}>
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-3 sm:mt-4">{children}</div>
    </div>
  );
}

function PlatformOverviewCard({
  title,
  subtitle,
  total,
  expense,
  income,
  platform,
  expenseRate,
  incomeRate,
  comparisonLabel,
}: {
  title: string;
  subtitle: string;
  total: number;
  expense: number;
  income: number;
  platform: "total" | "wechat" | "alipay";
  expenseRate: number | null;
  incomeRate: number | null;
  comparisonLabel?: string;
}) {
  const cardClass =
    platform === "wechat"
      ? "border-[#07c160]/20 bg-[#f0fdf4]"
      : platform === "alipay"
        ? "border-[#1677ff]/20 bg-[#eff6ff]"
        : "border-slate-200 bg-slate-50";

  const totalLabel = platform === "total" ? "本期总流水" : "平台总流水";
  const getComparisonTone = (value: number | null) =>
    value === null
      ? "bg-slate-100 text-slate-500"
      : value >= 0
        ? "bg-emerald-50 text-emerald-700"
        : "bg-red-50 text-red-700";
  const getComparisonTextClass = (value: number | null) =>
    value === null
      ? "text-slate-400"
      : value >= 0
        ? "text-emerald-600"
        : "text-red-600";
  const getComparisonText = (value: number | null) =>
    value === null
      ? "暂无环比"
      : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  return (
    <div className={cn("relative overflow-hidden rounded-[20px] border p-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:rounded-[22px] sm:p-4", cardClass)}>
      <div className="pointer-events-none absolute bottom-2 right-0 select-none overflow-hidden">
        {platform === "wechat" ? (
          <div className="translate-x-3 opacity-[0.1]">
            <Image
              src="/logo/WX.svg"
              alt=""
              width={176}
              height={176}
              aria-hidden="true"
              className="h-auto w-36 object-contain sm:w-48"
            />
          </div>
        ) : null}
        {platform === "alipay" ? (
          <div className="translate-x-3 opacity-[0.1]">
            <Image
              src="/logo/ZFB.svg"
              alt=""
              width={176}
              height={176}
              aria-hidden="true"
              className="h-auto w-24 object-contain sm:w-36"
            />
          </div>
        ) : null}
        {platform === "total" ? (
          <div className="translate-x-3 opacity-[0.1]">
            <div className="relative h-24 w-28 sm:h-28 sm:w-40">
              <Image
                src="/logo/WX.svg"
                alt=""
                width={112}
                height={112}
                aria-hidden="true"
                className="absolute bottom-4 right-6 h-auto w-24 object-contain sm:bottom-5 sm:right-10 sm:w-32"
              />
              <Image
                src="/logo/ZFB.svg"
                alt=""
                width={176}
                height={176}
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-auto w-20 object-contain sm:w-28"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-slate-950 sm:text-sm">{title}</p>
            <p className="mt-0.5 hidden text-[11px] text-slate-500 sm:block sm:mt-1 sm:text-xs">{subtitle}</p>
          </div>
          <span className="hidden rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200 sm:inline-flex sm:px-2.5 sm:py-1 sm:text-[11px]">
            {totalLabel}
          </span>
        </div>

        <div className="mt-1.5 sm:mt-4">
          <p className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">Total</p>
          <p className="mt-0.5 text-[1.35rem] font-semibold tracking-tight text-slate-950 sm:mt-2 sm:text-2xl">{formatCurrency(total)}</p>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2.5 border-t border-white/70 pt-1 sm:mt-2.5 sm:gap-4 sm:pt-2.5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">支出</p>
            <p className="mt-1 text-[15px] font-semibold text-red-600 sm:text-sm">{formatCurrency(expense)}</p>
            <p className={cn("mt-0.5 text-[10px] font-medium sm:hidden", getComparisonTextClass(expenseRate))}>
              {comparisonLabel ? `${comparisonLabel} ` : ""}
              {getComparisonText(expenseRate)}
            </p>
            <span className={cn("mt-1 hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex sm:mt-2 sm:py-1 sm:text-[11px]", getComparisonTone(expenseRate))}>
              {comparisonLabel ? `${comparisonLabel} ` : ""}
              {getComparisonText(expenseRate)}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">收入</p>
            <p className="mt-1 text-[15px] font-semibold text-emerald-600 sm:text-sm">{formatCurrency(income)}</p>
            <p className={cn("mt-0.5 text-[10px] font-medium sm:hidden", getComparisonTextClass(incomeRate))}>
              {comparisonLabel ? `${comparisonLabel} ` : ""}
              {getComparisonText(incomeRate)}
            </p>
            <span className={cn("mt-1 hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex sm:mt-2 sm:py-1 sm:text-[11px]", getComparisonTone(incomeRate))}>
              {comparisonLabel ? `${comparisonLabel} ` : ""}
              {getComparisonText(incomeRate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileFilterSheet({
  open,
  onOpenChange,
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  dateFilter,
  onDateFilterChange,
  customPeriod = { mode: "month", year: "", month: "" },
  onCustomPeriodChange,
  filteredCount,
}: FilterBarProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  function switchToCustomMonth() {
    onDateFilterChange?.("custom");
    onCustomPeriodChange?.({
      ...customPeriod,
      mode: "month",
      month: customPeriod.month || String(new Date().getMonth() + 1).padStart(2, "0"),
    });
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-w-md">
        <BottomSheetHeader>
              <BottomSheetTitle>筛选消费流水</BottomSheetTitle>
        </BottomSheetHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={FILTER_BAR_TEXT.searchPlaceholder}
                className="h-11 rounded-2xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDateFilterChange?.("month")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                dateFilter === "month" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {FILTER_BAR_TEXT.currentMonth}
            </button>
            <button
              type="button"
              onClick={() => onDateFilterChange?.("all")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                dateFilter === "all" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {FILTER_BAR_TEXT.allDate}
            </button>
            <button
              type="button"
              onClick={switchToCustomMonth}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                dateFilter === "custom" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              时间段
            </button>
          </div>

          {dateFilter === "custom" ? (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onCustomPeriodChange?.({
                        ...customPeriod,
                        mode: "year",
                      })
                    }
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      customPeriod.mode === "year"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    全年
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onCustomPeriodChange?.({
                        ...customPeriod,
                        mode: "month",
                        month: customPeriod.month || String(new Date().getMonth() + 1).padStart(2, "0"),
                      })
                    }
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      customPeriod.mode === "month"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    按月份
                  </button>
                </div>

            <div className={cn("grid gap-3", customPeriod.mode === "month" ? "grid-cols-2" : "grid-cols-1")}>
                <Input
                  type="number"
                  min="2000"
                  max="2099"
                  value={customPeriod.year}
                  onChange={(event) =>
                    onCustomPeriodChange?.({
                      ...customPeriod,
                      year: event.target.value,
                    })
                  }
                  placeholder="年份"
                  className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
                />
                {customPeriod.mode === "month" ? (
                  <Select
                    value={customPeriod.month}
                    onValueChange={(value) =>
                      onCustomPeriodChange?.({
                        ...customPeriod,
                        mode: "month",
                        month: value,
                      })
                    }
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
            </div>
          ) : null}

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            {`${filteredCount} ${FILTER_BAR_TEXT.countSuffix}`}
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function clampYear(year: number) {
  return Math.min(2099, Math.max(2000, year));
}

function DesktopYearStepper({
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

function DesktopMonthStepper({
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

function DesktopFilterFloat({
  open,
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  dateFilter,
  onDateFilterChange,
  customPeriod = { mode: "month", year: "", month: "" },
  onCustomPeriodChange,
  filteredCount,
}: FilterBarProps & { open: boolean }) {
  if (!open) return null;

  function switchToCustomMonth() {
    onDateFilterChange?.("custom");
    onCustomPeriodChange?.({
      ...customPeriod,
      mode: "month",
      month: customPeriod.month || String(new Date().getMonth() + 1).padStart(2, "0"),
    });
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 hidden w-[432px] rounded-[24px] border border-slate-200 bg-white p-3.5 shadow-[0_24px_60px_rgba(15,23,42,0.12)] md:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">筛选消费流水</p>
          <p className="mt-1 text-xs text-slate-500">按平台、时间和关键词快速收窄范围</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
          <Filter className="h-3.5 w-3.5" />
          {`${filteredCount} ${FILTER_BAR_TEXT.countSuffix}`}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="rounded-[18px] bg-slate-50/90 p-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={FILTER_BAR_TEXT.searchPlaceholder}
              className="h-11 rounded-2xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-[18px] bg-slate-50/90 p-2.5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">平台</p>
            <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-3">
              <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
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
                {filteredCount} 笔
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">时间</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onDateFilterChange?.("month")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  dateFilter === "month" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                )}
              >
                {FILTER_BAR_TEXT.currentMonth}
              </button>
              <button
                type="button"
                onClick={() => onDateFilterChange?.("all")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  dateFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                )}
              >
                {FILTER_BAR_TEXT.allDate}
              </button>
              <button
                type="button"
                onClick={switchToCustomMonth}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  dateFilter === "custom" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                )}
              >
                时间段
              </button>
            </div>
          </div>
        </div>

        {dateFilter === "custom" ? (
          <div className="space-y-2.5 rounded-[18px] border border-slate-200 bg-white p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">时间设置</p>
              <p className="mt-1 text-xs text-slate-500">可查看全年，也可切到按月份</p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onCustomPeriodChange?.({
                        ...customPeriod,
                        mode: "year",
                      })
                    }
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      customPeriod.mode === "year"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                    )}
                  >
                    全年
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onCustomPeriodChange?.({
                        ...customPeriod,
                        mode: "month",
                        month: customPeriod.month || String(new Date().getMonth() + 1).padStart(2, "0"),
                      })
                    }
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      customPeriod.mode === "month"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                    )}
                  >
                    按月份
                  </button>
                </div>

            <div className={cn("grid gap-3", customPeriod.mode === "month" ? "grid-cols-[minmax(0,1fr)_112px]" : "grid-cols-1")}>
                <DesktopYearStepper
                  year={customPeriod.year}
                  onYearChange={(value) =>
                    onCustomPeriodChange?.({
                      ...customPeriod,
                      year: value,
                    })
                  }
                />
                {customPeriod.mode === "month" ? (
                  <DesktopMonthStepper
                    month={customPeriod.month}
                    onMonthChange={(value) =>
                      onCustomPeriodChange?.({
                        ...customPeriod,
                        mode: "month",
                        month: value,
                      })
                    }
                  />
                ) : null}
            </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MerchantRow({ merchant, total, fill }: { merchant: string; total: number; fill: string }) {
  return (
    <div className="py-0.5">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fill }} />
          <span className="truncate text-sm font-medium leading-4" style={{ color: "var(--theme-body-text)" }}>{merchant}</span>
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: ConsumptionData["transactions"][number];
}) {
  const isIncome = transaction.type === "INCOME";

  return (
    <CompactTransactionRow
      icon={isIncome ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
      iconClassName={isIncome ? "bg-emerald-50 text-emerald-600" : "bg-slate-900 text-white"}
      primary={transaction.merchant}
      secondary={transaction.description ? `备注：${transaction.description}` : undefined}
      meta={[
        formatCompactTransactionDateTime(transaction.date),
        <span key="category" className="rounded-full px-2 py-0.5 font-medium" style={{ background: "var(--theme-empty-icon-bg)" }}>
          {transaction.category}
        </span>,
        getPlatformLabel(transaction.platform),
      ]}
      trailing={
        <div className={cn("text-sm font-semibold", isIncome ? "text-emerald-600" : "text-slate-950")}>
          <span className="mr-1 text-[10px] font-medium" style={{ color: "var(--theme-muted-text)" }}>
            {isIncome ? "收入" : "支出"}
          </span>
          <span>
            {isIncome ? "+" : "-"}
            {formatCurrency(Number(transaction.amount), { withSymbol: false, decimals: 2 })}
          </span>
        </div>
      }
    />
  );
}

function HeatmapGrid({ data }: { data: ConsumptionData["heatmap"] }) {
  const maxValue = Math.max(...data.data.map((item) => item.total), 1);
  const valueMap = new Map(data.data.map((item) => [`${item.platform}::${item.category}`, item.total]));
  const visiblePlatforms = data.platforms.slice(0, 2);

  return (
    <div>
      <div className="grid grid-cols-[98px_repeat(2,minmax(0,1fr))] gap-1.5 sm:grid-cols-[116px_repeat(2,minmax(0,1fr))] sm:gap-2">
        <div />
        {visiblePlatforms.map((platform) => (
          <div key={platform} className="px-2 py-0.5 text-center text-[11px] font-medium text-slate-500 sm:py-1 sm:text-xs">
            {platform}
          </div>
        ))}
      </div>

      <div className="mt-1.5 space-y-1.5 sm:mt-2 sm:space-y-2">
        {data.categories.slice(0, 6).map((category) => (
          <div key={category} className="grid grid-cols-[98px_repeat(2,minmax(0,1fr))] gap-1.5 sm:grid-cols-[116px_repeat(2,minmax(0,1fr))] sm:gap-2">
            <div className="flex items-center text-xs font-medium text-slate-700 sm:text-sm">{category}</div>
            {visiblePlatforms.map((platform) => {
              const value = valueMap.get(`${platform}::${category}`) ?? 0;
              const opacity = value > 0 ? 0.12 + (value / maxValue) * 0.55 : 0.04;

              return (
                <div
                  key={`${platform}-${category}`}
                  className="rounded-lg border border-slate-100 px-2 py-2 text-center text-[11px] font-medium text-slate-700 sm:rounded-xl sm:py-2.5 sm:text-xs"
                  style={{ backgroundColor: `rgba(37, 99, 235, ${opacity})` }}
                >
                  {value > 0 ? formatCurrency(value, { compact: true }) : "—"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarHeatGrid({
  calendar,
  mode = "day",
}: {
  calendar: ConsumptionData["calendar"];
  mode?: "day" | "month";
}) {
  if (mode === "month") {
    const monthMap = new Map<string, number>();
    calendar.forEach((item) => {
      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + item.value);
    });

    const monthItems = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, value]) => ({ month, value }));
    const maxValue = Math.max(...monthItems.map((item) => item.value), 1);

    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {monthItems.map((item) => {
          const intensity = item.value / maxValue;
          const background =
            intensity < 0.18
              ? "rgba(191,219,254,0.45)"
              : intensity < 0.4
                ? "rgba(96,165,250,0.55)"
                : intensity < 0.7
                  ? "rgba(37,99,235,0.65)"
                  : "rgba(30,64,175,0.8)";

          return (
            <div
              key={item.month}
              className="flex min-h-[82px] flex-col justify-between rounded-lg border border-white/70 px-3 py-3 shadow-sm sm:rounded-xl"
              style={{ backgroundColor: background }}
              title={`${item.month}: ${formatCurrency(item.value)}`}
            >
              <span className={cn("text-xs font-semibold sm:text-sm", intensity > 0.45 ? "text-white" : "text-slate-800")}>
                {item.month.slice(5)} 月
              </span>
              <span className={cn("text-[11px] font-medium sm:text-xs", intensity > 0.45 ? "text-blue-50" : "text-slate-600")}>
                {formatCurrency(item.value, { compact: true })}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const firstDate = calendar[0]?.date ? new Date(calendar[0].date) : null;
  const leadingBlanks = firstDate ? firstDate.getDay() : 0;
  const maxValue = Math.max(...calendar.map((item) => item.value), 1);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-400">
        {weekDays.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <div key={`blank-${index}`} className="h-12 rounded-lg bg-transparent sm:rounded-xl" />
        ))}

        {calendar.map((item) => {
          const intensity = item.value / maxValue;
          const background =
            intensity === 0
              ? "rgba(148,163,184,0.08)"
              : intensity < 0.2
                ? "rgba(191,219,254,0.7)"
                : intensity < 0.45
                  ? "rgba(96,165,250,0.65)"
                  : intensity < 0.75
                    ? "rgba(37,99,235,0.7)"
                    : "rgba(30,64,175,0.82)";

          return (
            <div
              key={item.date}
              className="flex h-12 flex-col items-center justify-center rounded-lg border border-white/70 text-center shadow-sm sm:rounded-xl"
              style={{ backgroundColor: background }}
              title={`${item.date}: ${formatCurrency(item.value)}`}
            >
              <span className={cn("text-xs font-semibold sm:text-sm", intensity > 0.4 ? "text-white" : "text-slate-800")}>{item.day}</span>
              {item.value > 0 ? (
                <span className={cn("mt-0.5 text-[10px] sm:text-[11px]", intensity > 0.4 ? "text-blue-50" : "text-slate-500")}>
                  {formatCurrency(item.value, { compact: true })}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConsumptionDefaultTheme({
  data,
  dateRangeLabel,
  comparisonLabel,
  loading = false,
  refreshing = false,
  usingMockData = false,
  dateFilter = "month",
  onDateFilterChange,
  customPeriod = { mode: "month", year: "", month: "" },
  onCustomPeriodChange,
}: ConsumptionViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  const [notesOnly, setNotesOnly] = useState(false);
  const [formState, setFormState] = useState<TransactionFormState>({
    amount: "",
    merchant: "",
    date: "",
    category: "",
    description: "",
    platform: "alipay",
  });
  const { categories: categoryCatalog } = useTransactionCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSkeletonVisible = loading;
  const balance = data.summary.totalIncome - data.summary.totalExpense;
  const topMerchant = data.merchants[0];
  const averageExpensePerTransaction =
    data.summary.expenseCount > 0 ? data.summary.totalExpense / data.summary.expenseCount : 0;
  const primaryExpenseLabel =
    dateFilter === "month"
      ? "本月总支出"
      : dateFilter === "all"
        ? "全部总支出"
      : dateFilter === "custom" && customPeriod.mode === "year"
        ? "本年总支出"
        : "本期总支出";
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredPlatformFilter = useDeferredValue(platformFilter);
  const lowerSearchTerm = deferredSearchTerm.trim().toLowerCase();
  const incomeExpenseTotal = data.incomeExpense.reduce((accumulator, item) => accumulator + item.value, 0);
  const calendarMode = useMemo(() => {
    if (dateFilter === "all") return "month" as const;
    if (dateFilter === "custom" && customPeriod.mode === "year") {
      return "month" as const;
    }
    return "day" as const;
  }, [customPeriod.mode, dateFilter]);
  const aiTransactions = useMemo(
    () =>
      data.transactions.map((transaction) => ({
        id: transaction.id,
        amount: parseFloat(transaction.amount) || 0,
        category: transaction.category,
        platform: transaction.platform,
        date: transaction.date,
        merchant: transaction.merchant,
        description: transaction.description || "",
      })),
    [data.transactions]
  );
  const availableExpenseCategories = useMemo(
    () =>
      mergeCategoryOptions(
        DEFAULT_EXPENSE_CATEGORIES,
        categoryCatalog.expense,
        data.transactions.map((transaction) => transaction.category),
        formState.category,
      ),
    [categoryCatalog.expense, data.transactions, formState.category]
  );

  const filteredTransactions = useMemo(
    () =>
      data.transactions.filter((transaction) => {
        const matchesSearch =
          lowerSearchTerm === "" ||
          transaction.merchant.toLowerCase().includes(lowerSearchTerm) ||
          transaction.category.toLowerCase().includes(lowerSearchTerm) ||
          (transaction.description ?? "").toLowerCase().includes(lowerSearchTerm);
        const matchesPlatform = deferredPlatformFilter === "all" || transaction.platform === deferredPlatformFilter;
        return matchesSearch && matchesPlatform;
      }),
    [data.transactions, deferredPlatformFilter, lowerSearchTerm]
  );
  const notedTransactions = useMemo(
    () => filteredTransactions.filter((transaction) => Boolean(transaction.description?.trim())),
    [filteredTransactions]
  );
  const displayTransactions = notesOnly ? notedTransactions : filteredTransactions;
  const visibleTransactions = useMemo(() => displayTransactions.slice(0, RECENT_TRANSACTION_LIMIT), [displayTransactions]);

  const trendDisplayData = useMemo(() => {
    const now = new Date();
    const fallbackYear = now.getFullYear();
    const fallbackMonth = now.getMonth() + 1;

    if (dateFilter === "all") {
      const source = data.trendYearly;
      if (source.length === 0) return [] as Array<{ key: string; label: string; expense: number; income: number }>;

      const years = source
        .map((item) => Number.parseInt(item.day, 10))
        .filter((value) => Number.isFinite(value));

      if (years.length === 0) return [] as Array<{ key: string; label: string; expense: number; income: number }>;

      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      const yearMap = new Map(source.map((item) => [item.day, item]));

      return Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
        const year = String(minYear + index);
        const row = yearMap.get(year);
        return {
          key: year,
          label: year,
          expense: row?.expense ?? 0,
          income: row?.income ?? 0,
        };
      });
    }

    if (dateFilter === "custom" && customPeriod.mode === "year") {
      const selectedYear = Number.parseInt(customPeriod.year, 10);
      const year = Number.isFinite(selectedYear) ? selectedYear : fallbackYear;
      const monthMap = new Map(data.trend.map((item) => [item.day, item]));

      return Array.from({ length: 12 }, (_, index) => {
        const month = String(index + 1).padStart(2, "0");
        const key = `${year}-${month}`;
        const row = monthMap.get(key);
        return {
          key,
          label: month,
          expense: row?.expense ?? 0,
          income: row?.income ?? 0,
        };
      });
    }

    const selectedYear = dateFilter === "custom" ? Number.parseInt(customPeriod.year, 10) : fallbackYear;
    const safeYear = Number.isFinite(selectedYear) ? selectedYear : fallbackYear;
    const selectedMonth = dateFilter === "custom" ? Number.parseInt(customPeriod.month, 10) : fallbackMonth;
    const safeMonth = Number.isFinite(selectedMonth) && selectedMonth >= 1 && selectedMonth <= 12 ? selectedMonth : fallbackMonth;
    const daysInMonth = new Date(safeYear, safeMonth, 0).getDate();
    const monthKey = String(safeMonth).padStart(2, "0");
    const dayMap = new Map(data.trend.map((item) => [item.day, item]));

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const key = `${safeYear}-${monthKey}-${day}`;
      const row = dayMap.get(key);
      return {
        key,
        label: day,
        expense: row?.expense ?? 0,
        income: row?.income ?? 0,
      };
    });
  }, [customPeriod.mode, customPeriod.month, customPeriod.year, data.trend, data.trendYearly, dateFilter]);

  const trendChartMeta = useMemo(() => {
    if (dateFilter === "all") {
      return {
        eyebrow: "收支趋势",
        title: "每年收支走势",
        description: "按年份查看全部时间范围内的收入与支出变化。",
      };
    }

    if (dateFilter === "custom" && customPeriod.mode === "year") {
      return {
        eyebrow: "收支趋势",
        title: `${customPeriod.year || "所选年份"}年每月收支走势`,
        description: "按月份查看所选年份的收入与支出变化。",
      };
    }

    if (dateFilter === "custom") {
      return {
        eyebrow: "收支趋势",
        title: `${customPeriod.year || ""}年${customPeriod.month || ""}月每日收支走势`,
        description: "按天查看所选月份内的收入与支出变化。",
      };
    }

    return {
      eyebrow: "收支趋势",
      title: "本月每日收支走势",
      description: "按天查看本月收入与支出的波动变化。",
    };
  }, [customPeriod.mode, customPeriod.month, customPeriod.year, dateFilter]);


  const trendOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        formatter: (params: Array<{ axisValue: string; seriesName: string; value: number }>) =>
          [
            params[0]?.axisValue ?? "",
            ...params.map((item) => `${item.seriesName} ${formatCurrency(Number(item.value ?? 0))}`),
          ].join("<br/>"),
      },
      legend: {
        top: 0,
        right: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: "#64748b", fontSize: 11 },
      },
      grid: { left: 16, right: 12, top: 44, bottom: 24, containLabel: true },
      xAxis: {
        type: "category",
        data: trendDisplayData.map((item) => item.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      series: [
        {
          name: "支出",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: trendDisplayData.map((item) => item.expense),
          lineStyle: { color: "#ef4444", width: 3 },
          itemStyle: { color: "#ef4444", borderColor: "#ffffff", borderWidth: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(239,68,68,0.18)" },
                { offset: 1, color: "rgba(239,68,68,0.02)" },
              ],
            },
          },
        },
        {
          name: "收入",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: trendDisplayData.map((item) => item.income),
          lineStyle: { color: "#10b981", width: 3 },
          itemStyle: { color: "#10b981", borderColor: "#ffffff", borderWidth: 2 },
        },
      ],
    }),
    [trendDisplayData]
  );

  const platformOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (params: { name: string; value: number }) => `${params.name}<br/>${formatCurrency(params.value)}`,
      },
      series: [
        {
          type: "pie",
          radius: ["46%", "88%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: "#ffffff", borderWidth: 5 },
          data: data.platformDistribution,
        },
      ],
    }),
    [data.platformDistribution]
  );

  const incomeExpenseOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (params: { name: string; value: number }) => `${params.name}<br/>${formatCurrency(params.value)}`,
      },
      series: [
        {
          type: "pie",
          radius: ["42%", "86%"],
          center: ["50%", "50%"],
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: "#ffffff", borderWidth: 5 },
          data: data.incomeExpense,
        },
      ],
    }),
    [data.incomeExpense]
  );

  const categoryOption = useMemo(
    () => ({
      grid: { left: 0, right: 56, top: 8, bottom: 0, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: "category",
        data: data.pareto.slice(0, 5).map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12 },
      },
      series: [
        {
          type: "bar",
          data: data.pareto.slice(0, 5).map((item) => ({
            value: item.value,
            itemStyle: {
              color: item.fill,
              borderRadius: [0, 12, 12, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            color: "#0f172a",
            padding: [0, 0, 0, 6],
            formatter: ({ value }: { value: number }) => formatCurrency(value, { compact: true }),
          },
          barWidth: 16,
        },
      ],
    }),
    [data.pareto]
  );

  const stackedCategories = useMemo(
    () => Array.from(new Set(data.stackedBar.flatMap((item) => Object.keys(item).filter((key) => key !== "day")))).slice(0, 5),
    [data.stackedBar]
  );

  const stackedBarOption = useMemo(
    () => ({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: {
        top: 0,
        textStyle: { color: "#64748b", fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: { left: 8, right: 8, bottom: 8, top: 44, containLabel: true },
      xAxis: {
        type: "category",
        data: data.stackedBar.map((item) => String(item.day).slice(5)),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      series: stackedCategories.map((category, index) => ({
        name: category,
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        data: data.stackedBar.map((item) => Number(item[category] ?? 0)),
        itemStyle: {
          color: data.pareto[index]?.fill || ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"][index % 5],
          borderRadius: index === stackedCategories.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0],
        },
      })),
    }),
    [data.pareto, data.stackedBar, stackedCategories]
  );

  const weekdayOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: Array<{ axisValue: string; value: number }>) =>
          `${params[0]?.axisValue ?? ""}<br/>日均 ${formatCurrency(Number(params[0]?.value ?? 0))}`,
      },
      grid: { left: 8, right: 8, bottom: 8, top: 20, containLabel: true },
      xAxis: {
        type: "category",
        data: data.weekdayWeekend.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          data: data.weekdayWeekend.map((item) => ({
            value: item.value,
            itemStyle: {
              color: item.fill,
              borderRadius: [8, 8, 0, 0],
            },
          })),
          barWidth: "54%",
          label: {
            show: true,
            position: "top",
            color: "#475569",
            formatter: ({ value }: { value: number }) => formatCurrency(value, { compact: true }),
          },
        },
      ],
    }),
    [data.weekdayWeekend]
  );

  const sankeyOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (params: { dataType: string; name: string; value: number }) =>
          params.dataType === "edge" ? `${params.name}<br/>${formatCurrency(params.value)}` : params.name,
      },
      series: [
        {
          type: "sankey",
          left: 8,
          right: 84,
          top: 12,
          bottom: 12,
          draggable: true,
          emphasis: { focus: "adjacency" },
          nodeGap: 14,
          lineStyle: {
            color: "source",
            curveness: 0.5,
            opacity: 0.28,
          },
          label: {
            color: "#334155",
            fontSize: 11,
            width: 72,
            overflow: "truncate",
            padding: [0, 6, 0, 6],
          },
          data: data.sankey.nodes.map((node, index) => ({
            ...node,
            itemStyle: {
              color: getSankeyNodeColor(node.name, index),
            },
          })),
          links: data.sankey.links.map((link) => ({
            ...link,
            source: data.sankey.nodes[link.source]?.name ?? "",
            target: data.sankey.nodes[link.target]?.name ?? "",
          })),
        },
      ],
    }),
    [data.sankey]
  );

  const scatterOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (params: { value: [number, number, string] }) =>
          `${params.value[0].toFixed(1)} 点<br/>${formatCurrency(params.value[1])}<br/>${params.value[2]}`,
      },
      grid: { left: 8, right: 8, bottom: 8, top: 20, containLabel: true },
      xAxis: {
        type: "value",
        min: 0,
        max: 24,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      series: [
        {
          type: "scatter",
          data: data.scatter.map((item) => [item.hour, item.amount, item.category]),
          symbolSize: (value: [number, number]) => Math.max(8, Math.min(22, value[1] / 60)),
          itemStyle: {
            color: "rgba(37,99,235,0.68)",
            borderColor: "#ffffff",
            borderWidth: 1,
          },
        },
      ],
    }),
    [data.scatter]
  );

  const histogramOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      grid: { left: 8, right: 8, bottom: 8, top: 20, containLabel: true },
      xAxis: {
        type: "category",
        data: data.histogram.map((item) => item.range),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          data: data.histogram.map((item) => ({
            value: item.count,
            itemStyle: {
              color: item.fill,
              borderRadius: [8, 8, 0, 0],
            },
          })),
          barWidth: "60%",
          label: { show: true, position: "top", color: "#475569" },
        },
      ],
    }),
    [data.histogram]
  );

  const recurringMerchantsOption = useMemo(
    () => ({
      grid: { left: 8, right: 12, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: "category",
        data: data.insights.recurringMerchants.map((item) => item.merchant),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12, width: 88, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          barWidth: 14,
          data: data.insights.recurringMerchants.map((item) => ({
            value: item.total,
            itemStyle: {
              color: item.tag === "订阅候选" ? "#8b5cf6" : item.tag === "高频商户" ? "#2563eb" : "#64748b",
              borderRadius: [0, 10, 10, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            color: "#0f172a",
            formatter: ({ value }: { value: number }) => formatCurrency(value, { compact: true }),
          },
        },
      ],
    }),
    [data.insights.recurringMerchants]
  );

  const concentrationOption = useMemo(
    () => ({
      grid: { left: 8, right: 44, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        max: 110,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11, formatter: "{value}%" },
      },
      yAxis: {
        type: "category",
        data: ["头部商户", "前三商户", "头部类别", "复购商户"],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12 },
      },
      series: [
        {
          type: "bar",
          barWidth: 14,
          data: [
            data.insights.concentration.topMerchantShare,
            data.insights.concentration.top3MerchantShare,
            data.insights.concentration.topCategoryShare,
            data.insights.concentration.repeatMerchantShare,
          ].map((value, index) => ({
            value,
            itemStyle: {
              color: ["#2563eb", "#3b82f6", "#7c3aed", "#16a34a"][index],
              borderRadius: [0, 10, 10, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            distance: 8,
            color: "#0f172a",
            formatter: ({ value }: { value: number }) => `${Number(value).toFixed(0)}%`,
          },
        },
      ],
    }),
    [data.insights.concentration]
  );

  const budgetVarianceOption = useMemo(
    () => ({
      grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 11,
          formatter: (value: number) => formatCurrency(value, { compact: true }),
        },
      },
      yAxis: {
        type: "category",
        data: data.insights.budgetVariance.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12 },
      },
      series: [
        {
          type: "bar",
          barWidth: 14,
          data: data.insights.budgetVariance.map((item) => ({
            value: item.variance,
            itemStyle: {
              color: item.status === "over" ? "#ef4444" : item.status === "warning" ? "#f59e0b" : "#16a34a",
              borderRadius: item.variance >= 0 ? [0, 10, 10, 0] : [10, 0, 0, 10],
            },
          })),
          label: {
            show: true,
            position: "right",
            distance: 10,
            color: "#0f172a",
            formatter: ({ value }: { value: number }) => `${value >= 0 ? "+" : ""}${formatCurrency(value, { compact: true })}`,
          },
        },
      ],
    }),
    [data.insights.budgetVariance]
  );

  const remarkBreakdownOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: Array<{ dataIndex: number; value: number }>) => {
          const item = data.insights.remarkBreakdown[params[0]?.dataIndex ?? 0];
          if (!item) return "";
          return [
            item.name,
            `总金额 ${formatCurrency(item.total)}`,
            `笔数 ${item.count}`,
            `主分类 ${item.category}`,
            `高频商户 ${item.merchant}`,
          ].join("<br/>");
        },
      },
      grid: { left: 8, right: 72, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 11,
          formatter: (value: number) => formatCurrency(value, { compact: true }),
        },
      },
      yAxis: {
        type: "category",
        data: data.insights.remarkBreakdown.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12, width: 108, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          barWidth: 16,
          data: data.insights.remarkBreakdown.map((item) => ({
            value: item.total,
            itemStyle: {
              color: item.fill,
              borderRadius: [0, 10, 10, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            distance: 8,
            color: "#0f172a",
            formatter: ({ value }: { value: number }) => formatCurrency(value, { compact: true }),
          },
        },
      ],
    }),
    [data.insights.remarkBreakdown]
  );

  const largeExpensesOption = useMemo(
    () => ({
      grid: { left: 8, right: 68, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: "category",
        data: data.insights.largeExpenses.map((item) => item.merchant),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12, width: 88, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          barWidth: 14,
          data: data.insights.largeExpenses.map((item) => ({
            value: item.amount,
            itemStyle: {
              color: "#ef4444",
              borderRadius: [0, 10, 10, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            distance: 10,
            color: "#0f172a",
            formatter: ({ value }: { value: number }) => formatCurrency(value, { compact: true }),
          },
        },
      ],
    }),
    [data.insights.largeExpenses]
  );

  const hotspotsOption = useMemo(
    () => ({
      grid: { left: 8, right: 68, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: "category",
        data: data.insights.timeCategoryHotspots.map((item) => item.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12, width: 96, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          barWidth: 14,
          data: data.insights.timeCategoryHotspots.map((item) => ({
            value: item.total,
            itemStyle: {
              color: "#f59e0b",
              borderRadius: [0, 10, 10, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            distance: 10,
            color: "#0f172a",
            formatter: ({ value }: { value: number }) => formatCurrency(value, { compact: true }),
          },
        },
      ],
    }),
    [data.insights.timeCategoryHotspots]
  );

  const weekendPreferenceOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        top: 0,
        textStyle: { color: "#64748b", fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: { left: 8, right: 44, top: 34, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        max: 110,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11, formatter: (value: number) => `${value}%` },
      },
      yAxis: {
        type: "category",
        data: data.insights.weekendPreference.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12, width: 88, overflow: "truncate" },
      },
      series: [
        {
          name: "周末偏好",
          type: "bar",
          barWidth: 14,
          data: data.insights.weekendPreference.map((item) => ({
            value: item.weekendShare,
            itemStyle: {
              color: "#2563eb",
              borderRadius: [0, 10, 10, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            distance: 8,
            color: "#0f172a",
            formatter: ({ value }: { value: number }) => `${Number(value).toFixed(0)}%`,
          },
        },
      ],
    }),
    [data.insights.weekendPreference]
  );

  function openAIDialog() {
    setIsAIDialogOpen(true);
    setSelectedImage(null);
    setSelectedFile(null);
    setScanResult(null);
    setFormState({
      amount: "",
      merchant: "",
      date: "",
      category: "",
      description: "",
      platform: "alipay",
    });
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setSelectedImage(loadEvent.target?.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleAIScan() {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("platform", formState.platform);

      const response = await apiFetch<ScanResponse>("/api/ai/scan-receipt", {
        method: "POST",
        body: formData,
      });

      const detectedDate = response.tradeTime || response.paymentTime || response.date || "";
      const merchant = response.merchant || response.tradeName || response.payeeFullName || response.product || "";
      const description = [response.description, response.remark].filter(Boolean).join(" | ");

      setScanResult(response);
      setFormState((current) => ({
        ...current,
        amount: String(response.amount ?? ""),
        merchant,
        date: detectedDate.includes("T") ? detectedDate : detectedDate.replace(" ", "T"),
        category: response.category || current.category,
        description,
        platform: (response.platform as TransactionFormState["platform"]) || current.platform,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "AI 璇嗗埆澶辫触锛岃閲嶈瘯";
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleAIConfirm() {
    if (!formState.amount || !formState.merchant) {
      toast.warning("请填写金额和商户");
      return;
    }

    try {
      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(formState.amount),
          type: "EXPENSE",
          category: formState.category || "鍏朵粬",
          platform: formState.platform,
          merchant: formState.merchant,
          description: formState.description,
          date: formState.date ? formState.date.split("T")[0] : new Date().toISOString().split("T")[0],
        }),
      });

      toast.success("璁拌处鎴愬姛");
      setIsAIDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("淇濆瓨澶辫触锛岃閲嶈瘯");
    }
  }

  if (isSkeletonVisible) {
    return <ConsumptionLoadingShell />;
  }

  return (
    <>
      <div className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5" style={getThemeModuleStyle("consumption")}>
        <DelayedRender delay={0}>
        <ThemeHero className="p-3.5 sm:p-6 lg:p-8">
            <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.92fr)]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: "var(--module-accent-soft)", color: "var(--module-accent-text)", boxShadow: "inset 0 0 0 1px var(--module-accent-ring)" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    消费工作台
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {dateRangeLabel}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1",
                      usingMockData
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    )}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {usingMockData ? "演示数据" : "真实数据"}
                  </span>
                  {refreshing ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      正在更新
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <p className="max-w-2xl text-sm leading-6 text-slate-600">
                    把支出、收入、平台分布和交易明细收拢到同一块消费工作台里，优先看见当前最影响决策的支出信号。
                  </p>
                  <p
                    className={cn(
                      "max-w-2xl text-xs leading-5",
                      usingMockData ? "text-amber-700" : "text-emerald-700"
                    )}
                  >
                    {usingMockData
                      ? "当前为演示数据。接入真实账单后，这里会自动切换成真实消费看板。"
                      : "当前展示真实账单数据，图表和流水会跟随导入结果更新。"}
                  </p>
                  <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{primaryExpenseLabel}</p>
                      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                        {formatCurrency(data.summary.totalExpense)}
                      </h1>
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1",
                        balance >= 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-red-50 text-red-700 ring-red-100"
                      )}
                    >
                      {balance >= 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      收支差 {formatCurrency(balance)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <PlatformOverviewCard
                    title="总消费"
                    subtitle="全部平台"
                    total={data.summary.totalExpense + data.summary.totalIncome}
                    expense={data.summary.totalExpense}
                    income={data.summary.totalIncome}
                    platform="total"
                    expenseRate={data.summary.comparison.totalExpenseRate}
                    incomeRate={data.summary.comparison.totalIncomeRate}
                    comparisonLabel={comparisonLabel}
                  />
                  <PlatformOverviewCard
                    title="微信"
                    subtitle="微信账单"
                    total={data.summary.wechat.expense + data.summary.wechat.income}
                    expense={data.summary.wechat.expense}
                    income={data.summary.wechat.income}
                    platform="wechat"
                    expenseRate={data.summary.comparison.wechatExpenseRate}
                    incomeRate={data.summary.comparison.wechatIncomeRate}
                    comparisonLabel={comparisonLabel}
                  />
                  <PlatformOverviewCard
                    title="支付宝"
                    subtitle="支付宝账单"
                    total={data.summary.alipay.expense + data.summary.alipay.income}
                    expense={data.summary.alipay.expense}
                    income={data.summary.alipay.income}
                    platform="alipay"
                    expenseRate={data.summary.comparison.alipayExpenseRate}
                    incomeRate={data.summary.comparison.alipayIncomeRate}
                    comparisonLabel={comparisonLabel}
                  />
                </div>
              </div>

              <div className="order-first w-full self-start xl:order-none xl:w-auto xl:self-end xl:justify-self-end">
                {/* 鈹€鈹€ Hero 鍙充晶娲炲療闈㈡澘 鈹€鈹€ */}
                <div className="flex flex-col gap-3">
                  {/* AI 鎿嶄綔鎸夐挳琛?*/}
                  <div className="flex gap-2.5">
                    <div className="min-w-0 flex-1">
                      <AIAnalysisCard transactions={aiTransactions} budgets={[]} compact className="w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={openAIDialog}
                        className="flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[18px] px-3 text-[13px] font-medium leading-none text-white transition hover:brightness-105 sm:gap-2 sm:px-4 sm:text-sm"
                        style={{ background: "var(--module-accent-strong)" }}
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                      AI 记账
                      </button>
                    </div>
                  </div>

                  {/* Top 商户 */}
                  <div className="hidden xl:block rounded-[18px] border border-slate-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Top 商户</p>
                    <div className="mt-2 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/12 text-blue-600">
                        <Store className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{topMerchant?.merchant ?? "暂无商户"}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {topMerchant ? `${formatCurrency(topMerchant.total)} · 本期最高` : "记录更多交易后自动生成"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 消费笔数 */}
                  <div className="hidden xl:block rounded-[18px] border border-slate-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">消费笔数</p>
                    <div className="mt-2 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-600">
                        <ReceiptText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {data.summary.expenseCount} 笔
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {data.summary.expenseCount > 0
                            ? `平均每笔 ${formatCurrency(averageExpensePerTransaction)}`
                            : "记录更多交易后自动生成"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 收支结余 */}
                  <div className="hidden xl:block rounded-[18px] border border-slate-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">收支结余</p>
                    <p className={cn("mt-1.5 text-xl font-semibold tracking-tight", balance >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      收入 {formatCurrency(data.summary.totalIncome, { compact: true })} · 支出 {formatCurrency(data.summary.totalExpense, { compact: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ThemeHero>
        </DelayedRender>

        {/* 鈹€鈹€ 鎵嬫満绔細鎮诞鎸夐挳 + BottomSheet 鈹€鈹€ */}
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="fixed bottom-28 right-3 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)] transition hover:border-slate-300 hover:text-slate-950 md:hidden"
        >
          <Filter className="h-4 w-4" />
          筛选</button>

        <MobileFilterSheet
          open={isMobileFilterOpen}
          onOpenChange={setIsMobileFilterOpen}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          customPeriod={customPeriod}
          onCustomPeriodChange={onCustomPeriodChange}
          filteredCount={filteredTransactions.length}
        />

        <>
          {isDesktopFilterOpen ? (
            <button
              type="button"
              aria-label="关闭筛选浮层"
              onClick={() => setIsDesktopFilterOpen(false)}
              className="fixed inset-0 z-30 hidden bg-transparent md:block"
            />
          ) : null}

          <button
            type="button"
            onClick={() => setIsDesktopFilterOpen(true)}
            className="fixed bottom-8 right-6 z-40 hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_18px_44px_rgba(15,23,42,0.16)] transition hover:border-slate-300 hover:text-slate-950 md:inline-flex"
          >
            <Filter className="h-4 w-4" />
            筛选
          </button>

          <div>
            <DesktopFilterFloat
              open={isDesktopFilterOpen}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              platformFilter={platformFilter}
              onPlatformFilterChange={setPlatformFilter}
              dateFilter={dateFilter}
              onDateFilterChange={onDateFilterChange}
              customPeriod={customPeriod}
              onCustomPeriodChange={onCustomPeriodChange}
              filteredCount={filteredTransactions.length}
            />
          </div>
        </>

        {/* 鈹€鈹€ 妗岄潰绔細sticky 鍐呰仈绛涢€夊伐鍏锋爮 鈹€鈹€ */}
        <div className="hidden">
          <div
            className="overflow-hidden rounded-[22px] border px-4 py-3"
            style={{
              background: "var(--theme-header-bg)",
              borderColor: "var(--theme-surface-border,rgba(148,163,184,0.12))",
              boxShadow: "0 4px 20px rgba(15,23,42,0.08)",
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* 鎼滅储妗?*/}
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4" style={{ color: "var(--theme-muted-text)" }} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="搜索商户或分类"
                  className="h-9 w-full rounded-[14px] border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    background: "var(--theme-input-bg)",
                    borderColor: "var(--theme-input-border)",
                    color: "var(--theme-body-text)",
                  }}
                />
              </div>

              {/* 骞冲彴绛涢€?*/}
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="h-9 w-[110px] rounded-[14px] shadow-none" style={{ background: "var(--theme-input-bg)", borderColor: "var(--theme-input-border)", color: "var(--theme-body-text)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{FILTER_BAR_TEXT.allPlatform}</SelectItem>
                  <SelectItem value="wechat">{FILTER_BAR_TEXT.wechat}</SelectItem>
                  <SelectItem value="alipay">{FILTER_BAR_TEXT.alipay}</SelectItem>
                  <SelectItem value="cloudpay">{FILTER_BAR_TEXT.cloudpay}</SelectItem>
                </SelectContent>
              </Select>

              {/* 鏃堕棿娈?pill */}
              <div className="flex items-center gap-1.5">
                {(["month", "all", "custom"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      onDateFilterChange?.(v);
                      if (v === "custom") {
                        onCustomPeriodChange?.({
                          ...customPeriod!,
                          mode: "month",
                          month: customPeriod?.month || String(new Date().getMonth() + 1).padStart(2, "0"),
                        });
                      }
                    }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      dateFilter === v
                        ? "bg-blue-600 text-white"
                        : "text-[color:var(--theme-muted-text)] hover:bg-[var(--theme-dialog-section-bg)]"
                    )}
                    style={dateFilter !== v ? { background: "transparent" } : undefined}
                  >
                    {v === "month" ? "本月" : v === "all" ? "全部" : "时间段"}
                  </button>
                ))}
              </div>

              {/* 鑷畾涔夋椂闂存 */}
              {dateFilter === "custom" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onCustomPeriodChange?.({ ...customPeriod!, mode: "year" })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      customPeriod?.mode === "year"
                        ? "bg-blue-600 text-white"
                        : "text-[color:var(--theme-muted-text)] hover:bg-[var(--theme-dialog-section-bg)]"
                    )}
                    style={customPeriod?.mode !== "year" ? { background: "transparent" } : undefined}
                  >
                    全年
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onCustomPeriodChange?.({
                        ...customPeriod!,
                        mode: "month",
                        month: customPeriod?.month || String(new Date().getMonth() + 1).padStart(2, "0"),
                      })
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      customPeriod?.mode === "month"
                        ? "bg-blue-600 text-white"
                        : "text-[color:var(--theme-muted-text)] hover:bg-[var(--theme-dialog-section-bg)]"
                    )}
                    style={customPeriod?.mode !== "month" ? { background: "transparent" } : undefined}
                  >
                    按月份
                  </button>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    value={customPeriod?.year ?? ""}
                    onChange={(e) => onCustomPeriodChange?.({ ...customPeriod!, year: e.target.value })}
                    placeholder="骞翠唤"
                    className="h-9 w-[92px] rounded-[14px] border px-2 text-sm outline-none"
                    style={{ background: "var(--theme-input-bg)", borderColor: "var(--theme-input-border)", color: "var(--theme-body-text)" }}
                  />
                  {customPeriod?.mode === "month" ? (
                    <Select
                      value={customPeriod.month}
                      onValueChange={(value) => onCustomPeriodChange?.({ ...customPeriod, mode: "month", month: value })}
                    >
                      <SelectTrigger className="h-9 w-[80px] rounded-[14px] shadow-none" style={{ background: "var(--theme-input-bg)", borderColor: "var(--theme-input-border)", color: "var(--theme-body-text)" }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }).map((_, i) => {
                          const v = String(i + 1).padStart(2, "0");
                          return <SelectItem key={v} value={v}>{v} 月</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              ) : null}

              {/* 缁撴灉璁℃暟 */}
              <div className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: "var(--theme-dialog-section-bg)", color: "var(--theme-muted-text)" }}>
                <Filter className="h-3 w-3" />
                {filteredTransactions.length} 绗?              </div>
            </div>
          </div>
        </div>

        <DelayedRender delay={60} lazy>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <div className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>{trendChartMeta.eyebrow}</p>
                  <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>{trendChartMeta.title}</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>{trendChartMeta.description}</p>
                </div>
              </div>

              <div className="mt-4 h-[220px] w-full sm:mt-5 sm:h-[300px]">
                <ReactECharts option={trendOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
              </div>
            </div>

            <div className="grid h-full gap-3 xl:grid-rows-2">
              <div className={cn(SURFACE_CLASS, "flex h-full flex-col p-3 sm:p-4")}>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>平台分布</p>
                  <h2 className="mt-0.5 text-lg font-semibold" style={{ color: "var(--theme-body-text)" }}>支付渠道占比</h2>
                </div>

                <div className="mt-3 grid flex-1 grid-cols-[118px_minmax(0,1fr)] items-center gap-3 sm:mt-5 sm:grid-cols-[156px_minmax(0,1fr)] sm:gap-5">
                  <div className="mx-auto h-[118px] w-full max-w-[118px] sm:h-[156px] sm:max-w-[156px]">
                    <ReactECharts option={platformOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {data.platformDistribution.slice(0, 3).map((platform) => (
                      <SummaryLegendRow
                        key={platform.name}
                        label={platform.name}
                        value={formatCurrency(platform.value, { compact: true })}
                        color={platform.fill}
                        detail={`${((platform.value / Math.max(data.summary.totalExpense, 1)) * 100).toFixed(1)}% 占比`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={cn(SURFACE_CLASS, "flex h-full flex-col p-3 sm:p-4")}>
                <div className="flex flex-wrap items-start gap-3">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>收支对比</p>
                    <h2 className="mt-0.5 text-lg font-semibold" style={{ color: "var(--theme-body-text)" }}>本期收入与支出</h2>
                  </div>
                </div>

                <div className="mt-3 grid flex-1 grid-cols-[118px_minmax(0,1fr)] items-center gap-3 sm:mt-5 sm:grid-cols-[156px_minmax(0,1fr)] sm:gap-5">
                  <div className="mx-auto h-[118px] w-full max-w-[118px] sm:h-[156px] sm:max-w-[156px]">
                    <ReactECharts option={incomeExpenseOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {data.incomeExpense.map((item) => (
                      <SummaryLegendRow
                        key={item.name}
                        label={item.name}
                        value={formatCurrency(item.value)}
                        color={item.fill}
                        detail={`${((item.value / Math.max(incomeExpenseTotal, 1)) * 100).toFixed(0)}% 占比`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={120} lazy>
          <section className="grid gap-3 xl:grid-cols-[minmax(0,1.95fr)_minmax(320px,1fr)]">
            <div className={cn(SURFACE_CLASS, "p-3 sm:p-4")}>
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>商户榜单</p>
                  <h2 className="mt-0.5 text-lg font-semibold" style={{ color: "var(--theme-body-text)" }}>本期消费最高的商户</h2>
                </div>
              </div>

              <div className="mt-2.5 grid gap-2.5 sm:mt-3 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.95fr)] lg:items-start">
                <div className="space-y-1.5">
                  {data.merchants.slice(0, 6).map((merchant) => (
                    <MerchantRow key={merchant.merchant} merchant={merchant.merchant} total={merchant.total} fill={merchant.fill} />
                  ))}
                </div>

                <div className="h-[170px] w-full sm:h-[190px] lg:mt-0">
                  <ReactECharts option={categoryOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                </div>
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-3 sm:p-4")}>
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>平台 × 分类</p>
                  <h2 className="mt-0.5 text-lg font-semibold" style={{ color: "var(--theme-body-text)" }}>消费热区矩阵</h2>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--theme-muted-text)" }}>快速看出不同支付平台上，哪类消费最集中。</p>
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3">
                {data.heatmap.data.length === 0 ? (
                  <EmptyState
                    icon={Grid3X3}
                    title="暂无热区数据"
                    description="记录更多分类后，这里会显示平台和消费分类之间的分布关系。"
                    className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 sm:rounded-[24px]"
                  />
                ) : (
                  <HeatmapGrid data={data.heatmap} />
                )}
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={160} lazy>
          <section className="space-y-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>更多分析维度</p>
              <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>把解释性分析收成图表面板</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>
                这一组不再平铺信息块，而是把结构、复购、预算、场景和风险收成少量图表卡，先看整体观感。
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <AnalysisCard eyebrow="结构视图" title="消费结构图表化">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { key: "style", title: "固定 / 弹性 / 冲动", items: data.insights.spendingStyle },
                    { key: "need", title: "必要 vs 可选", items: data.insights.necessitySplit },
                    { key: "nature", title: "真实消费 vs 资金流转", items: data.insights.transactionNature },
                  ].map((group) => (
                    <div key={group.key} className="rounded-[20px] px-3 py-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
                      <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>
                        {group.title}
                      </p>
                      <div className="mx-auto mt-2 h-[150px] w-full max-w-[150px]">
                        <ReactECharts option={buildInsightDonutOption(group.items)} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                      </div>
                      <div className="space-y-1.5">
                        {group.items.map((item) => (
                          <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                              <span className="truncate" style={{ color: "var(--theme-label-text)" }}>{item.name}</span>
                            </div>
                            <span style={{ color: "var(--theme-body-text)" }}>{`${item.share.toFixed(0)}%`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AnalysisCard>

              <AnalysisCard eyebrow="复购与集中" title="复购商户和消费集中度">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>高频商户 / 自动续费候选</p>
                    {data.insights.recurringMerchants.length > 0 ? (
                      <div className="mt-2 h-[260px] w-full">
                        <ReactECharts option={recurringMerchantsOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm" style={{ color: "var(--theme-muted-text)" }}>当前筛选里还没有明显的重复商户。</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>集中度</p>
                    <div className="mt-2 h-[260px] w-full">
                      <ReactECharts option={concentrationOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                    </div>
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard eyebrow="预算与风险" title="预算偏差和大额预警">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>实际消费 vs 预算</p>
                    {data.insights.budgetVariance.length > 0 ? (
                      <div className="mt-2 h-[260px] w-full">
                        <ReactECharts option={budgetVarianceOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm" style={{ color: "var(--theme-muted-text)" }}>{data.insights.budgetContext.label}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>优先回看的单笔支出</p>
                    {data.insights.largeExpenses.length > 0 ? (
                      <div className="mt-2 h-[260px] w-full">
                        <ReactECharts option={largeExpensesOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm" style={{ color: "var(--theme-muted-text)" }}>当前筛选里还没有达到阈值的大额支出。</p>
                    )}
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard eyebrow="场景偏好" title="时段热点和周末偏好">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>时段 × 分类热点</p>
                    {data.insights.timeCategoryHotspots.length > 0 ? (
                      <div className="mt-2 h-[260px] w-full">
                        <ReactECharts option={hotspotsOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm" style={{ color: "var(--theme-muted-text)" }}>当前筛选里还没有明显的高峰场景。</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>哪些消费偏向周末</p>
                    {data.insights.weekendPreference.length > 0 ? (
                      <div className="mt-2 h-[260px] w-full">
                        <ReactECharts option={weekendPreferenceOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm" style={{ color: "var(--theme-muted-text)" }}>当前筛选里还看不出明显的周末偏好。</p>
                    )}
                  </div>
                </div>
              </AnalysisCard>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={170} lazy>
          <section className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>规则备注</p>
                <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>按自动归类备注看固定场景支出</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>这里优先看自动归类规则里填的备注或规则名，不再混入原始订单描述。</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "var(--theme-dialog-section-bg)", color: "var(--theme-muted-text)" }}>
                <ReceiptText className="h-3.5 w-3.5" />
                已备注 {data.insights.remarkOverview.count} 笔
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "备注金额",
                  value: formatCurrency(data.insights.remarkOverview.total),
                  detail: `${data.insights.remarkOverview.share.toFixed(0)}% 支出已标注`,
                },
                {
                  label: "备注笔数",
                  value: `${data.insights.remarkOverview.count} 笔`,
                  detail: "当前筛选范围内",
                },
                {
                  label: "备注种类",
                  value: `${data.insights.remarkOverview.distinctCount} 种`,
                  detail: "按备注文本去重",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border px-4 py-3"
                  style={{ background: "var(--theme-dialog-section-bg)", borderColor: "var(--theme-surface-border,rgba(148,163,184,0.12))" }}
                >
                  <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>{item.label}</p>
                  <p className="mt-2 text-lg font-semibold" style={{ color: "var(--theme-body-text)" }}>{item.value}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--theme-muted-text)" }}>{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] sm:mt-5">
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>备注金额分布</p>
                {data.insights.remarkBreakdown.length > 0 ? (
                  <div className="mt-3 h-[280px] w-full sm:h-[340px]">
                    <ReactECharts option={remarkBreakdownOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
                  </div>
                ) : (
                  <EmptyState
                    icon={ReceiptText}
                    title="还没有形成规则备注图表"
                    description="先去数据页给自动归类规则补备注或规则名，这里就会按规则维度自动聚合出来。"
                    className="mt-3 rounded-[20px] border border-dashed border-slate-200 bg-slate-50 sm:rounded-[24px]"
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>备注 Top 4</p>
                {data.insights.remarkBreakdown.length > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {data.insights.remarkBreakdown.slice(0, 4).map((item) => (
                      <div
                        key={item.name}
                        className="rounded-[18px] border px-4 py-3"
                        style={{ background: "var(--theme-dialog-section-bg)", borderColor: "var(--theme-surface-border,rgba(148,163,184,0.12))" }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{item.name}</p>
                            <p className="mt-1 text-xs" style={{ color: "var(--theme-muted-text)" }}>
                              {item.category} · {item.merchant}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{formatCurrency(item.total)}</p>
                            <p className="mt-1 text-xs" style={{ color: "var(--theme-muted-text)" }}>{item.count} 笔 · {item.share.toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm" style={{ color: "var(--theme-muted-text)" }}>当前筛选范围内还没有可聚合的备注。</p>
                )}
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={180} lazy>
          <section className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>分类堆叠</p>
                  <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>每日消费分类组成</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>看每一天的消费是由哪些主要分类堆出来的。</p>
                </div>
              </div>

              <div className="mt-4 h-[240px] w-full sm:mt-5 sm:h-[320px]">
                <ReactECharts option={stackedBarOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
              </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={220} lazy>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
            <div className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>消费日历</p>
                  <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>
                    {calendarMode === "month" ? "按月份查看消费强度" : "每日消费强度分布"}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>
                    {calendarMode === "month"
                      ? "长时间范围下按月份汇总，只展示最近 12 个月的消费节奏。"
                      : "把本期的高低消费日放到日历上，看月内节奏更直观。"}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <CalendarHeatGrid calendar={data.calendar} mode={calendarMode} />
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>周内平均</p>
                  <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>按星期观察消费习惯</h2>
                </div>
              </div>

              <div className="mt-4 h-[240px] w-full sm:mt-5 sm:h-[320px]">
                <ReactECharts option={weekdayOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={260} lazy>
          <section className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>资金流向</p>
                <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>消费路径桑基图</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>从支付平台流向分类，快速看清消费主路径。</p>
              </div>
            </div>

            <div className="mt-4 h-[260px] w-full sm:mt-5 sm:h-[360px]">
              <ReactECharts option={sankeyOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={300} lazy>
          <section className="grid gap-4 xl:grid-cols-2">
            <div className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>消费时段分布</p>
                <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>24 小时消费散点图</h2>
              </div>

              <div className="mt-4 h-[240px] w-full sm:mt-5 sm:h-[320px]">
                <ReactECharts option={scatterOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>金额分布</p>
                <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>单笔消费直方图</h2>
              </div>

              <div className="mt-4 h-[240px] w-full sm:mt-5 sm:h-[320px]">
                <ReactECharts option={histogramOption} style={{ height: "100%", width: "100%" }} opts={CHART_RENDERER_OPTS} />
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={340} lazy>
          <section className={cn(SURFACE_CLASS, "p-3.5 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>交易明细</p>
                <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--theme-body-text)" }}>筛选后的消费流水</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>只展示最近 5 条，避免长列表拖慢页面交互。</p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNotesOnly((current) => !current)}
                  className={cn(
                    "rounded-full border-slate-200 bg-white/70 px-3 text-xs text-slate-600 shadow-none hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                    notesOnly ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:text-white" : ""
                  )}
                >
                  只看有备注
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", notesOnly ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600")}>
                    {notedTransactions.length}
                  </span>
                </Button>

                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "var(--theme-dialog-section-bg)", color: "var(--theme-muted-text)" }}>
                  <Filter className="h-3.5 w-3.5" />
                  最近 {Math.min(RECENT_TRANSACTION_LIMIT, displayTransactions.length)} / 共 {displayTransactions.length} 笔
                </div>
              </div>
            </div>

            <div
              className="mt-4 max-h-[380px] overflow-y-auto pr-1 sm:mt-5 sm:max-h-[420px] [&>*:last-child]:border-b-0"
            >
              {displayTransactions.length === 0 ? (
                <EmptyState
                  icon={ReceiptText}
                  title={notesOnly ? "当前筛选下没有备注账单" : "没有匹配到交易"}
                  description={notesOnly ? "先关闭“只看有备注”，或去数据页给这些流水补上备注。" : "换一个关键词或平台筛选条件试试。"}
                  className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 sm:rounded-[24px]"
                />
              ) : (
                visibleTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)
              )}
            </div>
          </section>
        </DelayedRender>
      </div>

      <BottomSheet open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <BottomSheetContent className="max-w-lg">
          <BottomSheetHeader>
            <BottomSheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI 拍照记账
            </BottomSheetTitle>
          </BottomSheetHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>平台</Label>
              <Select
                value={formState.platform}
                onValueChange={(value) =>
                  setFormState((current) => ({ ...current, platform: value as TransactionFormState["platform"] }))
                }
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alipay">支付宝</SelectItem>
                  <SelectItem value="wechat">微信</SelectItem>
                  <SelectItem value="unionpay">云闪付</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!selectedImage ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-900">上传票据或账单截图</p>
                <p className="mt-1 text-sm text-slate-500">AI 会自动识别金额、商户、时间和消费分类。</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <Button onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-2xl bg-slate-900 hover:bg-slate-800">
                  选择图片
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                  <Image
                    src={selectedImage}
                    alt="Receipt"
                    width={800}
                    height={480}
                    unoptimized
                    className="h-56 w-full object-contain"
                  />
                </div>

                {!scanResult && !isScanning ? (
                  <Button onClick={handleAIScan} className="w-full rounded-2xl text-white hover:brightness-105" style={{ background: "var(--module-accent-strong)" }}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    寮€濮嬭瘑鍒?                  </Button>
                ) : null}

                {isScanning ? (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
                    <p className="mt-3 text-sm font-medium text-slate-900">AI 正在识别票据</p>
                    <p className="mt-1 text-sm text-slate-500">通常几秒内会返回结构化结果。</p>
                  </div>
                ) : null}
              </div>
            )}

            {(scanResult || selectedImage) && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>金额</Label>
                  <Input
                    type="number"
                    value={formState.amount}
                    onChange={(event) => setFormState((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="0.00"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>商户</Label>
                  <Input
                    value={formState.merchant}
                    onChange={(event) => setFormState((current) => ({ ...current, merchant: event.target.value }))}
                    placeholder="商户名称"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>日期</Label>
                  <Input
                    type="datetime-local"
                    value={formState.date}
                    onChange={(event) => setFormState((current) => ({ ...current, date: event.target.value }))}
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>分类</Label>
                  <Select
                    value={formState.category || "其他"}
                    onValueChange={(value) => setFormState((current) => ({ ...current, category: value }))}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExpenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>描述</Label>
                  <textarea
                    value={formState.description}
                    onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                    placeholder="补充商品、账单备注或识别结果说明"
                    className={THEME_TEXTAREA_CLASS}
                  />
                </div>
              </div>
            )}
          </div>

          {selectedImage ? (
            <BottomSheetFooter className="flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedFile(null);
                  setScanResult(null);
                }}
              >
                重新上传
              </Button>
              <Button type="button" className="rounded-2xl bg-slate-900 hover:bg-slate-800" onClick={handleAIConfirm}>
                确认记账
              </Button>
            </BottomSheetFooter>
          ) : null}
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
}

