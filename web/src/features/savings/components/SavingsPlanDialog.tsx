import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SavingsGoal } from "./themes/DefaultSavings";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";

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

  useEffect(() => {
    if (open && goal) {
      fetchPlans();
    }
  }, [open, goal]);

  const fetchPlans = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ items: SavingsPlan[] }>(`/api/savings/${goal.id}/plans`);
      const items = data.items;
      if (items.length > 0) {
        setPlans(items);
      } else {
        const initialized = await initializeEmptyPlans();
        if (initialized.length > 0) {
          setPlans(initialized);
          onPlansChanged?.();
        } else {
          alert("初始化打卡表失败，请检查网络或重新打开后重试");
        }
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeEmptyPlans = async (): Promise<SavingsPlan[]> => {
    if (!goal) return [];
    const initDuration = 12;
    const initStartMonth = new Date().toISOString().slice(0, 7);
    const [year, month] = initStartMonth.split("-").map(Number);
    const draftPlans: any[] = [];
    for (let i = 0; i < initDuration; i++) {
      const currentDate = new Date(year, month - 1 + i, 1);
      const mStr = currentDate.toISOString().slice(0, 7);
      draftPlans.push({
        month: mStr,
        amount: 0,
        status: "PENDING",
        salary: 0,
        expenses: goal.type === "MONTHLY" ? {} : { 固定支出1: 0 },
        remark: "",
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
  };

  const handleUpdatePlan = async (id: string, updates: Partial<SavingsPlan>) => {
    // Optimistic update
    const updatedPlans = plans.map(p => p.id === id ? { ...p, ...updates } : p);
    setPlans(updatedPlans);

    try {
      await apiFetch(`/api/savings/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      
      // If status changed to COMPLETED, create a transaction record
      if (updates.status === "COMPLETED") {
        const plan = plans.find(p => p.id === id);
        if (plan && plan.amount > 0) {
          try {
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
            });
          } catch (err) {
            console.error("Failed to create transaction for savings plan", err);
          }
        }
      }
      
      onPlansChanged?.();
    } catch (error) {
      console.error("Failed to update plan", error);
      fetchPlans(); // Revert on error
    }
  };

  // Helper to calculate dynamic values for Bi-Monthly table
  const getCalculatedRows = () => {
    let carryOver = 0;
    return plans.map(plan => {
      const totalExp = Object.values(plan.expenses || {}).reduce((a, b) => a + Number(b), 0);
      const currentBalance = (plan.salary || 0) - totalExp;
      const totalAvailable = currentBalance + carryOver;
      const remaining = totalAvailable - plan.amount;
      
      // Update carryOver for next iteration
      carryOver = remaining;

      return {
        ...plan,
        totalExp,
        currentBalance,
        totalAvailable,
        remaining, // This is the "Carry Over" to next month
      };
    });
  };

  const calculatedPlans = goal?.type === "MONTHLY" ? plans : getCalculatedRows();
  const displayPlans = calculatedPlans.filter((p: any) => Number(p.amount) > 0).length > 0
    ? calculatedPlans.filter((p: any) => Number(p.amount) > 0)
    : calculatedPlans;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const handleProofUpload = (planId: string, file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) return;
      handleUpdatePlan(planId, { proofImage: value });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>每月打卡 - {goal?.name}</DialogTitle>
          <DialogDescription>卡片式打卡视图：仅显示存款月份，支持状态切换与凭证上传。</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto pr-1 space-y-3">
          {loading ? (
            <div className="text-sm text-gray-500 py-8 text-center">加载中...</div>
          ) : (
            displayPlans.map((plan: any) => (
              <div
                key={plan.id}
                className={clsx(
                  "rounded-lg border p-4 bg-white",
                  plan.month === currentMonth && "border-blue-300 ring-1 ring-blue-100"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-[180px]">
                    <div className="text-sm font-semibold text-gray-900">{plan.month.replace("-", "/")}</div>
                    <div className="text-xs text-gray-500">计划存款</div>
                    <Input
                      type="number"
                      className="h-9 w-[140px]"
                      value={plan.amount}
                      onChange={(e) => handleUpdatePlan(plan.id, { amount: Number(e.target.value) })}
                    />
                    {goal?.type !== "MONTHLY" ? (
                      <div className="text-xs text-gray-500">可存金额：<span className="text-blue-600 font-medium">¥{plan.totalAvailable?.toLocaleString()}</span></div>
                    ) : null}
                  </div>

                  <div className="space-y-2 min-w-[140px]">
                    <div className="text-xs text-gray-500">打卡状态</div>
                    <button
                      onClick={() => handleUpdatePlan(plan.id, { status: plan.status === "COMPLETED" ? "PENDING" : "COMPLETED" })}
                      className={clsx(
                        "px-3 py-1.5 rounded text-xs font-medium",
                        plan.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {plan.status === "COMPLETED" ? "已存款" : "未存款"}
                    </button>
                    {plan.updatedAt && plan.status === "COMPLETED" && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        打卡：{new Date(plan.updatedAt).toLocaleString('zh-CN', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">备注</div>
                    <Input
                      className="h-9 w-[180px]"
                      value={plan.remark || ""}
                      placeholder="备注..."
                      onChange={(e) => handleUpdatePlan(plan.id, { remark: e.target.value })}
                    />
                  </div>

                  <div
                    className={clsx(
                      "rounded-md border border-dashed p-3 min-w-[190px] bg-gray-50/60",
                      dragOverId === plan.id && "border-blue-500 bg-blue-50"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverId(plan.id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverId(null);
                      handleProofUpload(plan.id, e.dataTransfer.files?.[0]);
                    }}
                  >
                    <div className="text-xs text-gray-500 mb-2">打卡凭证</div>
                    <label htmlFor={`plan-proof-${plan.id}`} className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-700">上传</span>
                    </label>
                    <input
                      id={`plan-proof-${plan.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProofUpload(plan.id, e.target.files?.[0])}
                    />
                    <div className="text-[11px] text-gray-400 mt-1">支持拖入图片</div>
                    {plan.proofImage ? (
                      <button
                        className="mt-2 block text-xs text-blue-600 hover:underline"
                        onClick={() => window.open(plan.proofImage, "_blank")}
                      >
                        查看图片
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (!goal) return;
                if (!confirm("将按12个月重新初始化打卡计划，确定吗？")) return;
                setLoading(true);
                const initialized = await initializeEmptyPlans();
                if (initialized.length > 0) {
                  setPlans(initialized);
                  onPlansChanged?.();
                } else {
                  alert("重新初始化失败，请重试");
                }
                setLoading(false);
              }}
            >
              重新初始化12个月
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
