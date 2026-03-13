"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard, 
  Banknote, 
  TrendingUp,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { clsx } from "clsx";

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
        setMonthIncome(Number(incomeData.totalExpense));

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
  const balance = monthIncome - monthExpense;

  // Mock data for chart (since we don't have daily history API hooked up for chart yet)
  const chartData = [
    { name: '支出', value: monthExpense, color: '#ef4444' },
    { name: '收入', value: monthIncome, color: '#22c55e' },
    { name: '结余', value: Math.max(0, balance), color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net Worth Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">净资产</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">
              ¥ {netWorth.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <div>
                <p>总资产</p>
                <p className="text-gray-200 font-medium">¥{totalAssets.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p>负债</p>
                <p className="text-red-300 font-medium">-¥{totalDebt.toFixed(0)}</p>
              </div>
            </div>
          </div>
          {/* Decorative circle */}
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5 blur-3xl"></div>
        </div>
        
        {/* Monthly Expense */}
        <StatCard 
          title="本月支出" 
          value={monthExpense} 
          icon={CreditCard}
          trend="up" // Logic for trend to be implemented
          color="red"
        />

        {/* Monthly Income */}
        <StatCard 
          title="本月收入" 
          value={monthIncome} 
          icon={Banknote}
          trend="up"
          color="green"
        />

        {/* Monthly Balance */}
        <StatCard 
          title="本月结余" 
          value={balance} 
          icon={TrendingUp}
          trend={balance >= 0 ? "up" : "down"}
          color="blue"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">收支概览</h3>
                <p className="text-sm text-gray-500">本月资金流动统计</p>
              </div>
              <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">近期交易</h3>
              <Link href="/consumption" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                查看全部 <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-1">
              {recentTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">暂无交易记录</p>
                </div>
              ) : (
                recentTransactions.map((t) => (
                  <div key={t.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-full border shadow-sm",
                        t.type === "EXPENSE" ? "bg-white border-gray-100" : "bg-green-50 border-green-100"
                      )}>
                        {t.type === "EXPENSE" ? (
                          <span className="text-lg">💸</span>
                        ) : (
                          <span className="text-lg">💰</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t.category || "未分类"}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span>{new Date(t.date).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>{t.merchant || t.platform}</span>
                        </div>
                      </div>
                    </div>
                    <div className={clsx(
                      "font-bold tabular-nums",
                      t.type === "INCOME" ? "text-green-600" : "text-gray-900"
                    )}>
                      {t.type === "EXPENSE" ? "-" : "+"}
                      {Number(t.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">快捷入口</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction href="/assets" icon={Wallet} label="资产管理" color="blue" />
              <QuickAction href="/loans" icon={Banknote} label="贷款管理" color="purple" />
              <QuickAction href="/savings" icon={TrendingUp} label="储蓄目标" color="amber" />
              <QuickAction href="/connections" icon={CreditCard} label="连接管理" color="indigo" />
            </div>
          </div>

          <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">需要帮助？</h3>
              <p className="text-blue-100 text-sm mb-4">
                查看文档了解如何更好地管理您的财务。
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                查看文档
              </button>
            </div>
            <div className="absolute right-0 bottom-0 h-32 w-32 bg-white/10 rounded-full blur-2xl translate-x-10 translate-y-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: { 
  title: string; 
  value: number; 
  icon: any; 
  trend: "up" | "down";
  color: "red" | "green" | "blue";
}) {
  const colorStyles = {
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-500">
          <div className={clsx("p-2 rounded-lg", colorStyles[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">
          ¥ {Math.abs(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  const bgColors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
  };

  return (
    <Link href={href} className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm">
      <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors", bgColors[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
    </Link>
  );
}
