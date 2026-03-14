import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { SavingsGoal } from "./themes/DefaultSavings";

export type SavingsPlan = {
  id: string;
  goalId: string;
  month: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
};

interface SavingsPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
}

export function SavingsPlanDialog({ open, onOpenChange, goal }: SavingsPlanDialogProps) {
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [adding, setAdding] = useState(false);

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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.code === 200) {
        setPlans(data.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!goal || !newMonth || !newAmount) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/savings/${goal.id}/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          month: newMonth,
          amount: Number(newAmount),
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setPlans([...plans, data.data.item].sort((a, b) => a.month.localeCompare(b.month)));
        setNewMonth("");
        setNewAmount("");
      }
    } catch (error) {
      console.error("Failed to add plan", error);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async (plan: SavingsPlan) => {
    const newStatus = plan.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      // Optimistic update
      setPlans(plans.map(p => p.id === plan.id ? { ...p, status: newStatus } : p));
      
      const res = await fetch(`/api/savings/plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.code !== 200) {
        // Revert on failure
        setPlans(plans.map(p => p.id === plan.id ? plan : p));
      }
    } catch (error) {
      console.error("Failed to update status", error);
      setPlans(plans.map(p => p.id === plan.id ? plan : p));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个计划吗？")) return;
    try {
      setPlans(plans.filter(p => p.id !== id));
      await fetch(`/api/savings/plans/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Failed to delete plan", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>指定计划 - {goal?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Add New Plan Form */}
          <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium text-gray-500">月份</label>
              <Input 
                type="month" 
                value={newMonth} 
                onChange={(e) => setNewMonth(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium text-gray-500">目标金额</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={newAmount} 
                onChange={(e) => setNewAmount(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button onClick={handleAdd} disabled={!newMonth || !newAmount || adding} size="icon">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Plan List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无指定计划，请添加
              </div>
            ) : (
              plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={clsx(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    plan.status === "COMPLETED" ? "bg-green-50 border-green-200" : "bg-white border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleStatus(plan)}
                      className={clsx(
                        "transition-colors",
                        plan.status === "COMPLETED" ? "text-green-600" : "text-gray-300 hover:text-gray-400"
                      )}
                    >
                      {plan.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div>
                      <div className={clsx("font-medium", plan.status === "COMPLETED" && "text-green-900")}>
                        {plan.month}
                      </div>
                      <div className="text-xs text-gray-500">
                        目标: ¥{plan.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <span className={clsx(
                       "text-xs font-medium px-2 py-0.5 rounded",
                       plan.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                     )}>
                       {plan.status === "COMPLETED" ? "已达成" : "进行中"}
                     </span>
                     <button 
                       onClick={() => handleDelete(plan.id)}
                       className="text-gray-400 hover:text-red-500 transition-colors p-1"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
