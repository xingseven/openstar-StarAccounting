"use client";

import { useState, useEffect } from "react";
import { X, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SavingsGoal } from "./themes/DefaultSavings";

interface SavingsWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
  onWithdrawalChanged: () => void;
}

export function SavingsWithdrawalDialog({
  open,
  onOpenChange,
  goal,
  onWithdrawalChanged,
}: SavingsWithdrawalDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const withdrawalAmount = Number(amount);
      
      if (!withdrawalAmount || withdrawalAmount <= 0) {
        throw new Error("请输入有效的取款金额");
      }

      if (!goal) {
        throw new Error("未选择储蓄目标");
      }

      if (withdrawalAmount > goal.currentAmount) {
        throw new Error("取款金额不能超过当前存款");
      }

      // 1. 创建取款交易记录
      const transactionData = {
        amount: withdrawalAmount.toString(),
        type: "EXPENSE" as const,
        category: "储蓄取款",
        platform: "手动",
        merchant: goal.name,
        date: new Date().toISOString(),
        description: description || `从"${goal.name}"取款`,
      };

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      // 2. 更新储蓄目标的 currentAmount
      const newCurrentAmount = goal.currentAmount - withdrawalAmount;
      
      await fetch(`/api/savings/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAmount: newCurrentAmount,
        }),
      });

      onWithdrawalChanged();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-500" />
            取款 - {goal.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Amount Display */}
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="text-sm text-blue-700 mb-1">当前存款</div>
            <div className="text-2xl font-bold text-blue-900">
              ¥{goal.currentAmount.toLocaleString()}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">取款金额</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={goal.currentAmount}
                placeholder="请输入取款金额"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="focus:ring-2 focus:ring-red-500"
              />
              <div className="text-xs text-gray-500">
                最大可取：¥{goal.currentAmount.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">备注说明</Label>
              <Input
                id="description"
                type="text"
                placeholder="例如：应急使用、购买大件等"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Warning */}
            <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
              <div className="text-sm text-amber-800">
                <strong>注意：</strong> 取款后将减少该目标的当前存款，且无法撤销。
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-500 hover:bg-red-600"
              >
                {loading ? "处理中..." : "确认取款"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
