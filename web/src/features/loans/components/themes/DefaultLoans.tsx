import { useEffect, useMemo, useState } from "react";
import { DelayedRender } from "@/components/shared/DelayedRender";
import dynamic from "next/dynamic";
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

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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
  // 首次加载时显示骨架的延迟状态
  const [骨架显示, set骨架显示] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => set骨架显示(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const 显示骨架 = loading || 骨架显示;

  const getIcon = (platform: string) => {
    if (platform.includes("房")) return <Home className="h-5 w-5 text-blue-500" />;
    if (platform.includes("车")) return <CreditCard className="h-5 w-5 text-purple-500" />;
    if (platform.includes("银行")) return <Landmark className="h-5 w-5 text-red-500" />;
    return <Building className="h-5 w-5 text-gray-500" />;
  };

  // Loading 状态显示骨架
  if (显示骨架) {
    return (
      <div className="space-y-8 max-w-[1600px] mx-auto">
        <DelayedRender delay={0}>
          {/* 顶部按钮骨架 */}
          <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </DelayedRender>
        <DelayedRender delay={50}>
          {/* 图表骨架 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[350px] rounded-xl" />
            <Skeleton className="h-[350px] rounded-xl" />
          </div>
        </DelayedRender>
        <DelayedRender delay={100}>
          {/* 贷款卡片骨架 */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </DelayedRender>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <Button onClick={onOpenCreate} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新增贷款
        </Button>
      </div>

      {/* Analysis Charts */}
      {items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Platform Distribution */}
          <div className="rounded-xl bg-white p-4">
            <h3 className="text-base font-medium mb-1">贷款分布 (剩余金额)</h3>
            <p className="text-sm text-muted-foreground mb-2">各平台待还金额占比</p>
            <ReactECharts
              option={{
                tooltip: { trigger: 'item' },
                series: [{
                  type: 'pie',
                  radius: ['40%', '70%'],
                  label: { show: true, formatter: '{b} {d}%' },
                  data: platformData.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: { color: item.fill }
                  }))
                }]
              }}
              style={{ height: 300, width: '100%' }}
            />
          </div>

          {/* Paid vs Remaining */}
          <div className="rounded-xl bg-white p-4">
            <h3 className="text-base font-medium mb-1">还款进度分析</h3>
            <p className="text-sm text-muted-foreground mb-2">已还本金 vs 剩余本金</p>
            <ReactECharts
              option={{
                tooltip: { trigger: 'axis' },
                legend: { data: ['已还', '剩余'] },
                grid: { left: 50, right: 20, top: 30, bottom: 60 },
                xAxis: {
                  type: 'category',
                  data: paidVsRemainingData.map(d => d.platform),
                  axisLabel: { rotate: -15 }
                },
                yAxis: { type: 'value', splitLine: { show: false } },
                series: [
                  {
                    name: '已还',
                    type: 'bar',
                    stack: 'total',
                    data: paidVsRemainingData.map(d => d.paid),
                    itemStyle: { color: '#1d4ed8' }
                  },
                  {
                    name: '剩余',
                    type: 'bar',
                    stack: 'total',
                    data: paidVsRemainingData.map(d => d.remaining),
                    itemStyle: { color: '#60a5fa' }
                  }
                ]
              }}
              style={{ height: 300, width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Loan List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
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
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
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
                      <button onClick={() => onRepay(item)} className="p-1.5 hover:bg-gray-100 rounded-md text-blue-600 transition-colors" title="登记还款">
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
                      <Progress value={progress} className="h-2" indicatorClassName="bg-blue-500" />
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-gray-500">剩余 ¥{item.remainingAmount.toLocaleString()}</span>
                        <span className="text-gray-900 font-medium">总额 ¥{item.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                {/* Decorative bottom border */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 opacity-50" />
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
