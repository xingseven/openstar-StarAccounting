import { useEffect, useState, useMemo } from "react";
import { DelayedRender } from "@/components/shared/DelayedRender";
import {
  StatsCardSkeleton,
  ChartSkeleton,
  ListTableSkeleton
} from "@/components/shared/Skeletons";
import {
  Plus,
  Target,
  TrendingUp,
  Calendar as CalendarIcon,
  Wallet,
  PiggyBank,
  ArrowRight,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Download,
  Archive,
  Trash2,
  AlertCircle,
  CheckSquare,
  Square
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
import type { SavingsGoal } from "@/types";
export type { SavingsGoal };

export type TransactionItem = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
};

type SortOption = "progress" | "deadline" | "name" | "createdAt";
type FilterOption = "all" | "active" | "completed" | "archived";

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
  onDelete: (item: SavingsGoal) => void;
  onArchive?: (item: SavingsGoal) => Promise<void>;
  onBatchDelete?: (ids: string[]) => Promise<void>;
  onBatchArchive?: (ids: string[]) => Promise<void>;
  onCopy?: (item: SavingsGoal) => void;
}

// Types and interfaces

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
  onDelete,
  onArchive,
  onBatchDelete,
  onBatchArchive,
  onCopy,
}: SavingsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("progress");
  const [filterBy, setFilterBy] = useState<FilterOption>("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debug log
  useEffect(() => {
    if (transactions) {
      console.log('SavingsDefaultTheme 收到 transactions:', transactions);
      console.log('transactions.length:', transactions.length);
    } else {
      console.log('SavingsDefaultTheme 收到 transactions: undefined');
    }
  }, [transactions]);

  // Filtered and sorted goals
  const filteredGoals = useMemo(() => {
    let result = [...items];

    // Filter by status
    if (filterBy === "active") {
      result = result.filter(item => item.status === "ACTIVE");
    } else if (filterBy === "completed") {
      result = result.filter(item => item.status === "COMPLETED");
    } else if (filterBy === "archived") {
      result = result.filter(item => item.status === "ARCHIVED");
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "progress") {
        const progressA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
        const progressB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
        return progressB - progressA;
      } else if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "createdAt") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [items, searchTerm, sortBy, filterBy]);

  // Deposit type distribution data
  const depositTypeData = useMemo(() => {
    const data = [
      { name: "现金", value: 0, fill: "#10B981" },
      { name: "死期", value: 0, fill: "#8B5CF6" },
      { name: "他人帮存", value: 0, fill: "#F59E0B" },
    ];
    items.forEach(item => {
      if (item.depositType === "CASH") data[0].value += item.currentAmount;
      else if (item.depositType === "FIXED_TERM") data[1].value += item.currentAmount;
      else if (item.depositType === "HELP_DEPOSIT") data[2].value += item.currentAmount;
    });
    return data.filter(d => d.value > 0);
  }, [items]);

  // Calculate expected completion date
  const getExpectedCompletion = (item: SavingsGoal): string | null => {
    if (!item.deadline || item.currentAmount >= item.targetAmount) return null;
    const remaining = item.targetAmount - item.currentAmount;
    const months = Math.ceil(remaining / 1000); // Assume 1000/month average, simplified
    const expected = new Date();
    expected.setMonth(expected.getMonth() + months);
    return expected.toLocaleDateString("zh-CN", { year: "numeric", month: "long" });
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline: string | null): number | null => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Check if progress is behind schedule
  const isBehindSchedule = (item: SavingsGoal): boolean => {
    if (!item.deadline || item.currentAmount >= item.targetAmount) return false;
    const totalDays = new Date(item.deadline).getTime() - new Date(item.createdAt).getTime();
    const elapsedDays = new Date().getTime() - new Date(item.createdAt).getTime();
    const expectedProgress = elapsedDays / totalDays;
    const actualProgress = item.currentAmount / item.targetAmount;
    return expectedProgress - actualProgress > 0.2; // 20% behind
  };

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
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900">储蓄目标</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">积少成多，实现你的财务愿望</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜索目标..."
              className="pl-9 w-full bg-white h-9 sm:h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant={filterBy === "active" ? "default" : "outline"}
              size="sm"
              className="h-9 px-2 sm:px-3"
              onClick={() => setFilterBy("active")}
            >
              进行中
            </Button>
            <Button
              variant={filterBy === "completed" ? "default" : "outline"}
              size="sm"
              className="h-9 px-2 sm:px-3"
              onClick={() => setFilterBy("completed")}
            >
              已完成
            </Button>
            <Button
              variant={filterBy === "archived" ? "default" : "outline"}
              size="sm"
              className="h-9 px-2 sm:px-3"
              onClick={() => setFilterBy("archived")}
            >
              已归档
            </Button>
            <Button
              variant={filterBy === "all" ? "default" : "outline"}
              size="sm"
              className="h-9 px-2 sm:px-3"
              onClick={() => setFilterBy("all")}
            >
              全部
            </Button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 px-2 text-sm border rounded-md bg-white"
          >
            <option value="progress">按进度</option>
            <option value="deadline">按截止日期</option>
            <option value="name">按名称</option>
            <option value="createdAt">按创建时间</option>
          </select>

          {/* Export button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 sm:px-3"
            onClick={() => {
              const csv = [
                ["名称", "模式", "存款类型", "当前金额", "目标金额", "完成率", "截止日期", "状态"].join(","),
                ...filteredGoals.map(item => [
                  item.name,
                  item.type,
                  item.depositType,
                  item.currentAmount,
                  item.targetAmount,
                  `${((item.currentAmount / item.targetAmount) * 100).toFixed(1)}%`,
                  item.deadline?.slice(0, 10) || "",
                  item.status
                ].join(","))
              ].join("\n");
              const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `储蓄目标_${new Date().toLocaleDateString("zh-CN")}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">导出</span>
          </Button>

          <Button onClick={onOpenCreate} className="bg-black hover:bg-gray-800 text-white h-9 sm:h-10 px-3 sm:px-4">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">新建目标</span>
          </Button>
        </div>
      </div>

      {/* Row 1: Summary Cards (3 cols) - With Skeleton */}
      <div className="grid gap-2 sm:gap-4 grid-cols-3">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <Wallet className="absolute -right-2 -bottom-2 h-16 w-16 sm:h-24 sm:w-24 text-blue-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">总存款</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-lg font-bold text-gray-900">¥{totalSaved.toLocaleString()}</div>
                <p className="text-[10px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1">所有目标的当前存款总和</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <Target className="absolute -right-2 -bottom-2 h-16 w-16 sm:h-24 sm:w-24 text-purple-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">目标总额</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-lg font-bold text-gray-900">¥{totalTarget.toLocaleString()}</div>
                <p className="text-[10px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1">所有目标的计划总额</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="absolute -right-2 -bottom-2 h-16 w-16 sm:h-24 sm:w-24 text-green-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">总体进度</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-lg font-bold text-gray-900">{overallProgress.toFixed(0)}%</div>
                <Progress value={overallProgress} className="h-1.5 sm:h-2 mt-1 sm:mt-2 bg-green-100" indicatorClassName="bg-green-500" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Row 2: Distribution Chart & Goals Grid */}
      <div className="grid gap-6 md:grid-cols-5">
        {loading ? (
          <>
            <div className="md:col-span-1">
              <ChartSkeleton />
            </div>
            <div className="md:col-span-1">
              <ChartSkeleton />
            </div>
            <div className="md:col-span-3">
              <ListTableSkeleton rows={3} columns={7} />
            </div>
          </>
        ) : (
          <>
            {/* Chart Column 1: 储蓄模式分布 */}
            <DelayedRender delay={50} className="md:col-span-1 h-full" fallback={<ChartSkeleton />}>
              <Card className="flex flex-col h-full">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-base">储蓄分布</CardTitle>
                  <CardDescription>按模式统计</CardDescription>
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
            </DelayedRender>

            {/* Chart Column 2: 存款类型分布 */}
            <DelayedRender delay={100} className="md:col-span-1 h-full" fallback={<ChartSkeleton />}>
              <Card className="flex flex-col h-full">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-base">存款类型</CardTitle>
                  <CardDescription>按方式统计</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 relative min-h-[200px]">
                  {depositTypeData.length > 0 ? (
                    <>
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie
                            data={depositTypeData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={40}
                            strokeWidth={5}
                          >
                            {depositTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                      <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-xs">
                        {depositTypeData.map((item, index) => (
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
            </DelayedRender>

            {/* Goals Table Column */}
            <DelayedRender delay={150} className="md:col-span-3 h-full" fallback={<ListTableSkeleton rows={3} columns={7} />}>
              <Card className="overflow-hidden min-h-[350px] h-full">
                <CardHeader className="flex flex-row items-center justify-between py-2 sm:py-4">
                  <div className="space-y-0 sm:space-y-1">
                    <CardTitle className="text-sm sm:text-base">目标列表</CardTitle>
                    <CardDescription className="hidden sm:block">按行展示每个储蓄目标</CardDescription>
                  </div>
                  <Button onClick={onOpenCreate} size="sm" className="h-8 text-xs">
                    <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">新增目标</span>
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Batch actions bar */}
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">已选择 {selectedIds.size} 项</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          if (onBatchArchive) {
                            onBatchArchive?.(Array.from(selectedIds));
                          } else {
                            alert("批量归档功能开发中");
                          }
                        }}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        批量归档
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm(`确定要删除选中的 ${selectedIds.size} 个目标吗？`)) {
                            onBatchDelete?.(Array.from(selectedIds));
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        批量删除
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setSelectedIds(new Set())}
                      >
                        取消
                      </Button>
                    </div>
                  )}
                  {filteredGoals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-dashed">
                      暂无目标，点击右上角新增
                    </div>
                  ) : (
                    <div className="overflow-x-auto md:overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="text-left px-2 py-2 w-8">
                              <button
                                onClick={() => {
                                  if (selectedIds.size === filteredGoals.length) {
                                    setSelectedIds(new Set());
                                  } else {
                                    setSelectedIds(new Set(filteredGoals.map(i => i.id)));
                                  }
                                }}
                                className="p-1"
                              >
                                {selectedIds.size === filteredGoals.length && filteredGoals.length > 0 ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </button>
                            </th>
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
                            const daysLeft = getDaysUntilDeadline(item.deadline);
                            const behind = isBehindSchedule(item);
                            const expectedDate = getExpectedCompletion(item);
                            return (
                              <tr key={item.id} className="hover:bg-gray-50/70">
                                <td className="px-2 py-3">
                                  <button
                                    onClick={() => {
                                      const newSet = new Set(selectedIds);
                                      if (newSet.has(item.id)) {
                                        newSet.delete(item.id);
                                      } else {
                                        newSet.add(item.id);
                                      }
                                      setSelectedIds(newSet);
                                    }}
                                    className="p-1"
                                  >
                                    {selectedIds.has(item.id) ? (
                                      <CheckSquare className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <Square className="h-4 w-4 text-gray-400" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    {behind && item.status === "ACTIVE" && (
                                      <span title="进度落后"><AlertCircle className="h-4 w-4 text-orange-500" /></span>
                                    )}
                                    {item.status === "ARCHIVED" && (
                                      <span title="已归档"><Archive className="h-4 w-4 text-gray-400" /></span>
                                    )}
                                    <button
                                      onClick={() => {
                                        onOpenPunch(item);
                                      }}
                                      className="hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
                                      title="打开月度计划"
                                    >
                                      {item.name}
                                    </button>
                                  </div>
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
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <div className="flex flex-col gap-0.5">
                                    <span className={clsx(
                                      "text-gray-500",
                                      daysLeft !== null && daysLeft < 0 && "text-gray-400 line-through",
                                      daysLeft !== null && daysLeft >= 0 && daysLeft < 7 && "text-red-600 font-medium",
                                      daysLeft !== null && daysLeft >= 7 && daysLeft < 30 && "text-orange-600"
                                    )}>
                                      {item.deadline ? item.deadline.slice(0, 10) : "—"}
                                    </span>
                                    {expectedDate && progress < 100 && (
                                      <span className="text-[10px] text-gray-400">预计 {expectedDate}</span>
                                    )}
                                  </div>
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
                                      onClick={() => {
                                        if (onArchive && item.status === "ACTIVE") {
                                          onArchive(item);
                                        } else {
                                          onOpenEdit(item);
                                        }
                                      }}
                                      className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                                      title={item.status === "ACTIVE" ? "归档" : "编辑"}
                                    >
                                      {item.status === "ACTIVE" ? "归档" : "修改"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (onCopy) {
                                          onCopy(item);
                                        } else {
                                          // Default: open edit with copied data
                                          onOpenEdit({ ...item, id: "", name: `${item.name} (副本)` });
                                        }
                                      }}
                                      className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
                                      title="复制"
                                    >
                                      复制
                                    </button>
                                    <button
                                      onClick={() => onDelete(item)}
                                      className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors whitespace-nowrap"
                                      title="删除"
                                    >
                                      删除
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
            </DelayedRender>
          </>
        )}
      </div>

    </div>
  );
}
