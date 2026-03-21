"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { CardContainer } from "@/components/shared/CardContainer";
import { GridDecoration } from "@/components/shared/GridDecoration";
import { Database, Trash2, Tag, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeletons";
import { DelayedRender } from "@/components/shared/DelayedRender";

type Transaction = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  platform: string;
  merchant: string | null;
  description: string | null;
};

export default function DataPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");

  // 骨架屏延迟
  const [骨架显示, set骨架显示] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => set骨架显示(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    try {
      const res = await apiFetch<{ items: Transaction[] }>("/api/transactions?page=1&pageSize=500");
      setTransactions(res.items || []);
    } catch (err) {
      setError("加载数据失败");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  function toggleSelectAll() {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.size} 条记录？`)) return;

    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiFetch<{ deleted: number }>("/api/transactions/batch", {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          ids: Array.from(selectedIds),
        }),
      });
      setMessage(`已删除 ${res.deleted} 条记录`);
      setSelectedIds(new Set());
      loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBatchUpdateCategory() {
    if (selectedIds.size === 0 || !newCategory) return;

    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiFetch<{ updated: number }>("/api/transactions/batch", {
        method: "POST",
        body: JSON.stringify({
          action: "updateCategory",
          ids: Array.from(selectedIds),
          category: newCategory,
        }),
      });
      setMessage(`已更新 ${res.updated} 条记录的分类为「${newCategory}」`);
      setSelectedIds(new Set());
      setNewCategory("");
      loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setActionLoading(false);
    }
  }

  if (骨架显示 || loading) return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 md:space-y-6">
        <DelayedRender delay={0}>
          <Skeleton className="h-20 rounded-2xl" />
        </DelayedRender>
        <DelayedRender delay={50}>
          <Skeleton className="h-12 rounded-xl" />
        </DelayedRender>
        <DelayedRender delay={100}>
          <Skeleton className="h-96 rounded-2xl" />
        </DelayedRender>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8 text-white shadow-xl">
        <GridDecoration mode="dark" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/10">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">数据管理</h1>
            <p className="text-sm text-gray-300 mt-1">批量处理交易记录</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Batch Actions */}
      <CardContainer className="overflow-hidden rounded-2xl bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            已选择 <span className="text-blue-600">{selectedIds.size}</span> 条记录
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="新分类名称"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <button
              onClick={handleBatchUpdateCategory}
              disabled={actionLoading || selectedIds.size === 0 || !newCategory}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Tag className="h-4 w-4" />
              批量改分类
            </button>
          </div>

          <button
            onClick={handleBatchDelete}
            disabled={actionLoading || selectedIds.size === 0}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            批量删除
          </button>
        </div>
      </CardContainer>

      {/* Transactions Table */}
      <CardContainer className="overflow-hidden rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === transactions.length && transactions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">日期</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">类型</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">金额</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">分类</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">平台</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">商户</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">备注</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 ${
                      selectedIds.has(t.id) ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          t.type === "EXPENSE"
                            ? "bg-red-100 text-red-700"
                            : t.type === "INCOME"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t.type === "EXPENSE" ? "支出" : t.type === "INCOME" ? "收入" : t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {t.type === "EXPENSE" ? "-" : "+"}
                      {t.amount}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.category}</td>
                    <td className="px-4 py-3 text-gray-600">{t.platform}</td>
                    <td className="px-4 py-3 text-gray-600">{t.merchant || "-"}</td>
                    <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">
                      {t.description || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContainer>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4">
        共 {transactions.length} 条记录
      </div>
    </div>
  );
}
