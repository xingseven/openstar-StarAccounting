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
import { 
  Plus, 
  MoreHorizontal, 
  Calendar,
  Banknote
} from "lucide-react";

export type Loan = {
  id: string;
  platform: string;
  totalAmount: number;
  remainingAmount: number;
  periods: number;
  paidPeriods: number;
  monthlyPayment: number;
  dueDate: number;
  status: "ACTIVE" | "COMPLETED" | "DEFAULT";
  createdAt: string;
};

interface LoansViewProps {
  items: Loan[];
  platformData: Array<{ name: string; value: number; fill: string }>;
  paidVsRemainingData: Array<{ platform: string; paid: number; remaining: number }>;
  onOpenCreate: () => void;
  onOpenEdit: (item: Loan) => void;
  onOpenSchedule: (item: Loan) => void;
}

export function LoansDefaultTheme({
  items,
  platformData,
  paidVsRemainingData,
  onOpenCreate,
  onOpenEdit,
  onOpenSchedule,
}: LoansViewProps) {
  const chartConfig = {
    paid: { label: "已还", color: "hsl(var(--chart-1))" },
    remaining: { label: "剩余", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">贷款管理</h1>
          <p className="text-gray-500 mt-1">清晰掌握负债情况，合理规划还款</p>
        </div>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增贷款
        </button>
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
                  >
                    <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2" />
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
                  <ChartLegend content={<ChartLegendContent />} />
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
        {items.length === 0 ? (
          <div className="col-span-full rounded border p-12 text-center text-gray-500">
            暂无贷款记录
          </div>
        ) : (
          items.map((item) => {
            const progress = item.totalAmount > 0
              ? Math.min(100, ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100)
              : 0;
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{item.platform}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        每月 {item.dueDate} 日还款
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => onOpenSchedule(item)} className="p-1 hover:bg-gray-100 rounded text-blue-600" title="还款计划">
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button onClick={() => onOpenEdit(item)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Banknote className="h-4 w-4" />
                        月供
                      </div>
                      <span className="font-semibold">¥{item.monthlyPayment.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>进度 {progress.toFixed(1)}%</span>
                        <span>{item.paidPeriods} / {item.periods} 期</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">剩余 ¥{item.remainingAmount.toLocaleString()}</span>
                        <span className="text-gray-900 font-medium">总额 ¥{item.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
