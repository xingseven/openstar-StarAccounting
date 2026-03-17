"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type BudgetStatus = "normal" | "warning" | "overdue";

type Budget = {
  id: string;
  category: string;
  platform?: string | null;
  amount: number;
  used: number;
  percent: number;
  period: "MONTHLY" | "YEARLY";
  scopeType: "GLOBAL" | "CATEGORY" | "PLATFORM";
  alertPercent: number;
  status: BudgetStatus;
  createdAt: string;
};

const SCOPE_TYPE_OPTIONS = [
  { value: "GLOBAL", label: "全局预算" },
  { value: "CATEGORY", label: "分类预算" },
  { value: "PLATFORM", label: "平台预算" },
];

const COMMON_CATEGORIES = [
  "ALL",
  "餐饮",
  "交通",
  "购物",
  "娱乐",
  "医疗",
  "教育",
  "居住",
  "通讯",
  "其他",
];

const COMMON_PLATFORMS = [
  "支付宝",
  "微信",
  "现金",
  "银行卡",
  "信用卡",
];

function getStatusColor(status: BudgetStatus) {
  switch (status) {
    case "overdue":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
}

function getStatusTextColor(status: BudgetStatus) {
  switch (status) {
    case "overdue":
      return "text-red-600";
    case "warning":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
}

function getStatusLabel(status: BudgetStatus) {
  switch (status) {
    case "overdue":
      return "超支";
    case "warning":
      return "预警";
    default:
      return "正常";
  }
}

function getScopeTypeLabel(scopeType: string) {
  const option = SCOPE_TYPE_OPTIONS.find(o => o.value === scopeType);
  return option?.label || scopeType;
}

export default function BudgetsPage() {
  const [items, setItems] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Budget | null>(null);

  const [category, setCategory] = useState("ALL");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("MONTHLY");
  const [scopeType, setScopeType] = useState("GLOBAL");
  const [platform, setPlatform] = useState("");
  const [alertPercent, setAlertPercent] = useState("80");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      const data = await apiFetch<{ items: any[] }>("/api/budgets");
      const list = data.items.map((i) => ({
        ...i,
        amount: Number(i.amount),
        used: Number(i.used),
        percent: Number(i.percent),
        alertPercent: Number(i.alertPercent ?? 80),
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
    setScopeType("GLOBAL");
    setPlatform("");
    setAlertPercent("80");
    setError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: Budget) {
    setEditingItem(item);
    setCategory(item.category);
    setAmount(String(item.amount));
    setPeriod(item.period);
    setScopeType(item.scopeType || "GLOBAL");
    setPlatform(item.platform || "");
    setAlertPercent(String(item.alertPercent ?? 80));
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, any> = {
        category,
        amount,
        period,
        scopeType,
        alertPercent: Number(alertPercent),
      };
      
      if (scopeType === "PLATFORM" && platform) {
        body.platform = platform;
      }

      if (editingItem) {
        await apiFetch(`/api/budgets/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ amount, alertPercent: Number(alertPercent) }),
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
          <p className="text-sm text-gray-600">设定并监控你的消费限额，支持多维度预算控制</p>
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
          暂无预算记录，点击"新增预算"开始设置
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const displayPercent = item.percent;
            return (
              <div key={item.id} className="rounded border p-4 space-y-3 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.category === "ALL" ? "总预算" : item.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.status === "overdue" ? "bg-red-100 text-red-700" :
                        item.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{item.period === "MONTHLY" ? "月度" : "年度"}</span>
                      <span>·</span>
                      <span>{getScopeTypeLabel(item.scopeType)}</span>
                      {item.scopeType === "PLATFORM" && item.platform && (
                        <>
                          <span>·</span>
                          <span>{item.platform}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      预警阈值: {item.alertPercent}%
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
                    <span className={getStatusTextColor(item.status)}>
                      已用 ¥{item.used.toFixed(2)}
                    </span>
                    <span className="font-medium">{displayPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getStatusColor(item.status)}`}
                      style={{ width: `${Math.min(100, displayPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>剩余 ¥{(item.amount - item.used).toFixed(2)}</span>
                    <span>限额 ¥{item.amount}</span>
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
                  <span className="text-sm font-medium">作用域</span>
                  <select
                    disabled={!!editingItem}
                    className="w-full rounded border px-3 py-2 text-sm disabled:bg-gray-50"
                    value={scopeType}
                    onChange={(e) => setScopeType(e.target.value)}
                  >
                    {SCOPE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
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
                <span className="text-sm font-medium">分类</span>
                <input
                  required
                  disabled={!!editingItem}
                  className="w-full rounded border px-3 py-2 text-sm disabled:bg-gray-50"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="categories"
                  placeholder="选择或输入分类"
                />
                <datalist id="categories">
                  {COMMON_CATEGORIES.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>

              {scopeType === "PLATFORM" && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium">平台</span>
                  <input
                    required
                    disabled={!!editingItem}
                    className="w-full rounded border px-3 py-2 text-sm disabled:bg-gray-50"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    list="platforms"
                    placeholder="选择或输入平台名称"
                  />
                  <datalist id="platforms">
                    {COMMON_PLATFORMS.map(p => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </label>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">限额 (¥)</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">预警阈值 (%)</span>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={alertPercent}
                    onChange={(e) => setAlertPercent(e.target.value)}
                  />
                </label>
              </div>

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
