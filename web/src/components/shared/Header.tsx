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

import { MobileSidebar } from "@/components/shared/MobileSidebar";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    apiFetch<MeResponse>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  function logout() {
    clearAccessToken();
    setShowDropdown(false);
    window.location.href = "/auth/login";
  }

  const title = PAGE_TITLES[pathname] || "消费面板";

  return (
    <header className="h-16 border-b bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4">
        <MobileSidebar />
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[200px] md:max-w-none">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
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

        {/* 移动端退出按钮 - 始终可见 */}
        <button
          onClick={logout}
          className="lg:hidden rounded-full p-2 text-red-500 hover:bg-red-50"
          title="退出登录"
        >
          <LogOut className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email || "加载中..."}
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200"
            >
              <UserIcon className="h-5 w-5" />
            </button>
            
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50">
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
