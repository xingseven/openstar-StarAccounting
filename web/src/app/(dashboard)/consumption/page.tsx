"use client";

import { useEffect, useMemo, useState } from "react";

type ApiSuccess<T> = {
  code: 200;
  message: string;
  data: T;
};

type ApiError = {
  code: number;
  message: string;
  detail?: string;
};

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const DEV_USER_EMAIL = "dev@local";

export default function ConsumptionPage() {
  const [source, setSource] = useState<"wechat" | "alipay">("wechat");
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [summary, setSummary] = useState<ConsumptionSummary | null>(null);
  const [byPlatform, setByPlatform] = useState<PlatformItem[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  async function loadMetrics() {
    const [summaryRes, platformRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/metrics/consumption/summary`, {
        headers: { "x-user-email": DEV_USER_EMAIL },
        cache: "no-store",
      }),
      fetch(`${API_BASE_URL}/api/metrics/consumption/by-platform`, {
        headers: { "x-user-email": DEV_USER_EMAIL },
        cache: "no-store",
      }),
    ]);

    const summaryJson = (await summaryRes.json()) as ApiSuccess<ConsumptionSummary> | ApiError;
    if (summaryRes.ok && "data" in summaryJson) setSummary(summaryJson.data);

    const platformJson =
      (await platformRes.json()) as ApiSuccess<{ items: PlatformItem[] }> | ApiError;
    if (platformRes.ok && "data" in platformJson) setByPlatform(platformJson.data.items);
  }

  async function loadTransactions(nextPage = page) {
    const qs = new URLSearchParams({
      page: String(nextPage),
      pageSize: String(pageSize),
      type: "EXPENSE",
    });

    const res = await fetch(`${API_BASE_URL}/api/transactions?${qs.toString()}`, {
      headers: { "x-user-email": DEV_USER_EMAIL },
      cache: "no-store",
    });

    const json =
      (await res.json()) as
        | ApiSuccess<{ page: number; pageSize: number; total: number; items: TransactionItem[] }>
        | ApiError;

    if (!res.ok || "data" in json === false) {
      const msg = "detail" in json && json.detail ? json.detail : "加载流水失败";
      throw new Error(msg);
    }

    setItems(json.data.items);
    setTotal(json.data.total);
    setPage(json.data.page);
  }

  useEffect(() => {
    loadTransactions().catch(() => {
    });
    loadMetrics().catch(() => {
    });
  }, []);

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

      const res = await fetch(`${API_BASE_URL}/api/transactions/import`, {
        method: "POST",
        headers: { "x-user-email": DEV_USER_EMAIL },
        body: form,
      });

      const json = (await res.json()) as ApiSuccess<ImportResult> | ApiError;
      if (!res.ok || "data" in json === false) {
        const msg = "detail" in json && json.detail ? json.detail : "导入失败";
        throw new Error(msg);
      }

      setImportResult(json.data);
      await loadTransactions(1);
      await loadMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "导入失败");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">消费分析</h1>
        <p className="text-sm text-gray-600">先完成账单导入与流水列表，后续再接图表与指标</p>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

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
        </div>

        {summary ? (
          <div className="grid gap-2 md:grid-cols-3 text-sm">
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">总支出</div>
              <div className="font-medium mt-1">{summary.totalExpense}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">支出笔数</div>
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
                    <th className="py-2 pr-3">总支出</th>
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
          <div className="font-medium">消费流水（仅支出）</div>
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

