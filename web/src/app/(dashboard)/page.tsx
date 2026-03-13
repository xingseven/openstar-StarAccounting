"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type Asset = {
  id: string;
  name: string;
  balance: number;
};

type Loan = {
  id: string;
  remainingAmount: number;
};

type ConsumptionSummary = {
  totalExpense: string; // string from backend
  expenseCount: number;
  avgExpense: string;
};

type Transaction = {
  id: string;
  date: string;
  type: "EXPENSE" | "INCOME";
  amount: string;
  category: string;
  platform: string;
  merchant?: string;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  // States
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        
        const qsExpense = new URLSearchParams({ type: "EXPENSE", startDate: start, endDate: end });
        const qsIncome = new URLSearchParams({ type: "INCOME", startDate: start, endDate: end });

        const [assetsData, loansData, expenseData, incomeData, transactionsData] = await Promise.all([
          apiFetch<{ items: Asset[] }>("/api/assets"),
          apiFetch<{ items: Loan[] }>("/api/loans"),
          apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsExpense}`),
          apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsIncome}`),
          apiFetch<{ items: Transaction[] }>(`/api/transactions?page=1&pageSize=5`),
        ]);

        // Assets
        const assetsSum = assetsData.items.reduce((acc, cur) => acc + Number(cur.balance), 0);
        setTotalAssets(assetsSum);

        // Loans
        const loansSum = loansData.items.reduce((acc, cur) => acc + Number(cur.remainingAmount), 0);
        setTotalDebt(loansSum);

        // Month Summary
        setMonthExpense(Number(expenseData.totalExpense));
        setMonthIncome(Number(incomeData.totalExpense)); // Note: backend returns 'totalExpense' key even for INCOME type, logic reuse

        // Transactions
        setRecentTransactions(transactionsData.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const netWorth = totalAssets - totalDebt;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">仪表盘</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border bg-black p-4 text-white">
          <div className="text-xs opacity-70">净资产</div>
          <div className="mt-1 text-2xl font-bold">¥ {netWorth.toFixed(2)}</div>
          <div className="mt-2 text-xs opacity-50 flex justify-between">
            <span>总资产: {totalAssets.toFixed(2)}</span>
            <span>负债: {totalDebt.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="rounded border bg-white p-4">
          <div className="text-xs text-gray-500">本月支出</div>
          <div className="mt-1 text-2xl font-bold">¥ {monthExpense.toFixed(2)}</div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-xs text-gray-500">本月收入</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            ¥ {monthIncome.toFixed(2)}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-xs text-gray-500">结余 (本月)</div>
          <div className={`mt-1 text-2xl font-bold ${monthIncome - monthExpense >= 0 ? "text-blue-600" : "text-red-600"}`}>
            ¥ {(monthIncome - monthExpense).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">近期交易</h2>
            <Link href="/consumption" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          <div className="rounded border bg-white">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">暂无交易记录</div>
            ) : (
              <div className="divide-y">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                        t.type === "EXPENSE" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      }`}>
                        {t.type === "EXPENSE" ? "支" : "收"}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{t.category || "未分类"}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(t.date).toLocaleDateString()} · {t.merchant || t.platform}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${t.type === "INCOME" ? "text-green-600" : ""}`}>
                      {t.type === "EXPENSE" ? "-" : "+"}
                      {Number(t.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">快捷入口</h2>
          <div className="grid gap-3">
            <Link href="/assets" className="flex items-center justify-between rounded border bg-white p-4 hover:bg-gray-50 transition-colors">
              <span className="font-medium">资产管理</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link href="/loans" className="flex items-center justify-between rounded border bg-white p-4 hover:bg-gray-50 transition-colors">
              <span className="font-medium">贷款管理</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link href="/savings" className="flex items-center justify-between rounded border bg-white p-4 hover:bg-gray-50 transition-colors">
              <span className="font-medium">储蓄目标</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link href="/connections" className="flex items-center justify-between rounded border bg-white p-4 hover:bg-gray-50 transition-colors">
              <span className="font-medium">连接管理</span>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
