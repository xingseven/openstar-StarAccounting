"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type TransactionItem = {
  id: string;
  orderId: string | null;
  date: string;
  type: string;
  amount: string;
  category: string;
  platform: string;
  merchant: string | null;
  description: string | null;
  paymentMethod: string | null;
  status: string | null;
};

type ImportResult = {
  totalRows: number;
  insertedCount: number;
  duplicateCount: number;
  invalidCount: number;
};

type ConsumptionSummary = {
  totalExpense: string;
  expenseCount: number;
  avgExpense: string;
};

type PlatformItem = {
  platform: string;
  total: string;
  count: number;
};

type CategoryItem = {
  category: string;
  total: string;
  count: number;
};

type DailyItem = {
  day: string;
  total: string;
  count: number;
};

function asNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ConsumptionPage() {
  const [source, setSource] = useState<"wechat" | "alipay">("wechat");
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [platform, setPlatform] = useState<"ALL" | "wechat" | "alipay">("ALL");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const [items, setItems] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [summary, setSummary] = useState<ConsumptionSummary | null>(null);
  const [byPlatform, setByPlatform] = useState<PlatformItem[]>([]);
  const [byCategory, setByCategory] = useState<CategoryItem[]>([]);
  const [daily, setDaily] = useState<DailyItem[]>([]);

  // Chart controls
  const [trendGranularity, setTrendGranularity] = useState<"day" | "month">("day");
  const [topN, setTopN] = useState<number>(10);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  async function loadMetrics() {
    const qs = new URLSearchParams({
      type,
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
    const q = qs.toString();

    // daily with groupBy
    const dailyQs = new URLSearchParams(qs);
    dailyQs.append("groupBy", trendGranularity);

    // category with limit
    const categoryQs = new URLSearchParams(qs);
    categoryQs.append("limit", String(topN));

    const [summary, platform, category, daily] = await Promise.all([
      apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${q}`),
      apiFetch<{ items: PlatformItem[] }>(`/api/metrics/consumption/by-platform?${q}`),
      apiFetch<{ items: CategoryItem[] }>(`/api/metrics/consumption/by-category?${categoryQs}`),
      apiFetch<{ items: DailyItem[] }>(`/api/metrics/consumption/daily?${dailyQs}`),
    ]);
    setSummary(summary);
    setByPlatform(platform.items);
    setByCategory(category.items);
    setDaily(daily.items);
  }

  const topCategories = useMemo(() => byCategory, [byCategory]);
  const dailyPoints = useMemo(() => {
    const src = daily.slice(trendGranularity === "day" ? -60 : -24); // Show last 60 days or 24 months
    const values = src.map((d) => asNumber(d.total));
    const max = Math.max(0, ...values);
    const w = 640;
    const h = 180;
    const padX = 24;
    const padY = 16;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    if (src.length <= 1 || max <= 0) {
      return { viewBox: `0 0 ${w} ${h}`, path: "" };
    }

    const points = src.map((d, i) => {
      const x = padX + (i / (src.length - 1)) * innerW;
      const y = padY + innerH - (asNumber(d.total) / max) * innerH;
      return { x, y };
    });

    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");

    return { viewBox: `0 0 ${w} ${h}`, path };
  }, [daily, trendGranularity]);

  async function loadTransactions(nextPage = page) {
    const qs = new URLSearchParams({
      page: String(nextPage),
      pageSize: String(pageSize),
      type,
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
    if (platform !== "ALL") qs.append("platform", platform);

    const data = await apiFetch<{
      page: number;
      pageSize: number;
      total: number;
      items: TransactionItem[];
    }>(`/api/transactions?${qs.toString()}`);

    setItems(data.items);
    setTotal(data.total);
    setPage(data.page);
  }

  useEffect(() => {
    loadTransactions(1).catch(() => {});
    loadMetrics().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, platform, dateRange, trendGranularity, topN]);

  function setQuickDate(range: "7d" | "30d" | "thisMonth" | "lastMonth" | "all") {
    if (range === "all") {
      setDateRange({ start: "", end: "" });
      return;
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (range === "7d") {
      start = new Date(today);
      start.setDate(start.getDate() - 6);
    } else if (range === "30d") {
      start = new Date(today);
      start.setDate(start.getDate() - 29);
    } else if (range === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // lastMonth
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }
    
    // Format to YYYY-MM-DD
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };

    setDateRange({ start: fmt(start), end: fmt(end) });
  }

  async function importCsv() {
    setError(null);
    setImportResult(null);
    if (!file) {
      setError("请先选择要导入的 CSV 文件");
      return;
    }

    setIsImporting(true);
    try {
      const form = new FormData();
      form.append("source", source);
      form.append("file", file, file.name);

      const data = await apiFetch<ImportResult>("/api/transactions/import", {
        method: "POST",
        body: form,
      });

      setImportResult(data);
      await loadTransactions(1);
      await loadMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "导入失败");
    } finally {
      setIsImporting(false);
    }
  }

  async function downloadCsv() {
    const qs = new URLSearchParams({
      page: "1",
      pageSize: "10000", // Export max 10k for now
      type,
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
    if (platform !== "ALL") qs.append("platform", platform);

    try {
      const data = await apiFetch<{ items: TransactionItem[] }>(`/api/transactions?${qs.toString()}`);
      
      // Convert to CSV
      const headers = ["时间", "类型", "金额", "分类", "平台", "商家", "描述", "支付方式", "状态"];
      const rows = data.items.map(t => [
        new Date(t.date).toLocaleString(),
        t.type === "EXPENSE" ? "支出" : "收入",
        t.amount,
        t.category,
        t.platform === "wechat" ? "微信" : "支付宝",
        t.merchant || "",
        t.description || "",
        t.paymentMethod || "",
        t.status || ""
      ].map(v => `"${String(v).replace(/"/g, '""')}"`)); // Escape quotes
      
      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setError("导出失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">消费分析</h1>
        <p className="text-sm text-gray-600">支持账单导入、流水列表与基础汇总/趋势/分类分析</p>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="flex flex-col gap-4 rounded border p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center overflow-hidden rounded border">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm ${
                type === "EXPENSE" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setType("EXPENSE")}
            >
              支出
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm ${
                type === "INCOME" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setType("INCOME")}
            >
              收入
            </button>
          </div>

          <select
            className="rounded border px-2 py-1.5 text-sm"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as any)}
          >
            <option value="ALL">全部平台</option>
            <option value="wechat">微信</option>
            <option value="alipay">支付宝</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuickDate("all")}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              全部
            </button>
            <button
              onClick={() => setQuickDate("7d")}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              近7天
            </button>
            <button
              onClick={() => setQuickDate("thisMonth")}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              本月
            </button>
            <button
              onClick={() => setQuickDate("lastMonth")}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              上月
            </button>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <input
              type="date"
              className="rounded border px-2 py-1"
              value={dateRange.start}
              onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              className="rounded border px-2 py-1"
              value={dateRange.end}
              onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">汇总</div>
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={() => loadMetrics().catch(() => {
            })}
            type="button"
          >
            刷新汇总
          </button>
          <button
            className="rounded border px-3 py-2 text-sm text-gray-600 hover:text-black"
            onClick={downloadCsv}
            type="button"
          >
            导出 CSV
          </button>
        </div>

        {summary ? (
          <div className="grid gap-2 md:grid-cols-3 text-sm">
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">
                {type === "EXPENSE" ? "总支出" : "总收入"}
              </div>
              <div className="font-medium mt-1">{summary.totalExpense}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">
                {type === "EXPENSE" ? "支出笔数" : "收入笔数"}
              </div>
              <div className="font-medium mt-1">{summary.expenseCount}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">平均每笔</div>
              <div className="font-medium mt-1">{summary.avgExpense}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">暂无汇总数据</div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium">按平台</div>
          {byPlatform.length === 0 ? (
            <div className="text-sm text-gray-600">暂无平台数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-3">平台</th>
                    <th className="py-2 pr-3">
                      {type === "EXPENSE" ? "总支出" : "总收入"}
                    </th>
                    <th className="py-2 pr-3">笔数</th>
                  </tr>
                </thead>
                <tbody>
                  {byPlatform.map((p) => (
                    <tr key={p.platform} className="border-b">
                      <td className="py-2 pr-3">{p.platform}</td>
                      <td className="py-2 pr-3 font-medium">{p.total}</td>
                      <td className="py-2 pr-3">{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {type === "EXPENSE" ? "消费趋势" : "收入趋势"}
              </div>
              <div className="flex items-center overflow-hidden rounded border text-xs">
                <button
                  className={`px-2 py-1 ${trendGranularity === "day" ? "bg-black text-white" : "hover:bg-gray-50"}`}
                  onClick={() => setTrendGranularity("day")}
                >
                  按日
                </button>
                <button
                  className={`px-2 py-1 ${trendGranularity === "month" ? "bg-black text-white" : "hover:bg-gray-50"}`}
                  onClick={() => setTrendGranularity("month")}
                >
                  按月
                </button>
              </div>
            </div>
            {daily.length === 0 ? (
              <div className="text-sm text-gray-600">暂无趋势数据</div>
            ) : (
              <div className="rounded border p-3">
                <svg
                  className="w-full h-[180px]"
                  viewBox={dailyPoints.viewBox}
                  preserveAspectRatio="none"
                >
                  <path d={dailyPoints.path} fill="none" stroke="black" strokeWidth="2" />
                </svg>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                  <div>{daily[daily.length - Math.min(daily.length, trendGranularity === "day" ? 60 : 24)]?.day ?? "-"}</div>
                  <div>{daily[daily.length - 1]?.day ?? "-"}</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">分类排行</div>
              <select
                className="rounded border px-1 py-0.5 text-xs"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
              </select>
            </div>
            {topCategories.length === 0 ? (
              <div className="text-sm text-gray-600">暂无分类数据</div>
            ) : (
              <div className="space-y-2">
                {(() => {
                  const max = Math.max(0, ...topCategories.map((c) => asNumber(c.total)));
                  return topCategories.map((c) => {
                    const w = max > 0 ? (asNumber(c.total) / max) * 100 : 0;
                    return (
                      <div key={c.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="truncate pr-3">{c.category}</div>
                          <div className="shrink-0">{c.total}</div>
                        </div>
                        <div className="h-2 rounded bg-gray-100">
                          <div className="h-2 rounded bg-black" style={{ width: `${w}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="font-medium">导入账单</div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <div className="text-sm">来源</div>
            <select
              className="w-full rounded border px-3 py-2 text-sm"
              value={source}
              onChange={(e) => setSource(e.target.value as "wechat" | "alipay")}
            >
              <option value="wechat">微信</option>
              <option value="alipay">支付宝</option>
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <div className="text-sm">CSV 文件</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            onClick={importCsv}
            disabled={isImporting}
            type="button"
          >
            {isImporting ? "导入中..." : "开始导入"}
          </button>
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={() => loadTransactions().catch(() => {
            })}
            type="button"
          >
            刷新流水
          </button>
        </div>

        {importResult ? (
          <div className="grid gap-2 md:grid-cols-4 text-sm">
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">总行数</div>
              <div className="font-medium mt-1">{importResult.totalRows}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">新增</div>
              <div className="font-medium mt-1">{importResult.insertedCount}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">重复</div>
              <div className="font-medium mt-1">{importResult.duplicateCount}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">无效</div>
              <div className="font-medium mt-1">{importResult.invalidCount}</div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">
            {type === "EXPENSE" ? "消费流水（支出）" : "收入流水"}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-2 text-sm disabled:opacity-60"
              onClick={() => loadTransactions(Math.max(1, page - 1)).catch(() => {
              })}
              disabled={page <= 1}
              type="button"
            >
              上一页
            </button>
            <div className="text-sm text-gray-600">
              {page} / {totalPages}
            </div>
            <button
              className="rounded border px-3 py-2 text-sm disabled:opacity-60"
              onClick={() => loadTransactions(Math.min(totalPages, page + 1)).catch(() => {
              })}
              disabled={page >= totalPages}
              type="button"
            >
              下一页
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-gray-600">暂无数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-3">时间</th>
                  <th className="py-2 pr-3">商家</th>
                  <th className="py-2 pr-3">分类</th>
                  <th className="py-2 pr-3">金额</th>
                  <th className="py-2 pr-3">来源</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {new Date(t.date).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{t.merchant ?? "-"}</div>
                      <div className="text-xs text-gray-600 truncate max-w-[420px]">
                        {t.description ?? ""}
                      </div>
                    </td>
                    <td className="py-2 pr-3">{t.category}</td>
                    <td className="py-2 pr-3 font-medium">{t.amount}</td>
                    <td className="py-2 pr-3">{t.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

