"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ThemeHero, ThemeMetricCard, ThemeSectionHeader, ThemeTable } from "@/components/shared/theme-primitives";
import { ListTableSkeleton, StatsCardSkeleton } from "@/components/shared/Skeletons";

type AdminStats = {
  users: number;
  transactions: number;
  assets: number;
  loans: number;
  savings: number;
  budgets: number;
  recentTransactions: number;
  unresolvedErrors: number;
};

type UserItem = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: {
    transactions: number;
    assets: number;
    budgets: number;
  };
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadStats() {
    const data = await apiFetch<AdminStats>("/api/admin/stats");
    setStats(data);
  }

  async function loadUsers(nextPage: number) {
    const data = await apiFetch<{ items: UserItem[]; total: number }>(`/api/admin/users?page=${nextPage}&pageSize=10`);
    setUsers(data.items);
    setTotal(data.total);
  }

  async function handleRoleChange(userId: string, newRole: "USER" | "ADMIN") {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      await loadUsers(page);
    } catch {
      alert("修改失败");
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadStats(), loadUsers(1)]);
      } catch {
        setError("加载失败，请确认您有管理员权限");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    if (!loading) {
      void loadUsers(page);
    }
  }, [page, loading]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
        <div className="grid gap-3 md:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <ListTableSkeleton rows={10} columns={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
      <ThemeHero className="p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">后台管理</h1>
          <p className="mt-1 text-sm text-slate-500">查看系统核心指标、近期状态和用户账户分布。</p>
        </div>
      </ThemeHero>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ThemeMetricCard label="用户总数" value={stats.users.toLocaleString()} detail="注册用户" tone="blue" icon={Users} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="交易记录" value={stats.transactions.toLocaleString()} detail="全部流水" tone="green" icon={Receipt} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="资产账户" value={stats.assets.toLocaleString()} detail="资产总量" tone="slate" icon={Wallet} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="贷款记录" value={stats.loans.toLocaleString()} detail="贷款条目" tone="red" icon={CreditCard} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="储蓄目标" value={stats.savings.toLocaleString()} detail="储蓄计划" tone="green" icon={PiggyBank} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="预算设置" value={stats.budgets.toLocaleString()} detail="预算配置" tone="blue" icon={Target} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="近 30 天交易" value={stats.recentTransactions.toLocaleString()} detail="近期活跃" tone="slate" icon={TrendingUp} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="未处理错误" value={stats.unresolvedErrors.toLocaleString()} detail="系统告警" tone="red" icon={AlertTriangle} className="p-4" hideDetailOnMobile />
        </div>
      ) : null}

      <ThemeTable>
        <div className="p-4 sm:p-6">
          <ThemeSectionHeader eyebrow="用户管理" title="用户与角色" description="查看用户核心使用情况，并调整后台权限。" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">邮箱</th>
                <th className="px-4 py-3 font-medium text-slate-500">显示名</th>
                <th className="px-4 py-3 font-medium text-slate-500">角色</th>
                <th className="px-4 py-3 font-medium text-slate-500">交易数</th>
                <th className="px-4 py-3 font-medium text-slate-500">资产数</th>
                <th className="px-4 py-3 font-medium text-slate-500">预算数</th>
                <th className="px-4 py-3 font-medium text-slate-500">注册时间</th>
                <th className="px-4 py-3 font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 text-slate-700">{user.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-700"}`}>
                      {user.role === "ADMIN" ? "管理员" : "用户"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{user._count.transactions}</td>
                  <td className="px-4 py-3 text-slate-700">{user._count.assets}</td>
                  <td className="px-4 py-3 text-slate-700">{user._count.budgets}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value as "USER" | "ADMIN")}
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="USER">用户</option>
                      <option value="ADMIN">管理员</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 10 ? (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 sm:px-6">
            <p className="text-sm text-slate-500">共 {total} 个用户，第 {page} 页</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">
                上一页
              </button>
              <button onClick={() => setPage((current) => current + 1)} disabled={page * 10 >= total} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">
                下一页
              </button>
            </div>
          </div>
        ) : null}
      </ThemeTable>
    </div>
  );
}
