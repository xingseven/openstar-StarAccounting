"use client";

import { apiFetch } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Search, User as UserIcon, LogOut } from "lucide-react";

type MeResponse = {
  user: { id: string; email: string; name: string | null };
};

const PAGE_TITLES: Record<string, string> = {
  "/": "仪表盘",
  "/assets": "资产管理",
  "/consumption": "消费流水",
  "/savings": "储蓄目标",
  "/loans": "贷款管理",
  "/connections": "设备连接",
  "/settings": "系统设置",
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);

  useEffect(() => {
    apiFetch<MeResponse>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  function logout() {
    clearAccessToken();
    router.replace("/auth/login");
  }

  const title = PAGE_TITLES[pathname] || "消费面板";

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email || "加载中..."}
            </div>
          </div>
          
          <div className="relative group">
            <button className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
              <UserIcon className="h-5 w-5" />
            </button>
            
            {/* Dropdown (Simple CSS hover for now) */}
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">已登录</p>
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                个人设置
              </a>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
