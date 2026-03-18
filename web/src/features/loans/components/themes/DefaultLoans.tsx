import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Pie, 
  PieChart, 
  XAxis, 
  YAxis 
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar,
  Banknote,
  HandCoins,
  Landmark,
  CreditCard,
  Building,
  Home
} from "lucide-react";
import { clsx } from "clsx";
import { Skeleton, ChartSkeleton, CardListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Loan } from "@/types";
export type { Loan };

interface LoansViewProps {
  items: Loan[];
  platformData: Array<{ name: string; value: number; fill: string }>;
  paidVsRemainingData: Array<{ platform: string; paid: number; remaining: number }>;
  loading?: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: Loan) => void;
  onOpenSchedule: (item: Loan) => void;
  onRepay: (item: Loan) => void;
}

export function LoansDefaultTheme({
  items,
  platformData,
  paidVsRemainingData,
  loading = false,
  onOpenCreate,
  onOpenEdit,
  onOpenSchedule,
  onRepay,
}: LoansViewProps) {
  const chartConfig = {
    paid: { label: "已还", color: "hsl(var(--chart-1))" },
    remaining: { label: "剩余", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const getIcon = (platform: string) => {
    if (platform.includes("房")) return <Home className="h-5 w-5 text-blue-500" />;
    if (platform.includes("车")) return <CreditCard className="h-5 w-5 text-purple-500" />;
    if (platform.includes("银行")) return <Landmark className="h-5 w-5 text-red-500" />;
    return <Building className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">贷款管理</h1>
          <p className="text-gray-500 mt-1">清晰掌握负债情况，合理规划还款</p>
        </div>
        <Button onClick={onOpenCreate} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新增贷款
        </Button>
      </div>

      {/* Analysis Charts */}
      {items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>贷款分布 (剩余金额)</CardTitle>
              <CardDescription>各平台待还金额占比</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={platformData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2" verticalAlign="bottom" align="right" />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Paid vs Remaining */}
          <Card>
            <CardHeader>
              <CardTitle>还款进度分析</CardTitle>
              <CardDescription>已还本金 vs 剩余本金</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={paidVsRemainingData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="platform"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" align="right" />
                  <Bar dataKey="paid" stackId="a" fill="var(--color-chart-1)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="remaining" stackId="a" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loan List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white border p-4 min-h-[200px]">
                <div className="flex gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : items.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Landmark}
              title="暂无贷款记录"
              description="开始添加你的第一笔贷款吧"
            />
          </div>
        ) : (
          items.map((item) => {
            const progress = item.totalAmount > 0
              ? Math.min(100, ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100)
              : 0;
            return (
              <Card key={item.id} className="group hover:shadow-md transition-shadow relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                        {getIcon(item.platform)}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{item.platform}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          每月 {item.dueDate} 日还款
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => onOpenSchedule(item)} className="p-1.5 hover:bg-gray-100 rounded-md text-blue-600 transition-colors" title="还款计划">
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button onClick={() => onRepay(item)} className="p-1.5 hover:bg-gray-100 rounded-md text-emerald-600 transition-colors" title="登记还款">
                        <HandCoins className="h-4 w-4" />
                      </button>
                      <button onClick={() => onOpenEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-black transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Banknote className="h-4 w-4" />
                        月供
                      </div>
                      <span className="font-semibold text-gray-900">¥{item.monthlyPayment.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>进度 {progress.toFixed(1)}%</span>
                        <span>{item.paidPeriods} / {item.periods} 期</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-gray-500">剩余 ¥{item.remainingAmount.toLocaleString()}</span>
                        <span className="text-gray-900 font-medium">总额 ¥{item.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                {/* Decorative bottom border */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 opacity-50" />
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
