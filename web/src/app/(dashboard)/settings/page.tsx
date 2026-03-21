"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { CardContainer } from "@/components/shared/CardContainer";
import { GridDecoration } from "@/components/shared/GridDecoration";
import { User, Lock, CheckCircle, AlertCircle, Plus, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeletons";
import { DelayedRender } from "@/components/shared/DelayedRender";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string; name: string | null; defaultAccountId: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 首次加载时显示骨架的延迟状态
  const [骨架显示, set骨架显示] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => set骨架显示(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Profile Form
  const [name, setName] = useState("");

  // Password Form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Account Form
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; role: string | null; createdAt: string }>>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ user: any }>("/api/auth/me")
      .then((res) => {
        setUser(res.user);
        setName(res.user.name || "");
      })
      .catch(() => {});

    // 加载账户列表
    apiFetch<{ items: any[] }>("/api/accounts")
      .then((res) => setAccounts(res.items || []))
      .catch(() => {});
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiFetch<{ user: any }>("/api/settings/profile", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setUser(res.user);
      setMessage("个人信息已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch("/api/settings/password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setMessage("密码已修改");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    setAccountLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiFetch<{ item: any }>("/api/accounts", {
        method: "POST",
        body: JSON.stringify({ name: newAccountName.trim() }),
      });
      setAccounts([res.item, ...accounts]);
      setNewAccountName("");
      setMessage("账户已创建");
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleSetDefaultAccount(accountId: string) {
    setAccountLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/api/accounts/${accountId}/default`, {
        method: "PUT",
      });
      setUser({ ...user!, defaultAccountId: accountId });
      setMessage("默认账户已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "设置失败");
    } finally {
      setAccountLoading(false);
    }
  }

  if (骨架显示 || !user) return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 md:space-y-6">
        <DelayedRender delay={0}>
          <Skeleton className="h-20 rounded-2xl" />
        </DelayedRender>
        <div className="grid gap-6 lg:grid-cols-2">
          <DelayedRender delay={50}>
            <Skeleton className="h-64 rounded-2xl" />
          </DelayedRender>
          <DelayedRender delay={100}>
            <Skeleton className="h-64 rounded-2xl" />
          </DelayedRender>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8 text-white shadow-xl">
        <GridDecoration mode="dark" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/10">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">设置</h1>
            <p className="text-sm text-gray-300 mt-1">管理你的个人资料与安全设置</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Settings Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <CardContainer className="group/card flex flex-col gap-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-sm text-foreground lg:p-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">基本信息</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-500">邮箱</label>
              <input
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-500 cursor-not-allowed"
                value={user.email}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-500">昵称</label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="设置你的昵称"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                保存修改
              </button>
            </div>
          </form>
          <GridDecoration mode="light" className="opacity-[0.015]" />
        </CardContainer>

        {/* Password Settings */}
        <CardContainer className="group/card flex flex-col gap-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-sm text-foreground lg:p-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">安全设置</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-500">当前密码</label>
              <input
                required
                type="password"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-500">新密码</label>
              <input
                required
                type="password"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少 6 位"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl border border-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                修改密码
              </button>
            </div>
          </form>
          <GridDecoration mode="light" className="opacity-[0.015]" />
        </CardContainer>
      </div>

      {/* Account Management */}
      <CardContainer className="overflow-hidden rounded-2xl bg-white p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 rounded-lg bg-green-50 text-green-600">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">账户管理</h2>
        </div>

        {/* Create Account Form */}
        <form onSubmit={handleCreateAccount} className="flex items gap-3 mb-6">
          <input
            type="text"
            placeholder="新账户名称"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={accountLoading || !newAccountName.trim()}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            创建账户
          </button>
        </form>

        {/* Account List */}
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">暂无账户</p>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                  user?.defaultAccountId === account.id
                    ? "border-green-200 bg-green-50/50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    user?.defaultAccountId === account.id ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {account.role === "OWNER" ? <Star className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-400">
                      {account.role === "OWNER" ? "所有者" : account.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
                {user?.defaultAccountId !== account.id && (
                  <button
                    onClick={() => handleSetDefaultAccount(account.id)}
                    disabled={accountLoading}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                  >
                    设为默认
                  </button>
                )}
                {user?.defaultAccountId === account.id && (
                  <span className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                    默认账户
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </CardContainer>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4">
        openstar Star Accounting v1.4.0
      </div>
    </div>
  );
}
