"use client";

import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded border p-6">
        <h1 className="text-lg font-semibold">注册</h1>
        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <div className="text-sm">邮箱</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <div className="text-sm">昵称（可选）</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <div className="text-sm">密码</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            className="w-full rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <div className="text-sm text-gray-600 flex items-center justify-between">
          <a className="hover:underline" href="/auth/login">
            去登录
          </a>
          <a className="hover:underline" href="/">
            返回
          </a>
        </div>
      </div>
    </div>
  );
}

