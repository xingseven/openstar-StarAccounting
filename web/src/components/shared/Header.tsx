"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Settings2, User as UserIcon } from "lucide-react";
import { clearAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/shared/UserContext";
import { getPageMeta } from "@/components/shared/navigation";

const SCROLL_HIDE_THRESHOLD = 10;
const SCROLL_HIDE_START = 56;

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageMeta = getPageMeta(pathname);
  const displayName = user ? user.name || user.email.split("@")[0] : "未登录";
  const emailText = user ? user.email : "请重新登录";

  useEffect(() => {
    setIsHeaderVisible(true);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const scrollArea = document.querySelector<HTMLElement>("[data-dashboard-scroll-area='true']");
    if (!scrollArea) return;
    const scrollContainer = scrollArea;

    let lastScrollTop = scrollContainer.scrollTop;

    function handleScroll() {
      const currentScrollTop = scrollContainer.scrollTop;

      if (showDropdown) {
        setIsHeaderVisible(true);
        lastScrollTop = currentScrollTop;
        return;
      }

      const delta = currentScrollTop - lastScrollTop;
      if (Math.abs(delta) < SCROLL_HIDE_THRESHOLD) return;

      if (currentScrollTop <= 8) {
        setIsHeaderVisible(true);
      } else if (delta > 0 && currentScrollTop > SCROLL_HIDE_START) {
        setIsHeaderVisible(false);
      } else if (delta < 0) {
        setIsHeaderVisible(true);
      }

      lastScrollTop = currentScrollTop;
    }

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [pathname, showDropdown]);

  function logout() {
    clearAccessToken();
    setShowDropdown(false);
    window.location.href = "/auth/login";
  }

  return (
    <div
      className={cn(
        "origin-top overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
        isHeaderVisible ? "max-h-24 opacity-100 sm:max-h-28" : "max-h-0 opacity-0"
      )}
    >
      <header
        className={cn(
          "rounded-[18px] border [background:var(--theme-header-bg)] [border-color:var(--theme-header-border)] [box-shadow:var(--theme-header-shadow)] transition-transform duration-300 ease-out sm:rounded-[20px]",
          isHeaderVisible ? "translate-y-0" : "-translate-y-4"
        )}
      >
        <div className="flex min-h-[52px] items-center justify-between gap-2 px-3 py-2 sm:min-h-[60px] sm:gap-3 sm:px-5 sm:py-3">
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-950 sm:text-xl">{pageMeta.title}</h1>
            <p className="hidden truncate text-sm text-slate-500 md:block">{pageMeta.subtitle}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="通知"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950 sm:h-10 sm:w-10 sm:rounded-2xl"
            >
              <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              <span className="absolute right-[10px] top-[10px] h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white sm:right-3 sm:top-3 sm:h-2 sm:w-2" />
            </button>

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((value) => !value)}
                className={cn(
                  "group flex items-center gap-1.5 rounded-[18px] border border-slate-200 bg-white px-1 py-1 transition hover:border-slate-300 sm:gap-2 sm:rounded-[20px] sm:px-1.5 sm:py-1.5",
                  showDropdown && "border-slate-300 bg-slate-50"
                )}
                aria-label="用户菜单"
                aria-expanded={showDropdown}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-[16px] bg-slate-100 text-slate-700 sm:h-9 sm:w-9 sm:rounded-2xl">
                  <UserIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
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
    </div>
  );
}
