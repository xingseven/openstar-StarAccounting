"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  CheckSquare,
  Image as ImageIcon,
  PiggyBank,
  Plus,
  Search,
  Square,
  Target,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeletons";
import { ThemeHero, ThemeMetricCard, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";
import { cn } from "@/lib/utils";
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
  onImageChange?: (item: SavingsGoal, image: string | null) => Promise<void>;
}

const TYPE_COLORS: Record<string, string> = {
  MONTHLY: "#93c5fd",
  YEARLY: "#60a5fa",
  LONG_TERM: "#2563eb",
  BI_MONTHLY_ODD: "#1d4ed8",
  BI_MONTHLY_EVEN: "#1d4ed8",
};

function getGoalModeLabel(type: SavingsGoal["type"]) {
  switch (type) {
    case "MONTHLY":
      return "月度";
    case "YEARLY":
      return "年度";
    case "LONG_TERM":
      return "长期";
    case "BI_MONTHLY_ODD":
      return "隔月(奇)";
    case "BI_MONTHLY_EVEN":
      return "隔月(偶)";
    default:
      return type;
  }
}

function getDepositTypeLabel(type: SavingsGoal["depositType"]) {
  switch (type) {
    case "CASH":
      return "现金";
    case "FIXED_TERM":
      return "定期";
    case "HELP_DEPOSIT":
      return "他人帮存";
    default:
      return type;
  }
}

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isBehindSchedule(item: SavingsGoal): boolean {
  if (!item.deadline || item.currentAmount >= item.targetAmount) return false;
  const totalDays = new Date(item.deadline).getTime() - new Date(item.createdAt).getTime();
  const elapsedDays = new Date().getTime() - new Date(item.createdAt).getTime();
  const expectedProgress = elapsedDays / totalDays;
  const actualProgress = item.currentAmount / item.targetAmount;
  return expectedProgress - actualProgress > 0.2;
}

function SavingsGoalCard({
  item,
  selected,
  onToggleSelect,
  onOpenEdit,
  onOpenPunch,
  onOpenWithdrawal,
  onDelete,
  onArchive,
  onCopy,
  onOpenImage,
}: {
  item: SavingsGoal;
  selected: boolean;
  onToggleSelect: () => void;
  onOpenEdit: () => void;
  onOpenPunch: () => void;
  onOpenWithdrawal: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onCopy?: () => void;
  onOpenImage?: () => void;
}) {
  const progress = item.targetAmount > 0 ? Math.min(100, (item.currentAmount / item.targetAmount) * 100) : 0;
  const daysLeft = getDaysUntilDeadline(item.deadline);
  const behind = isBehindSchedule(item);

  return (
    <ThemeSurface className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onToggleSelect} className="text-slate-400 hover:text-slate-700">
            {selected ? <CheckSquare className="h-4.5 w-4.5 text-blue-600" /> : <Square className="h-4.5 w-4.5" />}
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-blue-600">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950">{item.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{getGoalModeLabel(item.type)}</span>
              <span>{getDepositTypeLabel(item.depositType)}</span>
              {behind && item.status === "ACTIVE" ? <span className="text-amber-600">进度偏慢</span> : null}
            </div>
          </div>
        </div>

        {item.image ? (
          <button type="button" onClick={onOpenImage} className="overflow-hidden rounded-xl border border-slate-200">
            <Image src={item.image} alt={item.name} width={48} height={48} className="h-12 w-12 object-cover" unoptimized />
          </button>
        ) : (
          <button type="button" onClick={onOpenImage} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
            <ImageIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">当前 / 目标</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              ¥{item.currentAmount.toLocaleString()} / ¥{item.targetAmount.toLocaleString()}
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{progress.toFixed(0)}%</span>
        </div>

        <div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-blue-600" />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{item.status === "COMPLETED" ? "已完成" : item.status === "ARCHIVED" ? "已归档" : "进行中"}</span>
            <span>{item.deadline ? `${daysLeft} 天到期` : "无截止日期"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenPunch}>
            打卡
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenWithdrawal}>
            取款
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenEdit}>
            编辑
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={onCopy}>
            复制
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {onArchive ? (
            <button type="button" onClick={onArchive} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900">
              <Archive className="h-3.5 w-3.5" />
              归档
            </button>
          ) : null}
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
            <Trash2 className="h-3.5 w-3.5" />
            删除
          </button>
        </div>
      </div>
    </ThemeSurface>
  );
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
  onDelete,
  onArchive,
  onBatchDelete,
  onBatchArchive,
  onCopy,
  onImageChange,
}: SavingsViewProps) {
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("progress");
  const [filterBy, setFilterBy] = useState<FilterOption>("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageDialogGoal, setImageDialogGoal] = useState<SavingsGoal | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const isSkeletonVisible = loading || showInitialSkeleton;

  const filteredGoals = useMemo(() => {
    let result = [...items];

    if (filterBy === "active") result = result.filter((item) => item.status === "ACTIVE");
    if (filterBy === "completed") result = result.filter((item) => item.status === "COMPLETED");
    if (filterBy === "archived") result = result.filter((item) => item.status === "ARCHIVED");

    if (searchTerm.trim()) {
      result = result.filter((item) => item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    }

    result.sort((a, b) => {
      if (sortBy === "progress") {
        return b.currentAmount / Math.max(b.targetAmount, 1) - a.currentAmount / Math.max(a.targetAmount, 1);
      }
      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [items, filterBy, searchTerm, sortBy]);

  const distributionData = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const key = getGoalModeLabel(item.type);
      map.set(key, (map.get(key) ?? 0) + item.currentAmount);
    });

    return Array.from(map.entries()).map(([name, value], index) => ({
      name,
      value,
      fill: Object.values(TYPE_COLORS)[index % Object.values(TYPE_COLORS).length],
    }));
  }, [items]);

  if (isSkeletonVisible) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 sm:space-y-5">
        <Skeleton className="h-[220px] rounded-[28px]" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <Skeleton className="h-[320px] rounded-[24px]" />
          <Skeleton className="h-[320px] rounded-[24px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[290px] rounded-[24px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1680px] space-y-4 sm:space-y-5">
        <DelayedRender delay={0}>
          <ThemeHero className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">储蓄工作台</h1>
                <p className="mt-1 text-sm text-slate-500">统一查看储蓄目标、完成进度和最近存取款动作。</p>
              </div>
              <Button onClick={onOpenCreate} className="rounded-2xl bg-slate-900 hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                新建目标
              </Button>
            </div>
          </ThemeHero>
        </DelayedRender>

        <DelayedRender delay={60}>
          <div className="grid gap-3 md:grid-cols-3">
            <ThemeMetricCard label="总存款" value={`¥${totalSaved.toLocaleString()}`} detail="当前累计" tone="green" icon={Wallet} className="p-4" hideDetailOnMobile />
            <ThemeMetricCard label="目标总额" value={`¥${totalTarget.toLocaleString()}`} detail="全部计划" tone="blue" icon={Target} className="p-4" hideDetailOnMobile />
            <ThemeMetricCard label="总体进度" value={`${overallProgress.toFixed(0)}%`} detail="储蓄完成率" tone="slate" icon={PiggyBank} className="p-4" hideDetailOnMobile />
          </div>
        </DelayedRender>

        <DelayedRender delay={120}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
            <ThemeSurface className="p-4 sm:p-6">
              <ThemeSectionHeader eyebrow="筛选工具" title="查找与批量操作" description="按状态、名称和排序方式管理你的储蓄目标。" />

              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="搜索目标"
                      className="rounded-2xl pl-10"
                    />
                  </div>
                  <select value={filterBy} onChange={(event) => setFilterBy(event.target.value as FilterOption)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
                    <option value="active">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="archived">已归档</option>
                    <option value="all">全部</option>
                  </select>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
                    <option value="progress">按进度</option>
                    <option value="deadline">按截止日</option>
                    <option value="name">按名称</option>
                    <option value="createdAt">按创建时间</option>
                  </select>
                </div>

                {selectedIds.size > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm">
                    <span className="font-medium text-slate-700">已选择 {selectedIds.size} 项</span>
                    {onBatchArchive ? (
                      <Button variant="outline" className="rounded-xl" onClick={() => onBatchArchive(Array.from(selectedIds))}>
                        <Archive className="mr-2 h-4 w-4" />
                        批量归档
                      </Button>
                    ) : null}
                    {onBatchDelete ? (
                      <Button variant="outline" className="rounded-xl text-red-600" onClick={() => onBatchDelete(Array.from(selectedIds))}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        批量删除
                      </Button>
                    ) : null}
                    <Button variant="ghost" className="rounded-xl" onClick={() => setSelectedIds(new Set())}>
                      取消
                    </Button>
                  </div>
                ) : null}
              </div>
            </ThemeSurface>

            <ThemeSurface className="p-4 sm:p-6">
              <ThemeSectionHeader eyebrow="目标分布" title="储蓄模式占比" description="看钱主要沉淀在月度、年度还是长期储蓄计划。" />
              <div className="mt-5 grid items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div className="mx-auto h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={4}>
                        {distributionData.map((item) => (
                          <Cell key={item.name} fill={item.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5">
                  {distributionData.map((item) => (
                    <div key={item.name} className="rounded-[18px] bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="truncate text-sm font-medium text-slate-900">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-950">¥{item.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ThemeSurface>
          </div>
        </DelayedRender>

        <DelayedRender delay={180}>
          {filteredGoals.length === 0 ? (
            <ThemeSurface className="p-8">
              <EmptyState icon={Target} title="暂无储蓄目标" description="开始创建你的第一个储蓄目标吧。" />
            </ThemeSurface>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredGoals.map((item) => (
                <SavingsGoalCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={() => {
                    const next = new Set(selectedIds);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    setSelectedIds(next);
                  }}
                  onOpenEdit={() => onOpenEdit(item)}
                  onOpenPunch={() => onOpenPunch(item)}
                  onOpenWithdrawal={() => onOpenWithdrawal(item)}
                  onDelete={() => onDelete(item)}
                  onArchive={onArchive ? () => onArchive(item) : undefined}
                  onCopy={onCopy ? () => onCopy(item) : undefined}
                  onOpenImage={() => {
                    setImageDialogGoal(item);
                    setPreviewImage(item.image || null);
                    setIsImageDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </DelayedRender>

        <DelayedRender delay={240}>
          <ThemeSurface className="p-4 sm:p-6">
            <ThemeSectionHeader eyebrow="最近动态" title="最近存取款记录" description="最近发生的储蓄相关交易。" />
            <div className="mt-5 space-y-2.5">
              {transactions.length === 0 ? (
                <EmptyState icon={PiggyBank} title="暂无储蓄交易" description="打卡或取款后，这里会显示最近记录。" />
              ) : (
                transactions.slice(0, 8).map((transaction) => {
                  const isIncome = transaction.type === "INCOME";
                  return (
                    <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", isIncome ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600")}>
                          {isIncome ? <ArrowUpRight className="h-4.5 w-4.5" /> : <ArrowDownLeft className="h-4.5 w-4.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-950">{transaction.category}</p>
                          <p className="mt-1 text-xs text-slate-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-semibold", isIncome ? "text-blue-600" : "text-red-600")}>
                          {isIncome ? "+" : "-"}¥{Number(transaction.amount).toLocaleString()}
                        </p>
                        {transaction.description ? <p className="mt-1 text-xs text-slate-500">{transaction.description}</p> : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ThemeSurface>
        </DelayedRender>
      </div>

      {isImageDialogOpen && imageDialogGoal ? (
        <BottomSheet open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <BottomSheetContent className="max-w-md">
            <ThemeSectionHeader eyebrow="目标图片" title={imageDialogGoal.name} />
            <div className="mt-5 space-y-4">
              {previewImage ? (
                <>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <Image src={previewImage} alt={imageDialogGoal.name} width={640} height={420} className="h-auto w-full object-contain" unoptimized />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (event) => {
                          const file = (event.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (loadEvent) => {
                            const base64 = loadEvent.target?.result as string;
                            setPreviewImage(base64);
                            await onImageChange?.(imageDialogGoal, base64);
                          };
                          reader.readAsDataURL(file);
                        };
                        input.click();
                      }}
                    >
                      更换图片
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl text-red-600"
                      onClick={async () => {
                        setPreviewImage(null);
                        await onImageChange?.(imageDialogGoal, null);
                        setIsImageDialogOpen(false);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="flex h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (event) => {
                      const file = (event.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (loadEvent) => {
                        const base64 = loadEvent.target?.result as string;
                        setPreviewImage(base64);
                        await onImageChange?.(imageDialogGoal, base64);
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }}
                >
                  <ImageIcon className="h-10 w-10 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-900">点击上传图片</p>
                  <p className="mt-1 text-sm text-slate-500">支持 JPG、PNG、GIF</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" className="rounded-xl" onClick={() => setIsImageDialogOpen(false)}>
                  关闭
                </Button>
              </div>
            </div>
          </BottomSheetContent>
        </BottomSheet>
      ) : null}
    </>
  );
}
