"use client";

import Image from "next/image";
import {
  memo,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Grid3X3,
  Loader2,
  MoreVertical,
  ReceiptText,
  Sparkles,
  Store,
} from "lucide-react";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { FloatingFilter } from "@/components/shared/FloatingFilter";
import { Button } from "@/components/ui/button";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  mergeCategoryOptions,
  useTransactionCategories,
} from "@/lib/transaction-categories";
import { cn, formatCurrency } from "@/lib/utils";
import {
  THEME_TEXTAREA_CLASS,
  getThemeModuleStyle,
} from "@/components/shared/theme-primitives";
import { ConsumptionLoadingShell } from "./ConsumptionLoadingShell";

type CustomPeriodState = {
  mode: "year" | "month";
  year: string;
  month: string;
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
  customPeriod?: CustomPeriodState;
  onCustomPeriodChange?: (value: CustomPeriodState) => void;
}

interface ConsumptionThemeInnerProps extends ConsumptionViewProps {
  platformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

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

type TrendPoint = {
  name: string;
  expense: number;
  income: number;
};

type CategoryTrendItem = {
  name: string;
  value: number;
  color: string;
  trendData: Array<{ name: string; value: number }>;
};

const CHART_COLORS = ["#2B6AF2", "#4CC98F", "#92C0F2", "#F5A623", "#A56BFA"];
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};
const DEFAULT_FORM_STATE: TransactionFormState = {
  amount: "",
  merchant: "",
  date: "",
  category: "",
  description: "",
  platform: "alipay",
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isIncomeTransaction(type: string) {
  return type.toUpperCase() === "INCOME";
}

function getPlatformLabel(platform?: string) {
  const value = (platform ?? "").toLowerCase();
  if (value.includes("wechat")) return "微信";
  if (value.includes("alipay")) return "支付宝";
  if (value.includes("cloudpay") || value.includes("unionpay")) return "云闪付";
  if (value.includes("bank")) return "银行卡";
  if (value.includes("cash")) return "现金";
  return platform || "其他";
}

function parseDate(value: string) {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date;

  const fallback = new Date(value.replace(" ", "T"));
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function formatBucketLabel(value: string, bucketMode: "day" | "month") {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return `${Number.parseInt(value.slice(5, 7), 10)}月`;
  }

  const date = parseDate(value.includes("T") ? value : `${value}T00:00:00`);
  if (!date) return value;

  if (bucketMode === "month") {
    return `${date.getMonth() + 1}月`;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTransactionDateTime(value: string) {
  const date = parseDate(value);
  if (!date) return value;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}月${day}日 ${hour}:${minute}`;
}

function formatSignedRate(rate: number | null) {
  if (rate === null || !Number.isFinite(rate)) return null;
  return `${rate >= 0 ? "↑" : "↓"} ${Math.abs(rate).toFixed(1)}%`;
}

function inferPreviousValue(current: number, rate: number | null) {
  if (rate === null || !Number.isFinite(rate)) return 0;
  const denominator = 1 + rate / 100;
  if (Math.abs(denominator) < 0.01) return 0;
  return Math.max(0, current / denominator);
}

function getCurrentPeriodLabel(dateFilter: ConsumptionViewProps["dateFilter"], customPeriod?: CustomPeriodState) {
  if (dateFilter === "all") return "全部";
  if (dateFilter === "custom") {
    if (customPeriod?.mode === "year" && customPeriod.year) return `${customPeriod.year}年`;
    if (customPeriod?.month) return `${Number.parseInt(customPeriod.month, 10)}月`;
    return "本期";
  }
  return "本月";
}

function getBucketKey(date: Date, bucketMode: "day" | "month") {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  if (bucketMode === "month") return `${year}-${month}`;
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildTrendSeriesFromTransactions(
  transactions: ConsumptionData["transactions"],
  bucketMode: "day" | "month",
) {
  const grouped = new Map<string, { expense: number; income: number }>();

  transactions.forEach((transaction) => {
    const date = parseDate(transaction.date);
    if (!date) return;

    const key = getBucketKey(date, bucketMode);
    const current = grouped.get(key) ?? { expense: 0, income: 0 };
    const amount = toNumber(transaction.amount);

    if (isIncomeTransaction(transaction.type)) current.income += amount;
    else current.expense += amount;

    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-10)
    .map(([key, value]) => ({
      name: formatBucketLabel(key, bucketMode),
      expense: Math.round(value.expense),
      income: Math.round(value.income),
    }));
}

function normalizeDateTimeLocal(value?: string) {
  if (!value) return "";

  const parsed = parseDate(value);
  if (parsed) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const hour = String(parsed.getHours()).padStart(2, "0");
    const minute = String(parsed.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  return value.replace(" ", "T").slice(0, 16);
}

function buildTopCategoryRows(
  transactions: ConsumptionData["transactions"],
  bucketMode: "day" | "month",
) {
  const totals = new Map<string, number>();
  const trends = new Map<string, Map<string, number>>();

  transactions.forEach((transaction) => {
    if (isIncomeTransaction(transaction.type)) return;

    const date = parseDate(transaction.date);
    if (!date) return;

    const category = transaction.category || "未分类";
    const amount = toNumber(transaction.amount);
    const bucketKey = getBucketKey(date, bucketMode);

    totals.set(category, (totals.get(category) ?? 0) + amount);

    if (!trends.has(category)) {
      trends.set(category, new Map<string, number>());
    }

    const categoryTrend = trends.get(category);
    if (!categoryTrend) return;
    categoryTrend.set(bucketKey, (categoryTrend.get(bucketKey) ?? 0) + amount);
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map<CategoryTrendItem>(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
      trendData: Array.from(trends.get(name)?.entries() ?? [])
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7)
        .map(([bucketKey, amount]) => ({
          name: formatBucketLabel(bucketKey, bucketMode),
          value: Math.round(amount),
        })),
    }));
}

function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sm:rounded-[24px] sm:p-6",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
      <h3 className="text-[13px] font-bold text-[#1e293b]">{title}</h3>
      {action}
    </div>
  );
}

function FilterBadge() {
  return (
    <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3 py-1.5 text-xs font-semibold text-[#64748b] transition hover:bg-[#e2e8f0]">
      <ChevronDown className="h-3.5 w-3.5" />
      筛选
    </span>
  );
}

function ActionDots() {
  return (
    <button className="flex h-6 w-6 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-slate-100">
      <MoreVertical className="h-4 w-4" />
    </button>
  );
}

function ChartEmpty({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-[16px] bg-[#f8fafc] text-xs font-medium text-[#94a3b8]">
      {text}
    </div>
  );
}

function MiniDonut({
  data,
  centerLabel,
}: {
  data: Array<{ name: string; value: number; fill: string }>;
  centerLabel: string;
}) {
  return (
    <div className="relative h-[112px] w-[112px]">
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-center">
        <span className="text-[11px] font-semibold text-[#64748b]">{centerLabel}</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.length > 0 ? data : [{ name: "暂无", value: 1, fill: "#e2e8f0" }]}
            dataKey="value"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={4}
            stroke="none"
            cornerRadius={6}
          >
            {(data.length > 0 ? data : [{ name: "暂无", value: 1, fill: "#e2e8f0" }]).map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function HeatmapGrid({ data }: { data: ConsumptionData["heatmap"] }) {
  const maxValue = Math.max(...data.data.map((item) => item.total), 1);

  function resolveCellValue(platform: string, category: string) {
    return data.data.find((item) => item.platform === platform && item.category === category)?.total ?? 0;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px] space-y-2">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `120px repeat(${data.platforms.length}, minmax(72px, 1fr))` }}
        >
          <div />
          {data.platforms.map((platform) => (
            <div
              key={platform}
              className="rounded-[14px] bg-[#f8fafc] px-2 py-2 text-center text-[11px] font-semibold text-[#64748b]"
            >
              {platform}
            </div>
          ))}
        </div>
        {data.categories.map((category) => (
          <div
            key={category}
            className="grid gap-2"
            style={{ gridTemplateColumns: `120px repeat(${data.platforms.length}, minmax(72px, 1fr))` }}
          >
            <div className="flex items-center rounded-[14px] bg-[#f8fafc] px-3 text-[11px] font-semibold text-[#475569]">
              {category}
            </div>
            {data.platforms.map((platform) => {
              const total = resolveCellValue(platform, category);
              const ratio = total / maxValue;

              return (
                <div
                  key={`${platform}-${category}`}
                  className="rounded-[14px] px-2 py-3 text-center text-[11px] font-semibold"
                  style={{
                    backgroundColor: `rgba(43,106,242,${0.08 + ratio * 0.32})`,
                    color: ratio > 0.55 ? "#ffffff" : "#1e293b",
                  }}
                >
                  {total > 0 ? formatCurrency(total, { withSymbol: false, compact: true }) : "-"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarHeatGrid({ calendar }: { calendar: ConsumptionData["calendar"] }) {
  const visibleDays = [...calendar]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-35);
  const maxValue = Math.max(...visibleDays.map((item) => item.value), 1);

  return (
    <div className="grid grid-cols-7 gap-2">
      {visibleDays.map((item) => {
        const ratio = item.value / maxValue;

        return (
          <div
            key={item.date}
            className="rounded-[16px] px-2 py-2.5 text-center"
            style={{ backgroundColor: `rgba(43,106,242,${0.08 + ratio * 0.3})` }}
          >
            <div className="text-[11px] font-semibold text-[#475569]">{item.day}</div>
            <div className="mt-1 text-[10px] font-medium text-[#64748b]">
              {item.value > 0 ? formatCurrency(item.value, { withSymbol: false, compact: true }) : "-"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const chartAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "#64748b", fontSize: 10, fontWeight: 600 },
  dy: 10,
};

const yAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "#64748b", fontSize: 10, fontWeight: 600 },
  tickFormatter: (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  },
  dx: -10,
  width: 42,
};

const ConsumptionDefaultThemeView = memo(function ConsumptionDefaultThemeView({
  data,
  dateRangeLabel,
  comparisonLabel,
  loading,
  refreshing,
  usingMockData,
  dateFilter = "month",
  customPeriod,
  platformFilter,
  searchQuery,
}: ConsumptionThemeInnerProps) {
  const [notesOnly, setNotesOnly] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [formState, setFormState] = useState<TransactionFormState>(DEFAULT_FORM_STATE);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { categories } = useTransactionCategories();

  const bucketMode = dateFilter === "all" || (dateFilter === "custom" && customPeriod?.mode === "year")
    ? "month"
    : "day";
  const currentPeriodLabel = getCurrentPeriodLabel(dateFilter, customPeriod);
  const comparisonPeriodLabel = comparisonLabel || "对比期";
  const searchNeedle = deferredSearchQuery.trim().toLowerCase();
  const hasLocalFilters = platformFilter !== "all" || searchNeedle.length > 0;

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((transaction) => {
      const matchesPlatform =
        platformFilter === "all" || transaction.platform.toLowerCase() === platformFilter.toLowerCase();

      const haystack = [
        transaction.merchant,
        transaction.category,
        transaction.description,
        getPlatformLabel(transaction.platform),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchNeedle || haystack.includes(searchNeedle);
      return matchesPlatform && matchesSearch;
    });
  }, [data.transactions, platformFilter, searchNeedle]);

  const analysisTransactions = hasLocalFilters ? filteredTransactions : data.transactions;
  const notedTransactions = filteredTransactions.filter((transaction) => Boolean(transaction.description?.trim()));
  const displayTransactions = notesOnly ? notedTransactions : filteredTransactions;
  const visibleTransactions = displayTransactions.slice(0, 5);

  const activeTrend = useMemo<TrendPoint[]>(() => {
    if (hasLocalFilters) {
      return buildTrendSeriesFromTransactions(analysisTransactions, bucketMode);
    }

    const source = bucketMode === "month" ? data.trendYearly : data.trend;
    return source.map((item) => ({
      name: formatBucketLabel(item.day, bucketMode),
      expense: Math.round(toNumber(item.expense)),
      income: Math.round(toNumber(item.income)),
    }));
  }, [analysisTransactions, bucketMode, data.trend, data.trendYearly, hasLocalFilters]);

  const dailyExpenseData = activeTrend.map((item) => ({
    name: item.name,
    value: item.expense,
  }));

  const comparisonData = useMemo(() => {
    const previousExpense = inferPreviousValue(
      data.summary.totalExpense,
      data.summary.comparison.totalExpenseRate,
    );
    const previousIncome = inferPreviousValue(
      data.summary.totalIncome,
      data.summary.comparison.totalIncomeRate,
    );

    return [
      {
        name: comparisonPeriodLabel,
        expense: Math.round(previousExpense),
        income: Math.round(previousIncome),
      },
      {
        name: currentPeriodLabel,
        expense: Math.round(data.summary.totalExpense),
        income: Math.round(data.summary.totalIncome),
      },
    ];
  }, [
    comparisonPeriodLabel,
    currentPeriodLabel,
    data.summary.comparison.totalExpenseRate,
    data.summary.comparison.totalIncomeRate,
    data.summary.totalExpense,
    data.summary.totalIncome,
  ]);

  const categoryBreakdownData = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    analysisTransactions.forEach((transaction) => {
      if (isIncomeTransaction(transaction.type)) return;
      const category = transaction.category || "未分类";
      categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + toNumber(transaction.amount));
    });

    if (categoryTotals.size > 0) {
      return Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], index) => ({
          name,
          value: Math.round(value),
          color: CHART_COLORS[index % CHART_COLORS.length],
        }));
    }

    return data.pareto.slice(0, 5).map((item, index) => ({
      name: item.name,
      value: Math.round(toNumber(item.value)),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [analysisTransactions, data.pareto]);

  const platformData = useMemo(() => {
    const grouped = new Map<string, number>();

    analysisTransactions.forEach((transaction) => {
      if (isIncomeTransaction(transaction.type)) return;
      const platform = getPlatformLabel(transaction.platform);
      grouped.set(platform, (grouped.get(platform) ?? 0) + toNumber(transaction.amount));
    });

    if (grouped.size > 0) {
      return Array.from(grouped.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], index) => ({
          name,
          value: Math.round(value),
          fill: CHART_COLORS[index % CHART_COLORS.length],
        }));
    }

    return data.platformDistribution.slice(0, 5).map((item, index) => ({
      name: item.name,
      value: Math.round(toNumber(item.value)),
      fill: item.fill || CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [analysisTransactions, data.platformDistribution]);

  const topCategories = useMemo(() => {
    const derived = buildTopCategoryRows(analysisTransactions, bucketMode);
    if (derived.length > 0) return derived;

    return data.pareto.slice(0, 3).map((item, index) => ({
      name: item.name,
      value: Math.round(toNumber(item.value)),
      color: CHART_COLORS[index % CHART_COLORS.length],
      trendData: [] as Array<{ name: string; value: number }>,
    }));
  }, [analysisTransactions, bucketMode, data.pareto]);

  const qualityTransactionCount = analysisTransactions.length;
  const qualityNotedCount = analysisTransactions.filter((item) => Boolean(item.description?.trim())).length;
  const noteCoverage = qualityTransactionCount > 0 ? (qualityNotedCount / qualityTransactionCount) * 100 : 0;
  const averageExpense =
    data.summary.expenseCount > 0 ? data.summary.totalExpense / data.summary.expenseCount : 0;
  const netBalance = data.summary.totalIncome - data.summary.totalExpense;

  const topMerchantName = useMemo(() => {
    if (analysisTransactions.length > 0) {
      const grouped = new Map<string, number>();

      analysisTransactions.forEach((transaction) => {
        if (isIncomeTransaction(transaction.type)) return;
        const merchant = transaction.merchant || getPlatformLabel(transaction.platform);
        grouped.set(merchant, (grouped.get(merchant) ?? 0) + toNumber(transaction.amount));
      });

      const topMerchant = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topMerchant) return topMerchant;
    }

    return data.merchants[0]?.merchant || "暂无";
  }, [analysisTransactions, data.merchants]);

  const merchantRankings = useMemo(
    () =>
      data.merchants.slice(0, 6).map((item, index) => ({
        merchant: item.merchant,
        total: Math.round(toNumber(item.total)),
        fill: item.fill || CHART_COLORS[index % CHART_COLORS.length],
      })),
    [data.merchants],
  );

  const repeatMerchantRows = data.insights.recurringMerchants.slice(0, 4);

  const structureGroups = useMemo(
    () => [
      {
        key: "style",
        title: "固定 / 灵活 / 波动",
        centerLabel: "结构",
        items: data.insights.spendingStyle.map((item, index) => ({
          name: item.name,
          value: Math.round(item.value),
          fill: item.fill || CHART_COLORS[index % CHART_COLORS.length],
        })),
      },
      {
        key: "necessity",
        title: "必要 vs 可选",
        centerLabel: "必要性",
        items: data.insights.necessitySplit.map((item, index) => ({
          name: item.name,
          value: Math.round(item.value),
          fill: item.fill || CHART_COLORS[index % CHART_COLORS.length],
        })),
      },
      {
        key: "nature",
        title: "消费 vs 周转",
        centerLabel: "性质",
        items: data.insights.transactionNature.map((item, index) => ({
          name: item.name,
          value: Math.round(item.value),
          fill: item.fill || CHART_COLORS[index % CHART_COLORS.length],
        })),
      },
    ],
    [data.insights.necessitySplit, data.insights.spendingStyle, data.insights.transactionNature],
  );

  const concentrationData = useMemo(
    () => [
      {
        name: "头部商户",
        value: data.insights.concentration.topMerchantShare,
        color: "#2B6AF2",
      },
      {
        name: "前三商户",
        value: data.insights.concentration.top3MerchantShare,
        color: "#4CC98F",
      },
      {
        name: "头部分类",
        value: data.insights.concentration.topCategoryShare,
        color: "#92C0F2",
      },
      {
        name: "重复商户",
        value: data.insights.concentration.repeatMerchantShare,
        color: "#F5A623",
      },
    ],
    [data.insights.concentration],
  );

  const budgetVarianceData = useMemo(
    () =>
      data.insights.budgetVariance.map((item) => ({
        name: item.name,
        budget: item.budget,
        spent: item.spent,
      })),
    [data.insights.budgetVariance],
  );

  const hotspotData = useMemo(
    () =>
      data.insights.timeCategoryHotspots.slice(0, 5).map((item, index) => ({
        name: item.label,
        value: item.total,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [data.insights.timeCategoryHotspots],
  );

  const weekendPreferenceData = useMemo(
    () =>
      data.insights.weekendPreference.slice(0, 5).map((item, index) => ({
        name: item.name,
        weekend: item.weekend,
        weekday: item.weekday,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [data.insights.weekendPreference],
  );

  const remarkBreakdownData = useMemo(
    () =>
      data.insights.remarkBreakdown.slice(0, 6).map((item, index) => ({
        name: item.name,
        total: item.total,
        share: item.share,
        color: item.fill || CHART_COLORS[index % CHART_COLORS.length],
        category: item.category,
        merchant: item.merchant,
        count: item.count,
      })),
    [data.insights.remarkBreakdown],
  );

  const stackedKeys = useMemo(() => {
    const keySet = new Set<string>();
    data.stackedBar.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "day") keySet.add(key);
      });
    });
    return Array.from(keySet).slice(0, 4);
  }, [data.stackedBar]);

  const sankeyFlowData = useMemo(() => {
    const nodes = data.sankey.nodes.map((item) => item.name);
    return data.sankey.links
      .map((link, index) => ({
        name: `${nodes[link.source] ?? "来源"} → ${nodes[link.target] ?? "去向"}`,
        value: Math.round(link.value),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data.sankey.links, data.sankey.nodes]);

  const availableExpenseCategories = useMemo(
    () =>
      mergeCategoryOptions(
        DEFAULT_EXPENSE_CATEGORIES,
        categories.expense,
        data.transactions.map((item) => item.category),
        scanResult?.category ? [scanResult.category] : [],
      ),
    [categories.expense, data.transactions, scanResult?.category],
  );

  function resetAIDialog() {
    setSelectedImage(null);
    setSelectedFile(null);
    setScanResult(null);
    setIsScanning(false);
    setFormState(DEFAULT_FORM_STATE);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openAIDialog() {
    resetAIDialog();
    setIsAIDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setIsAIDialogOpen(open);
    if (!open) resetAIDialog();
  }

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setSelectedImage((loadEvent.target?.result as string) || null);
    };
    reader.readAsDataURL(file);
  }

  async function handleAIScan() {
    if (!selectedFile) {
      toast.warning("请先选择小票图片");
      return;
    }

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
      const merchant =
        response.merchant || response.tradeName || response.payeeFullName || response.product || "";
      const description = [response.description, response.remark].filter(Boolean).join(" | ");

      setScanResult(response);
      setFormState((current) => ({
        ...current,
        amount: response.amount ? String(response.amount) : current.amount,
        merchant: merchant || current.merchant,
        date: normalizeDateTimeLocal(detectedDate) || current.date,
        category: response.category || current.category,
        description: description || current.description,
        platform: (response.platform as TransactionFormState["platform"]) || current.platform,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 识别失败，请重试";
      toast.error(message);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleAIConfirm() {
    if (!formState.amount || !formState.merchant) {
      toast.warning("请补齐金额和商户");
      return;
    }

    try {
      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: Number.parseFloat(formState.amount),
          type: "EXPENSE",
          category: formState.category || "其他支出",
          platform: formState.platform,
          merchant: formState.merchant,
          description: formState.description,
          date: formState.date ? formState.date.split("T")[0] : new Date().toISOString().split("T")[0],
        }),
      });

      toast.success("记账成功");
      handleDialogOpenChange(false);
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败，请重试";
      toast.error(message);
    }
  }

  if (loading) {
    return <ConsumptionLoadingShell />;
  }

  return (
    <>
      <div
        className="mx-auto max-w-[1680px] space-y-4 px-0.5 pb-2 sm:space-y-5 sm:px-4"
        style={getThemeModuleStyle("consumption")}
      >
        <DelayedRender delay={0}>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
            <Card className="bg-[#2B6AF2] p-3 pb-4 text-white sm:p-3 sm:pb-4">
              <div className="flex items-start justify-between">
                <p className="text-[13px] font-semibold text-white/90">总支出</p>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 sm:h-5 sm:w-5">
                  <Check className="h-3.5 w-3.5 stroke-[3] sm:h-3 sm:w-3" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2 sm:mt-4">
                <p className="font-numbers text-[28px] font-bold leading-none tracking-tight sm:text-[64px]">
                  {formatCurrency(data.summary.totalExpense, { withSymbol: false })}
                </p>
                {formatSignedRate(data.summary.comparison.totalExpenseRate) ? (
                  <span className="text-[10px] font-semibold text-white/80 sm:text-xs">
                    {formatSignedRate(data.summary.comparison.totalExpenseRate)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[10px] font-medium text-white sm:mt-6 sm:text-xs">
                {dateRangeLabel} · {data.summary.expenseCount} 笔记录
              </p>
            </Card>

            <Card className="bg-[#4CC98F] p-3 pb-4 text-white sm:p-3 sm:pb-4">
              <div className="flex items-start justify-between">
                <p className="text-[13px] font-semibold text-white/90">总收入</p>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 sm:h-5 sm:w-5">
                  <Check className="h-3.5 w-3.5 stroke-[3] sm:h-3 sm:w-3" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2 sm:mt-4">
                <p className="font-numbers text-[28px] font-bold leading-none tracking-tight sm:text-[64px]">
                  {formatCurrency(data.summary.totalIncome, { withSymbol: false })}
                </p>
                {formatSignedRate(data.summary.comparison.totalIncomeRate) ? (
                  <span className="text-[10px] font-semibold text-white/80 sm:text-xs">
                    {formatSignedRate(data.summary.comparison.totalIncomeRate)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[10px] font-medium text-white sm:mt-6 sm:text-xs">
                结余 {formatCurrency(netBalance, { withSymbol: false })}
              </p>
            </Card>

            <Card className="p-3 sm:p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#1e293b]">记录质量</h3>
                <ActionDots />
              </div>
              <div className="mt-3 space-y-2 sm:mt-3">
                <p className="text-[10px] font-semibold text-[#64748b] sm:text-xs">备注覆盖率</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                  <div
                    className="h-full rounded-full bg-[#4CC98F]"
                    style={{ width: `${Math.min(100, Math.max(0, noteCoverage))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] font-semibold text-[#64748b] sm:text-xs">
                    已备注 {qualityNotedCount} / {qualityTransactionCount}
                  </p>
                  <p className="font-numbers text-[10px] font-bold text-[#0f172a] sm:text-xs">
                    {noteCoverage.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
                <div className="rounded-[16px] bg-[#f8fafc] px-3 py-2">
                  <p className="text-[10px] font-medium text-[#64748b]">平均每笔</p>
                  <p className="mt-1 text-xs font-semibold text-[#0f172a] sm:text-sm">
                    {formatCurrency(averageExpense, { compact: true })}
                  </p>
                </div>
                <div className="rounded-[16px] bg-[#f8fafc] px-3 py-2">
                  <p className="text-[10px] font-medium text-[#64748b]">头部商户</p>
                  <p className="mt-1 truncate text-xs font-semibold text-[#0f172a] sm:text-sm">
                    {topMerchantName}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
                <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[10px] font-semibold text-[#64748b]">
                  {usingMockData ? "演示数据" : "真实数据"}
                </span>
                {refreshing ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-semibold text-[#2B6AF2]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    刷新中
                  </span>
                ) : null}
              </div>
            </Card>

            <Card className="bg-[#D8E6FC] p-3 sm:p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#1e293b]">消费排行</h3>
                <ActionDots />
              </div>
              <div className="mt-3 space-y-2 sm:mt-3 sm:space-y-2">
                {topCategories.length > 0 ? (
                  topCategories.map((category) => (
                    <div key={category.name} className="flex items-center gap-2 sm:gap-3">
                      <div className="flex w-[80px] items-center gap-1.5 sm:w-[100px] sm:gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate text-[10px] font-semibold text-[#475569] sm:text-xs">
                          {category.name}
                        </span>
                      </div>
                      <div className="h-[30px] flex-1 sm:h-[40px]">
                        {category.trendData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={category.trendData}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={category.color}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full rounded-full bg-white/50" />
                        )}
                      </div>
                      <div className="w-[60px] text-right sm:w-[70px]">
                        <p className="font-numbers text-[10px] font-bold text-[#1e293b] sm:text-xs">
                          {formatCurrency(category.value, { withSymbol: false })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] font-semibold text-[#475569] sm:text-xs">暂无可展示分类</span>
                )}
              </div>
            </Card>
          </div>
        </DelayedRender>

        <DelayedRender delay={30}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
            <Card>
              <CardHeader title="收支趋势" action={<FilterBadge />} />
              <div className="h-[140px] sm:h-[180px] md:h-[220px]">
                {activeTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="consumptionIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2B6AF2" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#2B6AF2" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="consumptionExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4CC98F" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#4CC98F" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" {...chartAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === "expense" ? "支出" : "收入",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        name="expense"
                        stroke="#4CC98F"
                        strokeWidth={2}
                        fill="url(#consumptionExpenseGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        name="income"
                        stroke="#2B6AF2"
                        strokeWidth={2}
                        fill="url(#consumptionIncomeGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty text="暂无趋势数据" />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="区间对比" action={<FilterBadge />} />
              <div className="h-[140px] sm:h-[180px] md:h-[220px]">
                {comparisonData.some((item) => item.expense > 0 || item.income > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                      barGap={6}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" {...chartAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === "expense" ? "支出" : "收入",
                        ]}
                      />
                      <Bar dataKey="expense" name="expense" fill="#4CC98F" radius={[6, 6, 0, 0]} barSize={20} />
                      <Bar dataKey="income" name="income" fill="#2B6AF2" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty text="暂无对比数据" />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="分类结构" action={<FilterBadge />} />
              <div className="h-[140px] sm:h-[180px] md:h-[220px]">
                {categoryBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryBreakdownData}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                      layout="vertical"
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" {...yAxisProps} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                        width={72}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                        {categoryBreakdownData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty text="暂无分类数据" />
                )}
              </div>
            </Card>
          </div>
        </DelayedRender>

        <DelayedRender delay={60}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-4">
              <CardHeader title={bucketMode === "month" ? "月度支出" : "每日支出"} action={<FilterBadge />} />
              <div className="h-[140px] sm:h-[180px] md:h-[220px]">
                {dailyExpenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyExpenseData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="consumptionDailyExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2B6AF2" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2B6AF2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" {...chartAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number) => [
                          formatCurrency(value),
                          bucketMode === "month" ? "月支出" : "日支出",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#2B6AF2"
                        strokeWidth={2}
                        fill="url(#consumptionDailyExpenseGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty text="暂无支出分布" />
                )}
              </div>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader title="平台构成" action={<FilterBadge />} />
              <div className="flex h-[140px] sm:h-[180px] md:h-[220px]">
                <div className="relative flex w-1/2 items-center justify-center">
                  <div className="absolute inset-0 m-auto flex flex-col items-center justify-center gap-1">
                    {platformData.length > 0 ? (
                      platformData.slice(0, 3).map((item) => {
                        const total = platformData.reduce((sum, current) => sum + current.value, 0);
                        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

                        return (
                          <div key={item.name} className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-xs font-semibold text-[#64748b]">{percentage}%</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs font-medium text-[#64748b]">暂无数据</span>
                    )}
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={platformData.length > 0 ? platformData : [{ name: "暂无数据", value: 1, fill: "#f1f5f9" }]}
                        innerRadius="65%"
                        outerRadius="90%"
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={8}
                      >
                        {(platformData.length > 0 ? platformData : [{ name: "暂无数据", value: 1, fill: "#f1f5f9" }]).map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={TOOLTIP_STYLE}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex w-1/2 flex-col justify-center gap-2 pl-2 sm:gap-2.5 sm:pl-4">
                  {platformData.length > 0 ? (
                    platformData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.fill }} />
                        <span className="flex-1 truncate text-xs font-medium text-[#475569]">{item.name}</span>
                        <span className="font-numbers shrink-0 text-xs font-semibold text-[#0f172a]">
                          {formatCurrency(item.value, { withSymbol: false, compact: true })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-[#64748b]">暂无平台数据</span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-0 lg:col-span-4">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3">
                <div>
                  <h3 className="text-[13px] font-semibold text-[#0f172a]">近期流水</h3>
                  <p className="text-[10px] text-[#64748b] sm:text-xs">
                    {dateRangeLabel} · 最近 {Math.min(5, displayTransactions.length)} 条
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNotesOnly((current) => !current)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      notesOnly
                        ? "bg-slate-900 text-white"
                        : "bg-[#F1F5F9] text-[#475569] hover:bg-[#e2e8f0]",
                    )}
                  >
                    只看备注
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px]",
                        notesOnly ? "bg-white/15 text-white" : "bg-white text-[#64748b]",
                      )}
                    >
                      {notedTransactions.length}
                    </span>
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={openAIDialog}
                    className="rounded-full bg-[#2B6AF2] px-3 text-xs text-white hover:bg-[#245ad0]"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    AI记一笔
                  </Button>
                </div>
              </div>

              {displayTransactions.length === 0 ? (
                <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg px-4 text-center sm:min-h-[180px]">
                  <CalendarDays className="h-6 w-6 text-slate-300 sm:h-8 sm:w-8" />
                  <p className="mt-2 text-xs font-medium text-slate-500 sm:mt-3">
                    {notesOnly ? "当前筛选下没有备注流水" : "暂无匹配流水"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {notesOnly ? "可以关闭“只看备注”或补充备注后再查看。" : "试试调整关键词、平台或时间筛选条件。"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto px-2 pb-2 sm:px-4 sm:pb-4">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 sm:px-3 sm:py-2 sm:text-xs">类型</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 sm:px-3 sm:py-2 sm:text-xs">分类</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 sm:px-3 sm:py-2 sm:text-xs">商户</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 sm:px-3 sm:py-2 sm:text-xs">时间</th>
                        <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-slate-500 sm:px-3 sm:py-2 sm:text-xs">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTransactions.map((transaction) => {
                        const isIncome = isIncomeTransaction(transaction.type);

                        return (
                          <tr
                            key={transaction.id}
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/30"
                          >
                            <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:text-xs",
                                  isIncome ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600",
                                )}
                              >
                                {isIncome ? "收入" : "支出"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-[10px] font-medium text-slate-700 sm:px-3 sm:py-2 sm:text-xs">
                              <div>{transaction.category || "未分类"}</div>
                              {transaction.description ? (
                                <div className="mt-0.5 truncate text-[10px] text-slate-400">
                                  {transaction.description}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-2 py-1.5 text-[10px] text-slate-500 sm:px-3 sm:py-2 sm:text-xs">
                              {transaction.merchant || getPlatformLabel(transaction.platform)}
                            </td>
                            <td className="px-2 py-1.5 text-[10px] text-slate-500 sm:px-3 sm:py-2 sm:text-xs">
                              {formatTransactionDateTime(transaction.date)}
                            </td>
                            <td
                              className={cn(
                                "px-2 py-1.5 text-right text-[10px] font-semibold sm:px-3 sm:py-2 sm:text-xs",
                                isIncome ? "text-blue-600" : "text-red-600",
                              )}
                            >
                              {isIncome ? "+" : "-"}
                              {formatCurrency(toNumber(transaction.amount), { withSymbol: false })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </DelayedRender>

        <DelayedRender delay={90}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1.95fr)_minmax(320px,1fr)]">
            <Card>
              <CardHeader title="商户排行与分类观察" action={<FilterBadge />} />
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
                <div className="space-y-2">
                  {merchantRankings.length > 0 ? (
                    merchantRankings.map((merchant, index) => (
                      <div key={merchant.merchant} className="rounded-[18px] bg-[#f8fafc] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                              style={{ backgroundColor: merchant.fill }}
                            >
                              {index + 1}
                            </div>
                            <span className="truncate text-sm font-semibold text-[#0f172a]">
                              {merchant.merchant}
                            </span>
                          </div>
                          <span className="font-numbers text-sm font-bold text-[#0f172a]">
                            {formatCurrency(merchant.total)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <ChartEmpty text="暂无商户排行" />
                  )}
                </div>

                <div className="h-[220px]">
                  {categoryBreakdownData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryBreakdownData}
                        margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                        layout="vertical"
                        barCategoryGap="24%"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" {...yAxisProps} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                          width={72}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                          {categoryBreakdownData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty text="暂无分类排行" />
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="平台 x 分类热区" action={<ActionDots />} />
              <div className="mt-1">
                {data.heatmap.data.length > 0 ? (
                  <HeatmapGrid data={data.heatmap} />
                ) : (
                  <div className="flex h-[220px] flex-col items-center justify-center rounded-[18px] bg-[#f8fafc] text-center">
                    <Grid3X3 className="h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-500">暂无热区数据</p>
                    <p className="mt-1 text-xs text-slate-400">记录更多交易后会展示平台与分类的交叉分布。</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </DelayedRender>

        <DelayedRender delay={120}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title="消费结构图谱" action={<ActionDots />} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {structureGroups.map((group) => (
                  <div key={group.key} className="rounded-[18px] bg-[#f8fafc] p-3">
                    <p className="min-h-10 text-xs font-semibold leading-5 text-[#64748b]">
                      {group.title}
                    </p>
                    <div className="mt-1 flex justify-center">
                      <MiniDonut data={group.items} centerLabel={group.centerLabel} />
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {group.items.map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="truncate text-[#475569]">{item.name}</span>
                          </div>
                          <span className="font-semibold text-[#0f172a]">
                            {Math.round((item.value / Math.max(group.items.reduce((sum, current) => sum + current.value, 0), 1)) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="重复商户与集中度" action={<ActionDots />} />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {concentrationData.map((metric) => (
                  <div key={metric.name} className="rounded-[18px] bg-[#f8fafc] px-3 py-3">
                    <p className="text-[11px] font-medium text-[#64748b]">{metric.name}</p>
                    <p className="mt-1 text-lg font-semibold text-[#0f172a]">{metric.value.toFixed(0)}%</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="space-y-2">
                  {repeatMerchantRows.length > 0 ? (
                    repeatMerchantRows.map((item) => (
                      <div key={item.merchant} className="rounded-[18px] bg-[#f8fafc] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#0f172a]">{item.merchant}</p>
                            <p className="mt-0.5 text-xs text-[#64748b]">
                              {item.category} · {item.cadenceLabel}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#0f172a]">{formatCurrency(item.total)}</p>
                            <p className="text-xs text-[#64748b]">{item.count} 笔</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-[220px] flex-col items-center justify-center rounded-[18px] bg-[#f8fafc] text-center">
                      <Store className="h-8 w-8 text-slate-300" />
                      <p className="mt-3 text-sm font-semibold text-slate-500">暂无重复商户</p>
                    </div>
                  )}
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={concentrationData}
                      margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                        width={72}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                        {concentrationData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="预算偏差与大额支出" action={<ActionDots />} />
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="h-[240px]">
                  {budgetVarianceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetVarianceData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" {...chartAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="budget" fill="#92C0F2" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="spent" fill="#2B6AF2" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty text="暂无预算对比" />
                  )}
                </div>
                <div className="space-y-2">
                  {data.insights.largeExpenses.length > 0 ? (
                    data.insights.largeExpenses.slice(0, 4).map((item) => (
                      <div key={`${item.merchant}-${item.date}`} className="rounded-[18px] bg-[#f8fafc] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#0f172a]">{item.merchant}</p>
                            <p className="mt-0.5 text-xs text-[#64748b]">{item.category} · {item.reason}</p>
                          </div>
                          <span className="font-numbers text-sm font-bold text-[#2B6AF2]">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <ChartEmpty text="暂无大额支出" />
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="时段热点与周末偏好" action={<ActionDots />} />
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="h-[240px]">
                  {hotspotData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={hotspotData}
                        margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" {...yAxisProps} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                          width={84}
                        />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
                          {hotspotData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty text="暂无热点数据" />
                  )}
                </div>

                <div className="h-[240px]">
                  {weekendPreferenceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekendPreferenceData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" {...chartAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === "weekend" ? "周末" : "工作日",
                          ]}
                        />
                        <Bar dataKey="weekend" fill="#4CC98F" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="weekday" fill="#2B6AF2" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty text="暂无周末偏好" />
                  )}
                </div>
              </div>
            </Card>
          </div>
        </DelayedRender>

        <DelayedRender delay={150}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Card>
              <CardHeader title="备注洞察" action={<ActionDots />} />
              <div className="h-[220px] sm:h-[260px]">
                {remarkBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={remarkBreakdownData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                        interval={0}
                        angle={-18}
                        textAnchor="end"
                        height={42}
                      />
                      <YAxis {...yAxisProps} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {remarkBreakdownData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-[18px] bg-[#f8fafc] text-center">
                    <ReceiptText className="h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-500">暂无备注图谱</p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="备注摘要" action={<ActionDots />} />
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "备注金额",
                    value: formatCurrency(data.insights.remarkOverview.total),
                    detail: `${data.insights.remarkOverview.share.toFixed(0)}% 支出已备注`,
                  },
                  {
                    label: "备注笔数",
                    value: `${data.insights.remarkOverview.count} 笔`,
                    detail: "当前筛选范围",
                  },
                  {
                    label: "备注种类",
                    value: `${data.insights.remarkOverview.distinctCount} 类`,
                    detail: "按文本去重",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] bg-[#f8fafc] px-3 py-3">
                    <p className="text-[11px] font-medium text-[#64748b]">{item.label}</p>
                    <p className="mt-1 text-base font-semibold text-[#0f172a]">{item.value}</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#94a3b8]">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {remarkBreakdownData.slice(0, 4).map((item) => (
                  <div key={item.name} className="rounded-[18px] bg-[#f8fafc] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0f172a]">{item.name}</p>
                        <p className="mt-0.5 text-xs text-[#64748b]">
                          {item.category} · {item.merchant}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#0f172a]">{formatCurrency(item.total)}</p>
                        <p className="text-xs text-[#64748b]">{item.count} 笔 · {item.share.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </DelayedRender>

        <DelayedRender delay={180}>
          <Card>
            <CardHeader title="分类堆叠趋势" action={<FilterBadge />} />
            <div className="h-[240px] sm:h-[320px]">
              {data.stackedBar.length > 0 && stackedKeys.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stackedBar} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" {...chartAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatCurrency(value)} />
                    {stackedKeys.map((key, index) => (
                      <Bar key={key} dataKey={key} stackId="consumption-stack" fill={CHART_COLORS[index % CHART_COLORS.length]} radius={index === stackedKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmpty text="暂无堆叠趋势数据" />
              )}
            </div>
          </Card>
        </DelayedRender>

        <DelayedRender delay={210}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
            <Card>
              <CardHeader title="热力日历" action={<ActionDots />} />
              {data.calendar.length > 0 ? (
                <CalendarHeatGrid calendar={data.calendar} />
              ) : (
                <ChartEmpty text="暂无日历热力" />
              )}
            </Card>

            <Card>
              <CardHeader title="周内 / 周末分布" action={<ActionDots />} />
              <div className="h-[240px] sm:h-[320px]">
                {data.weekdayWeekend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.weekdayWeekend}
                        dataKey="value"
                        innerRadius="55%"
                        outerRadius="82%"
                        paddingAngle={6}
                        stroke="none"
                      >
                        {data.weekdayWeekend.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty text="暂无周内分布" />
                )}
              </div>
            </Card>
          </div>
        </DelayedRender>

        <DelayedRender delay={240}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title="资金流向摘要" action={<ActionDots />} />
              <div className="h-[240px] sm:h-[320px]">
                {sankeyFlowData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sankeyFlowData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" {...yAxisProps} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                        width={130}
                      />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
                        {sankeyFlowData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty text="暂无资金流向" />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="时段散点与金额分布" action={<ActionDots />} />
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="h-[240px]">
                  {data.scatter.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" dataKey="hour" name="hour" unit="h" domain={[0, 24]} {...chartAxisProps} />
                        <YAxis type="number" dataKey="amount" name="amount" {...yAxisProps} />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value: number, name: string) => [
                            name === "amount" ? formatCurrency(value) : value,
                            name === "amount" ? "金额" : "小时",
                          ]}
                        />
                        <Scatter data={data.scatter} fill="#2B6AF2" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty text="暂无时段散点" />
                  )}
                </div>
                <div className="h-[240px]">
                  {data.histogram.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.histogram} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="range" {...chartAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `${value} 笔`} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {data.histogram.map((entry, index) => (
                            <Cell key={entry.range} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty text="暂无金额分布" />
                  )}
                </div>
              </div>
            </Card>
          </div>
        </DelayedRender>
      </div>

      <BottomSheet open={isAIDialogOpen} onOpenChange={handleDialogOpenChange}>
        <BottomSheetContent className="max-w-lg">
          <BottomSheetHeader>
            <BottomSheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2B6AF2]" />
              AI记一笔
            </BottomSheetTitle>
          </BottomSheetHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>支付平台</Label>
              <Select
                value={formState.platform}
                onValueChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    platform: value as TransactionFormState["platform"],
                  }))
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
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2B6AF2]">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-900">上传支付截图或小票</p>
                <p className="mt-1 text-sm text-slate-500">AI 会自动识别金额、商户、时间和分类</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 rounded-2xl bg-slate-900 hover:bg-slate-800"
                >
                  选择图片
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
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
                  <Button
                    type="button"
                    onClick={handleAIScan}
                    className="w-full rounded-2xl bg-[#2B6AF2] text-white hover:bg-[#245ad0]"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始识别
                  </Button>
                ) : null}

                {isScanning ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2B6AF2]" />
                    <p className="mt-3 text-sm font-medium text-slate-900">AI 正在识别图片</p>
                    <p className="mt-1 text-sm text-slate-500">稍等片刻，系统会自动回填交易信息</p>
                  </div>
                ) : null}
              </div>
            )}

            {(scanResult || selectedImage) ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>金额</Label>
                  <Input
                    type="number"
                    value={formState.amount}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, amount: event.target.value }))
                    }
                    placeholder="0.00"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>商户</Label>
                  <Input
                    value={formState.merchant}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, merchant: event.target.value }))
                    }
                    placeholder="请输入商户名称"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>时间</Label>
                  <Input
                    type="datetime-local"
                    value={formState.date}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, date: event.target.value }))
                    }
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>分类</Label>
                  <Select
                    value={formState.category || ""}
                    onValueChange={(value) =>
                      setFormState((current) => ({ ...current, category: value }))
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="选择分类" />
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
                  <Label>备注</Label>
                  <textarea
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="可补充商品、用途或备注信息"
                    className={THEME_TEXTAREA_CLASS}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {selectedImage ? (
            <BottomSheetFooter className="flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" className="rounded-2xl" onClick={resetAIDialog}>
                重新上传
              </Button>
              <Button
                type="button"
                className="rounded-2xl bg-slate-900 hover:bg-slate-800"
                onClick={handleAIConfirm}
              >
                确认入账
              </Button>
            </BottomSheetFooter>
          ) : null}
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
});

ConsumptionDefaultThemeView.displayName = "ConsumptionDefaultThemeView";

export function ConsumptionDefaultTheme(props: ConsumptionViewProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <ConsumptionDefaultThemeView
        {...props}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <FloatingFilter
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        module="consumption"
        transactionCount={props.data.transactions.length}
        dateFilter={props.dateFilter}
        onDateFilterChange={props.onDateFilterChange}
        customPeriod={props.customPeriod}
        onCustomPeriodChange={props.onCustomPeriodChange}
        platform={platformFilter}
        onPlatformChange={setPlatformFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </>
  );
}
