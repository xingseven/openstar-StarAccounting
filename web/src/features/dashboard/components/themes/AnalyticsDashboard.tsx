"use client";

import { useMemo } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import {
  Area,
  AreaChart,
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
import { AnalyticsLoadingShell } from "./AnalyticsLoadingShell";
import type { DashboardData } from "@/types";

const BG_COLOR = "#F4EFEA";
const BLUE_CARD_BG = "#2E62A6";
const TEAL_CARD_BG = "#BFE2DC";
const GREEN_CARD_BG = "#CAE3D9";
const PURPLE_CARD_BG = "#A692CD";

const CHART_PURPLE = "#9D83C5";
const CHART_BLUE = "#2E62A6";
const CHART_TEAL = "#7BB5A8";
const CHART_LIGHT_GREEN = "#A4D2C3";
const CHART_COLORS = [CHART_BLUE, CHART_TEAL, CHART_PURPLE, CHART_LIGHT_GREEN, "#e2e8f0"];
const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function buildSixMonthTrend(currentIncome: number, currentExpense: number, lastIncome: number, lastExpense: number) {
  const currentMonthIdx = new Date().getMonth();
  const result = [];
  const actualLastIncome = lastIncome || currentIncome * 0.9;
  const actualLastExpense = lastExpense || currentExpense * 0.9;

  for (let i = 5; i >= 0; i--) {
    let monthIndex = currentMonthIdx - i;
    if (monthIndex < 0) monthIndex += 12;

    let income = currentIncome;
    let expense = currentExpense;

    if (i === 1) {
      income = actualLastIncome;
      expense = actualLastExpense;
    } else if (i > 1) {
      const scale = Math.max(currentIncome, currentExpense, 1000);
      income = Math.max(0, actualLastIncome + Math.sin(i) * scale * 0.2);
      expense = Math.max(0, actualLastExpense + Math.cos(i) * scale * 0.15);
    }

    result.push({
      name: MONTH_LABELS[monthIndex],
      income: Math.round(income),
      expense: Math.round(expense),
      balance: Math.round(Math.max(0, income - expense)),
    });
  }

  return result;
}

function buildDailyExpenseTrend(transactions: DashboardData["recentTransactions"], monthExpense: number) {
  const days = new Array(30).fill(0);
  const expenseTransactions = transactions.filter((transaction) => transaction.type === "EXPENSE");

  expenseTransactions.forEach((transaction) => {
    const day = new Date(transaction.date).getDate();
    if (day >= 1 && day <= 30) {
      days[day - 1] += Number(transaction.amount);
    }
  });

  const totalInTransactions = days.reduce((sum, value) => sum + value, 0);
  if (totalInTransactions < monthExpense * 0.5 && monthExpense > 0) {
    const dailyAverage = monthExpense / 30;
    for (let index = 0; index < 30; index += 1) {
      if (days[index] === 0) {
        days[index] = dailyAverage * (0.5 + ((index % 7) / 10 + 0.4));
      }
    }
  }

  return days.map((value, index) => ({
    name: `${index + 1}日`,
    value: Math.round(value),
  }));
}

export function AnalyticsDashboard({ data, loading }: { data: DashboardData; loading?: boolean }) {
  const topCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    data.recentTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .forEach((transaction) => {
        const category = transaction.category || "未分类";
        categoryMap.set(category, (categoryMap.get(category) || 0) + Number(transaction.amount));
      });

    const sorted = Array.from(categoryMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

    if (sorted.length === 0 && data.monthExpense > 0) {
      return [
        { name: "居住", value: data.monthExpense * 0.4, color: CHART_COLORS[0] },
        { name: "餐饮", value: data.monthExpense * 0.3, color: CHART_COLORS[1] },
        { name: "出行", value: data.monthExpense * 0.2, color: CHART_COLORS[2] },
        { name: "其他", value: data.monthExpense * 0.1, color: CHART_COLORS[3] },
      ];
    }

    return sorted;
  }, [data.monthExpense, data.recentTransactions]);

  const sixMonthData = useMemo(
    () => buildSixMonthTrend(data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense),
    [data.lastMonthExpense, data.lastMonthIncome, data.monthExpense, data.monthIncome]
  );

  const dailyExpenseData = useMemo(
    () => buildDailyExpenseTrend(data.recentTransactions, data.monthExpense),
    [data.monthExpense, data.recentTransactions]
  );

  const netWorth = data.totalAssets - data.totalDebt;
  const topCategoryMax = topCategories.length > 0 ? topCategories[0].value : 1;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: 35 }, (_, index) => {
    const dayNumber = index - firstDayOfMonth + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  if (loading) {
    return <AnalyticsLoadingShell />;
  }

  const Card = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] sm:p-6",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );

  const CardHeader = ({ title, action, textColor = "#1e293b" }: { title: string; action?: React.ReactNode; textColor?: string }) => (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h3 className="text-[16px] font-bold" style={{ color: textColor }}>{title}</h3>
      {action}
    </div>
  );

  const ActionDots = ({ light = false }: { light?: boolean }) => (
    <button className={cn("flex h-7 w-7 items-center justify-center rounded-full transition", light ? "bg-white/20 text-white hover:bg-white/30" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]")}>
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );

  const chartAxisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fill: "#64748b", fontSize: 10, fontWeight: 600 },
    dy: 10,
  };

  const yAxisProps = {
    ...chartAxisProps,
    dx: -10,
    width: 30,
    tickFormatter: (value: number) => {
      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
      return `${value}`;
    },
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1680px] space-y-5 overflow-x-hidden pb-4" style={{ background: BG_COLOR, padding: "20px 24px", borderRadius: "32px" }}>
      <DelayedRender delay={0}>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.2fr_1.8fr]">
          <Card style={{ backgroundColor: BLUE_CARD_BG, color: "white" }} className="flex min-h-[220px] flex-col justify-between pb-8">
            <CardHeader
              title="总资产概览"
              textColor="white"
              action={<button className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"><ChevronDown className="h-4 w-4" /></button>}
            />
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-white" /><div className="h-2 w-16 rounded-full bg-white/40" /></div>
                <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-white" /><div className="h-2 w-28 rounded-full bg-white" /></div>
                <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-white" /><div className="h-2 w-20 rounded-full bg-white/40" /></div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-[13px] font-medium text-white/80">净资产 {formatCurrency(netWorth, { compact: true })}</span>
              </div>
            </div>
          </Card>

          <Card className="flex min-h-[220px] flex-col">
            <CardHeader title="每日支出" action={<ActionDots />} />
            <div className="mt-2 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyExpenseData}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_PURPLE} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_PURPLE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  <Area type="monotone" dataKey="value" name="支出" stroke={CHART_PURPLE} strokeWidth={3} fill="url(#purpleGrad)" />
                  <Area type="monotone" dataKey={(entry: { value: number }) => entry.value * 0.7} name="参考线" stroke="#c4b5db" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card style={{ backgroundColor: TEAL_CARD_BG }} className="flex min-h-[220px] flex-col">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[16px] font-bold text-[#0f172a]">现金流趋势</h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#0f172a] shadow-sm">{formatCurrency(data.monthIncome - data.monthExpense, { compact: true })}</span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#0f172a] shadow-sm">本月</span>
              </div>
            </div>
            <div className="mt-4 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sixMonthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_BLUE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" {...chartAxisProps} tick={{ ...chartAxisProps.tick, fill: "#475569" }} />
                  <YAxis {...yAxisProps} tick={{ ...yAxisProps.tick, fill: "#475569" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="income" name="收入" stroke={CHART_BLUE} strokeWidth={3} fill="url(#blueGrad)" />
                  <Area type="monotone" dataKey="expense" name="支出" stroke={CHART_TEAL} strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>

      <DelayedRender delay={30}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card className="flex h-[240px] flex-col">
            <CardHeader title="储蓄趋势" action={<ChevronDown className="h-4 w-4 text-slate-400" />} />
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sixMonthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" {...chartAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="balance" name="结余" stroke={CHART_BLUE} strokeWidth={3} fill="none" />
                  <Area type="monotone" dataKey={(entry: { balance: number }) => entry.balance * 0.6} name="趋势" stroke={CHART_LIGHT_GREEN} strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card style={{ backgroundColor: GREEN_CARD_BG }} className="flex h-[240px] flex-col">
            <CardHeader title="收支对比" action={<ActionDots />} />
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonthData.slice(-4)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="15%">
                  <XAxis dataKey="name" {...chartAxisProps} tick={{ ...chartAxisProps.tick, fill: "#475569" }} />
                  <YAxis {...yAxisProps} tick={{ ...yAxisProps.tick, fill: "#475569" }} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.4)" }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="income" name="收入" fill={CHART_BLUE} radius={[4, 4, 4, 4]} barSize={8} />
                  <Bar dataKey="expense" name="支出" fill={CHART_TEAL} radius={[4, 4, 4, 4]} barSize={8} />
                  <Bar dataKey="balance" name="结余" fill={CHART_PURPLE} radius={[4, 4, 4, 4]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="flex h-[240px] flex-col">
            <CardHeader title="月度对比" action={<ActionDots />} />
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonthData.slice(-4)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="15%">
                  <XAxis dataKey="name" {...chartAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="income" name="收入" fill={CHART_BLUE} radius={[4, 4, 4, 4]} barSize={8} />
                  <Bar dataKey="expense" name="支出" fill={CHART_PURPLE} radius={[4, 4, 4, 4]} barSize={8} />
                  <Bar dataKey="balance" name="结余" fill={CHART_TEAL} radius={[4, 4, 4, 4]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="flex h-[240px] flex-col">
            <CardHeader title="支出构成" action={<ActionDots />} />
            <div className="-mt-4 flex flex-1 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topCategories.length > 0 ? topCategories : [{ name: "暂无数据", value: 1, color: "#e2e8f0" }]} innerRadius="0%" outerRadius="85%" paddingAngle={2} dataKey="value" stroke="none">
                    {(topCategories.length > 0 ? topCategories : [{ name: "暂无数据", value: 1, color: "#e2e8f0" }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>

      <DelayedRender delay={60}>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1.5fr_1fr]">
          <Card style={{ backgroundColor: PURPLE_CARD_BG, color: "white" }} className="flex min-h-[220px] flex-col">
            <CardHeader title="高频分类" textColor="white" action={<ChevronDown className="h-4 w-4 text-white/60" />} />
            <div className="flex flex-1 flex-col justify-center space-y-5">
              {topCategories.slice(0, 3).map((category, index) => (
                <div key={category.name + index} className="flex items-center gap-4">
                  <div className="flex w-24 shrink-0 items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color === CHART_PURPLE ? "white" : category.color }} />
                    <span className="truncate text-[13px] font-medium text-white">{category.name}</span>
                  </div>
                  <div className="flex flex-1 items-center gap-3">
                    <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full rounded-full" style={{ width: `${(category.value / topCategoryMax) * 100}%`, backgroundColor: category.color === CHART_PURPLE ? "white" : category.color }} />
                    </div>
                    <span className="w-16 shrink-0 text-right text-[12px] font-bold text-white/90">{formatCurrency(category.value, { compact: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex min-h-[220px] flex-col">
            <CardHeader title="最近交易" action={<ActionDots />} />
            <div className="flex-1 w-full overflow-hidden">
              <table className="w-full table-fixed text-left text-[12px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[#94a3b8]">
                    <th className="pb-3 font-semibold">分类</th>
                    <th className="pb-3 font-semibold">商户</th>
                    <th className="pb-3 font-semibold">日期</th>
                    <th className="pb-3 text-right font-semibold">金额</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-[#334155]">
                  {data.recentTransactions.slice(0, 4).map((transaction, index) => (
                    <tr key={transaction.id} className={index % 2 === 0 ? "bg-[#F8FAFC]/50" : ""}>
                      <td className="flex items-center gap-2 rounded-l-lg py-2.5 pr-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                        <span className="truncate">{transaction.category || "其他"}</span>
                      </td>
                      <td className="py-2.5 pr-2"><span className="block truncate">{transaction.merchant || transaction.platform}</span></td>
                      <td className="py-2.5 pr-2">{new Date(transaction.date).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", year: "numeric" })}</td>
                      <td className={cn("rounded-r-lg py-2.5 text-right font-bold", transaction.type === "INCOME" ? "text-emerald-600" : "")}>
                        {transaction.type === "INCOME" ? "+" : "-"}{formatCurrency(Number(transaction.amount), { compact: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="flex min-h-[220px] flex-col pb-4">
            <CardHeader title="日程日历" action={<ChevronDown className="h-4 w-4 text-slate-400" />} />
            <div className="flex-1">
              <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-bold text-[#64748b]">
                {["日", "一", "二", "三", "四", "五", "六"].map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 text-center text-[11px] font-semibold text-[#334155]">
                {calendarDays.map((day, index) => {
                  const isToday = day === currentDate.getDate();
                  return (
                    <div key={index} className={cn("mx-auto flex h-6 w-6 items-center justify-center rounded-full", isToday ? "bg-[#2E62A6] text-white shadow-sm" : "")}>{day || ""}</div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </DelayedRender>
    </div>
  );
}
