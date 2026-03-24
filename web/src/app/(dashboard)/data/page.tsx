"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Database, FileText, Loader2, Tag, Trash2, Upload } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeletons";
import {
  ThemeEmptyState,
  ThemeHero,
  ThemeMetricCard,
  ThemeSectionHeader,
  ThemeSurface,
  ThemeTable,
  ThemeToolbar,
} from "@/components/shared/theme-primitives";

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

  const loadTransactions = useCallback(
    async (options?: { showLoading?: boolean; page?: number }) => {
      const showLoading = options?.showLoading ?? false;
      const pageToLoad = options?.page ?? currentPage;

      setError(null);
      if (showLoading) setLoading(true);
      else setTableLoading(true);

      try {
        const response = await apiFetch<TransactionListResponse>(`/api/transactions?page=${pageToLoad}&pageSize=${PAGE_SIZE}`);
        const nextTotal = response.total || 0;
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));

        if (nextTotal === 0) {
          setTransactions([]);
          setTotal(0);
          setSelectedIds(new Set());
          if (pageToLoad !== 1) setCurrentPage(1);
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
        if (showLoading) setLoading(false);
        else setTableLoading(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    void loadTransactions({ showLoading: true, page: currentPage });
  }, [currentPage, loadTransactions]);

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    if (allSelectedOnPage) setSelectedIds(new Set());
    else setSelectedIds(new Set(transactions.map((transaction) => transaction.id)));
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.size} 条记录？`)) return;

    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiFetch<{ deleted: number }>("/api/transactions/batch", {
        method: "POST",
        body: JSON.stringify({ action: "delete", ids: Array.from(selectedIds) }),
      });
      setMessage(`已删除 ${response.deleted} 条记录`);
      setSelectedIds(new Set());
      await loadTransactions();
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
      setMessage(`已更新 ${response.updated} 条记录的分类为 “${newCategory}”`);
      setSelectedIds(new Set());
      setNewCategory("");
      await loadTransactions();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "更新失败");
    } finally {
      setActionLoading(false);
    }
  }

  function handleImport(source: "wechat" | "alipay") {
    fileInputRef.current?.click();
    fileInputRef.current?.setAttribute("data-source", source);
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
      setMessage(`导入完成：成功 ${response.insertedCount} 条，重复 ${response.duplicateCount} 条，无效 ${response.invalidCount} 条`);

      if (currentPage !== 1) setCurrentPage(1);
      else await loadTransactions({ page: 1 });
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入失败");
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (showInitialSkeleton || loading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <ThemeHero className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">数据管理</h1>
            <p className="mt-1 text-sm text-slate-500">分页查看全部交易记录，并支持导入与批量处理。</p>
          </div>
        </div>
      </ThemeHero>

      <div className="grid gap-3 md:grid-cols-3">
        <ThemeMetricCard label="当前页记录" value={`${transactions.length} 条`} detail="本页数据量" tone="blue" icon={Database} className="p-4" hideDetailOnMobile />
        <ThemeMetricCard label="已选择" value={`${selectedIds.size} 条`} detail="批量处理目标" tone="green" icon={Tag} className="p-4" hideDetailOnMobile />
        <ThemeMetricCard label="总记录数" value={`${total} 条`} detail="系统交易总量" tone="slate" icon={FileText} className="p-4" hideDetailOnMobile />
      </div>

      {message ? (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm text-green-700">{message}</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader eyebrow="账单导入" title="导入微信 / 支付宝账单" description="上传 CSV 或 XLSX 文件，系统会自动识别并入库。" />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => handleImport("wechat")}
            disabled={importLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            导入微信账单
          </button>
          <button
            onClick={() => handleImport("alipay")}
            disabled={importLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            导入支付宝账单
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />

        {importResult ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            总行数：{importResult.totalRows} | 成功：{importResult.insertedCount} | 重复：{importResult.duplicateCount} | 无效：{importResult.invalidCount}
          </div>
        ) : null}
      </ThemeSurface>

      <ThemeToolbar>
        <span className="text-sm font-medium text-slate-700">
          已选择 <span className="text-blue-600">{selectedIds.size}</span> 条记录
        </span>

        <div className="flex-1" />

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="新分类名称"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
      </ThemeToolbar>

      <ThemeTable>
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">{total === 0 ? "暂无记录" : `共 ${total} 条记录，当前显示 ${startItem}-${endItem} 条`}</p>
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
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAll} className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">日期</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">类型</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">金额</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">分类</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">平台</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">商户</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">备注</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10">
                    <ThemeEmptyState icon={Database} title="暂无数据" description="导入账单后，这里会显示交易记录。" />
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/60 ${selectedIds.has(transaction.id) ? "bg-blue-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(transaction.id)} onChange={() => toggleSelect(transaction.id)} className="rounded border-slate-300" />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(transaction.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          transaction.type === "EXPENSE"
                            ? "bg-red-100 text-red-700"
                            : transaction.type === "INCOME"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {transaction.type === "EXPENSE" ? "支出" : transaction.type === "INCOME" ? "收入" : transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {transaction.type === "EXPENSE" ? "-" : "+"}
                      {transaction.amount}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{transaction.category}</td>
                    <td className="px-4 py-3 text-slate-600">{transaction.platform}</td>
                    <td className="px-4 py-3 text-slate-600">{transaction.merchant || "-"}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[150px]">{transaction.description || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              共 {total} 条记录，第 {currentPage} 页
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">
                上一页
              </button>
              <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">
                下一页
              </button>
            </div>
          </div>
        ) : null}
      </ThemeTable>
    </div>
  );
}
