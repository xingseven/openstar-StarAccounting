"use client";

import { useState, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft,
  Wallet, 
  CreditCard, 
  Banknote, 
  TrendingUp,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  AlertCircle,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  type LucideIcon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer
} from 'recharts';
import { cn, formatCurrency } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { StatsCardSkeleton, ChartSkeleton, CardListSkeleton } from "@/components/shared/Skeletons";
import { GridDecoration } from "@/components/shared/GridDecoration";
import { CardContainer } from "@/components/shared/CardContainer";
import { CardItem } from "@/components/shared/CardItem";
import type { DashboardData } from "@/types";

interface DashboardViewProps {
  data: DashboardData;
  loading?: boolean;
}

export function DashboardDefaultTheme({ data, loading }: DashboardViewProps) {
  const [alertsDismissed, setAlertsDismissed] = useState(false);
  
  const netWorth = data.totalAssets - data.totalDebt;
  const balance = data.monthIncome - data.monthExpense;

  // 模拟趋势数据 (实际开发中应从后端获取)
  const trends = {
    expense: 12.5,
    income: -5.2,
    savings: 8.4
  };

  const chartData = [
    { name: '支出', value: data.monthExpense, color: '#ef4444' },
    { name: '收入', value: data.monthIncome, color: '#22c55e' },
    { name: '结余', value: Math.max(0, balance), color: '#3b82f6' },
  ];

  // 模拟消费分类占比数据
  const categoryDistribution = useMemo(() => [
    { name: '餐饮美食', value: 2450, color: '#3b82f6' },
    { name: '购物消费', value: 1800, color: '#ef4444' },
    { name: '日常缴费', value: 1200, color: '#f59e0b' },
    { name: '交通出行', value: 800, color: '#10b981' },
    { name: '休闲娱乐', value: 600, color: '#8b5cf6' },
  ], []);

  const chartConfig = {
    expense: {
      label: "支出",
      color: "hsl(var(--chart-1))",
    },
    income: {
      label: "收入",
      color: "hsl(var(--chart-2))",
    },
    balance: {
      label: "结余",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <ChartSkeleton />
        <CardListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto overflow-x-hidden">
      {/* Budget Alerts Banner */}
      {data.budgetAlerts.length > 0 && !alertsDismissed && (
        <div className="group relative rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 lg:p-3 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3 sm:gap-4 relative z-10">
            <div className="p-2 sm:p-3 rounded-xl bg-red-100 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <h3 className="text-base sm:text-lg font-bold text-red-900">
                  预算预警 ({data.budgetAlerts.length})
                </h3>
                <button 
                  onClick={() => setAlertsDismissed(true)}
                  className="p-1 hover:bg-red-200/50 rounded-full text-red-400 hover:text-red-600 transition-colors"
                  title="暂时忽略"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {data.budgetAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/60 border border-red-100">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={cn(
                        "p-1.5 sm:p-2 rounded-lg shrink-0",
                        alert.status === "overdue" ? "bg-red-100" : "bg-yellow-100"
                      )}>
                        <AlertCircle className={cn(
                          "h-3 w-3 sm:h-4 sm:w-4",
                          alert.status === "overdue" ? "text-red-600" : "text-yellow-600"
                        )} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                          {alert.category === "ALL" ? "总预算" : alert.category}
                          {alert.scopeType === "PLATFORM" && alert.platform && ` - ${alert.platform}`}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500">
                          {alert.period === "MONTHLY" ? "月度" : "年度"} · 
                          已用 {formatCurrency(Number(alert.used))} / {formatCurrency(Number(alert.amount))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn(
                        "text-sm sm:text-base font-bold",
                        alert.status === "overdue" ? "text-red-600" : "text-yellow-600"
                      )}>
                        {alert.percent.toFixed(0)}%
                      </div>
                      <div className={cn(
                        "text-[10px] sm:text-xs",
                        alert.status === "overdue" ? "text-red-500" : "text-yellow-500"
                      )}>
                        {alert.status === "overdue" ? "超支" : "预警"}
                      </div>
                    </div>
                  </div>
                ))}
                {data.budgetAlerts.length > 3 && (
                  <Link 
                    href="/budgets" 
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    查看全部 {data.budgetAlerts.length} 个预警 <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
          <GridDecoration mode="light" opacity={0.03} />
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {/* Net Worth Card */}
        <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-6 text-white shadow-xl group">
          <GridDecoration mode="dark" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-300 mb-1 sm:mb-2">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">净资产</span>
            </div>
            <div className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              {formatCurrency(netWorth)}
            </div>
            <div className="mt-2 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs lg:text-sm text-gray-400">
              <div>
                <p>总资产</p>
                <p className="text-gray-200 font-medium text-xs sm:text-sm">{formatCurrency(data.totalAssets)}</p>
              </div>
              <div className="text-right">
                <p>负债</p>
                <p className="text-red-300 font-medium text-xs sm:text-sm">-{formatCurrency(data.totalDebt)}</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 sm:-right-6 sm:-top-6 h-16 sm:h-24 lg:h-32 w-16 sm:w-24 lg:w-32 rounded-full bg-white/5 blur-2xl sm:blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>
        </div>
        
        <StatCard 
          title="支出" 
          subtitle="本月"
          value={data.monthExpense} 
          icon={CreditCard}
          trend={trends.expense > 0 ? "up" : "down"}
          trendValue={trends.expense}
          color="red"
        />

        <StatCard 
          title="收入" 
          subtitle="本月"
          value={data.monthIncome} 
          icon={Banknote}
          trend={trends.income > 0 ? "up" : "down"}
          trendValue={trends.income}
          color="green"
        />

        <StatCard 
          title="储蓄" 
          subtitle="存入"
          value={data.monthSavingsIncome} 
          icon={TrendingUp}
          trend={trends.savings > 0 ? "up" : "down"}
          trendValue={trends.savings}
          color="amber"
        />
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm overflow-hidden group h-full gap-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-gray-900">收支概览</CardTitle>
                  <CardDescription>本月收支状态对比</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 -mt-2">
                <ChartContainer config={chartConfig} className="h-[100px] sm:h-[160px] w-full [&_.recharts-surface]:border-none [&_.recharts-surface]:bg-transparent">
                    <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0 }} className="outline-none focus:outline-none">
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        width={40}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <XAxis dataKey="value" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar dataKey="value" layout="vertical" radius={5} barSize={16}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
              </CardContent>
              <GridDecoration mode="light" className="opacity-[0.01]" />
            </Card>

            <Card className="shadow-sm overflow-hidden group h-full gap-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 px-0">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-gray-900">消费占比</CardTitle>
                  <CardDescription>按消费分类统计占比</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 h-[160px] flex items-center justify-center -mt-2">
                <div className="w-full h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-gray-400 font-medium">总支出</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(data.monthExpense, { compact: true })}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 ml-2">
                  {categoryDistribution.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <GridDecoration mode="light" className="opacity-[0.01]" />
            </Card>
          </div>

          <CardContainer className="group/card flex flex-col gap-0 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground lg:p-3">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">近期交易</h3>
              <Link href="/consumption" className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                查看全部 <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>

            <div className="space-y-1">
              {data.recentTransactions.length === 0 ? (
                <div className="py-8 sm:py-12 text-center">
                  <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-50 flex items-center justify-center mb-2 sm:mb-3">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm">暂无交易记录</p>
                </div>
              ) : (
                data.recentTransactions.map((t) => (
                  <div key={t.id} className="group/item flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-xl hover:bg-gray-50 transition-colors gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border shadow-sm shrink-0",
                        t.type === "EXPENSE" ? "bg-white border-gray-100" : "bg-green-50 border-green-100"
                      )}>
                        {t.type === "EXPENSE" ? (
                          <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                        ) : (
                          <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-gray-900 truncate group-hover/item:text-blue-600 transition-colors">{t.category || "未分类"}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                          <span>{new Date(t.date).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="truncate">{t.merchant || t.platform}</span>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "font-bold text-sm tabular-nums shrink-0 whitespace-nowrap",
                      t.type === "INCOME" ? "text-green-600" : "text-gray-900"
                    )}>
                      {t.type === "EXPENSE" ? "-" : "+"}
                      {formatCurrency(Number(t.amount), { withSymbol: false, decimals: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContainer>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6 min-w-0">
          <CardContainer className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground lg:p-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">快捷操作</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <QuickAction
                icon={Plus}
                label="记一笔"
                color="indigo"
                onClick={() => alert("记一笔功能即将上线！")}
              />
              <QuickAction href="/assets" icon={Wallet} label="资产管理" color="blue" />
              <QuickAction href="/budgets" icon={CreditCard} label="预算管理" color="red" />
              <QuickAction href="/loans" icon={Banknote} label="贷款管理" color="purple" />
              <QuickAction href="/savings" icon={TrendingUp} label="储蓄目标" color="amber" />
            </div>
          </CardContainer>

          <CardContainer variant="blue">
            <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">需要帮助？</h3>
            <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">
              查看文档了解如何更好地管理您的财务。
            </p>
            <button className="bg-white text-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm">
              查看文档
            </button>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, subtitle, value, icon: Icon, trend, trendValue, color, className }: { 
  title: string;
  subtitle?: string;
  value: number; 
  icon: LucideIcon; 
  trend: "up" | "down";
  trendValue?: number;
  color: "red" | "green" | "blue" | "amber";
  className?: string;
}) {
  const colorStyles = {
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
  };

  const isPositive = trend === "up";

  return (
    <div className={cn(
      "rounded-xl sm:rounded-2xl bg-white p-3 lg:p-4 shadow-sm transition-all hover:shadow-md relative overflow-hidden group",
      className
    )}>
      <GridDecoration mode="light" className="opacity-[0.01]" />
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-4">
        <div className="flex items-center gap-2 text-gray-500">
          <div className={cn("p-1.5 sm:p-2 rounded-lg transition-colors", colorStyles[color])}>
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs lg:text-sm font-medium group-hover:text-gray-900 transition-colors">{title}</span>
            {subtitle && <span className="text-[9px] sm:text-[10px] lg:text-xs text-gray-400 ml-0.5 sm:ml-1">({subtitle})</span>}
          </div>
        </div>
        {trendValue !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold",
            isPositive ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          )}>
            {isPositive ? <ArrowUp className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> : <ArrowDown className="h-2 w-2 sm:h-2.5 sm:w-2.5" />}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
          {formatCurrency(Math.abs(value), { decimals: 0 })}
        </div>
      </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, color, onClick }: {
  href?: string;
  icon: LucideIcon;
  label: string;
  color: string;
  onClick?: () => void;
}) {
  const bgColors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    red: "bg-red-50 text-red-600 group-hover:bg-red-100",
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
  };

  const content = (
    <>
      <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-colors", bgColors[color])}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
    </>
  );

  return (
    <CardItem href={href} onClick={onClick}>
      {content}
    </CardItem>
  );
}
