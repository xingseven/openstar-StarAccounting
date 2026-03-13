"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Asset = {
  id: string;
  name: string;
  type: "CASH" | "BANK_CARD" | "ALIPAY" | "WECHAT" | "INVESTMENT" | "OTHER";
  balance: number;
  currency: string;
  estimatedValue: number;
  createdAt: string;
};

const SUPPORTED_CURRENCIES = ["CNY", "USD", "EUR", "HKD", "JPY", "GBP"];

export default function AssetsPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | null>(null);

  // Display settings
  const [displayCurrency, setDisplayCurrency] = useState("CNY");

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("CASH");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("CNY");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      const data = await apiFetch<{ items: any[] }>(`/api/assets?currency=${displayCurrency}`);
      const list = data.items.map((i) => ({
        ...i,
        balance: Number(i.balance),
        estimatedValue: Number(i.estimatedValue ?? i.balance),
      }));
      setItems(list);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadItems();
  }, [displayCurrency]);

  function openCreate() {
    setEditingItem(null);
    setName("");
    setType("CASH");
    setBalance("");
    setCurrency("CNY");
    setError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: Asset) {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setBalance(String(item.balance));
    setCurrency(item.currency);
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
        type,
        balance,
        currency,
      };

      if (editingItem) {
        await apiFetch(`/api/assets/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/api/assets", {
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
    if (!confirm("确定要删除这个资产吗？")) return;
    try {
      await apiFetch(`/api/assets/${id}`, { method: "DELETE" });
      loadItems();
    } catch (e) {
      alert("删除失败");
    }
  }

  const totalAssets = items.reduce((sum, item) => sum + item.estimatedValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">资产管理</h1>
          <p className="text-sm text-gray-600">管理你的现金、银行卡与投资账户</p>
        </div>
        <div className="flex gap-3">
          <select
            className="rounded border px-3 py-2 text-sm"
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                以 {c} 显示
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            新增资产
          </button>
        </div>
      </div>

      <div className="rounded border bg-black p-6 text-white">
        <div className="text-sm opacity-80">总资产估值 ({displayCurrency})</div>
        <div className="mt-2 text-3xl font-bold">
          {displayCurrency === "CNY" ? "¥" : displayCurrency} {totalAssets.toFixed(2)}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded border p-8 text-center text-gray-500">
          暂无资产记录
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded border p-4 space-y-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.type === "CASH"
                      ? "现金"
                      : item.type === "BANK_CARD"
                      ? "银行卡"
                      : item.type === "ALIPAY"
                      ? "支付宝"
                      : item.type === "WECHAT"
                      ? "微信"
                      : item.type === "INVESTMENT"
                      ? "投资"
                      : "其他"}
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

              <div className="flex justify-between items-end">
                <div className="text-lg font-medium">
                  {item.currency === "CNY" ? "¥" : item.currency} {item.balance.toFixed(2)}
                </div>
                {item.currency !== displayCurrency && (
                  <div className="text-sm text-gray-500">
                    ≈ {displayCurrency} {item.estimatedValue.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editingItem ? "编辑资产" : "新增资产"}
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
                  placeholder="例如：招商银行储蓄卡"
                />
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">类型</span>
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="CASH">现金</option>
                    <option value="BANK_CARD">银行卡</option>
                    <option value="ALIPAY">支付宝</option>
                    <option value="WECHAT">微信</option>
                    <option value="INVESTMENT">投资</option>
                    <option value="OTHER">其他</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">币种</span>
                  <input
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium">余额</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
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
