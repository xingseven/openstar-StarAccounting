"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Budget = {
  id: string;
  category: string;
  amount: number;
  used: number;
  period: "MONTHLY" | "YEARLY";
  createdAt: string;
};

export default function BudgetsPage() {
  const [items, setItems] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Budget | null>(null);

  // Form states
  const [category, setCategory] = useState("ALL");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("MONTHLY");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      const data = await apiFetch<{ items: any[] }>("/api/budgets");
      const list = data.items.map((i) => ({
        ...i,
        amount: Number(i.amount),
        used: Number(i.used),
      }));
      setItems(list);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function openCreate() {
    setEditingItem(null);
    setCategory("ALL");
    setAmount("");
    setPeriod("MONTHLY");
    setError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: Budget) {
    setEditingItem(item);
    setCategory(item.category);
    setAmount(String(item.amount));
    setPeriod(item.period);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = {
        category,
        amount,
        period,
      };

      if (editingItem) {
        await apiFetch(`/api/budgets/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ amount }), // Only amount editable for now
        });
      } else {
        await apiFetch("/api/budgets", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setIsModalOpen(false);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个预算吗？")) return;
    try {
      await apiFetch(`/api/budgets/${id}`, { method: "DELETE" });
      loadItems();
    } catch (e) {
      alert("删除失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">预算管理</h1>
          <p className="text-sm text-gray-600">设定并监控你的消费限额</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          新增预算
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded border p-8 text-center text-gray-500">
          暂无预算记录
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const percent = item.amount > 0 ? (item.used / item.amount) * 100 : 0;
            const isOver = percent > 100;
            return (
              <div key={item.id} className="rounded border p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {item.category === "ALL" ? "总预算" : item.category}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.period === "MONTHLY" ? "月度" : "年度"} · 限额 ¥{item.amount}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs text-gray-600 hover:text-black"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isOver ? "text-red-600 font-medium" : "text-gray-600"}>
                      已用 ¥{item.used.toFixed(2)}
                    </span>
                    <span className="font-medium">{percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOver ? "bg-red-500" : percent > 80 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>剩余 ¥{(item.amount - item.used).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editingItem ? "编辑预算" : "新增预算"}
            </h2>
            {error && (
              <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">分类</span>
                  <input
                    required
                    disabled={!!editingItem}
                    className="w-full rounded border px-3 py-2 text-sm disabled:bg-gray-50"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="输入 ALL 为总预算"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">周期</span>
                  <select
                    disabled={!!editingItem}
                    className="w-full rounded border px-3 py-2 text-sm disabled:bg-gray-50"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="MONTHLY">月度</option>
                    <option value="YEARLY">年度</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium">限额</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded px-4 py-2 text-sm hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
