"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  type: "MONTHLY" | "YEARLY" | "LONG_TERM";
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
};

export default function SavingsPage() {
  const [items, setItems] = useState<SavingsGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoal | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState("LONG_TERM");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      const data = await apiFetch<{ items: any[] }>("/api/savings");
      // Map string amounts to numbers if needed, or backend sends numbers for memory mode?
      // Prisma Decimal is string usually, memory mode is string in my backend code.
      // Let's normalize.
      const list = data.items.map((i) => ({
        ...i,
        targetAmount: Number(i.targetAmount),
        currentAmount: Number(i.currentAmount),
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
    setLoading(true);
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
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个目标吗？")) return;
    try {
      await apiFetch(`/api/savings/${id}`, { method: "DELETE" });
      loadItems();
    } catch (e) {
      alert("删除失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">储蓄目标</h1>
          <p className="text-sm text-gray-600">设定并追踪你的存钱计划</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          新建目标
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded border p-8 text-center text-gray-500">
          暂无储蓄目标，快去创建一个吧
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const progress =
              item.targetAmount > 0
                ? Math.min(100, (item.currentAmount / item.targetAmount) * 100)
                : 0;
            return (
              <div key={item.id} className="rounded border p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.type === "LONG_TERM"
                        ? "长期"
                        : item.type === "YEARLY"
                        ? "年度"
                        : "月度"}
                      {item.deadline && ` · 截止 ${item.deadline.slice(0, 10)}`}
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
                    <span className="text-gray-600">进度</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>已存 {item.currentAmount}</span>
                    <span>目标 {item.targetAmount}</span>
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
              {editingItem ? "编辑目标" : "新建目标"}
            </h2>
            {error && (
              <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium">名称</span>
                <input
                  required
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：买房首付"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">目标金额</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">当前已存</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">截止日期 (可选)</span>
                  <input
                    type="date"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">类型</span>
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="LONG_TERM">长期</option>
                    <option value="YEARLY">年度</option>
                    <option value="MONTHLY">月度</option>
                  </select>
                </label>
              </div>
              
              {editingItem && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium">状态</span>
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ACTIVE">进行中</option>
                    <option value="COMPLETED">已完成</option>
                    <option value="ARCHIVED">已归档</option>
                  </select>
                </label>
              )}

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
