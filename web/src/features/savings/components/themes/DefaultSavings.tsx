import { useEffect, useState, useRef, useMemo } from "react";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MoreHorizontal,
  Wallet,
  PiggyBank,
  ArrowRight,
  Search,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";
import { 
  Pie, 
  PieChart, 
  Cell, 
  ResponsiveContainer 
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  type: "MONTHLY" | "YEARLY" | "LONG_TERM" | "BI_MONTHLY_ODD" | "BI_MONTHLY_EVEN";
  depositType: "CASH" | "FIXED_TERM" | "HELP_DEPOSIT";
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
};

export type TransactionItem = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
};

interface SavingsViewProps {
  items: SavingsGoal[];
  transactions: TransactionItem[];
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  loading?: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: SavingsGoal) => void;
  onOpenPunch: (item: SavingsGoal) => void;
  onOpenWithdrawal: (item: SavingsGoal) => void;
}

// Skeleton loader components
function StatsCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-300 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

function DistributionChartSkeleton() {
  return (
    <Card className="md:col-span-1 flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent className="flex-1 pb-0 relative min-h-[200px]">
        <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
          <div className="h-40 w-40 rounded-full border-8 border-gray-200 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalsTableSkeleton() {
  return (
    <Card className="md:col-span-3 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {["名称", "模式", "存款类型", "当前/目标", "进度", "截止日期", "操作"].map((header, i) => (
                  <th key={i} className="text-left px-3 py-2 whitespace-nowrap">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50/70">
                  <td className="px-3 py-3">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
                  </td>
                  <td className="px-3 py-3 min-w-[180px]">
                    <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 -mx-6 px-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for staggered animation and lazy loading
function DelayedRender({ children, delay, lazy = false, skeleton }: { 
  children: React.ReactNode; 
  delay: number; 
  lazy?: boolean;
  skeleton?: React.ReactNode;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If lazy, wait for intersection
    if (lazy) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            // Add a small delay even after intersection to prevent jank during scroll
            setTimeout(() => setShouldRender(true), delay);
            observer.disconnect();
          }
        },
        { rootMargin: "50px" } // Start loading slightly before view
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      
      return () => observer.disconnect();
    } 
    // If not lazy, just use timeout
    else {
      const timer = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay, lazy]);

  if (!shouldRender) {
    return (
      <div ref={ref}>
        {skeleton || (
          <div className="h-[250px] w-full flex flex-col items-center justify-center bg-white border rounded-xl animate-pulse space-y-4 p-6">
            <div className="w-full flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex-1 w-full flex items-end justify-between gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-t w-full" style={{ height: `${40 + i * 20}%` }}></div>
              ))}
            </div>
            <div className="h-4 w-full bg-gray-100 rounded"></div>
          </div>
        )}
      </div>
    );
  }

  return <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">{children}</div>;
}

export function SavingsDefaultTheme({
  items,
  transactions,
  totalSaved,
  totalTarget,
  overallProgress,
  loading = false,
  onOpenCreate,
  onOpenEdit,
  onOpenPunch,
  onOpenWithdrawal,
}: SavingsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Debug log
  useEffect(() => {
    console.log('SavingsDefaultTheme 收到 transactions:', transactions);
    console.log('transactions.length:', transactions.length);
  }, [transactions]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return items.filter(item => 
      searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Chart Data: Savings Distribution by Type
  const distributionData = useMemo(() => {
    const data = [
      { name: "月度", value: 0, fill: "#F59E0B" }, // Amber
      { name: "年度", value: 0, fill: "#8B5CF6" }, // Purple
      { name: "长期", value: 0, fill: "#3B82F6" }, // Blue
      { name: "隔月", value: 0, fill: "#10B981" }, // Emerald
    ];
    
    items.forEach(item => {
      if (item.type === "MONTHLY") data[0].value += item.currentAmount;
      else if (item.type === "YEARLY") data[1].value += item.currentAmount;
      else if (item.type === "LONG_TERM") data[2].value += item.currentAmount;
      else if (item.type === "BI_MONTHLY_ODD" || item.type === "BI_MONTHLY_EVEN") data[3].value += item.currentAmount;
    });

    return data.filter(d => d.value > 0);
  }, [items]);

  const chartConfig = {
    monthly: { label: "月度", color: "#F59E0B" },
    yearly: { label: "年度", color: "#8B5CF6" },
    longTerm: { label: "长期", color: "#3B82F6" },
    biMonthly: { label: "隔月", color: "#10B981" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">储蓄目标</h1>
          <p className="text-gray-500 mt-1">积少成多，实现你的财务愿望</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜索目标..."
              className="pl-9 w-[200px] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button onClick={onOpenCreate} className="bg-black hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            新建目标
          </Button>
        </div>
      </div>

      {/* Row 1: Summary Cards (3 cols) - With Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">总存款</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">¥{totalSaved.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">所有目标的当前存款总和</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">目标总额</CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">¥{totalTarget.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">所有目标的计划总额</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">总体进度</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{overallProgress.toFixed(1)}%</div>
                <Progress value={overallProgress} className="h-2 mt-2 bg-green-100" indicatorClassName="bg-green-500" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Row 2: Distribution Chart & Goals Grid */}
      <DelayedRender 
        delay={200} 
        skeleton={
          <div className="grid gap-6 md:grid-cols-4">
            <DistributionChartSkeleton />
            <GoalsTableSkeleton />
          </div>
        }
      >
        <div className="grid gap-6 md:grid-cols-4">
          {/* Chart Column */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-base">储蓄分布</CardTitle>
              <CardDescription>按类型统计</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 relative min-h-[200px]">
              {distributionData.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={distributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        strokeWidth={5}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-xs">
                    {distributionData.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-gray-500">{item.name}</span>
                        <span className="font-medium">{(item.value / totalSaved * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">暂无数据</div>
              )}
            </CardContent>
          </Card>

          {/* Goals Table Column */}
          <Card className="md:col-span-3 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="space-y-1">
                <CardTitle className="text-base">目标列表</CardTitle>
                <CardDescription>按行展示每个储蓄目标</CardDescription>
              </div>
              <Button onClick={onOpenCreate} size="sm">
                <Plus className="mr-1 h-4 w-4" />
                新增目标
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {filteredGoals.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-dashed">
                  暂无目标，点击右上角新增
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-3 py-2 whitespace-nowrap">名称</th>
                        <th className="text-left px-3 py-2 whitespace-nowrap">模式</th>
                        <th className="text-left px-3 py-2 whitespace-nowrap">存款类型</th>
                        <th className="text-right px-3 py-2 whitespace-nowrap">当前/目标</th>
                        <th className="text-left px-3 py-2 whitespace-nowrap">进度</th>
                        <th className="text-left px-3 py-2 whitespace-nowrap">截止日期</th>
                        <th className="text-right px-3 py-2 whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredGoals.map((item) => {
                        const progress = item.targetAmount > 0
                          ? Math.min(100, (item.currentAmount / item.targetAmount) * 100)
                          : 0;
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/70">
                            <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    onOpenPunch(item);
                                  }}
                                className="hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
                                title="打开月度计划"
                              >
                                {item.name}
                              </button>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {item.type === "BI_MONTHLY_ODD"
                                ? "隔月 (单)"
                                : item.type === "BI_MONTHLY_EVEN"
                                ? "隔月 (双)"
                                : item.type === "MONTHLY"
                                ? "每月存"
                                : item.type === "YEARLY"
                                ? "年度"
                                : "长期"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {item.depositType === "CASH"
                                ? "现金"
                                : item.depositType === "FIXED_TERM"
                                ? "死期"
                                : "他人帮存"}
                            </td>
                            <td className="px-3 py-3 text-right whitespace-nowrap text-gray-700">
                              ¥{item.currentAmount.toLocaleString()} / ¥{item.targetAmount.toLocaleString()}
                            </td>
                            <td className="px-3 py-3 min-w-[180px]">
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={progress}
                                  className="h-2"
                                  indicatorClassName={clsx(
                                    progress >= 100 ? "bg-green-500" :
                                    item.type === "LONG_TERM" ? "bg-blue-500" :
                                    item.type === "YEARLY" ? "bg-purple-500" :
                                    item.type === "MONTHLY" ? "bg-amber-500" :
                                    "bg-emerald-500"
                                  )}
                                />
                                <span className="text-xs text-gray-500 w-10 text-right">{progress.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-gray-500">
                              {item.deadline ? item.deadline.slice(0, 10) : "—"}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    onOpenPunch(item);
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
                                  title="打开并勾选每月已存款"
                                >
                                  每月打卡
                                </button>
                                <button
                                  onClick={() => {
                                    onOpenWithdrawal(item);
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors whitespace-nowrap"
                                  title="从该目标取款"
                                  disabled={item.currentAmount <= 0}
                                >
                                  取款
                                </button>
                                <button
                                  onClick={() => {
                                    onOpenPunch(item);
                                  }}
                                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-black transition-colors"
                                  title="指定计划"
                                >
                                  <Target className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onOpenEdit(item)}
                                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-black transition-colors"
                                  title="编辑"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DelayedRender>

      {/* Row 3: Transactions - Lazy Load */}
      <DelayedRender 
        delay={100} 
        lazy
        skeleton={<TransactionsSkeleton />}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="space-y-1">
              <CardTitle className="text-base">存取记录</CardTitle>
              <CardDescription>包含"储蓄"、"存款"、"理财"等分类的流水</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-black">
              查看全部 <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-dashed">
                <PiggyBank className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                暂无相关记录
              </div>
            ) : (
              <div className="space-y-0 divide-y">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors -mx-6 px-6 first:border-t">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "h-10 w-10 rounded-full flex items-center justify-center border",
                        t.type === "EXPENSE" ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-600"
                      )}>
                        {t.type === "EXPENSE" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{t.description || t.category}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{new Date(t.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={clsx("font-bold text-sm", t.type === "EXPENSE" ? "text-gray-900" : "text-green-600")}>
                      {t.type === "EXPENSE" ? "-" : "+"}¥{Number(t.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DelayedRender>

    </div>
  );
}
