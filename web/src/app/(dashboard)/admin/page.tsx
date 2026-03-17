"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Users,
  Receipt,
  Wallet,
  CreditCard,
  PiggyBank,
  Target,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadStats() {
    try {
      const data = await apiFetch<AdminStats>("/api/admin/stats");
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadUsers(p: number) {
    try {
      const data = await apiFetch<{ items: UserItem[]; total: number }>(
        `/api/admin/users?page=${p}&pageSize=10`
      );
      setUsers(data.items);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRoleChange(userId: string, newRole: "USER" | "ADMIN") {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers(page);
    } catch (e) {
      alert("修改失败");
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadStats(), loadUsers(1)]);
      } catch (e) {
        setError("加载失败，请确认您有管理员权限");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">后台管理</h1>
        <p className="text-sm text-gray-600">系统运行状态与用户管理</p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="用户总数" value={stats.users} icon={Users} color="bg-blue-500" />
          <StatCard title="交易记录" value={stats.transactions} icon={Receipt} color="bg-green-500" />
          <StatCard title="资产账户" value={stats.assets} icon={Wallet} color="bg-purple-500" />
          <StatCard title="贷款记录" value={stats.loans} icon={CreditCard} color="bg-orange-500" />
          <StatCard title="储蓄目标" value={stats.savings} icon={PiggyBank} color="bg-pink-500" />
          <StatCard title="预算设置" value={stats.budgets} icon={Target} color="bg-indigo-500" />
          <StatCard title="近30天交易" value={stats.recentTransactions} icon={TrendingUp} color="bg-teal-500" />
          <StatCard title="未处理错误" value={stats.unresolvedErrors} icon={AlertTriangle} color="bg-red-500" />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">用户管理</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">邮箱</th>
                <th className="px-4 py-3 font-medium text-gray-600">昵称</th>
                <th className="px-4 py-3 font-medium text-gray-600">角色</th>
                <th className="px-4 py-3 font-medium text-gray-600">交易数</th>
                <th className="px-4 py-3 font-medium text-gray-600">资产数</th>
                <th className="px-4 py-3 font-medium text-gray-600">预算数</th>
                <th className="px-4 py-3 font-medium text-gray-600">注册时间</th>
                <th className="px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role === "ADMIN" ? "管理员" : "用户"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user._count.transactions}</td>
                  <td className="px-4 py-3">{user._count.assets}</td>
                  <td className="px-4 py-3">{user._count.budgets}</td>
                  <td className="px-4 py-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as "USER" | "ADMIN")
                      }
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
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
        {total > 10 && (
          <div className="flex items-center justify-between border-t border-gray-200 p-4">
            <p className="text-sm text-gray-500">
              共 {total} 个用户，第 {page} 页
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= total}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
