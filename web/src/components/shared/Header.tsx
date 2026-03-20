"use client";

import { clearAccessToken } from "@/lib/auth";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, User as UserIcon, LogOut } from "lucide-react";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { useUser } from "@/components/shared/UserContext";

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
  const pathname = usePathname();
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  function logout() {
    clearAccessToken();
    setShowDropdown(false);
    window.location.href = "/auth/login";
  }

  const title = PAGE_TITLES[pathname] || "消费面板";

  return (
    <header className="h-16 px-3 md:px-4 flex items-center justify-between sticky top-0 z-10 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80">
      <div className="w-full h-full flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <MobileSidebar />
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[200px] md:max-w-none">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {user ? (user.name || user.email.split("@")[0]) : "未登录"}
            </div>
            <div className="text-xs text-gray-500">
              {user ? user.email : "请重新登录"}
            </div>
          </div>
          
          {/* 移动端点击整个区域打开下拉菜单 */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="用户菜单"
            >
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <UserIcon className="h-5 w-5" />
              </div>
              {/* 移动端显示的小箭头 */}
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">{user ? "已登录" : "未登录"}</p>
                  <p className="text-sm font-medium truncate">{user ? user.email : "请点击重新登录"}</p>
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
      </div>
    </header>
  );
}
