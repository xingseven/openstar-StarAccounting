import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>指定计划 - {goal?.name}</DialogTitle>
          <DialogDescription>按月份逐行打卡，点击状态列标记已存款。</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto p-1">
              <div className="border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 font-medium">月份</th>
                      {goal?.type !== "MONTHLY" && (
                        <>
                          <th className="p-3 font-medium">月薪</th>
                          {/* Dynamic Expense Headers */}
                          {Object.keys(plans[0]?.expenses || {}).map(key => (
                            <th key={key} className="p-3 font-medium">{key}</th>
                          ))}
                          <th className="p-3 font-medium text-gray-500">本月结余</th>
                          <th className="p-3 font-medium text-blue-600">可存金额</th>
                        </>
                      )}
                      <th className="p-3 font-medium">计划存款</th>
                      {goal?.type !== "MONTHLY" && (
                        <th className="p-3 font-medium text-purple-600">下月结余</th>
                      )}
                      <th className="p-3 font-medium">状态</th>
                      <th className="p-3 font-medium">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {calculatedPlans.map((plan: any) => (
                      <tr key={plan.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-medium">{plan.month}</td>
                        
                        {goal?.type !== "MONTHLY" && (
                          <>
                            <td className="p-3">
                              <input 
                                className="w-20 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                                type="number"
                                value={plan.salary}
                                onChange={(e) => handleUpdatePlan(plan.id, { salary: Number(e.target.value) })}
                              />
                            </td>
                            {Object.keys(plan.expenses || {}).map(key => (
                              <td key={key} className="p-3">
                                <input 
                                  className="w-20 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                                  type="number"
                                  value={plan.expenses[key]}
                                  onChange={(e) => {
                                    const newExpenses = { ...plan.expenses, [key]: Number(e.target.value) };
                                    handleUpdatePlan(plan.id, { expenses: newExpenses });
                                  }}
                                />
                              </td>
                            ))}
                            <td className="p-3 text-gray-500">¥{plan.currentBalance?.toLocaleString()}</td>
                            <td className="p-3 font-bold text-blue-600">¥{plan.totalAvailable?.toLocaleString()}</td>
                          </>
                        )}

                        <td className="p-3">
                          <input 
                            className="w-24 bg-transparent font-bold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                            type="number"
                            value={plan.amount}
                            onChange={(e) => handleUpdatePlan(plan.id, { amount: Number(e.target.value) })}
                          />
                        </td>

                        {goal?.type !== "MONTHLY" && (
                          <td className="p-3 font-bold text-purple-600">¥{plan.remaining?.toLocaleString()}</td>
                        )}

                        <td className="p-3">
                          <button
                            onClick={() => handleUpdatePlan(plan.id, { status: plan.status === "COMPLETED" ? "PENDING" : "COMPLETED" })}
                            className={clsx(
                              "px-2 py-1 rounded text-xs font-medium",
                              plan.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {plan.status === "COMPLETED" ? "已存款" : "未存款"}
                          </button>
                        </td>
                        <td className="p-3">
                          <input 
                            className="w-full min-w-[100px] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-gray-500"
                            value={plan.remark || ""}
                            placeholder={goal?.type === "MONTHLY" ? "备注..." : "备注"}
                            onChange={(e) => handleUpdatePlan(plan.id, { remark: e.target.value })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
