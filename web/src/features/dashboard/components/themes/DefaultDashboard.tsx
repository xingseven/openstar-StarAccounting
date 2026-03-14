import { 
  ArrowUpRight, 
  ArrowDownLeft,
  Wallet, 
  CreditCard, 
  Banknote, 
  TrendingUp,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell
} from 'recharts';
import { clsx } from "clsx";
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

export type DashboardData = {
  totalAssets: number;
  totalDebt: number;
  monthExpense: number;
  monthIncome: number;
  monthSavingsIncome: number;
  monthSavingsExpense: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    type: "EXPENSE" | "INCOME";
    amount: string;
    category: string;
    platform: string;
    merchant?: string;
  }>;
};

interface DashboardViewProps {
  data: DashboardData;
  loading?: boolean;
}

export function DashboardDefaultTheme({ data, loading }: DashboardViewProps) {
  const netWorth = data.totalAssets - data.totalDebt;
  const balance = data.monthIncome - data.monthExpense;

  const chartData = [
    { name: '支出', value: data.monthExpense, color: '#ef4444' },
    { name: '收入', value: data.monthIncome, color: '#22c55e' },
    { name: '结余', value: Math.max(0, balance), color: '#3b82f6' },
  ];

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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto overflow-x-hidden px-2 sm:px-0">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {/* Net Worth Card */}
        <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-6 text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-300 mb-1 sm:mb-2">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">净资产</span>
            </div>
            <div className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              ¥ {netWorth.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="mt-2 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs lg:text-sm text-gray-400">
              <div>
                <p>总资产</p>
                <p className="text-gray-200 font-medium text-xs sm:text-sm">¥{data.totalAssets.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p>负债</p>
                <p className="text-red-300 font-medium text-xs sm:text-sm">-¥{data.totalDebt.toFixed(0)}</p>
              </div>
            </div>
          </div>
          {/* Decorative circle */}
          <div className="absolute -right-4 -top-4 sm:-right-6 sm:-top-6 h-16 sm:h-24 lg:h-32 w-16 sm:w-24 lg:w-32 rounded-full bg-white/5 blur-2xl sm:blur-3xl"></div>
        </div>
        
        {/* Monthly Expense */}
        <StatCard 
          title="支出" 
          subtitle="消费"
          value={data.monthExpense} 
          icon={CreditCard}
          trend="up"
          color="red"
        />

        {/* Monthly Income */}
        <StatCard 
          title="收入" 
          subtitle="消费"
          value={data.monthIncome} 
          icon={Banknote}
          trend="up"
          color="green"
        />

        {/* Monthly Savings Income */}
        <StatCard 
          title="储蓄" 
          subtitle="存入"
          value={data.monthSavingsIncome} 
          icon={TrendingUp}
          trend={data.monthSavingsIncome >= 0 ? "up" : "down"}
          color="amber"
        />
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-gray-900">收支概览</CardTitle>
                <CardDescription>本月资金流动统计</CardDescription>
              </div>
              <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0 }}>
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
                  <Bar dataKey="value" layout="vertical" radius={5} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
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
                  <div key={t.id} className="group flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors gap-2 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={clsx(
                        "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border shadow-sm shrink-0",
                        t.type === "EXPENSE" ? "bg-white border-gray-100" : "bg-green-50 border-green-100"
                      )}>
                        {t.type === "EXPENSE" ? (
                          <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{t.category || "未分类"}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 truncate">
                          <span>{new Date(t.date).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="truncate">{t.merchant || t.platform}</span>
                        </div>
                      </div>
                    </div>
                    <div className={clsx(
                      "font-bold text-sm sm:text-base tabular-nums shrink-0 whitespace-nowrap",
                      t.type === "INCOME" ? "text-green-600" : "text-gray-900"
                    )}>
                      {t.type === "EXPENSE" ? "-" : "+"}
                      {Number(t.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6 min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">快捷入口</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <QuickAction href="/assets" icon={Wallet} label="资产管理" color="blue" />
              <QuickAction href="/loans" icon={Banknote} label="贷款管理" color="purple" />
              <QuickAction href="/savings" icon={TrendingUp} label="储蓄目标" color="amber" />
              <QuickAction href="/connections" icon={CreditCard} label="连接管理" color="indigo" />
            </div>
          </div>

          <div className="rounded-2xl bg-blue-600 p-4 sm:p-6 text-white shadow-lg relative overflow-hidden z-0">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">需要帮助？</h3>
              <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">
                查看文档了解如何更好地管理您的财务。
              </p>
              <button className="bg-white text-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors">
                查看文档
              </button>
            </div>
            <div className="absolute right-0 bottom-0 h-24 w-24 sm:h-32 sm:w-32 bg-white/10 rounded-full blur-2xl translate-x-8 translate-y-8 sm:translate-x-10 sm:translate-y-10 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, subtitle, value, icon: Icon, trend, color, className }: { 
  title: string;
  subtitle?: string;
  value: number; 
  icon: any; 
  trend: "up" | "down";
  color: "red" | "green" | "blue" | "amber";
  className?: string;
}) {
  const colorStyles = {
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
  };

  return (
    <div className={clsx(
      "rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-2 sm:p-4 lg:p-6 shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-4">
        <div className="flex items-center gap-2 text-gray-500">
          <div className={clsx("p-1.5 sm:p-2 rounded-lg", colorStyles[color])}>
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs lg:text-sm font-medium">{title}</span>
            {subtitle && <span className="text-[9px] sm:text-[10px] lg:text-xs text-gray-400 ml-0.5 sm:ml-1">({subtitle})</span>}
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
          ¥ {Math.abs(value).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  const bgColors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
  };

  return (
    <Link href={href} className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
      <div className={clsx("h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-colors", bgColors[color])}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
    </Link>
  );
}
