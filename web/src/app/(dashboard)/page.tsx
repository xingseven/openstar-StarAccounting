"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { DashboardDefaultTheme, DashboardData } from "@/features/dashboard/components/themes/DefaultDashboard";

// Keep internal types for API response matching
type Asset = {
  id: string;
  name: string;
  balance: number;
  estimatedValue?: string;
};

type Loan = {
  id: string;
  remainingAmount: number;
};

type ConsumptionSummary = {
  totalExpense: string;
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
  const [data, setData] = useState<DashboardData>({
    totalAssets: 0,
    totalDebt: 0,
    monthExpense: 0,
    monthIncome: 0,
    recentTransactions: [],
  });

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        
        const qsExpense = new URLSearchParams({ type: "EXPENSE", startDate: start, endDate: end });
        const qsIncome = new URLSearchParams({ type: "INCOME", startDate: start, endDate: end });

        const [assetsData, loansData, savingsData, expenseData, incomeData, transactionsData] = await Promise.all([
          apiFetch<{ items: Asset[] }>("/api/assets"),
          apiFetch<{ items: Loan[] }>("/api/loans"),
          apiFetch<{ items: any[] }>("/api/savings"),
          apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsExpense}`),
          apiFetch<ConsumptionSummary>(`/api/metrics/consumption/summary?${qsIncome}`),
          apiFetch<{ items: Transaction[] }>(`/api/transactions?page=1&pageSize=5`),
        ]);

        const assetsTotal = assetsData.items.reduce((acc, cur) => acc + Number(cur.estimatedValue ?? cur.balance), 0);
        const savingsTotal = savingsData.items.reduce((acc, cur) => acc + Number(cur.currentAmount), 0);

        setData({
          totalAssets: assetsTotal + savingsTotal,
          totalDebt: loansData.items.reduce((acc, cur) => acc + Number(cur.remainingAmount), 0),
          monthExpense: Number(expenseData.totalExpense),
          monthIncome: Number(incomeData.totalExpense),
          recentTransactions: transactionsData.items,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  return <DashboardDefaultTheme data={data} loading={loading} />;
}
