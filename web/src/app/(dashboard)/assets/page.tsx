"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Asset } from "@/features/assets/components/themes/DefaultAssets";

const AssetsDefaultTheme = dynamic(
  () => import("@/features/assets/components/themes/DefaultAssets").then(mod => mod.AssetsDefaultTheme),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Edit,
  Trash2,
} from "lucide-react";

import { clsx } from "clsx";

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
      const data = await apiFetch<{ items: Asset[] }>(`/api/assets?currency=${displayCurrency}`);
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
    <>
      <AssetsDefaultTheme 
        items={items}
        totalAssets={totalAssets}
        displayCurrency={displayCurrency}
        onCurrencyChange={setDisplayCurrency}
        supportedCurrencies={SUPPORTED_CURRENCIES}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onDelete={handleDelete}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-lg font-bold">
              {editingItem ? "编辑资产" : "新增资产"}
            </h2>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
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
                  placeholder="例如：招商银行储蓄卡"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">类型</label>
                  <select
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
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
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">币种</label>
                  <input
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">余额</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存"}
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
                  删除此资产
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
