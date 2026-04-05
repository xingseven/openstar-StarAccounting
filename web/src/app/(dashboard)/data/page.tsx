"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Banknote, CheckCircle, Database, FileText, Loader2, Search, Tag, Trash2, Upload, Wand2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  mergeCategoryOptions,
  useTransactionCategories,
} from "@/lib/transaction-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";
import { DataLoadingShell } from "./DataLoadingShell";

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

type MerchantCandidate = {
  merchant: string;
  count: number;
  latestDate: string;
};

type MerchantRule = {
  id: string;
  name: string | null;
  merchant: string;
  category: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type ImportResult = {
  totalRows: number;
  insertedCount: number;
  duplicateCount: number;
  invalidCount: number;
  linkedLoanCount?: number;
  syncedLoanCount?: number;
};

type TransactionListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: Transaction[];
};

const PAGE_SIZE = 50;
const MANUAL_INCOME_CATEGORIES = ["工资", "奖金", "报销", "兼职收入", "转账收入", "理财收益", "其他收入"];
const MANUAL_EXPENSE_CATEGORIES = [
  "餐饮",
  "购物",
  "交通",
  "娱乐",
  "生活",
  "医疗",
  "教育",
  "住房",
  "通讯",
  "还款",
  "信用卡还款",
  "贷款还款",
  "转账支出",
  "其他支出",
];
const MANUAL_TRANSACTION_PLATFORMS = ["云闪付", "银行卡", "支付宝", "微信", "现金", "其他"];
type ManualEntryMode = "income" | "expense";

function getDefaultManualForm(mode: ManualEntryMode) {
  return {
    amount: "",
    category: mode === "income" ? "工资" : "餐饮",
    platform: mode === "expense" ? "云闪付" : "银行卡",
    merchant: "",
    date: getCurrentDateTimeLocal(),
    description: "",
  };
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

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

const Card = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white p-3 sm:p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]",
      className,
    )}
    style={style}
  >
    {children}
  </div>
);

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualEntryMode, setManualEntryMode] = useState<ManualEntryMode>("income");
  const [manualTransactionLoading, setManualTransactionLoading] = useState(false);
  const [manualTransactionForm, setManualTransactionForm] = useState(getDefaultManualForm("income"));
  const [merchantKeyword, setMerchantKeyword] = useState("");
  const [merchantCandidates, setMerchantCandidates] = useState<MerchantCandidate[]>([]);
  const [merchantCandidatesLoading, setMerchantCandidatesLoading] = useState(false);
  const [merchantRules, setMerchantRules] = useState<MerchantRule[]>([]);
  const [merchantRulesLoading, setMerchantRulesLoading] = useState(false);
  const [selectedRuleMerchants, setSelectedRuleMerchants] = useState<string[]>([]);
  const [ruleName, setRuleName] = useState("");
  const [ruleCategory, setRuleCategory] = useState("房租");
  const [ruleDescription, setRuleDescription] = useState("");
  const [applyRuleToHistory, setApplyRuleToHistory] = useState(true);
  const [ruleActionLoading, setRuleActionLoading] = useState(false);
  const { categories: categoryCatalog, refresh: refreshCategoryCatalog } = useTransactionCategories();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = total === 0 ? 0 : startItem + Math.max(0, transactions.length - 1);
  const allSelectedOnPage = transactions.length > 0 && selectedIds.size === transactions.length;
  const selectedRuleMerchantSet = new Set(selectedRuleMerchants);
  const existingMerchantRuleMap = new Map(merchantRules.map((rule) => [rule.merchant, rule]));
  const incomeCategoryOptions = mergeCategoryOptions(
    MANUAL_INCOME_CATEGORIES,
    categoryCatalog.income,
    transactions.filter((transaction) => transaction.type === "INCOME").map((transaction) => transaction.category),
    manualTransactionForm.category,
  );
  const expenseCategoryOptions = mergeCategoryOptions(
    MANUAL_EXPENSE_CATEGORIES,
    categoryCatalog.expense,
    merchantRules.map((rule) => rule.category),
    transactions.filter((transaction) => transaction.type !== "INCOME").map((transaction) => transaction.category),
    manualTransactionForm.category,
    ruleCategory,
    newCategory,
  );
  const manualCategoryOptions = manualEntryMode === "income" ? incomeCategoryOptions : expenseCategoryOptions;
  const allCategorySuggestions = mergeCategoryOptions(incomeCategoryOptions, expenseCategoryOptions, newCategory);

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

  const loadMerchantRules = useCallback(async () => {
    setMerchantRulesLoading(true);
    try {
      const response = await apiFetch<{ items: MerchantRule[] }>("/api/transactions/rules");
      setMerchantRules(response.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载归类规则失败");
    } finally {
      setMerchantRulesLoading(false);
    }
  }, []);

  const loadMerchantCandidates = useCallback(async (keyword: string) => {
    setMerchantCandidatesLoading(true);
    try {
      const search = keyword.trim();
      const query = new URLSearchParams();
      query.set("limit", "48");
      if (search) query.set("keyword", search);
      const response = await apiFetch<{ items: MerchantCandidate[] }>(`/api/transactions/merchants?${query.toString()}`);
      setMerchantCandidates(response.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载交易对方列表失败");
    } finally {
      setMerchantCandidatesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions({ showLoading: true, page: currentPage });
  }, [currentPage, loadTransactions]);

  useEffect(() => {
    void loadMerchantRules();
  }, [loadMerchantRules]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMerchantCandidates(merchantKeyword);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [merchantKeyword, loadMerchantCandidates]);

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

  function toggleRuleMerchant(merchant: string) {
    setSelectedRuleMerchants((current) =>
      current.includes(merchant) ? current.filter((item) => item !== merchant) : [...current, merchant],
    );
  }

  async function handleCreateMerchantRule() {
    if (selectedRuleMerchants.length === 0 || !ruleCategory.trim()) return;

    setRuleActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiFetch<{
        created: number;
        updated: number;
        historyUpdated: number;
        items: MerchantRule[];
      }>("/api/transactions/rules", {
        method: "POST",
        body: JSON.stringify({
          name: ruleName.trim() || undefined,
          merchants: selectedRuleMerchants,
          category: ruleCategory.trim(),
          description: ruleDescription.trim() || undefined,
          applyToHistory: applyRuleToHistory,
        }),
      });

      setMerchantRules(response.items || []);
      setSelectedRuleMerchants([]);
      setRuleName("");
      setRuleDescription("");
      setMessage(
        `已保存 ${response.created + response.updated} 条归类规则${response.historyUpdated ? `，并回填 ${response.historyUpdated} 条历史交易` : ""}`,
      );

      await Promise.all([
        loadMerchantCandidates(merchantKeyword),
        loadTransactions({ page: currentPage }),
        refreshCategoryCatalog(),
      ]);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "创建归类规则失败");
    } finally {
      setRuleActionLoading(false);
    }
  }

  async function handleDeleteMerchantRule(rule: MerchantRule) {
    if (!confirm(`确定删除 "${rule.merchant} -> ${rule.category}" 这条规则吗？`)) return;

    setRuleActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/api/transactions/rules/${rule.id}`, { method: "DELETE" });
      setMerchantRules((current) => current.filter((item) => item.id !== rule.id));
      setMessage(`已删除规则：${rule.merchant} -> ${rule.category}`);
      await Promise.all([
        loadMerchantCandidates(merchantKeyword),
        refreshCategoryCatalog(),
      ]);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除归类规则失败");
    } finally {
      setRuleActionLoading(false);
    }
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
      await Promise.all([
        loadTransactions(),
        refreshCategoryCatalog(),
      ]);
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
      setMessage(`已更新 ${response.updated} 条记录的分类为 "${newCategory}"`);
      setSelectedIds(new Set());
      setNewCategory("");
      await Promise.all([
        loadTransactions(),
        refreshCategoryCatalog(),
      ]);
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
      const loanSummary =
        response.linkedLoanCount || response.syncedLoanCount
          ? `，关联贷款 ${response.linkedLoanCount ?? 0} 条，同步余额 ${response.syncedLoanCount ?? 0} 条`
          : "";
      setMessage(`导入完成：成功 ${response.insertedCount} 条，重复 ${response.duplicateCount} 条，无效 ${response.invalidCount} 条${loanSummary}`);

      if (currentPage !== 1) {
        setCurrentPage(1);
        await refreshCategoryCatalog();
      } else {
        await Promise.all([
          loadTransactions({ page: 1 }),
          refreshCategoryCatalog(),
        ]);
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入失败");
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleManualTransactionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(manualTransactionForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(`${manualEntryMode === "income" ? "收入" : "支出"}金额必须大于 0`);
      return;
    }

    setManualTransactionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const category = manualTransactionForm.category.trim();
      const platform = manualTransactionForm.platform.trim();
      const merchant =
        manualTransactionForm.merchant.trim()
        || category
        || (manualEntryMode === "income" ? "手动收入" : "手动支出");

      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: amount.toFixed(2),
          type: manualEntryMode === "income" ? "INCOME" : "EXPENSE",
          category,
          platform,
          merchant,
          date: new Date(manualTransactionForm.date).toISOString(),
          description: manualTransactionForm.description.trim() || undefined,
        }),
      });

      setMessage(`已新增一笔${manualEntryMode === "income" ? "收入" : "支出"}：¥${amount.toFixed(2)}`);
      setManualTransactionForm(getDefaultManualForm(manualEntryMode));

      if (currentPage !== 1) {
        setCurrentPage(1);
        await refreshCategoryCatalog();
      } else {
        await Promise.all([
          loadTransactions({ page: 1 }),
          refreshCategoryCatalog(),
        ]);
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : `新增${manualEntryMode === "income" ? "收入" : "支出"}失败`);
    } finally {
      setManualTransactionLoading(false);
    }
  }

  if (loading) {
    return <DataLoadingShell />;
  }

  return (
    <div
      className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5 px-0.5 sm:px-4"
      style={{
        ...getThemeModuleStyle("dashboard"),
      }}
    >
      <datalist id="data-expense-category-suggestions">
        {expenseCategoryOptions.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <datalist id="data-all-category-suggestions">
        {allCategorySuggestions.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <DelayedRender delay={0}>
        <div className="grid gap-3 xl:grid-cols-12">
          <Card className="p-4 xl:col-span-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2B6AF2]/10">
                <FileText className="h-5 w-5 text-[#2B6AF2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748b]">总记录数</p>
                <p className="text-xl font-bold text-[#1e293b] font-numbers">{total}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#94a3b8]">系统交易总量</p>
          </Card>

          <Card className="p-4 sm:p-6 xl:col-span-9">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4CC98F]/10">
                <Upload className="h-4 w-4 text-[#4CC98F]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">账单导入</p>
                <h3 className="text-sm font-bold text-[#1e293b]">导入微信 / 支付宝账单</h3>
              </div>
            </div>
            <p className="text-xs text-[#64748b] mb-4">上传 CSV 或 XLSX 文件，系统会自动识别并入库。</p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleImport("wechat")}
                disabled={importLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4CC98F] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3EB97F] disabled:opacity-50"
              >
                {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                导入微信账单
              </button>
              <button
                onClick={() => handleImport("alipay")}
                disabled={importLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2B6AF2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                导入支付宝账单
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />

            {importResult ? (
              <div className="mt-4 rounded-xl bg-[#f8fafc] p-3 text-sm text-[#64748b]">
                总行数：{importResult.totalRows} | 成功：{importResult.insertedCount} | 重复：{importResult.duplicateCount} | 无效：{importResult.invalidCount}
                {importResult.linkedLoanCount || importResult.syncedLoanCount
                  ? ` | 关联贷款：${importResult.linkedLoanCount ?? 0} | 同步余额：${importResult.syncedLoanCount ?? 0}`
                  : ""}
              </div>
            ) : null}
          </Card>
        </div>
      </DelayedRender>

      {message ? (
        <DelayedRender delay={30}>
          <Card className="bg-[#ECFDF5] border border-[#A7F3D0] p-3 sm:p-4">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#059669]" />
              <span className="text-[#065F46]">{message}</span>
            </div>
          </Card>
        </DelayedRender>
      ) : null}

      {error ? (
        <DelayedRender delay={30}>
          <Card className="bg-[#FEF2F2] border border-[#FECACA] p-3 sm:p-4">
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-[#DC2626]" />
              <span className="text-[#991B1B]">{error}</span>
            </div>
          </Card>
        </DelayedRender>
      ) : null}

      <DelayedRender delay={60}>
        <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
          <Card className="p-4 sm:p-6 xl:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B6AF2]/10">
                <Banknote className="h-4 w-4 text-[#2B6AF2]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">手动补录</p>
                <h3 className="text-sm font-bold text-[#1e293b]">手动录入收支</h3>
              </div>
            </div>
            <p className="text-xs text-[#64748b] mb-4">工资、奖金这类银行卡收入，以及云闪付、现金等无法导出的消费，都可以在这里直接补录。</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setManualEntryMode("income");
                  setManualTransactionForm(getDefaultManualForm("income"));
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  manualEntryMode === "income"
                    ? "bg-[#2B6AF2] text-white"
                    : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                )}
              >
                录入收入
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualEntryMode("expense");
                  setManualTransactionForm(getDefaultManualForm("expense"));
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  manualEntryMode === "expense"
                    ? "bg-[#EF4444] text-white"
                    : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                )}
              >
                录入支出
              </button>
            </div>

            <form onSubmit={handleManualTransactionSubmit} className="space-y-4">
              <div className={cn(
                "rounded-xl p-3",
                manualEntryMode === "income" ? "bg-[#EFF6FF]" : "bg-[#FEF2F2]"
              )}>
                <p className="text-xs font-semibold text-[#475569] mb-1">推荐场景</p>
                <p className="text-xs text-[#64748b]">
                  {manualEntryMode === "income"
                    ? "适合记录工资、奖金、报销或其他打到银行卡里的收入，后续统计会自动计入收入侧。"
                    : "适合补录云闪付、银行卡、现金等无法批量导出的消费，保持账目收支完整。"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "收入金额" : "支出金额"}
                  </label>
                  <Input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualTransactionForm.amount}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="例如：12000"
                    className="h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "入账时间" : "消费时间"}
                  </label>
                  <Input
                    required
                    type="datetime-local"
                    value={manualTransactionForm.date}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, date: event.target.value }))}
                    className="h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "收入分类" : "支出分类"}
                  </label>
                  <select
                    required
                    value={manualTransactionForm.category}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, category: event.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm outline-none focus:border-[#2B6AF2] focus:ring-2 focus:ring-[#2B6AF2]/20"
                  >
                    {manualCategoryOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "入账平台" : "支付平台"}
                  </label>
                  <select
                    required
                    value={manualTransactionForm.platform}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, platform: event.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm outline-none focus:border-[#2B6AF2] focus:ring-2 focus:ring-[#2B6AF2]/20"
                  >
                    {MANUAL_TRANSACTION_PLATFORMS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "来源 / 发放方" : "商户 / 收款方"}
                  </label>
                  <Input
                    value={manualTransactionForm.merchant}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, merchant: event.target.value }))}
                    placeholder={manualEntryMode === "income" ? "例如：公司工资" : "例如：超市 / 房租"}
                    className="h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#64748b] mb-1 block">备注</label>
                  <Input
                    value={manualTransactionForm.description}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="补充说明"
                    className="h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={manualTransactionLoading}
                className={cn(
                  "w-full h-11 rounded-2xl font-medium",
                  manualEntryMode === "income"
                    ? "bg-[#2B6AF2] hover:bg-[#2563EB]"
                    : "bg-[#EF4444] hover:bg-[#DC2626]"
                )}
              >
                {manualTransactionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Banknote className="mr-2 h-4 w-4" />
                    {manualEntryMode === "income" ? "手动新增收入" : "手动新增支出"}
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card className="p-4 sm:p-6 xl:col-span-9">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A855F7]/10">
                <Wand2 className="h-4 w-4 text-[#A855F7]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">自动归类</p>
                <h3 className="text-sm font-bold text-[#1e293b]">按交易对方建立固定支出规则</h3>
              </div>
            </div>
            <p className="text-xs text-[#64748b] mb-4">从已出现过的交易对方里搜索并勾选，绑定到一个分类后，后续导入和手动补录会自动套用。</p>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3 sm:p-4">
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">规则名称</label>
                    <Input
                      value={ruleName}
                      onChange={(event) => setRuleName(event.target.value)}
                      placeholder="例如：房租"
                      className="h-9 sm:h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">目标分类</label>
                    <Input
                      list="data-expense-category-suggestions"
                      value={ruleCategory}
                      onChange={(event) => setRuleCategory(event.target.value)}
                      placeholder="例如：房租"
                      className="h-9 sm:h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">统一备注</label>
                    <Input
                      value={ruleDescription}
                      onChange={(event) => setRuleDescription(event.target.value)}
                      placeholder="例如：每月房租"
                      className="h-9 sm:h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                    />
                  </div>

                  <label className="inline-flex h-9 sm:h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 sm:px-4 text-[10px] sm:text-xs text-[#64748b]">
                    <input
                      type="checkbox"
                      checked={applyRuleToHistory}
                      onChange={(event) => setApplyRuleToHistory(event.target.checked)}
                      className="rounded border-[#cbd5e1]"
                    />
                    回填历史
                  </label>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-3 sm:p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#1e293b]">选择交易对方</p>
                      <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#64748b]">支持按关键词搜索，适合房东、物业这类长期重复对象。</p>
                    </div>
                    <div className="text-xs sm:text-sm text-[#64748b]">
                      已选 <span className="font-semibold text-[#1e293b]">{selectedRuleMerchants.length}</span> 个
                    </div>
                  </div>

                  <div className="relative mt-3 sm:mt-4">
                    <Search className="pointer-events-none absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-[#94a3b8]" />
                    <Input
                      value={merchantKeyword}
                      onChange={(event) => setMerchantKeyword(event.target.value)}
                      placeholder="搜索交易对方"
                      className="pl-8 sm:pl-9 h-9 sm:h-10 rounded-xl border-[#e2e8f0] text-sm"
                    />
                  </div>

                  {selectedRuleMerchants.length > 0 ? (
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                      {selectedRuleMerchants.map((merchant) => (
                        <button
                          key={merchant}
                          type="button"
                          onClick={() => toggleRuleMerchant(merchant)}
                          className="rounded-full bg-[#1e293b] px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white transition hover:bg-[#334155]"
                        >
                          {merchant}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 sm:mt-4 max-h-60 sm:max-h-80 overflow-y-auto rounded-xl sm:rounded-2xl border border-[#e2e8f0] bg-white">
                    {merchantCandidatesLoading ? (
                      <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-8 sm:py-10 text-xs sm:text-sm text-[#64748b]">
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        正在整理交易对方列表
                      </div>
                    ) : merchantCandidates.length === 0 ? (
                      <div className="px-3 sm:px-4 py-8 sm:py-10 text-center">
                        <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-[#cbd5e1]" />
                        <p className="mt-2 text-xs sm:text-sm font-medium text-[#64748b]">没有找到匹配的交易对方</p>
                        <p className="mt-1 text-[10px] sm:text-xs text-[#94a3b8]">先导入或补录交易，或者换关键词再试。</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#f1f5f9]">
                        {merchantCandidates.map((candidate) => {
                          const existingRule = existingMerchantRuleMap.get(candidate.merchant);
                          const selected = selectedRuleMerchantSet.has(candidate.merchant);

                          return (
                            <label
                              key={candidate.merchant}
                              className={cn(
                                "flex cursor-pointer items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition",
                                selected ? "bg-[#D8E6FC]/50" : "hover:bg-[#f8fafc]"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleRuleMerchant(candidate.merchant)}
                                className="mt-0.5 rounded border-[#cbd5e1]"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <span className="truncate text-xs sm:text-sm font-medium text-[#1e293b]">{candidate.merchant}</span>
                                  {existingRule ? (
                                    <span className="rounded-full bg-[#FEF3C7] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-medium text-[#92400E]">
                                      已有规则 · {existingRule.category}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-0.5 sm:mt-1 flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-[10px] sm:text-xs text-[#64748b]">
                                  <span>出现 {candidate.count} 次</span>
                                  <span>最近 {formatDateTime(candidate.latestDate)}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleCreateMerchantRule()}
                    disabled={ruleActionLoading || selectedRuleMerchants.length === 0 || !ruleCategory.trim()}
                    className="h-10 sm:h-11 rounded-2xl w-full sm:w-auto sm:min-w-40 bg-[#2B6AF2] hover:bg-[#2563EB] text-sm"
                  >
                    {ruleActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        保存归类规则
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1e293b]">当前规则</p>
                    <p className="mt-1 text-xs text-[#64748b]">一个交易对方只保留一条生效规则</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#64748b] shadow-sm w-fit">
                    {merchantRules.length} 条
                  </span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {merchantRulesLoading ? (
                    <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-6 text-sm text-[#64748b] shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      正在加载规则
                    </div>
                  ) : merchantRules.length === 0 ? (
                    <div className="text-center py-6">
                      <Tag className="h-8 w-8 mx-auto text-[#cbd5e1]" />
                      <p className="mt-2 text-sm font-medium text-[#64748b]">还没有自动归类规则</p>
                      <p className="mt-1 text-xs text-[#94a3b8]">选中交易对方并保存后，这里会展示已建立的规则。</p>
                    </div>
                  ) : (
                    merchantRules.map((rule) => (
                      <div key={rule.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-3 sm:p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="truncate text-xs sm:text-sm font-semibold text-[#1e293b]">{rule.name || rule.category}</span>
                              <span className="rounded-full bg-[#D8E6FC] px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-[#1E40AF]">
                                {rule.category}
                              </span>
                            </div>
                            <p className="mt-1.5 sm:mt-2 truncate text-xs sm:text-sm text-[#64748b]">{rule.merchant}</p>
                            {rule.description ? <p className="mt-1 text-[10px] sm:text-xs text-[#94a3b8]">备注：{rule.description}</p> : null}
                            <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-[#94a3b8]">更新于 {formatDateTime(rule.updatedAt)}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => void handleDeleteMerchantRule(rule)}
                            disabled={ruleActionLoading}
                            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-[#e2e8f0] text-[#94a3b8] transition hover:border-[#FECACA] hover:text-[#DC2626] disabled:opacity-50 shrink-0"
                            aria-label={`删除规则 ${rule.merchant}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DelayedRender>

      <DelayedRender delay={90}>
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-[#475569]">
              已选择 <span className="text-[#2B6AF2]">{selectedIds.size}</span> 条记录
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                list="data-all-category-suggestions"
                placeholder="新分类名称"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                className="h-10 rounded-xl border border-[#e2e8f0] px-3 text-sm outline-none focus:border-[#2B6AF2] focus:ring-2 focus:ring-[#2B6AF2]/20"
              />
              <button
                onClick={handleBatchUpdateCategory}
                disabled={actionLoading || selectedIds.size === 0 || !newCategory}
                className="flex items-center gap-2 rounded-xl bg-[#2B6AF2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                <Tag className="h-4 w-4" />
                批量改分类
              </button>
            </div>

            <button
              onClick={handleBatchDelete}
              disabled={actionLoading || selectedIds.size === 0}
              className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              批量删除
            </button>
          </div>
        </Card>
      </DelayedRender>

      <DelayedRender delay={120}>
        <Card className="p-0 overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-[#f1f5f9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#64748b]">{total === 0 ? "暂无记录" : `共 ${total} 条记录，当前显示 ${startItem}-${endItem} 条`}</p>
            {tableLoading ? (
              <div className="inline-flex items-center gap-2 text-sm text-[#2B6AF2]">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在加载分页数据
              </div>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1060px]">
              <div className="grid grid-cols-[44px_minmax(260px,1.3fr)_170px_96px_140px_120px_120px] items-center gap-3 border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-2.5 text-xs font-semibold text-[#64748b]">
                <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAll} className="rounded border-[#cbd5e1]" />
                <span>商户 / 备注</span>
                <span>时间</span>
                <span>类型</span>
                <span>分类</span>
                <span>平台</span>
                <span className="text-right">金额</span>
              </div>

              {transactions.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Database className="h-8 w-8 mx-auto text-[#cbd5e1]" />
                  <p className="mt-2 text-sm font-medium text-[#64748b]">暂无数据</p>
                  <p className="mt-1 text-xs text-[#94a3b8]">导入账单后，这里会显示交易记录。</p>
                </div>
              ) : (
                <div>
                  {transactions.map((transaction) => {
                    const isExpense = transaction.type === "EXPENSE";
                    const isIncome = transaction.type === "INCOME";

                    return (
                      <div
                        key={transaction.id}
                        className={cn(
                          "grid grid-cols-[44px_minmax(260px,1.3fr)_170px_96px_140px_120px_120px] items-center gap-3 border-b border-[#f1f5f9] px-4 py-3 transition",
                          selectedIds.has(transaction.id) ? "bg-[#D8E6FC]/30" : "hover:bg-[#f8fafc]"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(transaction.id)}
                          onChange={() => toggleSelect(transaction.id)}
                          className="rounded border-[#cbd5e1]"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#1e293b]">
                            {transaction.merchant || "-"}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#94a3b8]">
                            {transaction.description || "无备注"}
                          </p>
                        </div>

                        <span className="text-sm text-[#64748b]">{formatDateTime(transaction.date)}</span>

                        <span
                          className={cn(
                            "inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                            isExpense
                              ? "bg-[#FEE2E2] text-[#DC2626]"
                              : isIncome
                                ? "bg-[#D1FAE5] text-[#059669]"
                                : "bg-[#f1f5f9] text-[#64748b]"
                          )}
                        >
                          {isExpense ? "支出" : isIncome ? "收入" : transaction.type}
                        </span>

                        <span className="inline-flex w-fit rounded-full bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                          {transaction.category}
                        </span>

                        <span className="text-sm text-[#64748b]">{transaction.platform}</span>

                        <div className={cn("text-right text-sm font-semibold", isExpense ? "text-[#DC2626]" : "text-[#1e293b]")}>
                          {isExpense ? "-" : "+"}
                          {transaction.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-[#f1f5f9] p-4">
              <p className="text-sm text-[#64748b]">
                共 {total} 条记录，第 {currentPage} 页
              </p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-sm font-medium text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-50">
                  上一页
                </button>
                <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-sm font-medium text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-50">
                  下一页
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      </DelayedRender>
    </div>
  );
}
