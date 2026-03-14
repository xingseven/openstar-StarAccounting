import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { SavingsGoal } from "./themes/DefaultSavings";
import { clsx } from "clsx";

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
}

export function SavingsPlanDialog({ open, onOpenChange, goal }: SavingsPlanDialogProps) {
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"setup" | "table">("setup");

  // Setup States
  const [duration, setDuration] = useState(12);
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
  const [depositDay, setDepositDay] = useState(15);
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [baseSalary, setBaseSalary] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState<{ name: string; amount: number }[]>([
    { name: "固定支出1", amount: 0 },
  ]);

  useEffect(() => {
    if (open && goal) {
      fetchPlans();
    }
  }, [open, goal]);

  const fetchPlans = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/savings/${goal.id}/plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.code === 200) {
        setPlans(data.data.items);
        if (data.data.items.length > 0) {
          setActiveTab("table");
        } else {
          setActiveTab("setup");
        }
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!goal) return;
    setLoading(true);
    
    const newPlans: any[] = [];
    const [year, month] = startMonth.split("-").map(Number);
    
    // Carry over logic for Bi-Monthly
    let previousCarryOver = 0;

    for (let i = 0; i < duration; i++) {
      const currentDate = new Date(year, month - 1 + i, 1);
      const mStr = currentDate.toISOString().slice(0, 7); // YYYY-MM
      const currentMonthNum = currentDate.getMonth() + 1; // 1-12

      let planItem: any = {
        month: mStr,
        status: "PENDING",
        salary: baseSalary,
        expenses: {},
        remark: "",
      };

      if (goal.type === "MONTHLY") {
        planItem.amount = monthlyAmount;
        planItem.remark = `每月${depositDay}号存款`;
      } else {
        // Bi-Monthly Logic
        const isOdd = currentMonthNum % 2 !== 0;
        const isTargetMonth = 
          (goal.type === "BI_MONTHLY_ODD" && isOdd) || 
          (goal.type === "BI_MONTHLY_EVEN" && !isOdd);

        // Calculate expenses sum
        let totalExpenses = 0;
        fixedExpenses.forEach(exp => {
          planItem.expenses[exp.name] = exp.amount;
          totalExpenses += exp.amount;
        });

        const currentBalance = baseSalary - totalExpenses;
        const totalAvailable = currentBalance + previousCarryOver;

        if (isTargetMonth) {
          // Default logic: Deposit everything available? Or user sets it?
          // User requirement: "Can deposit 6000... if all deposited, 0 carry over"
          // Let's default to depositing all available for now, user can edit later
          planItem.amount = Math.max(0, totalAvailable);
          previousCarryOver = 0;
        } else {
          planItem.amount = 0;
          previousCarryOver = totalAvailable;
        }
      }
      
      newPlans.push(planItem);
    }

    try {
      const res = await fetch(`/api/savings/${goal.id}/plans/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          plans: newPlans,
          config: {
            duration,
            startMonth,
            depositDay,
            monthlyAmount,
            baseSalary,
            fixedExpenses,
          }
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setPlans(data.data.items);
        setActiveTab("table");
      }
    } catch (error) {
      console.error("Failed to generate plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (id: string, updates: Partial<SavingsPlan>) => {
    // Optimistic update
    const updatedPlans = plans.map(p => p.id === id ? { ...p, ...updates } : p);
    setPlans(updatedPlans);

    try {
      await fetch(`/api/savings/plans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updates),
      });
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
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "setup" && (
            <div className="p-4 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">开始月份</label>
                  <Input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">持续月数</label>
                  <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
                </div>
              </div>

              {goal?.type === "MONTHLY" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">每月存款日</label>
                    <Input type="number" min={1} max={31} value={depositDay} onChange={e => setDepositDay(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">每月存款金额</label>
                    <Input type="number" value={monthlyAmount} onChange={e => setMonthlyAmount(Number(e.target.value))} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">月薪 (Base)</label>
                    <Input type="number" value={baseSalary} onChange={e => setBaseSalary(Number(e.target.value))} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">固定支出项</label>
                    {fixedExpenses.map((exp, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          placeholder="支出名称" 
                          value={exp.name} 
                          onChange={e => {
                            const newExps = [...fixedExpenses];
                            newExps[idx].name = e.target.value;
                            setFixedExpenses(newExps);
                          }} 
                        />
                        <Input 
                          type="number" 
                          placeholder="金额" 
                          value={exp.amount} 
                          onChange={e => {
                            const newExps = [...fixedExpenses];
                            newExps[idx].amount = Number(e.target.value);
                            setFixedExpenses(newExps);
                          }} 
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setFixedExpenses(fixedExpenses.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFixedExpenses([...fixedExpenses, { name: `固定支出${fixedExpenses.length + 1}`, amount: 0 }])}
                    >
                      <Plus className="h-4 w-4 mr-2" /> 添加支出项
                    </Button>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                生成计划表
              </Button>
            </div>
          )}

          {activeTab === "table" && (
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
                          <th className="p-3 font-medium text-gray-500">上月结余</th>
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
                    {calculatedPlans.map((plan: any, idx) => (
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
                            <td className="p-3 text-gray-500">
                              {/* Previous Carry Over is derived from previous row's remaining */}
                              ¥{(idx > 0 ? calculatedPlans[idx - 1].remaining : 0)?.toLocaleString()}
                            </td>
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
                            {plan.status === "COMPLETED" ? "已达成" : "进行中"}
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
                 <Button variant="outline" onClick={() => {
                   if (confirm("重新生成将覆盖现有计划，确定吗？")) {
                     setActiveTab("setup");
                   }
                 }}>
                   重置计划
                 </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
