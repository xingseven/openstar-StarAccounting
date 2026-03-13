"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { 
  SavingsDefaultTheme, 
  SavingsGoal, 
  TransactionItem 
} from "@/features/savings/components/themes/DefaultSavings";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SavingsPage() {
  const [items, setItems] = useState<SavingsGoal[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState("LONG_TERM");
  const [status, setStatus] = useState("ACTIVE");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Load Goals
      const goalsData = await apiFetch<{ items: any[] }>("/api/savings");
      const list = goalsData.items.map((i) => ({
        ...i,
        targetAmount: Number(i.targetAmount),
        currentAmount: Number(i.currentAmount),
      }));
      setItems(list);

      // 2. Load Savings Related Transactions
      // Filter by common savings keywords
      const qs = new URLSearchParams({
        page: "1",
        pageSize: "50",
      });
      // We can't filter by multiple categories easily in current API without loop or new API
      // For now, let's fetch recent transactions and filter client side or use a broad search if available
      // The current API supports 'category' param? No, it supports type, platform, date.
      // Let's use the 'category' filter if I added it? I didn't add category filter to GET /api/transactions
      // I will fetch recent 100 transactions and filter client side for now as a quick fix
      // TODO: Add category filter to backend
      const transData = await apiFetch<{ items: TransactionItem[] }>(`/api/transactions?pageSize=100`);
      const savingsKeywords = ["储蓄", "存款", "理财", "基金", "股票", "定投", "Savings", "Deposit"];
      const filtered = transData.items.filter(t => 
        savingsKeywords.some(k => t.category.includes(k))
      );
      setTransactions(filtered);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingItem(null);
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setDeadline("");
    setType("LONG_TERM");
    setStatus("ACTIVE");
    setError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: SavingsGoal) {
    setEditingItem(item);
    setName(item.name);
    setTargetAmount(String(item.targetAmount));
    setCurrentAmount(String(item.currentAmount));
    setDeadline(item.deadline ? item.deadline.slice(0, 10) : "");
    setType(item.type);
    setStatus(item.status);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const body = {
        name,
        targetAmount,
        currentAmount,
        deadline: deadline || null,
        type,
        status,
      };

      if (editingItem) {
        await apiFetch(`/api/savings/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/api/savings", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个目标吗？")) return;
    try {
      await apiFetch(`/api/savings/${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      alert("删除失败");
    }
  }

  const totalSaved = items.reduce((acc, item) => acc + item.currentAmount, 0);
  const totalTarget = items.reduce((acc, item) => acc + item.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <>
      <SavingsDefaultTheme 
        items={items}
        transactions={transactions}
        totalSaved={totalSaved}
        totalTarget={totalTarget}
        overallProgress={overallProgress}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle>{editingItem ? "编辑目标" : "新建目标"}</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">名称</label>
                  <input
                    required
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：买房首付"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">目标金额</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">当前已存</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">截止日期</label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">类型</label>
                    <select
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="LONG_TERM">长期</option>
                      <option value="YEARLY">年度</option>
                      <option value="MONTHLY">月度</option>
                    </select>
                  </div>
                </div>
                
                {editingItem && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">状态</label>
                    <select
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="ACTIVE">进行中</option>
                      <option value="COMPLETED">已完成</option>
                      <option value="ARCHIVED">已归档</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-black text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {formLoading ? "保存中..." : "保存"}
                  </button>
                </div>
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      handleDelete(editingItem.id);
                    }}
                    className="w-full text-center text-xs text-red-500 hover:underline pt-2"
                  >
                    删除此目标
                  </button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
