"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Settings2, User as UserIcon } from "lucide-react";
import { clearAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/shared/UserContext";
import { getPageMeta } from "@/components/shared/navigation";

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageMeta = getPageMeta(pathname);
  const displayName = user ? user.name || user.email.split("@")[0] : "未登录";
  const emailText = user ? user.email : "请重新登录";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function logout() {
    clearAccessToken();
    setShowDropdown(false);
    window.location.href = "/auth/login";
  }

  return (
    <header className="rounded-[20px] border [background:var(--theme-header-bg)] [border-color:var(--theme-header-border)] [box-shadow:var(--theme-header-shadow)]">
      <div className="flex min-h-[60px] items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-xl">{pageMeta.title}</h1>
          <p className="hidden truncate text-sm text-slate-500 md:block">{pageMeta.subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="通知"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown((value) => !value)}
              className={cn(
                "group flex items-center gap-2 rounded-[20px] border border-slate-200 bg-white px-1.5 py-1.5 transition hover:border-slate-300",
                showDropdown && "border-slate-300 bg-slate-50"
              )}
              aria-label="用户菜单"
              aria-expanded={showDropdown}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <UserIcon className="h-4.5 w-4.5" />
              </div>

              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-[140px] truncate text-sm font-medium text-slate-900">{displayName}</p>
                <p className="max-w-[180px] truncate text-xs text-slate-500">{emailText}</p>
              </div>

              <ChevronDown className={cn("mr-1 hidden h-4 w-4 text-slate-400 transition md:block", showDropdown && "rotate-180")} />
            </button>

            {showDropdown ? (
              <div className="absolute right-0 top-full z-50 mt-3 w-[240px] rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <div className="rounded-[18px] bg-slate-50 p-3">
                  <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{emailText}</p>
                </div>

                <div className="mt-2 space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    个人设置
                  </Link>

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
