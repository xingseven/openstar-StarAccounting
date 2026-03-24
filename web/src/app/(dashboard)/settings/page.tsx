"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Lock, Plus, Star, User, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { Skeleton } from "@/components/shared/Skeletons";
import {
  THEME_DIALOG_INPUT_CLASS,
  THEME_STATUS_MUTED_SURFACE_CLASS,
  THEME_STATUS_SUCCESS_SOFT_SURFACE_CLASS,
  ThemeActionBar,
  ThemeFormField,
  ThemeHero,
  ThemeMetricCard,
  ThemeNotice,
  ThemeSectionHeader,
  ThemeSurface,
} from "@/components/shared/theme-primitives";

type AccountItem = {
  id: string;
  name: string;
  role: string | null;
  createdAt: string;
};

type UserInfo = {
  id: string;
  email: string;
  name: string | null;
  defaultAccountId: string | null;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [meResponse, accountResponse] = await Promise.all([
          apiFetch<{ user: UserInfo }>("/api/auth/me"),
          apiFetch<{ items: AccountItem[] }>("/api/accounts"),
        ]);

        setUser(meResponse.user);
        setName(meResponse.user.name || "");
        setAccounts(accountResponse.items || []);
      } catch (loadError) {
        console.error(loadError);
      }
    }

    void loadData();
  }, []);

  async function handleUpdateProfile(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiFetch<{ user: UserInfo }>("/api/settings/profile", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setUser(response.user);
      setMessage("个人信息已更新");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "更新失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch("/api/settings/password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setOldPassword("");
      setNewPassword("");
      setMessage("密码已修改");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "修改失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(event: React.FormEvent) {
    event.preventDefault();
    if (!newAccountName.trim()) return;

    setAccountLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiFetch<{ item: AccountItem }>("/api/accounts", {
        method: "POST",
        body: JSON.stringify({ name: newAccountName.trim() }),
      });
      setAccounts((current) => [response.item, ...current]);
      setNewAccountName("");
      setMessage("账户已创建");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "创建失败");
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleSetDefaultAccount(accountId: string) {
    if (!user) return;

    setAccountLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/api/accounts/${accountId}/default`, {
        method: "PUT",
      });
      setUser({ ...user, defaultAccountId: accountId });
      setMessage("默认账户已更新");
    } catch (defaultError) {
      setError(defaultError instanceof Error ? defaultError.message : "设置失败");
    } finally {
      setAccountLoading(false);
    }
  }

  if (showInitialSkeleton || !user) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:p-6 lg:p-8">
        <Skeleton className="h-[180px] rounded-[28px]" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[320px] rounded-[24px]" />
          <Skeleton className="h-[320px] rounded-[24px]" />
          <Skeleton className="h-[320px] rounded-[24px]" />
        </div>
      </div>
    );
  }

  const defaultAccountName =
    accounts.find((account) => account.id === user.defaultAccountId)?.name || "未设置";

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:p-6 lg:p-8">
      <DelayedRender delay={0}>
        <ThemeHero className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">设置</h1>
              <p className="mt-1 text-sm text-slate-500">管理你的账户资料、安全信息和默认工作账户。</p>
            </div>
          </div>
        </ThemeHero>
      </DelayedRender>

      <DelayedRender delay={60}>
        <div className="grid gap-3 md:grid-cols-3">
          <ThemeMetricCard label="账号邮箱" value={user.email} detail="当前登录身份" tone="blue" icon={User} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="默认账户" value={defaultAccountName} detail="当前工作账户" tone="green" icon={Star} className="p-4" hideDetailOnMobile />
          <ThemeMetricCard label="账户数量" value={`${accounts.length} 个`} detail="可切换账户" tone="slate" icon={Users} className="p-4" hideDetailOnMobile />
        </div>
      </DelayedRender>

      {message ? (
        <ThemeNotice tone="green">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            {message}
          </div>
        </ThemeNotice>
      ) : null}

      {error ? (
        <ThemeNotice tone="red">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            {error}
          </div>
        </ThemeNotice>
      ) : null}

      <DelayedRender delay={120}>
        <div className="grid gap-4 lg:grid-cols-3">
          <ThemeSurface className="p-4 sm:p-6 lg:p-8">
            <ThemeSectionHeader eyebrow="基本信息" title="个人资料" description="更新你的显示名称和基础资料。" />

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
              <ThemeFormField label="邮箱">
                <Input disabled value={user.email} className={cn(THEME_DIALOG_INPUT_CLASS, "rounded-xl bg-slate-50 text-slate-500")} />
              </ThemeFormField>

              <ThemeFormField label="显示名称">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="设置你的显示名称"
                  className={cn(THEME_DIALOG_INPUT_CLASS, "rounded-xl")}
                />
              </ThemeFormField>

              <ThemeActionBar>
                <Button type="submit" disabled={loading} className="rounded-xl">
                  保存修改
                </Button>
              </ThemeActionBar>
            </form>
          </ThemeSurface>

          <ThemeSurface className="p-4 sm:p-6 lg:p-8">
            <ThemeSectionHeader eyebrow="安全设置" title="修改密码" description="定期更新密码，保持账户安全。" />

            <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
              <ThemeFormField label="当前密码">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="password"
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.target.value)}
                    className={cn(THEME_DIALOG_INPUT_CLASS, "rounded-xl pl-11")}
                  />
                </div>
              </ThemeFormField>

              <ThemeFormField label="新密码" hint="至少 6 位">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="至少 6 位"
                    className={cn(THEME_DIALOG_INPUT_CLASS, "rounded-xl pl-11")}
                  />
                </div>
              </ThemeFormField>

              <ThemeActionBar>
                <Button type="submit" variant="outline" disabled={loading} className="rounded-xl">
                  修改密码
                </Button>
              </ThemeActionBar>
            </form>
          </ThemeSurface>

          <ThemeSurface className="p-4 sm:p-6 lg:p-8">
            <ThemeSectionHeader eyebrow="账户管理" title="切换与创建账户" description="管理你的多账户工作空间和默认账户。" />

            <form onSubmit={handleCreateAccount} className="mt-5 space-y-4">
              <ThemeFormField label="新账户名称">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="text"
                    placeholder="输入新账户名称"
                    value={newAccountName}
                    onChange={(event) => setNewAccountName(event.target.value)}
                    className={cn(THEME_DIALOG_INPUT_CLASS, "flex-1 rounded-xl")}
                  />
                  <Button type="submit" disabled={accountLoading || !newAccountName.trim()} className="h-11 rounded-xl bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    创建
                  </Button>
                </div>
              </ThemeFormField>
            </form>

            <div className="mt-5 space-y-3">
              {accounts.length === 0 ? (
                <ThemeNotice tone="slate" description="暂无账户" />
              ) : (
                accounts.map((account) => {
                  const isDefault = user.defaultAccountId === account.id;

                  return (
                    <div
                      key={account.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition",
                        isDefault ? THEME_STATUS_SUCCESS_SOFT_SURFACE_CLASS : THEME_STATUS_MUTED_SURFACE_CLASS
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-950">{account.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{account.role === "OWNER" ? "所有者" : account.role?.toLowerCase()}</p>
                      </div>

                      {isDefault ? (
                        <span className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">默认账户</span>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => void handleSetDefaultAccount(account.id)}
                          disabled={accountLoading}
                          className="h-auto rounded-lg px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                        >
                          设为默认
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ThemeSurface>
        </div>
      </DelayedRender>
    </div>
  );
}
