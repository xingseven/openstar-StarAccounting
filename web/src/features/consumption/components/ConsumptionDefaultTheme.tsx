"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { siAlipay, siWechat } from "simple-icons";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Camera,
  CalendarDays,
  CreditCard,
  Filter,
  Grid3X3,
  Network,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  Sparkles,
  Store,
  TimerReset,
} from "lucide-react";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { apiFetch } from "@/lib/api";
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
import { Skeleton } from "@/components/shared/Skeletons";
import {
  THEME_SURFACE_CLASS,
  ThemeDarkPanel,
  ThemeHero,
  ThemeMetricCard,
} from "@/components/shared/theme-primitives";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type ConsumptionData = {
  summary: {
    totalExpense: number;
    totalIncome: number;
    expenseCount: number;
    wechat: { expense: number; income: number };
    alipay: { expense: number; income: number };
  };
  platformDistribution: Array<{ name: string; value: number; fill: string }>;
  incomeExpense: Array<{ name: string; value: number; fill: string }>;
  merchants: Array<{ merchant: string; total: number; fill: string }>;
  trend: Array<{ day: string; total: number }>;
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
  }>;
};

interface ConsumptionViewProps {
  data: ConsumptionData;
  dateRangeLabel: string;
  loading?: boolean;
  usingMockData?: boolean;
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

const SURFACE_CLASS = THEME_SURFACE_CLASS;

const PLATFORM_LABELS: Record<string, string> = {
  wechat: "微信",
  alipay: "支付宝",
  cloudpay: "云闪付",
  unionpay: "云闪付",
  unknown: "其他",
};

const CATEGORY_OPTIONS = ["餐饮", "购物", "交通", "娱乐", "生活", "医疗", "教育", "其他"];

function getPlatformLabel(platform: string) {
  return PLATFORM_LABELS[platform] ?? platform;
}

function getPlatformBadge(platform: string) {
  if (platform === "wechat") {
    return (
      <div className="rounded-2xl bg-[#07c160]/10 p-2.5 ring-1 ring-[#07c160]/10">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d={siWechat.path} fill={`#${siWechat.hex}`} transform="translate(2 2) scale(0.83)" />
        </svg>
      </div>
    );
  }

  if (platform === "alipay") {
    return (
      <div className="rounded-2xl bg-[#1677ff]/10 p-2.5 ring-1 ring-[#1677ff]/10">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d={siAlipay.path} fill={`#${siAlipay.hex}`} transform="translate(2 2) scale(0.83)" />
        </svg>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-100 p-2.5 ring-1 ring-slate-200">
      <CreditCard className="h-5 w-5 text-slate-600" />
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: "blue" | "green" | "red" | "slate";
}) {
  return (
    <ThemeMetricCard label={label} value={value} detail={detail} tone={accent} detailPosition="badge" className="p-3.5 sm:p-4" />
  );
}

function MerchantRow({ merchant, total, fill }: { merchant: string; total: number; fill: string }) {
  return (
    <div className="rounded-[20px] bg-slate-50/90 px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fill }} />
          <span className="truncate text-sm font-medium text-slate-900">{merchant}</span>
        </div>
        <span className="text-sm font-semibold text-slate-950">{formatCurrency(total)}</span>
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
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-slate-100 bg-slate-50/70 px-3 py-3 transition hover:border-slate-200 hover:bg-white sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            isIncome ? "bg-emerald-50 text-emerald-600" : "bg-slate-900 text-white"
          )}
        >
          {isIncome ? <ArrowDownRight className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{transaction.merchant}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span>{transaction.date}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{transaction.category}</span>
            <span>{getPlatformLabel(transaction.platform)}</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className={cn("text-sm font-semibold sm:text-base", isIncome ? "text-emerald-600" : "text-slate-950")}>
          {isIncome ? "+" : "-"}
          {formatCurrency(Number(transaction.amount), { withSymbol: false, decimals: 2 })}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">{isIncome ? "收入" : "支出"}</p>
      </div>
    </div>
  );
}

function HeatmapGrid({ data }: { data: ConsumptionData["heatmap"] }) {
  const maxValue = Math.max(...data.data.map((item) => item.total), 1);
  const valueMap = new Map(data.data.map((item) => [`${item.platform}::${item.category}`, item.total]));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[540px]">
        <div className="grid grid-cols-[120px_repeat(4,minmax(88px,1fr))] gap-2">
          <div />
          {data.platforms.slice(0, 4).map((platform) => (
            <div key={platform} className="px-2 py-1 text-center text-xs font-medium text-slate-500">
              {platform}
            </div>
          ))}
        </div>

        <div className="mt-2 space-y-2">
          {data.categories.slice(0, 6).map((category) => (
            <div key={category} className="grid grid-cols-[120px_repeat(4,minmax(88px,1fr))] gap-2">
              <div className="flex items-center text-sm font-medium text-slate-700">{category}</div>
              {data.platforms.slice(0, 4).map((platform) => {
                const value = valueMap.get(`${platform}::${category}`) ?? 0;
                const opacity = value > 0 ? 0.12 + (value / maxValue) * 0.55 : 0.04;

                return (
                  <div
                    key={`${platform}-${category}`}
                    className="rounded-2xl border border-slate-100 px-2 py-3 text-center text-xs font-medium text-slate-700"
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
    </div>
  );
}

function CalendarHeatGrid({ calendar }: { calendar: ConsumptionData["calendar"] }) {
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
          <div key={`blank-${index}`} className="h-12 rounded-2xl bg-transparent" />
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
              className="flex h-12 flex-col items-center justify-center rounded-2xl border border-white/70 text-center shadow-sm"
              style={{ backgroundColor: background }}
              title={`${item.date}: ${formatCurrency(item.value)}`}
            >
              <span className={cn("text-xs font-semibold", intensity > 0.4 ? "text-white" : "text-slate-800")}>{item.day}</span>
              {item.value > 0 ? (
                <span className={cn("mt-0.5 text-[10px]", intensity > 0.4 ? "text-blue-50" : "text-slate-500")}>
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
  loading = false,
  usingMockData = false,
}: ConsumptionViewProps) {
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [formState, setFormState] = useState<TransactionFormState>({
    amount: "",
    merchant: "",
    date: "",
    category: "",
    description: "",
    platform: "alipay",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const isSkeletonVisible = loading || showInitialSkeleton;
  const balance = data.summary.totalIncome - data.summary.totalExpense;
  const avgPerExpense = data.summary.expenseCount > 0 ? data.summary.totalExpense / data.summary.expenseCount : 0;
  const topCategory = data.pareto[0];
  const topMerchant = data.merchants[0];
  const lowerSearchTerm = searchTerm.trim().toLowerCase();
  const incomeExpenseTotal = data.incomeExpense.reduce((accumulator, item) => accumulator + item.value, 0);

  const filteredTransactions = useMemo(
    () =>
      data.transactions.filter((transaction) => {
        const matchesSearch =
          lowerSearchTerm === "" ||
          transaction.merchant.toLowerCase().includes(lowerSearchTerm) ||
          transaction.category.toLowerCase().includes(lowerSearchTerm);
        const matchesPlatform = platformFilter === "all" || transaction.platform === platformFilter;
        return matchesSearch && matchesPlatform;
      }),
    [data.transactions, lowerSearchTerm, platformFilter]
  );

  const trendOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        formatter: (params: Array<{ axisValue: string; value: number }>) =>
          `${params[0]?.axisValue ?? ""}<br/>消费 ${formatCurrency(Number(params[0]?.value ?? 0))}`,
      },
      grid: { left: 16, right: 12, top: 24, bottom: 24, containLabel: true },
      xAxis: {
        type: "category",
        data: data.trend.map((item) => item.day.slice(5)),
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
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 7,
          data: data.trend.map((item) => item.total),
          lineStyle: { color: "#2563eb", width: 3 },
          itemStyle: { color: "#2563eb", borderColor: "#ffffff", borderWidth: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(37,99,235,0.24)" },
                { offset: 1, color: "rgba(37,99,235,0.02)" },
              ],
            },
          },
        },
      ],
    }),
    [data.trend]
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
          radius: ["58%", "80%"],
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
          radius: ["54%", "78%"],
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
      grid: { left: 0, right: 8, top: 8, bottom: 0, containLabel: true },
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
          right: 12,
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
          },
          data: data.sankey.nodes.map((node, index) => ({
            ...node,
            itemStyle: {
              color: ["#16a34a", "#0f766e", "#1677ff", "#2563eb", "#22c55e", "#60a5fa", "#f59e0b", "#ef4444"][index % 8],
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
      const errorMessage = error instanceof Error ? error.message : "AI 识别失败，请重试";
      alert(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleAIConfirm() {
    if (!formState.amount || !formState.merchant) {
      alert("请填写金额和商户");
      return;
    }

    try {
      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(formState.amount),
          type: "EXPENSE",
          category: formState.category || "其他",
          platform: formState.platform,
          merchant: formState.merchant,
          description: formState.description,
          date: formState.date ? formState.date.split("T")[0] : new Date().toISOString().split("T")[0],
        }),
      });

      alert("记账成功");
      setIsAIDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("保存失败，请重试");
    }
  }

  if (isSkeletonVisible) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 sm:space-y-5">
        <Skeleton className="h-[300px] rounded-[30px]" />
        <div className="grid gap-3 md:grid-cols-4">
          <Skeleton className="h-[120px] rounded-[24px]" />
          <Skeleton className="h-[120px] rounded-[24px]" />
          <Skeleton className="h-[120px] rounded-[24px]" />
          <Skeleton className="h-[120px] rounded-[24px]" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.92fr)]">
          <Skeleton className="h-[330px] rounded-[24px]" />
          <Skeleton className="h-[330px] rounded-[24px]" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <Skeleton className="h-[320px] rounded-[24px]" />
          <Skeleton className="h-[320px] rounded-[24px]" />
        </div>
        <Skeleton className="h-[420px] rounded-[24px]" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5">
        <DelayedRender delay={0}>
        <ThemeHero className="p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),transparent_70%)] lg:block" />
            <div className="absolute -right-20 top-8 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl sm:h-56 sm:w-56" />

            <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.92fr)]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
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
                      ? "当前为演示数据。接入真实账单后，这里会自动切换为真实消费看板。"
                      : "当前展示真实账单数据，图表和流水会跟随导入结果更新。"}
                  </p>
                  <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">本月总支出</p>
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
                  <MetricCard label="支出笔数" value={`${data.summary.expenseCount} 笔`} detail="本期记录" accent="blue" />
                  <MetricCard label="笔均支出" value={formatCurrency(avgPerExpense)} detail="平均客单价" accent="slate" />
                  <MetricCard
                    label="最高分类"
                    value={topCategory ? topCategory.name : "暂无"}
                    detail={topCategory ? `${topCategory.cumulativePercentage.toFixed(0)}% 累积贡献` : "等待数据"}
                    accent="green"
                  />
                </div>
              </div>

              <ThemeDarkPanel className="p-5 shadow-none sm:shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
                <div className="flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="搜索商户或分类"
                        className="h-11 rounded-2xl border-white/10 bg-white/6 pl-10 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/6 text-white shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部平台</SelectItem>
                        <SelectItem value="wechat">微信</SelectItem>
                        <SelectItem value="alipay">支付宝</SelectItem>
                        <SelectItem value="cloudpay">云闪付</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <AIAnalysisCard
                      transactions={data.transactions.map((transaction) => ({
                        id: transaction.id,
                        amount: parseFloat(transaction.amount) || 0,
                        category: transaction.category,
                        platform: transaction.platform,
                        date: transaction.date,
                        merchant: transaction.merchant,
                        description: "",
                      }))}
                      budgets={[]}
                      compact
                      className="w-full"
                    />

                    <Button
                      onClick={openAIDialog}
                      className="h-11 rounded-2xl bg-white text-slate-950 shadow-none hover:bg-blue-50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      AI 记账
                    </Button>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-transparent bg-transparent p-0 sm:border-white/10 sm:bg-white/6 sm:p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100/60">Leading Merchant</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-100">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{topMerchant?.merchant ?? "暂无商户"}</p>
                      <p className="mt-1 truncate text-xs text-slate-300/75">
                        {topMerchant ? `${formatCurrency(topMerchant.total)} · 本期最高消费商户` : "记录交易后自动生成消费重点商户"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.platformDistribution.slice(0, 4).map((platform) => (
                    <div key={platform.name} className="rounded-[20px] bg-transparent px-0 py-2.5 sm:bg-white/6 sm:px-3 sm:py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-white">{platform.name}</span>
                        <span className="text-xs text-slate-300/75">{formatCurrency(platform.value, { compact: true })}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(8, (platform.value / Math.max(data.summary.totalExpense, 1)) * 100)}%`,
                            backgroundColor: platform.fill,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ThemeDarkPanel>
            </div>
          </ThemeHero>
        </DelayedRender>

        <DelayedRender delay={60}>
          <section className="grid gap-3 md:grid-cols-4">
            <MetricCard label="本月支出" value={formatCurrency(data.summary.totalExpense)} detail="消费总额" accent="red" />
            <MetricCard label="本月收入" value={formatCurrency(data.summary.totalIncome)} detail="已入账金额" accent="green" />
            <MetricCard label="Top 分类" value={topCategory ? formatCurrency(topCategory.value, { compact: true }) : "暂无"} detail={topCategory?.name ?? "等待数据"} accent="blue" />
            <MetricCard label="筛选结果" value={`${filteredTransactions.length} 笔`} detail={platformFilter === "all" ? "全部平台" : getPlatformLabel(platformFilter)} accent="slate" />
          </section>
        </DelayedRender>

        <DelayedRender delay={120}>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.92fr)]">
            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">消费趋势</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">每日支出走势</h2>
                  <p className="mt-1 text-sm text-slate-500">观察本期消费波动，找出高峰日和资金节奏变化。</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {dateRangeLabel}
                </span>
              </div>

              <div className="mt-5 h-[300px] w-full">
                <ReactECharts option={trendOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </div>

            <div className="space-y-4">
              <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
                <div>
                  <p className="text-sm font-medium text-slate-500">平台分布</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">支付渠道占比</h2>
                </div>

                <div className="mt-5 grid items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="mx-auto h-[180px] w-[180px]">
                    <ReactECharts option={platformOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
                  </div>

                  <div className="space-y-2.5">
                    {data.platformDistribution.map((platform) => (
                      <div key={platform.name} className="flex items-center justify-between gap-3 rounded-[18px] bg-slate-50 px-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-3">
                          {getPlatformBadge(platform.name === "微信" ? "wechat" : platform.name === "支付宝" ? "alipay" : "cloudpay")}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{platform.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {((platform.value / Math.max(data.summary.totalExpense, 1)) * 100).toFixed(1)}% 占比
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-950">{formatCurrency(platform.value, { compact: true })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <AIAnalysisCard
                transactions={data.transactions.map((transaction) => ({
                  id: transaction.id,
                  amount: parseFloat(transaction.amount) || 0,
                  category: transaction.category,
                  platform: transaction.platform,
                  date: transaction.date,
                  merchant: transaction.merchant,
                  description: "",
                }))}
                budgets={[]}
              />
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={180}>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">商户榜单</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">本期消费最高的商户</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  Top {Math.min(6, data.merchants.length)}
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {data.merchants.slice(0, 6).map((merchant) => (
                  <MerchantRow key={merchant.merchant} merchant={merchant.merchant} total={merchant.total} fill={merchant.fill} />
                ))}
              </div>

              <div className="mt-6 h-[260px] w-full">
                <ReactECharts option={categoryOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">平台 × 分类</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">消费热区矩阵</h2>
                  <p className="mt-1 text-sm text-slate-500">快速看出不同支付平台上，哪类消费最集中。</p>
                </div>
                <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                  <Grid3X3 className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5">
                {data.heatmap.data.length === 0 ? (
                  <EmptyState
                    icon={Grid3X3}
                    title="暂无热区数据"
                    description="记录更多分类后，这里会显示平台和消费分类之间的分布关系。"
                    className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50"
                  />
                ) : (
                  <HeatmapGrid data={data.heatmap} />
                )}
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={220}>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">收支对比</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">本期收入与支出</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {incomeExpenseTotal > 0 ? `${((data.summary.totalExpense / incomeExpenseTotal) * 100).toFixed(0)}% 为支出` : "等待数据"}
                </span>
              </div>

              <div className="mt-5 grid items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div className="mx-auto h-[180px] w-[180px]">
                  <ReactECharts option={incomeExpenseOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
                </div>

                <div className="space-y-2.5">
                  {data.incomeExpense.map((item) => (
                    <div key={item.name} className="rounded-[18px] bg-slate-50 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-900">{item.name}</span>
                        <span className="text-sm font-semibold text-slate-950">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(8, (item.value / Math.max(incomeExpenseTotal, 1)) * 100)}%`,
                            backgroundColor: item.fill,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">分类堆叠</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">每日消费分类组成</h2>
                  <p className="mt-1 text-sm text-slate-500">看每一天的消费是由哪些主要分类堆出来的。</p>
                </div>
              </div>

              <div className="mt-5 h-[320px] w-full">
                <ReactECharts option={stackedBarOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={260}>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">消费日历</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">每日消费强度分布</h2>
                  <p className="mt-1 text-sm text-slate-500">把本期的高低消费日放到日历上，看月内节奏更直观。</p>
                </div>
                <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5">
                <CalendarHeatGrid calendar={data.calendar} />
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">周内平均</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">按星期观察消费习惯</h2>
                </div>
                <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                  <TimerReset className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 h-[320px] w-full">
                <ReactECharts option={weekdayOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={300}>
          <section className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">资金流向</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">消费路径桑基图</h2>
                <p className="mt-1 text-sm text-slate-500">从支付平台流向分类，快速看清消费主路径。</p>
              </div>
              <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                <Network className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 h-[360px] w-full">
              <ReactECharts option={sankeyOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={340}>
          <section className="grid gap-4 xl:grid-cols-2">
            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div>
                <p className="text-sm font-medium text-slate-500">消费时段分布</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">24 小时消费散点图</h2>
              </div>

              <div className="mt-5 h-[320px] w-full">
                <ReactECharts option={scatterOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div>
                <p className="text-sm font-medium text-slate-500">金额分布</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">单笔消费直方图</h2>
              </div>

              <div className="mt-5 h-[320px] w-full">
                <ReactECharts option={histogramOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </div>
          </section>
        </DelayedRender>

        <DelayedRender delay={380}>
          <section className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">交易明细</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">筛选后的消费流水</h2>
                <p className="mt-1 text-sm text-slate-500">搜索商户、分类或按支付平台筛选最近交易。</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Filter className="h-3.5 w-3.5" />
                {filteredTransactions.length} 笔结果
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {filteredTransactions.length === 0 ? (
                <EmptyState
                  icon={ReceiptText}
                  title="没有匹配到交易"
                  description="换一个关键词或平台筛选条件试试。"
                  className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50"
                />
              ) : (
                filteredTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)
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
                  <Button onClick={handleAIScan} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700">
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始识别
                  </Button>
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
                      {CATEGORY_OPTIONS.map((category) => (
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
                    className="min-h-[96px] w-full rounded-[20px] border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
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
