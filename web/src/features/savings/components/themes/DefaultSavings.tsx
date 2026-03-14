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
import { SavingsPlanDialog } from "../SavingsPlanDialog";

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
  onOpenCreate: () => void;
  onOpenEdit: (item: SavingsGoal) => void;
}

// Helper component for staggered animation and lazy loading
function DelayedRender({ children, delay, lazy = false }: { children: React.ReactNode; delay: number; lazy?: boolean }) {
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
      <div ref={ref} className="h-[250px] w-full flex flex-col items-center justify-center bg-white border rounded-xl animate-pulse space-y-4 p-6">
        <div className="w-full flex justify-between items-center">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex-1 w-full flex items-end justify-between gap-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-gray-200 rounded-t w-full" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
           ))}
        </div>
        <div className="h-4 w-full bg-gray-100 rounded"></div>
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
  onOpenCreate,
  onOpenEdit,
}: SavingsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [planGoal, setPlanGoal] = useState<SavingsGoal | null>(null);

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
    <div className="space-y-8 max-w-[1600px] mx-auto p-6">
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

      {/* Row 1: Summary Cards (3 cols) - Instant Render */}
      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      {/* Row 2: Distribution Chart & Goals Grid */}
      <DelayedRender delay={200}>
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

          {/* Goals Grid Column */}
          <div className="md:col-span-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((item) => {
              const progress = item.targetAmount > 0 
                ? Math.min(100, (item.currentAmount / item.targetAmount) * 100) 
                : 0;
              
              return (
                <Card key={item.id} className="group overflow-hidden hover:shadow-md transition-shadow relative border-l-4 border-l-transparent hover:border-l-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className={clsx(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          item.type === "LONG_TERM" ? "bg-blue-50 text-blue-600" :
                          item.type === "YEARLY" ? "bg-purple-50 text-purple-600" :
                          item.type === "MONTHLY" ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                        )}>
                          <PiggyBank className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {(item.type === "BI_MONTHLY_ODD" || item.type === "BI_MONTHLY_EVEN") ? (
                              <div className="relative group/tooltip inline-block cursor-help">
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-700">
                                  {item.type === "BI_MONTHLY_ODD" ? "隔月(单)" : "隔月(双)"}
                                </span>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                                  隔月存就是存款月可以存大额，因为有上个月剩余下来的除去固定支出的剩余就可以存这样子。
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            ) : (
                              <span className={clsx(
                                "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                item.type === "LONG_TERM" ? "bg-blue-50 text-blue-700" :
                                item.type === "YEARLY" ? "bg-purple-50 text-purple-700" :
                                "bg-amber-50 text-amber-700"
                              )}>
                                {item.type === "LONG_TERM" ? "长期" : item.type === "YEARLY" ? "年度" : "月度"}
                              </span>
                            )}
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-medium tracking-wider",
                              "bg-gray-100 text-gray-600"
                            )}>
                              {item.depositType === "CASH" ? "现金" : 
                               item.depositType === "FIXED_TERM" ? "死期" : 
                               item.depositType === "HELP_DEPOSIT" ? "他人帮存" : "现金"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setPlanGoal(item)} 
                          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-black transition-colors"
                          title="指定计划"
                        >
                          <Target className="h-4 w-4" />
                        </button>
                        <button onClick={() => onOpenEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-black transition-colors" title="编辑">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="text-2xl font-bold text-gray-900">
                          {progress.toFixed(0)}<span className="text-sm text-gray-500 font-normal">%</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          ¥{item.currentAmount.toLocaleString()} / ¥{item.targetAmount.toLocaleString()}
                        </div>
                      </div>
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
                      {item.deadline && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 pt-2 border-t border-dashed">
                          <CalendarIcon className="h-3 w-3" />
                          截止日期: {item.deadline.slice(0, 10)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Empty State Add Button */}
            <button
              onClick={onOpenCreate}
              className="group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-gray-400 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-300 min-h-[200px]"
            >
              <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium">添加新目标</span>
            </button>
          </div>
        </div>
      </DelayedRender>

      {/* Row 3: Transactions - Lazy Load */}
      <DelayedRender delay={100} lazy>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="space-y-1">
              <CardTitle className="text-base">存取记录</CardTitle>
              <CardDescription>包含“储蓄”、“存款”、“理财”等分类的流水</CardDescription>
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

      {/* Dialogs */}
      <SavingsPlanDialog 
        open={!!planGoal} 
        onOpenChange={(open) => !open && setPlanGoal(null)} 
        goal={planGoal} 
      />
    </div>
  );
}
