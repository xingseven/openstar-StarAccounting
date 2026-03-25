"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Banknote,
  Building,
  Calendar,
  CreditCard,
  HandCoins,
  Home,
  Landmark,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeletons";
import {
  THEME_ICON_BUTTON_CLASS,
  ThemeHero,
  ThemeMetricCard,
  ThemeSectionHeader,
  ThemeSurface,
} from "@/components/shared/theme-primitives";
import { formatCurrency } from "@/lib/utils";
import type { Loan } from "@/types";

export type { Loan };

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface LoansViewProps {
  items: Loan[];
  platformData: Array<{ name: string; value: number; fill: string }>;
  paidVsRemainingData: Array<{ platform: string; paid: number; remaining: number }>;
  loading?: boolean;
  reconcileLoadingId?: string | null;
  onOpenCreate: () => void;
  onOpenEdit: (item: Loan) => void;
  onOpenSchedule: (item: Loan) => void;
  onRepay: (item: Loan) => void;
  onReconcile: (item: Loan) => void;
}

function getIcon(platform: string) {
  if (platform.includes("房")) return <Home className="h-5 w-5 text-blue-600" />;
  if (platform.includes("车")) return <CreditCard className="h-5 w-5 text-violet-600" />;
  if (platform.includes("银行")) return <Landmark className="h-5 w-5 text-red-600" />;
  return <Building className="h-5 w-5 text-slate-500" />;
}

function LoanCard({
  item,
  onOpenEdit,
  onOpenSchedule,
  onRepay,
  onReconcile,
  isReconciling,
}: {
  item: Loan;
  onOpenEdit: (item: Loan) => void;
  onOpenSchedule: (item: Loan) => void;
  onRepay: (item: Loan) => void;
  onReconcile: (item: Loan) => void;
  isReconciling: boolean;
}) {
  const progress = item.totalAmount > 0 ? Math.min(100, ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100) : 0;
  const mobileLightOutlineButtonClass =
    "h-10 justify-center rounded-xl border-transparent bg-slate-100 px-4 text-xs font-medium text-slate-700 hover:bg-slate-200 sm:border-border sm:bg-background sm:text-sm sm:text-foreground sm:hover:bg-muted";

  return (
    <ThemeSurface className="group p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-transparent bg-slate-50 sm:border-slate-200">
            {getIcon(item.platform)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950 sm:text-lg">{item.platform}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
              <Calendar className="h-3.5 w-3.5" />
              每月 {item.dueDate} 日还款
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenEdit(item)}
          className={`${THEME_ICON_BUTTON_CLASS} h-10 w-10 rounded-xl`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5">
        <div className="grid grid-cols-2 gap-3 rounded-[18px] bg-slate-50/70 px-4 py-3 sm:bg-transparent sm:px-0 sm:py-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
              <Banknote className="h-4 w-4" />
              月供
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-950 sm:text-base">{formatCurrency(item.monthlyPayment)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 sm:text-sm">剩余本金</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 sm:text-base">{formatCurrency(item.remainingAmount)}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500 sm:text-sm">
            <span>进度 {progress.toFixed(1)}%</span>
            <span>
              {item.paidPeriods} / {item.periods} 期
            </span>
          </div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-blue-600" />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="text-slate-500">已还 {formatCurrency(item.totalAmount - item.remainingAmount)}</span>
            <span className="font-medium text-slate-900">总额 {formatCurrency(item.totalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button type="button" variant="outline" className={mobileLightOutlineButtonClass} onClick={() => onOpenSchedule(item)}>
            <Calendar className="mr-2 h-4 w-4" />
            还款计划
          </Button>
          <Button type="button" className="h-10 justify-center rounded-xl bg-slate-900 px-4 text-xs font-medium hover:bg-slate-800 sm:text-sm" onClick={() => onRepay(item)}>
            <HandCoins className="mr-2 h-4 w-4" />
            登记还款
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-center rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
          onClick={() => onReconcile(item)}
          disabled={isReconciling}
        >
          {isReconciling ? "扫描中..." : "扫描历史还款"}
        </Button>
      </div>
    </ThemeSurface>
  );
}

export function LoansDefaultTheme({
  items,
  platformData,
  paidVsRemainingData,
  loading = false,
  reconcileLoadingId = null,
  onOpenCreate,
  onOpenEdit,
  onOpenSchedule,
  onRepay,
  onReconcile,
}: LoansViewProps) {
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const isSkeletonVisible = loading || showInitialSkeleton;
  const totalRemaining = useMemo(() => items.reduce((sum, item) => sum + item.remainingAmount, 0), [items]);
  const totalPaid = useMemo(() => items.reduce((sum, item) => sum + (item.totalAmount - item.remainingAmount), 0), [items]);
  const totalMonthlyPayment = useMemo(() => items.reduce((sum, item) => sum + item.monthlyPayment, 0), [items]);

  if (isSkeletonVisible) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 sm:space-y-5">
        <Skeleton className="h-[220px] rounded-[28px]" />
        <div className="grid gap-3 md:grid-cols-4">
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-[320px] rounded-[24px]" />
          <Skeleton className="h-[320px] rounded-[24px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[250px] rounded-[24px]" />
          ))}
        </div>
      </div>
    );
  }

  const platformOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["42%", "72%"],
        label: { show: true, formatter: "{b}" },
        data: platformData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.fill },
        })),
      },
    ],
  };

  const progressOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: ["已还", "剩余"],
      top: 0,
      left: "center",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#64748b", fontSize: 11 },
    },
    grid: { left: 44, right: 16, top: 52, bottom: 50 },
    xAxis: {
      type: "category",
      data: paidVsRemainingData.map((item) => item.platform),
      axisLabel: { rotate: -18, color: "#64748b", fontSize: 11, margin: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
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
        name: "已还",
        type: "bar",
        stack: "total",
        data: paidVsRemainingData.map((item) => item.paid),
        itemStyle: { color: "#1d4ed8" },
      },
      {
        name: "剩余",
        type: "bar",
        stack: "total",
        data: paidVsRemainingData.map((item) => item.remaining),
        itemStyle: { color: "#93c5fd" },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 sm:space-y-5">
      <DelayedRender delay={0}>
        <ThemeHero className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">贷款工作台</h1>
              <p className="mt-1 text-sm text-slate-500">统一查看贷款余额、月供压力和平台分布。</p>
            </div>

            <Button onClick={onOpenCreate} className="h-10 rounded-2xl bg-slate-900 px-4 text-sm font-medium hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" />
              新增贷款
            </Button>
          </div>
        </ThemeHero>
      </DelayedRender>

      <DelayedRender delay={60}>
        <div className="grid gap-3 md:grid-cols-4">
          <ThemeMetricCard label="待还总额" value={formatCurrency(totalRemaining)} detail="当前负债" tone="red" icon={Landmark} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="已还金额" value={formatCurrency(totalPaid)} detail="累计偿付" tone="green" icon={HandCoins} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="月供合计" value={formatCurrency(totalMonthlyPayment)} detail="每月固定支出" tone="blue" icon={Banknote} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="贷款数量" value={`${items.length} 笔`} detail="当前管理中" tone="slate" icon={Building} className="p-4" hideDetailOnMobile />
        </div>
      </DelayedRender>

      <DelayedRender delay={120}>
        {items.length === 0 ? (
          <ThemeSurface className="p-8">
            <EmptyState icon={Landmark} title="暂无贷款记录" description="开始添加你的第一笔贷款吧。" />
          </ThemeSurface>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <LoanCard
                key={item.id}
                item={item}
                onOpenEdit={onOpenEdit}
                onOpenSchedule={onOpenSchedule}
                onRepay={onRepay}
                onReconcile={onReconcile}
                isReconciling={reconcileLoadingId === item.id}
              />
            ))}
            </div>
          )}
      </DelayedRender>

      {items.length > 0 ? (
        <DelayedRender delay={180}>
          <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
            <ThemeSurface className="p-4 sm:p-5 lg:p-6">
              <ThemeSectionHeader eyebrow="贷款分布" title="剩余本金结构" description="看不同平台上的贷款余额占比。" />
              <div className="mt-4 h-[280px] w-full sm:h-[300px]">
                <ReactECharts option={platformOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </ThemeSurface>

            <ThemeSurface className="p-4 sm:p-5 lg:p-6">
              <ThemeSectionHeader eyebrow="还款进度" title="已还 vs 剩余" description="不同贷款的偿还进度对比。" />
              <div className="mt-4 h-[280px] w-full sm:h-[300px]">
                <ReactECharts option={progressOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </ThemeSurface>
          </div>
        </DelayedRender>
      ) : null}
    </div>
  );
}
