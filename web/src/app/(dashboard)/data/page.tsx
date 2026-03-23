"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Database, FileText, Loader2, Tag, Trash2, Upload } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { CardContainer } from "@/components/shared/CardContainer";
import { GridDecoration } from "@/components/shared/GridDecoration";
import { Skeleton } from "@/components/shared/Skeletons";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { useConfirm } from "@/components/ui/confirm-dialog";

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

type ImportResult = {
  totalRows: number;
  insertedCount: number;
  duplicateCount: number;
  invalidCount: number;
};

type TransactionListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: Transaction[];
};

const PAGE_SIZE = 50;

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

export default function DataPage() {
  const { confirmAsync, ConfirmDialog } = useConfirm();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = total === 0 ? 0 : startItem + Math.max(0, transactions.length - 1);
  const allSelectedOnPage = transactions.length > 0 && selectedIds.size === transactions.length;

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const loadTransactions = useCallback(async (options?: { showLoading?: boolean; page?: number }) => {
    const showLoading = options?.showLoading ?? false;
    const pageToLoad = options?.page ?? currentPage;

    setError(null);
    if (showLoading) {
      setLoading(true);
    } else {
      setTableLoading(true);
    }

    try {
      const response = await apiFetch<TransactionListResponse>(
        `/api/transactions?page=${pageToLoad}&pageSize=${PAGE_SIZE}`
      );
      const nextTotal = response.total || 0;
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));

      if (nextTotal === 0) {
        setTransactions([]);
        setTotal(0);
        setSelectedIds(new Set());
        if (pageToLoad !== 1) {
          setCurrentPage(1);
        }
        return;
      }

      if (pageToLoad > nextTotalPages) {
        setCurrentPage(nextTotalPages);
        return;
      }

      setTransactions(response.items || []);
      setTotal(nextTotal);
      setSelectedIds(new Set());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载数据失败");
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setTableLoading(false);
      }
    }
  }, [currentPage]);

  useEffect(() => {
    let active = true;
    void loadTransactions({ showLoading: !initialized, page: currentPage }).finally(() => {
      if (active) {
        setInitialized(true);
      }
    });
    return () => {
      active = false;
    };
  }, [currentPage, initialized, loadTransactions]);

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    if (allSelectedOnPage) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(transactions.map((transaction) => transaction.id)));
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.size} 条记录吗？`)) return;

    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiFetch<{ deleted: number }>("/api/transactions/batch", {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          ids: Array.from(selectedIds),
        }),
      });

      setMessage(`已删除 ${response.deleted} 条记录`);
      setSelectedIds(new Set());
      await loadTransactions({ page: currentPage });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除失败");
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
      const response = await apiFetch<{ updated: number }>("/api/transactions/batch", {
        method: "POST",
        body: JSON.stringify({
          action: "updateCategory",
          ids: Array.from(selectedIds),
          category: newCategory,
        }),
      });

      setMessage(`已更新 ${response.updated} 条记录的分类为“${newCategory}”`);
      setSelectedIds(new Set());
      setNewCategory("");
      await loadTransactions({ page: currentPage });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "更新失败");
    } finally {
      setActionLoading(false);
    }
  }

  function handleImport(source: "wechat" | "alipay") {
    fileInputRef.current?.setAttribute("data-source", source);
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const source = (event.target.getAttribute("data-source") as "wechat" | "alipay") || "alipay";

    setImportLoading(true);
    setImportResult(null);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("source", source);

      const response = await apiFetch<ImportResult>("/api/transactions/import", {
        method: "POST",
        body: formData,
      });

      setImportResult(response);
      setMessage(
        `导入完成：成功 ${response.insertedCount} 条，重复 ${response.duplicateCount} 条，无效 ${response.invalidCount} 条`
      );

      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        await loadTransactions({ page: 1 });
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入失败");
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  if (showInitialSkeleton || loading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
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
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white shadow-xl sm:p-6 lg:p-8">
        <GridDecoration mode="dark" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="rounded-xl bg-white/10 p-3">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">数据管理</h1>
            <p className="mt-1 text-sm text-gray-300">分页查看全部交易记录，并支持批量处理。</p>
          </div>
        </div>
      </div>

      {message ? (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm text-green-700">{message}</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      <CardContainer className="overflow-hidden rounded-2xl bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Upload className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">导入账单</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleImport("wechat")}
            disabled={importLoading}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            导入微信账单
          </button>
          <button
            onClick={() => handleImport("alipay")}
            disabled={importLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            导入支付宝账单
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />

        {importResult ? (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            总行数：{importResult.totalRows} | 成功导入：{importResult.insertedCount} | 重复跳过：{importResult.duplicateCount} | 无效数据：{importResult.invalidCount}
          </div>
        ) : null}
      </CardContainer>

      <CardContainer className="overflow-hidden rounded-2xl bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            已选择 <span className="text-blue-600">{selectedIds.size}</span> 条记录
          </span>

          <div className="flex-1" />

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="新分类名称"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleBatchUpdateCategory}
              disabled={actionLoading || selectedIds.size === 0 || !newCategory}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <Tag className="h-4 w-4" />
              批量改分类
            </button>
          </div>

          <button
            onClick={handleBatchDelete}
            disabled={actionLoading || selectedIds.size === 0}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            批量删除
          </button>
        </div>
      </CardContainer>

      <CardContainer className="overflow-hidden rounded-2xl bg-white">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            {total === 0 ? "暂无记录" : `共 ${total} 条记录，当前显示 ${startItem}-${endItem} 条`}
          </p>
          {tableLoading ? (
            <div className="inline-flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在加载分页数据
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
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
                transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 ${selectedIds.has(transaction.id) ? "bg-blue-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(transaction.id)}
                        onChange={() => toggleSelect(transaction.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(transaction.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          transaction.type === "EXPENSE"
                            ? "bg-red-100 text-red-700"
                            : transaction.type === "INCOME"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {transaction.type === "EXPENSE" ? "支出" : transaction.type === "INCOME" ? "收入" : transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {transaction.type === "EXPENSE" ? "-" : "+"}
                      {transaction.amount}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{transaction.category}</td>
                    <td className="px-4 py-3 text-gray-600">{transaction.platform}</td>
                    <td className="px-4 py-3 text-gray-600">{transaction.merchant || "-"}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-400">{transaction.description || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {total === 0 ? "第 1 / 1 页" : `第 ${currentPage} / ${totalPages} 页`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || tableLoading || total === 0}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              首页
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || tableLoading || total === 0}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              上一页
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || tableLoading || total === 0}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              下一页
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || tableLoading || total === 0}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              末页
            </button>
          </div>
        </div>
      </CardContainer>

      <div className="py-4 text-center text-xs text-gray-400">
        {`每页 ${PAGE_SIZE} 条，支持分页查看全部数据。`}
      </div>
    </div>
  );
}
