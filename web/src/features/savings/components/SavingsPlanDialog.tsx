"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BottomSheet, BottomSheetContent, BottomSheetDescription, BottomSheetHeader, BottomSheetTitle } from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeActionBar, ThemeDialogSection, ThemeEmptyState, ThemeToolbar } from "@/components/shared/theme-primitives";
import type { SavingsGoal } from "./themes/DefaultSavings";

export type SavingsPlan = {
  id: string;
  goalId: string;
  month: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  salary: number;
  expenses: Record<string, number>;
  remark: string;
  proofImage?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CalculatedPlan = SavingsPlan & {
  totalExp: number;
  currentBalance: number;
  totalAvailable: number;
  remaining: number;
};

interface SavingsPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
  onPlansChanged?: () => void;
}

export function SavingsPlanDialog({ open, onOpenChange, goal, onPlansChanged }: SavingsPlanDialogProps) {
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ items: SavingsPlan[] }>(`/api/savings/${goal.id}/plans`);
      const items = data.items ?? [];
      if (items.length > 0) {
        setPlans(items);
      } else {
        const initialized = await initializeEmptyPlans(goal);
        setPlans(initialized);
        if (initialized.length > 0) {
          onPlansChanged?.();
        }
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  }, [goal, onPlansChanged]);

  useEffect(() => {
    if (open && goal) {
      void fetchPlans();
    }
  }, [open, goal, fetchPlans]);

  const calculatedPlans: CalculatedPlan[] = useMemo(() => {
    if (goal?.type === "MONTHLY") {
      return plans.map((plan) => ({
        ...plan,
        totalExp: 0,
        currentBalance: 0,
        totalAvailable: 0,
        remaining: 0,
      }));
    }

    let carryOver = 0;
    return plans.map((plan) => {
      const totalExp = Object.values(plan.expenses || {}).reduce((sum, value) => sum + Number(value), 0);
      const currentBalance = Number(plan.salary || 0) - totalExp;
      const totalAvailable = currentBalance + carryOver;
      const remaining = totalAvailable - Number(plan.amount || 0);
      carryOver = remaining;

      return {
        ...plan,
        totalExp,
        currentBalance,
        totalAvailable,
        remaining,
      };
    });
  }, [goal?.type, plans]);

  const displayPlans = useMemo(() => {
    const plansWithAmount = calculatedPlans.filter((plan) => Number(plan.amount) > 0);
    return plansWithAmount.length > 0 ? plansWithAmount : calculatedPlans;
  }, [calculatedPlans]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  async function handleUpdatePlan(id: string, updates: Partial<SavingsPlan>) {
    const updatedPlans = plans.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan));
    setPlans(updatedPlans);

    try {
      await apiFetch(`/api/savings/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (updates.status === "COMPLETED") {
        const plan = plans.find((item) => item.id === id);
        if (plan && plan.amount > 0) {
          await apiFetch("/api/transactions", {
            method: "POST",
            body: JSON.stringify({
              amount: plan.amount.toString(),
              type: "INCOME" as const,
              category: "储蓄存款",
              platform: "手动打卡",
              merchant: goal?.name || "储蓄目标",
              date: new Date().toISOString(),
              description: `储蓄打卡 - ${plan.month}`,
            }),
          }).catch((error) => console.error("Failed to create transaction for savings plan", error));
        }
      }

      onPlansChanged?.();
    } catch (error) {
      console.error("Failed to update plan", error);
      void fetchPlans();
    }
  }

  function handleProofUpload(planId: string, file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) return;
      void handleUpdatePlan(planId, { proofImage: value });
    };
    reader.readAsDataURL(file);
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="flex max-h-[90vh] max-w-[920px] flex-col">
        <BottomSheetHeader>
          <BottomSheetTitle>每月打卡 - {goal?.name}</BottomSheetTitle>
          <BottomSheetDescription>卡片式查看每个月的计划存款、状态与凭证。</BottomSheetDescription>
        </BottomSheetHeader>

        <ThemeToolbar className="mt-4 justify-between">
          <div className="text-sm text-slate-500">当前显示 {displayPlans.length} 条计划记录</div>
          <Button
            variant="outline"
            onClick={async () => {
              if (!goal) return;
              if (!confirm("将按 12 个月重新初始化打卡计划，确定吗？")) return;
              setLoading(true);
              const initialized = await initializeEmptyPlans(goal);
              setPlans(initialized);
              setLoading(false);
              if (initialized.length > 0) onPlansChanged?.();
            }}
          >
            重新初始化 12 个月
          </Button>
        </ThemeToolbar>

        <div className="mt-4 flex-1 space-y-3 overflow-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">加载中...</div>
          ) : displayPlans.length === 0 ? (
            <ThemeEmptyState title="暂无计划" description="请先创建储蓄目标计划。" icon={goal?.type === "MONTHLY" ? undefined as never : undefined as never} />
          ) : (
            displayPlans.map((plan) => (
              <ThemeDialogSection key={plan.id} className={plan.month === currentMonth ? "border-blue-300 ring-1 ring-blue-100" : undefined}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-[180px] space-y-2">
                    <div className="text-sm font-semibold text-slate-900">{plan.month.replace("-", "/")}</div>
                    <div className="text-xs text-slate-500">计划存款</div>
                    <Input type="number" className="h-9 w-[140px]" value={plan.amount} onChange={(e) => void handleUpdatePlan(plan.id, { amount: Number(e.target.value) })} />
                    {goal?.type !== "MONTHLY" ? (
                      <div className="text-xs text-slate-500">
                        可存金额：<span className="font-medium text-blue-600">¥{plan.totalAvailable.toLocaleString()}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-[160px] space-y-2">
                    <div className="text-xs text-slate-500">打卡状态</div>
                    <button
                      type="button"
                      onClick={() => void handleUpdatePlan(plan.id, { status: plan.status === "COMPLETED" ? "PENDING" : "COMPLETED" })}
                      className={`rounded px-3 py-1.5 text-xs font-medium ${plan.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {plan.status === "COMPLETED" ? "已存款" : "未存款"}
                    </button>
                    {plan.updatedAt && plan.status === "COMPLETED" ? (
                      <div className="text-[10px] text-slate-400">
                        打卡：{new Date(plan.updatedAt).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    ) : null}
                    <div className="text-xs text-slate-500">备注</div>
                    <Input className="h-9 w-[180px]" value={plan.remark || ""} placeholder="备注..." onChange={(e) => void handleUpdatePlan(plan.id, { remark: e.target.value })} />
                  </div>

                  <div
                    className={cn(
                      "min-w-[190px] rounded-md border border-dashed p-3 transition-colors",
                      dragOverId === plan.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50/60"
                    )}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverId(plan.id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragOverId(null);
                      handleProofUpload(plan.id, event.dataTransfer.files?.[0]);
                    }}
                  >
                    <div className="mb-2 text-xs text-slate-500">打卡凭证</div>
                    <label htmlFor={`plan-proof-${plan.id}`} className="inline-flex cursor-pointer items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200">上传</span>
                    </label>
                    <input id={`plan-proof-${plan.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleProofUpload(plan.id, e.target.files?.[0])} />
                    <div className="mt-1 text-[11px] text-slate-400">支持拖入图片</div>
                    {plan.proofImage ? (
                      <div className="mt-2 space-y-1">
                        <Image src={plan.proofImage} alt="打卡凭证" width={56} height={56} unoptimized className="h-14 w-14 rounded border object-cover" />
                        <button type="button" className="block text-xs text-blue-600 hover:underline" onClick={() => window.open(plan.proofImage, "_blank")}>
                          查看图片
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </ThemeDialogSection>
            ))
          )}
        </div>

        <ThemeActionBar className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </ThemeActionBar>
      </BottomSheetContent>
    </BottomSheet>
  );
}

async function initializeEmptyPlans(goal: SavingsGoal): Promise<SavingsPlan[]> {
  const initDuration = 12;
  const initStartMonth = new Date().toISOString().slice(0, 7);
  const [year, month] = initStartMonth.split("-").map(Number);
  const draftPlans: Array<Omit<SavingsPlan, "id" | "goalId">> = [];

  for (let index = 0; index < initDuration; index += 1) {
    const currentDate = new Date(year, month - 1 + index, 1);
    const monthText = currentDate.toISOString().slice(0, 7);
    draftPlans.push({
      month: monthText,
      amount: 0,
      status: "PENDING",
      salary: 0,
      expenses: goal.type === "MONTHLY" ? {} : { 固定支出1: 0 },
      remark: "",
      proofImage: "",
    });
  }

  try {
    const data = await apiFetch<{ items: SavingsPlan[] }>(`/api/savings/${goal.id}/plans/batch`, {
      method: "POST",
      body: JSON.stringify({
        plans: draftPlans,
        config: {
          duration: initDuration,
          startMonth: initStartMonth,
          depositDay: 15,
          monthlyAmount: 0,
          baseSalary: 0,
          fixedExpenses: [{ name: "固定支出1", amount: 0 }],
        },
      }),
    });
    return data.items ?? [];
  } catch (error) {
    console.error("Failed to initialize plans", error);
    return [];
  }
}
