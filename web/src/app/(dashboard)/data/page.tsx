"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Banknote, Check, CheckCircle, ChevronDown, Database, FileText, Loader2, MoreVertical, Search, Tag, Trash2, Upload, Wand2 } from "lucide-react";
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

const CardHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="mb-3 sm:mb-6 flex items-center justify-between gap-2">
    <h3 className="text-[13px] sm:text-[13px] font-bold text-[#1e293b]">{title}</h3>
    {action}
  </div>
);

const ActionDots = () => (
  <button className="flex h-6 w-6 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-slate-100">
    <MoreVertical className="h-4 w-4" />
  </button>
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
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
          <Card className="bg-[#2B6AF2] text-white p-3 sm:p-3 pb-4 sm:pb-4">
            <div className="flex items-start justify-between">
              <p className="text-[13px] sm:text-[13px] font-semibold text-white/90">总记录数</p>
              <div className="flex h-6 w-6 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20">
                <FileText className="h-3.5 w-3.5 sm:h-3 sm:w-3 stroke-[3]" />
              </div>
            </div>
            <p className="mt-2 sm:mt-2 text-[28px] sm:text-[64px] font-bold tracking-tight font-numbers leading-none">
              {total}
            </p>
            <p className="text-[10px] sm:text-xs font-medium text-white mt-1 sm:mt-6">
              系统交易总量
            </p>
          </Card>

          <Card className="bg-[#4CC98F] text-white p-3 sm:p-3 pb-4 sm:pb-4">
            <div className="flex items-start justify-between">
              <p className="text-[13px] sm:text-[13px] font-semibold text-white/90">归类规则</p>
              <div className="flex h-6 w-6 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20">
                <Tag className="h-3.5 w-3.5 sm:h-3 sm:w-3 stroke-[3]" />
              </div>
            </div>
            <p className="mt-2 sm:mt-2 text-[28px] sm:text-[64px] font-bold tracking-tight font-numbers leading-none">
              {merchantRules.length}
            </p>
            <p className="text-[10px] sm:text-xs font-medium text-white mt-1 sm:mt-6">
              自动归类规则数
            </p>
          </Card>

          <Card className="p-3 sm:p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] sm:text-[13px] font-bold text-[#1e293b]">账单导入</h3>
              <ActionDots />
            </div>
            <div className="mt-3 sm:mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => handleImport("wechat")}
                disabled={importLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {importLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                微信
              </button>
              <button
                onClick={() => handleImport("alipay")}
                disabled={importLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {importLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                支付宝
              </button>
            </div>
            {importResult ? (
              <div className="mt-3 text-[10px] sm:text-xs text-[#64748b]">
                成功 {importResult.insertedCount} | 重复 {importResult.duplicateCount} | 无效 {importResult.invalidCount}
              </div>
            ) : null}
          </Card>

          <Card className="bg-[#D8E6FC] p-3 sm:p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] sm:text-[13px] font-bold text-[#1e293b]">手动补录</h3>
              <ActionDots />
            </div>
            <div className="mt-3 sm:mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setManualEntryMode("income");
                  setManualTransactionForm(getDefaultManualForm("income"));
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  manualEntryMode === "income"
                    ? "bg-[#2B6AF2] text-white"
                    : "bg-white/70 text-[#475569] hover:bg-white"
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
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  manualEntryMode === "expense"
                    ? "bg-[#4CC98F] text-white"
                    : "bg-white/70 text-[#475569] hover:bg-white"
                )}
              >
                录入支出
              </button>
            </div>
            <p className="mt-3 text-[10px] sm:text-xs text-[#475569]">
              {manualEntryMode === "income" ? "工资、奖金等银行卡收入" : "云闪付、现金等无法导出的消费"}
            </p>
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
        <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-4 p-3 sm:p-4">
            <CardHeader title={manualEntryMode === "income" ? "手动录入收入" : "手动录入支出"} />
            <form onSubmit={handleManualTransactionSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">
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
                    className="h-9 sm:h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "入账时间" : "消费时间"}
                  </label>
                  <Input
                    required
                    type="datetime-local"
                    value={manualTransactionForm.date}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, date: event.target.value }))}
                    className="h-9 sm:h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "收入分类" : "支出分类"}
                  </label>
                  <select
                    required
                    value={manualTransactionForm.category}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, category: event.target.value }))}
                    className="h-9 sm:h-10 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm outline-none focus:border-[#2B6AF2] focus:ring-2 focus:ring-[#2B6AF2]/20"
                  >
                    {manualCategoryOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "入账平台" : "支付平台"}
                  </label>
                  <select
                    required
                    value={manualTransactionForm.platform}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, platform: event.target.value }))}
                    className="h-9 sm:h-10 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm outline-none focus:border-[#2B6AF2] focus:ring-2 focus:ring-[#2B6AF2]/20"
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
                  <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">
                    {manualEntryMode === "income" ? "来源 / 发放方" : "商户 / 收款方"}
                  </label>
                  <Input
                    value={manualTransactionForm.merchant}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, merchant: event.target.value }))}
                    placeholder={manualEntryMode === "income" ? "例如：公司工资" : "例如：超市"}
                    className="h-9 sm:h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">
                    备注
                  </label>
                  <Input
                    value={manualTransactionForm.description}
                    onChange={(event) => setManualTransactionForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="补充说明"
                    className="h-9 sm:h-10 rounded-xl border-[#e2e8f0] bg-white text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={manualTransactionLoading}
                className={cn(
                  "w-full h-10 sm:h-11 rounded-2xl font-medium",
                  manualEntryMode === "income"
                    ? "bg-[#2B6AF2] hover:bg-[#2563EB]"
                    : "bg-[#4CC98F] hover:bg-[#3EB97F]"
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

          <Card className="lg:col-span-8 p-3 sm:p-4">
            <CardHeader title="自动归类规则" action={<span className="text-xs font-semibold text-[#64748b]">{merchantRules.length} 条规则</span>} />
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">规则名称</label>
                      <Input
                        value={ruleName}
                        onChange={(event) => setRuleName(event.target.value)}
                        placeholder="例如：房租"
                        className="h-9 rounded-xl border-[#e2e8f0] bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">目标分类</label>
                      <Input
                        list="data-expense-category-suggestions"
                        value={ruleCategory}
                        onChange={(event) => setRuleCategory(event.target.value)}
                        placeholder="例如：房租"
                        className="h-9 rounded-xl border-[#e2e8f0] bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] sm:text-xs font-semibold text-[#64748b] mb-1 block">统一备注</label>
                      <Input
                        value={ruleDescription}
                        onChange={(event) => setRuleDescription(event.target.value)}
                        placeholder="可选"
                        className="h-9 rounded-xl border-[#e2e8f0] bg-white text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 text-xs text-[#64748b]">
                        <input
                          type="checkbox"
                          checked={applyRuleToHistory}
                          onChange={(event) => setApplyRuleToHistory(event.target.checked)}
                          className="rounded border-[#cbd5e1]"
                        />
                        回填历史交易
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#1e293b]">选择交易对方</p>
                      <span className="text-xs text-[#64748b]">已选 {selectedRuleMerchants.length} 个</span>
                    </div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
                      <Input
                        value={merchantKeyword}
                        onChange={(event) => setMerchantKeyword(event.target.value)}
                        placeholder="搜索交易对方"
                        className="h-8 pl-8 text-xs rounded-xl border-[#e2e8f0]"
                      />
                    </div>
                    {selectedRuleMerchants.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedRuleMerchants.map((merchant) => (
                          <button
                            key={merchant}
                            type="button"
                            onClick={() => toggleRuleMerchant(merchant)}
                            className="rounded-full bg-[#1e293b] px-2 py-0.5 text-[10px] font-medium text-white transition hover:bg-[#334155]"
                          >
                            {merchant}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white">
                      {merchantCandidatesLoading ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-[#64748b]">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          加载中...
                        </div>
                      ) : merchantCandidates.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-[#94a3b8]">
                          没有找到匹配的交易对方
                        </div>
                      ) : (
                        <div className="divide-y divide-[#f1f5f9]">
                          {merchantCandidates.slice(0, 8).map((candidate) => {
                            const existingRule = existingMerchantRuleMap.get(candidate.merchant);
                            const selected = selectedRuleMerchantSet.has(candidate.merchant);

                            return (
                              <label
                                key={candidate.merchant}
                                className={cn(
                                  "flex cursor-pointer items-start gap-2 px-3 py-2 transition",
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
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="truncate text-xs font-medium text-[#1e293b]">{candidate.merchant}</span>
                                    {existingRule ? (
                                      <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-medium text-[#92400E]">
                                        {existingRule.category}
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-[#94a3b8]">
                                    出现 {candidate.count} 次
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => void handleCreateMerchantRule()}
                    disabled={ruleActionLoading || selectedRuleMerchants.length === 0 || !ruleCategory.trim()}
                    className="w-full h-9 rounded-xl bg-[#2B6AF2] hover:bg-[#2563EB] text-xs font-medium"
                  >
                    {ruleActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-3 w-3" />
                        保存自动归类规则
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-xs font-semibold text-[#1e293b] mb-3">当前规则</p>
                <div className="space-y-2 max-h-[340px] overflow-y-auto">
                  {merchantRulesLoading ? (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-4 text-xs text-[#64748b]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      正在加载规则
                    </div>
                  ) : merchantRules.length === 0 ? (
                    <div className="text-center py-4 text-xs text-[#94a3b8]">
                      还没有自动归类规则
                    </div>
                  ) : (
                    merchantRules.map((rule) => (
                      <div key={rule.id} className="rounded-xl border border-[#e2e8f0] bg-white p-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate text-xs font-semibold text-[#1e293b]">{rule.name || rule.category}</span>
                              <span className="rounded-full bg-[#D8E6FC] px-1.5 py-0.5 text-[9px] font-medium text-[#1E40AF]">
                                {rule.category}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-[10px] text-[#64748b]">{rule.merchant}</p>
                            {rule.description ? <p className="mt-0.5 text-[10px] text-[#94a3b8]">备注：{rule.description}</p> : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleDeleteMerchantRule(rule)}
                            disabled={ruleActionLoading}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e2e8f0] text-[#94a3b8] transition hover:border-[#FECACA] hover:text-[#DC2626] disabled:opacity-50"
                            aria-label={`删除规则 ${rule.merchant}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <p className="text-sm text-[#64748b]">
              {total === 0 ? "暂无记录" : `共 ${total} 条记录，当前显示 ${startItem}-${endItem} 条`}
            </p>
            {tableLoading ? (
              <div className="inline-flex items-center gap-2 text-sm text-[#2B6AF2]">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在加载分页数据
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3 border-t border-[#f1f5f9]">
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
                className="h-9 rounded-xl border border-[#e2e8f0] px-3 text-sm outline-none focus:border-[#2B6AF2] focus:ring-2 focus:ring-[#2B6AF2]/20"
              />
              <button
                onClick={handleBatchUpdateCategory}
                disabled={actionLoading || selectedIds.size === 0 || !newCategory}
                className="flex items-center gap-2 rounded-xl bg-[#2B6AF2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                <Tag className="h-4 w-4" />
                批量改分类
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={actionLoading || selectedIds.size === 0}
                className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                批量删除
              </button>
            </div>
          </div>
        </Card>
      </DelayedRender>

      <DelayedRender delay={120}>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[44px_minmax(180px,1.3fr)_140px_80px_100px_100px_100px] items-center gap-3 border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-3 text-xs font-semibold text-[#64748b]">
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
                          "grid grid-cols-[44px_minmax(180px,1.3fr)_140px_80px_100px_100px_100px] items-center gap-3 border-b border-[#f1f5f9] px-4 py-3 transition",
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

                        <span className="text-xs text-[#64748b]">{formatDateTime(transaction.date)}</span>

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

                        <span className="text-xs text-[#64748b]">{transaction.platform}</span>

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
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-[#e2e8f0] px-4 py-1.5 text-sm font-medium text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-[#e2e8f0] px-4 py-1.5 text-sm font-medium text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      </DelayedRender>

      <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
