"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetTitle } from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import {
  ThemeActionBar,
  ThemeDialogSection,
  ThemeFormField,
  ThemeNotice,
} from "@/components/shared/theme-primitives";
import type { SavingsGoal } from "./themes/DefaultSavings";

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
    if (!open) return;
    setAmount("");
    setDescription("");
    setError(null);
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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

      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: withdrawalAmount.toString(),
          type: "EXPENSE" as const,
          category: "储蓄取款",
          platform: "手动",
          merchant: goal.name,
          date: new Date().toISOString(),
          description: description || `从「${goal.name}」取款`,
        }),
      });

      await apiFetch(`/api/savings/${goal.id}`, {
        method: "PUT",
        body: JSON.stringify({
          currentAmount: goal.currentAmount - withdrawalAmount,
        }),
      });

      onWithdrawalChanged();
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-w-md">
        <BottomSheetHeader>
          <BottomSheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <LogOut className="h-5 w-5 text-red-500" />
            取款 - {goal.name}
          </BottomSheetTitle>
        </BottomSheetHeader>

        <div className="space-y-4 py-4">
          <ThemeNotice tone="blue" title="当前存款">
            <div className="text-3xl font-bold">¥{goal.currentAmount.toLocaleString()}</div>
          </ThemeNotice>

          {error ? <ThemeNotice tone="red" description={error} /> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <ThemeDialogSection className="space-y-4">
              <ThemeFormField
                htmlFor="amount"
                label="取款金额"
                hint={`最大可取：¥${goal.currentAmount.toLocaleString()}`}
              >
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={goal.currentAmount}
                  placeholder="请输入取款金额"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  className="h-11 rounded-2xl text-sm focus:ring-2 focus:ring-red-500"
                />
              </ThemeFormField>

              <ThemeFormField htmlFor="description" label="备注说明">
                <Input
                  id="description"
                  type="text"
                  placeholder="例如：应急使用、购买大件等"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="h-11 rounded-2xl text-sm"
                />
              </ThemeFormField>

              <ThemeNotice
                tone="amber"
                description={
                  <>
                    <strong>注意：</strong>
                    取款后将减少该目标的当前存款，且无法撤销。
                  </>
                }
              />
            </ThemeDialogSection>

            <ThemeActionBar>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="h-11 rounded-2xl px-4 text-sm font-medium">
                取消
              </Button>
              <Button type="submit" disabled={loading} className="h-11 rounded-2xl bg-red-500 px-4 text-sm font-medium hover:bg-red-600">
                {loading ? "处理中..." : "确认取款"}
              </Button>
            </ThemeActionBar>
          </form>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
