"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CreditCard,
  PiggyBank,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { GridDecoration } from "@/components/shared/GridDecoration";
import { Skeleton } from "@/components/shared/Skeletons";
import {
  THEME_SURFACE_CLASS,
  ThemeMetricCard,
  ThemeSurface,
} from "@/components/shared/theme-primitives";
import type { DashboardData } from "@/types";

interface DashboardViewProps {
  data: DashboardData;
  loading?: boolean;
}

type AlertStatus = "normal" | "warning" | "overdue";

const SURFACE_CLASS = THEME_SURFACE_CLASS;

const STAT_TONE_CLASS: Record<"blue" | "red" | "green" | "amber", string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
};

type Tone = "blue" | "red" | "green" | "amber";

const ALERT_STYLE: Record<AlertStatus, { badge: string; line: string; text: string; icon: LucideIcon; label: string }> = {
  normal: {
    badge: "bg-slate-100 text-slate-600",
    line: "from-slate-300 to-slate-100",
    text: "text-slate-700",
    icon: AlertCircle,
    label: "正常",
  },
  warning: {
    badge: "bg-amber-100 text-amber-700",
    line: "from-amber-400 to-amber-100",
    text: "text-amber-700",
    icon: AlertTriangle,
    label: "预警",
  },
  overdue: {
    badge: "bg-red-100 text-red-700",
    line: "from-red-500 to-red-100",
    text: "text-red-700",
    icon: ShieldAlert,
    label: "超支",
  },
};

const CATEGORY_COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#ef4444", "#7c3aed"];

type InsightItem = {
  label: string;
  value: string;
  description: string;
  tone: Tone;
  icon: LucideIcon;
};

export function DashboardDefaultTheme({ data, loading }: DashboardViewProps) {
  const [alertsDismissed, setAlertsDismissed] = useState(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const isSkeletonVisible = loading || showInitialSkeleton;

  const netWorth = data.totalAssets - data.totalDebt;
  const monthlyBalance = data.monthIncome - data.monthExpense;
  const savingsDelta = data.monthSavingsIncome - data.monthSavingsExpense;
  const debtRatio = data.totalAssets > 0 ? Math.min(100, (data.totalDebt / data.totalAssets) * 100) : 0;
  const savingsRate = data.monthIncome > 0 ? (monthlyBalance / data.monthIncome) * 100 : 0;
  const criticalAlerts = data.budgetAlerts.filter((alert) => alert.status !== "normal");
  const overdueAlerts = data.budgetAlerts.filter((alert) => alert.status === "overdue").length;
  const warningAlerts = data.budgetAlerts.filter((alert) => alert.status === "warning").length;
  const recentTransactions = data.recentTransactions.slice(0, 5);

  const periodLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
      }).format(new Date()),
    []
  );

  const cashFlowData = [
    { name: "支出", value: data.monthExpense, color: "#ef4444" },
    { name: "收入", value: data.monthIncome, color: "#2563eb" },
    { name: "结余", value: Math.max(monthlyBalance, 0), color: "#0f766e" },
  ];

  const categoryDistribution = useMemo(() => {
    const totals = new Map<string, number>();

    data.recentTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .forEach((transaction) => {
        const key = transaction.category || "未分类";
        totals.set(key, (totals.get(key) ?? 0) + Number(transaction.amount));
      });

    const values = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));

    if (values.length > 0) {
      return values;
    }

    return [
      { name: "餐饮美食", value: 2450, color: CATEGORY_COLORS[0] },
      { name: "购物消费", value: 1800, color: CATEGORY_COLORS[1] },
      { name: "日常缴费", value: 1200, color: CATEGORY_COLORS[2] },
      { name: "交通出行", value: 800, color: CATEGORY_COLORS[3] },
      { name: "休闲娱乐", value: 600, color: CATEGORY_COLORS[4] },
    ];
  }, [data.recentTransactions]);

  const insightItems: InsightItem[] = [
    {
      label: "负债占比",
      value: `${debtRatio.toFixed(0)}%`,
      description: data.totalDebt > 0 ? `总负债 ${formatCurrency(data.totalDebt)}` : "当前无负债压力",
      tone: "blue" as const,
      icon: CreditCard,
    },
    {
      label: "预算预警",
      value: `${criticalAlerts.length} 项`,
      description: overdueAlerts > 0 ? `${overdueAlerts} 项已超支` : warningAlerts > 0 ? `${warningAlerts} 项接近上限` : "预算执行稳定",
      tone: criticalAlerts.length > 0 ? "red" : "blue",
      icon: ShieldAlert,
    },
    {
      label: "储蓄净流入",
      value: formatCurrency(savingsDelta),
      description: savingsDelta >= 0 ? "本月存下来的钱在增加" : "本月储蓄有回撤",
      tone: savingsDelta >= 0 ? "green" : "amber",
      icon: PiggyBank,
    },
  ];

  if (isSkeletonVisible) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-3 sm:space-y-5">
        <Skeleton className="h-[220px] rounded-[24px] sm:h-[280px] sm:rounded-[32px]" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-[104px] rounded-[22px] sm:h-[128px] sm:rounded-[28px]" />
          <Skeleton className="h-[104px] rounded-[22px] sm:h-[128px] sm:rounded-[28px]" />
          <Skeleton className="h-[104px] rounded-[22px] sm:h-[128px] sm:rounded-[28px]" />
          <Skeleton className="h-[104px] rounded-[22px] sm:h-[128px] sm:rounded-[28px]" />
        </div>
        <div className="grid gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <div className="space-y-3 sm:space-y-5">
            <Skeleton className="h-[280px] rounded-[22px] sm:h-[340px] sm:rounded-[28px]" />
            <Skeleton className="h-[340px] rounded-[22px] sm:h-[420px] sm:rounded-[28px]" />
          </div>
          <div className="space-y-3 sm:space-y-5">
            <Skeleton className="h-[190px] rounded-[22px] sm:h-[240px] sm:rounded-[28px]" />
            <Skeleton className="h-[220px] rounded-[22px] sm:h-[260px] sm:rounded-[28px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 pb-1 sm:space-y-5 sm:pb-2">
      <DelayedRender delay={0}>
        <section className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-[28px] sm:p-6 lg:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.14),transparent_70%)] lg:block" />
          <div className="absolute -right-20 top-8 h-40 w-40 rounded-full bg-blue-200/35 blur-3xl sm:-right-24 sm:top-10 sm:h-56 sm:w-56" />
          <div className="absolute left-6 top-0 h-28 w-28 rounded-full bg-white/80 blur-3xl sm:left-10 sm:h-40 sm:w-40" />
          <GridDecoration mode="light" opacity={0.05} className="mix-blend-multiply" />

          <div className="relative z-10">
            <div className="space-y-3 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100 sm:gap-2 sm:px-3 sm:text-xs">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  总览仪表盘
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white sm:gap-2 sm:px-3 sm:text-xs">
                  <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {periodLabel}
                </span>
              </div>

              <div className="space-y-2.5 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <p className="hidden max-w-xl text-[13px] leading-5 text-slate-600 sm:block sm:text-sm sm:leading-6">
                    资产、负债、现金流和预算风险放在同一屏里，优先看见本月真正影响决策的数字。
                  </p>
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-2 sm:gap-x-6 sm:gap-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 sm:text-sm">当前净资产</p>
                      <h1 className="mt-1 text-[1.75rem] font-semibold tracking-tight text-slate-950 sm:mt-2 sm:text-5xl">
                        {formatCurrency(netWorth)}
                      </h1>
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm",
                        monthlyBalance >= 0
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : "bg-red-50 text-red-700 ring-red-100"
                      )}
                    >
                      {monthlyBalance >= 0 ? <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                      本月结余 {formatCurrency(monthlyBalance)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <HeroStatCard
                    label="总资产"
                    value={formatCurrency(data.totalAssets)}
                    mobileValue={formatCurrency(data.totalAssets, { compact: true })}
                    detail="含资产和储蓄计划"
                    tone="blue"
                    icon={Wallet}
                  />
                  <HeroStatCard
                    label="总负债"
                    value={formatCurrency(data.totalDebt)}
                    mobileValue={formatCurrency(data.totalDebt, { compact: true })}
                    detail={data.totalDebt > 0 ? "持续关注偿付节奏" : "当前状态健康"}
                    tone="red"
                    icon={CreditCard}
                  />
                  <HeroStatCard
                    label="储蓄净流入"
                    value={formatCurrency(savingsDelta)}
                    mobileValue={formatCurrency(savingsDelta, { compact: true })}
                    detail={`${formatCurrency(data.monthSavingsIncome)} 流入 / ${formatCurrency(data.monthSavingsExpense)} 流出`}
                    tone={savingsDelta >= 0 ? "green" : "amber"}
                    icon={PiggyBank}
                  />
                </div>

                <FundsHealthPanel items={insightItems} />
              </div>

              {criticalAlerts.length > 0 && !alertsDismissed ? (
                <div className="hidden flex-wrap items-center justify-between gap-2.5 rounded-[20px] border border-amber-200/70 bg-white/70 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:flex sm:gap-3 sm:rounded-[24px] sm:px-4 sm:py-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-2 text-amber-700 sm:rounded-2xl">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 sm:text-sm">预算提醒正在升温</p>
                      <p className="text-xs text-slate-600 sm:text-sm">
                        当前有 {criticalAlerts.length} 项预算需要关注，其中 {overdueAlerts} 项已经超支。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/budgets"
                      className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      查看预算
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAlertsDismissed(true)}
                      className="rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      暂时收起
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </DelayedRender>

      <DelayedRender delay={40}>
        <div className="xl:hidden">
          <BudgetFocusPanel alerts={data.budgetAlerts} />
        </div>
      </DelayedRender>

      <DelayedRender delay={60}>
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <MetricRailCard
            label="本月支出"
            value={formatCurrency(data.monthExpense)}
            mobileValue={formatCurrency(data.monthExpense, { compact: true })}
            detail="本月消费总额"
            icon={CreditCard}
            tone="red"
          />
          <MetricRailCard
            label="本月收入"
            value={formatCurrency(data.monthIncome)}
            mobileValue={formatCurrency(data.monthIncome, { compact: true })}
            detail="已记录入账"
            icon={Banknote}
            tone="blue"
          />
          <MetricRailCard
            label="本月结余率"
            value={`${savingsRate.toFixed(0)}%`}
            detail={monthlyBalance >= 0 ? "现金流处于正向区间" : "本月支出高于收入"}
            icon={monthlyBalance >= 0 ? TrendingUp : TrendingDown}
            tone={monthlyBalance >= 0 ? "green" : "amber"}
          />
          <MetricRailCard
            label="预算关注"
            value={`${criticalAlerts.length} 项`}
            mobileValue={`${criticalAlerts.length} 项`}
            detail={criticalAlerts.length > 0 ? "建议优先处理高风险预算" : "预算执行稳定"}
            icon={ShieldAlert}
            tone={criticalAlerts.length > 0 ? "amber" : "blue"}
          />
        </section>
      </DelayedRender>

      <DelayedRender delay={120}>
        <section className="grid gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.92fr)]">
          <div className="space-y-3 sm:space-y-5">
            <div className="grid gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.85fr)]">
              <div className={cn(SURFACE_CLASS, "self-start p-4 sm:p-5 lg:p-6")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">本月现金流</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950 sm:text-xl">收入、支出与可留存空间</h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 sm:px-3 sm:text-xs",
                      monthlyBalance >= 0
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                        : "bg-red-50 text-red-700 ring-red-100"
                    )}
                  >
                    结余 {formatCurrency(monthlyBalance)}
                  </span>
                </div>

                <div className="mt-3 grid gap-2.5 sm:mt-5 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_170px]">
                  <div className="h-[152px] min-w-0 sm:h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashFlowData} margin={{ top: 12, right: 6, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          tickFormatter={(value) => formatCurrency(Number(value), { compact: true })}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(148,163,184,0.08)" }}
                          formatter={(value: number | string) => formatCurrency(Number(value))}
                          labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                          contentStyle={{
                            border: "1px solid rgba(226,232,240,0.9)",
                            borderRadius: 16,
                            boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
                          }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 5, 5]} barSize={24}>
                          {cashFlowData.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:grid-cols-1">
                    <CompactStat
                      label="收入覆盖支出"
                      value={data.monthExpense > 0 ? `${((data.monthIncome / data.monthExpense) * 100).toFixed(0)}%` : "100%"}
                      tone={data.monthIncome >= data.monthExpense ? "green" : "red"}
                    />
                    <CompactStat
                      label="资产缓冲"
                      value={data.monthExpense > 0 ? `${(data.totalAssets / data.monthExpense).toFixed(1)} 月` : "充足"}
                      tone="blue"
                    />
                    <CompactStat
                      label="预算风险"
                      value={criticalAlerts.length > 0 ? `${criticalAlerts.length} 项` : "低"}
                      tone={criticalAlerts.length > 0 ? "amber" : "green"}
                    />
                  </div>
                </div>
              </div>

              <div className={cn(SURFACE_CLASS, "p-4 sm:min-h-[320px] sm:p-6")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">近期消费构成</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950 sm:text-xl">最近交易里的主要花费</h3>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-[118px_minmax(0,1fr)] items-center gap-3 sm:mt-5 sm:grid-cols-[156px_minmax(0,1fr)] sm:gap-5">
                  <div className="mx-auto h-[118px] w-full max-w-[118px] sm:h-[156px] sm:max-w-[156px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={38} outerRadius={56} paddingAngle={3}>
                          {categoryDistribution.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number | string) => formatCurrency(Number(value))}
                          contentStyle={{
                            border: "1px solid rgba(226,232,240,0.9)",
                            borderRadius: 16,
                            boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {categoryDistribution.slice(0, 3).map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ backgroundColor: item.color }} />
                          <span className="truncate text-[11px] font-medium text-slate-700 sm:text-sm">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-950 sm:text-sm">{formatCurrency(item.value, { compact: true })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">最近交易</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950 sm:text-xl">最近录入的流水</h3>
                </div>
                <Link
                  href="/consumption"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 sm:px-3 sm:py-2 sm:text-sm"
                >
                  查看全部
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </div>

              <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
                {data.recentTransactions.length === 0 ? (
                  <div className="flex min-h-[170px] flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-3 text-center sm:min-h-[220px] sm:rounded-[24px]">
                    <div className="rounded-full bg-white p-2.5 shadow-sm sm:p-3">
                      <CalendarDays className="h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-700 sm:mt-4 sm:text-base">还没有最近交易</p>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">录入一笔账单后，这里会自动出现最新动态。</p>
                  </div>
                ) : (
                  recentTransactions.map((transaction, index) => (
                    <TransactionRow key={transaction.id} transaction={transaction} className={index >= 3 ? "hidden sm:flex" : undefined} />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-5">
            <div className="hidden xl:block">
              <BudgetFocusPanel alerts={data.budgetAlerts} />
            </div>

            <div className={cn(SURFACE_CLASS, "p-4 sm:p-6")}>
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">快捷入口</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950 sm:text-xl">高频动作放在手边</h3>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
                <QuickLink href="/assets" icon={Wallet} title="资产管理" detail="查看账户与余额" tone="blue" />
                <QuickLink href="/budgets" icon={CreditCard} title="预算管理" detail="调整分类限额" tone="red" />
                <QuickLink href="/savings" icon={PiggyBank} title="储蓄目标" detail="追踪计划进度" tone="green" />
                <QuickLink href="/loans" icon={Banknote} title="贷款管理" detail="跟进还款状态" tone="amber" />
              </div>
            </div>
          </div>
        </section>
      </DelayedRender>
    </div>
  );
}

function FundsHealthPanel({
  items,
}: {
  items: InsightItem[];
}) {
  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <ThemeMetricCard
          key={item.label}
          label={item.label}
          value={item.value}
          detail={item.description}
          tone={item.tone}
          icon={item.icon}
          className="border-black/80 sm:p-4"
          hideDetailOnMobile
        />
      ))}
    </section>
  );
}

function BudgetFocusPanel({ alerts }: { alerts: DashboardData["budgetAlerts"] }) {
  const visibleBudgetAlerts = alerts.slice(0, 4);

  return (
    <ThemeSurface className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">预算关注</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950 sm:text-xl">需要优先处理的预算项</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 sm:px-2.5 sm:text-xs">
          {alerts.length} 项
        </span>
      </div>

      <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center sm:rounded-[24px] sm:py-6">
            <p className="text-sm font-medium text-slate-700 sm:text-base">预算执行稳定</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">当前没有需要提醒的预算异常。</p>
          </div>
        ) : (
          visibleBudgetAlerts.map((alert, index) => (
            <BudgetAlertCard key={alert.id} alert={alert} className={index >= 2 ? "hidden sm:block" : undefined} />
          ))
        )}
      </div>
    </ThemeSurface>
  );
}

function HeroStatCard({
  label,
  value,
  mobileValue,
  detail,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  mobileValue?: string;
  detail: string;
  tone: Tone;
  icon: LucideIcon;
}) {
  return (
    <ThemeMetricCard
      label={label}
      value={value}
      mobileValue={mobileValue}
      detail={detail}
      tone={tone}
      icon={Icon}
      className="sm:p-4"
      hideDetailOnMobile
    />
  );
}

function MetricRailCard({
  label,
  value,
  mobileValue,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  mobileValue?: string;
  detail: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  return (
    <ThemeMetricCard
      label={label}
      value={value}
      mobileValue={mobileValue}
      detail={detail}
      tone={tone}
      icon={Icon}
      className="p-3 sm:p-5"
      hideDetailOnMobile
    />
  );
}

function CompactStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    <div className="rounded-[16px] bg-slate-50 px-2.5 py-2 sm:rounded-[22px] sm:px-4 sm:py-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="text-[11px] font-medium text-slate-500 sm:text-sm">{label}</span>
        <span className={cn("w-fit rounded-full px-2 py-1 text-[10px] font-medium ring-1 sm:px-2.5 sm:text-xs", STAT_TONE_CLASS[tone])}>{value}</span>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
  className,
}: {
  transaction: DashboardData["recentTransactions"][number];
  className?: string;
}) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div className={cn("flex items-center justify-between gap-2.5 rounded-[18px] border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition hover:border-slate-200 hover:bg-white sm:gap-3 sm:rounded-[24px] sm:px-4 sm:py-3", className)}>
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl",
            isIncome ? "bg-blue-100 text-blue-700" : "bg-slate-900 text-white"
          )}
        >
          {isIncome ? <ArrowDownLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5" /> : <ArrowUpRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">{transaction.category || "未分类"}</p>
          <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-xs">
            {new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(transaction.date))}
            {" · "}
            {transaction.merchant || transaction.platform}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-xs font-semibold sm:text-sm", isIncome ? "text-blue-700" : "text-slate-950")}>
          {isIncome ? "+" : "-"}
          {formatCurrency(Number(transaction.amount), { withSymbol: false, decimals: 2 })}
        </p>
        <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{isIncome ? "收入" : "支出"}</p>
      </div>
    </div>
  );
}

function BudgetAlertCard({
  alert,
  className,
}: {
  alert: DashboardData["budgetAlerts"][number];
  className?: string;
}) {
  const style = ALERT_STYLE[alert.status];
  const Icon = style.icon;
  const scopeLabel = alert.category === "ALL" ? "总预算" : alert.category;

  return (
    <div className={cn("relative overflow-hidden rounded-[18px] border border-slate-100 bg-slate-50/80 p-3 sm:rounded-[24px] sm:p-4", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", style.line)} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={cn("rounded-xl p-2 sm:rounded-2xl sm:p-2.5", style.badge)}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
              {scopeLabel}
              {alert.scopeType === "PLATFORM" && alert.platform ? ` · ${alert.platform}` : ""}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
              {alert.period === "MONTHLY" ? "月度预算" : "年度预算"} · 已用 {formatCurrency(Number(alert.used))} /{" "}
              {formatCurrency(Number(alert.amount))}
            </p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-medium sm:px-2.5 sm:text-xs", style.badge)}>{style.label}</span>
      </div>
      <div className="mt-3 sm:mt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500 sm:text-xs">
          <span>使用进度</span>
          <span className={cn("font-semibold", style.text)}>{alert.percent.toFixed(0)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn(
              "h-full rounded-full",
              alert.status === "overdue"
                ? "bg-red-500"
                : alert.status === "warning"
                  ? "bg-amber-400"
                  : "bg-slate-400"
            )}
            style={{ width: `${Math.min(100, Math.max(alert.percent, 6))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  detail,
  tone,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  tone: Tone;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[18px] border border-slate-100 bg-slate-50/80 p-3 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-lg sm:rounded-[24px] sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("rounded-xl p-2.5 ring-1 transition sm:rounded-2xl sm:p-3", STAT_TONE_CLASS[tone])}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-700 sm:h-4 sm:w-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-950 sm:mt-4 sm:text-base">{title}</p>
      <p className="mt-1 hidden text-sm text-slate-500 sm:block">{detail}</p>
    </Link>
  );
}
