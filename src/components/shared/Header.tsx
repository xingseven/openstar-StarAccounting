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
  const [hasInlineContent, setHasInlineContent] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inlineSlotRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const slot = inlineSlotRef.current;
    if (!slot) return;

    const sync = () => {
      setHasInlineContent(slot.childElementCount > 0);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(slot, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  function logout() {
    clearAccessToken();
    setShowDropdown(false);
    window.location.href = "/auth/login";
  }

  return (
    <header
      className="nova-header-shell rounded-[16px] border [background:var(--theme-header-bg)] backdrop-blur-md sm:rounded-[18px]"
      style={{
        borderColor: "var(--theme-header-border)",
        boxShadow: "var(--theme-header-shadow)",
      }}
    >
      <div className="flex min-h-[52px] items-center gap-2 px-3 py-2 sm:min-h-[60px] sm:gap-3 sm:px-5 sm:py-3">
        <div className={cn("min-w-0 shrink-0 md:max-w-[240px] lg:max-w-[280px]", hasInlineContent && "md:hidden")}>
          <h1 className="nova-header-title truncate text-[15px] font-semibold tracking-tight sm:text-xl" style={{ color: "var(--theme-body-text)" }}>
            {pageMeta.title}
          </h1>
          <p className="nova-header-subtitle hidden truncate text-sm md:block" style={{ color: "var(--theme-muted-text)" }}>
            {pageMeta.subtitle}
          </p>
        </div>

        <div
          id="dashboard-header-inline-slot"
          ref={inlineSlotRef}
          className="hidden min-w-0 flex-1 md:block [&:empty]:hidden"
        />

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="通知"
            className="nova-header-button relative inline-flex h-9 w-9 items-center justify-center rounded-[16px] border transition hover:brightness-110 sm:h-10 sm:w-10 sm:rounded-[18px]"
            style={{
              background: "var(--theme-input-bg)",
              color: "var(--theme-muted-text)",
              borderColor: "var(--theme-input-border)",
            }}
          >
            <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            <span
              className="absolute right-[10px] top-[10px] h-1.5 w-1.5 rounded-full bg-blue-500 sm:right-3 sm:top-3 sm:h-2 sm:w-2"
              style={{ boxShadow: "0 0 0 2px var(--theme-header-bg)" }}
            />
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown((value) => !value)}
              className={cn(
                "nova-header-user-button group flex items-center gap-1.5 rounded-[16px] border px-1 py-1 transition hover:brightness-110 sm:gap-2 sm:rounded-[18px] sm:px-1.5 sm:py-1.5",
                showDropdown && "shadow-sm"
              )}
              style={{
                background: "var(--theme-input-bg)",
                borderColor: "var(--theme-input-border)",
              }}
              aria-label="用户菜单"
              aria-expanded={showDropdown}
            >
              <div
                className="nova-header-avatar flex h-8 w-8 items-center justify-center rounded-[14px] sm:h-9 sm:w-9 sm:rounded-[16px]"
                style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}
              >
                <UserIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>

              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-[140px] truncate text-sm font-medium" style={{ color: "var(--theme-body-text)" }}>{displayName}</p>
                <p className="max-w-[180px] truncate text-xs" style={{ color: "var(--theme-muted-text)" }}>{emailText}</p>
              </div>

              <ChevronDown
                className={cn("mr-1 hidden h-4 w-4 transition md:block", showDropdown && "rotate-180")}
                style={{ color: "var(--theme-muted-text)" }}
              />
            </button>

            {showDropdown ? (
              <div
                className="nova-header-menu absolute right-0 top-full z-50 mt-3 w-[240px] rounded-[20px] border p-2 backdrop-blur-xl"
                style={{
                  background: "var(--theme-surface-bg)",
                  borderColor: "var(--theme-surface-border)",
                  boxShadow: "var(--theme-surface-shadow)",
                }}
              >
                <div className="nova-header-menu-card rounded-[16px] p-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{displayName}</p>
                  <p className="mt-1 truncate text-xs" style={{ color: "var(--theme-muted-text)" }}>{emailText}</p>
                </div>

                <div className="mt-2 space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="nova-header-menu-link flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50/80"
                    style={{ color: "var(--theme-label-text)" }}
                  >
                    <Settings2 className="h-4 w-4" style={{ color: "var(--theme-muted-text)" }} />
                    个人设置
                  </Link>

                  <button
                    onClick={logout}
                    className="nova-header-menu-danger flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left text-sm font-medium transition hover:bg-red-50"
                    style={{ color: "#ef4444" }}
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
