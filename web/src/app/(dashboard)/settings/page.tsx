"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile Form
  const [name, setName] = useState("");

  // Password Form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    apiFetch<{ user: any }>("/api/auth/me")
      .then((res) => {
        setUser(res.user);
        setName(res.user.name || "");
      })
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

  if (!user) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold">设置</h1>
        <p className="text-sm text-gray-600">管理你的个人资料与安全设置</p>
      </div>

      {message && (
        <div className="rounded bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded border bg-white p-6 space-y-6 text-center">
        <h2 className="font-medium">基本信息</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">邮箱</span>
            <input
              disabled
              className="w-full rounded border bg-gray-50 px-3 py-2 text-sm text-gray-500"
              value={user.email}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">昵称</span>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="设置你的昵称"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>

      <div className="rounded border bg-white p-6 space-y-6 text-center">
        <h2 className="font-medium">安全设置</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">当前密码</span>
            <input
              required
              type="password"
              className="w-full rounded border px-3 py-2 text-sm"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">新密码</span>
            <input
              required
              type="password"
              className="w-full rounded border px-3 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少 6 位"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              修改密码
            </button>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-gray-400">
        OpenStar XFDashboard v1.4.0
      </div>
    </div>
  );
}
