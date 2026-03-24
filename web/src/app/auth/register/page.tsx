"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Mail, User, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { ThemeHero, ThemeSurface } from "@/components/shared/theme-primitives";

type RegisterResponse = {
  accessToken: string;
  user: { id: string; email: string; name: string | null };
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<RegisterResponse>("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      setAccessToken(data.accessToken);
      router.replace("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <ThemeHero className="hidden lg:flex lg:min-h-[520px] lg:flex-col lg:justify-between">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">创建账户</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">注册后可以直接进入统一主题的财务工作台，开始管理资产、消费和储蓄计划。</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-medium text-slate-500">全局主题</p>
              <p className="mt-2 text-base font-semibold text-slate-950">一键切换</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-medium text-slate-500">多账户</p>
              <p className="mt-2 text-base font-semibold text-slate-950">可扩展管理</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-medium text-slate-500">AI</p>
              <p className="mt-2 text-base font-semibold text-slate-950">智能记账</p>
            </div>
          </div>
        </ThemeHero>

        <ThemeSurface className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">注册</h2>
            <p className="mt-1 text-sm text-slate-500">填写基础信息，创建你的 OpenStar 账户。</p>
          </div>

          {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-600">邮箱</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 px-10 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-600">显示名称（可选）</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 px-10 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-600">密码</span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 px-10 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </label>

            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60" type="submit" disabled={loading}>
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
            <Link className="hover:text-slate-900 hover:underline" href="/auth/login">
              去登录
            </Link>
            <Link className="hover:text-slate-900 hover:underline" href="/">
              返回首页
            </Link>
          </div>
        </ThemeSurface>
      </div>
    </div>
  );
}
