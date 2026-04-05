"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Search, Settings2, User as UserIcon } from "lucide-react";
import { clearAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, resolveNavigationHref } from "@/components/shared/navigation";
import { useUser } from "@/components/shared/UserContext";
import { useTheme } from "@/components/shared/theme-provider";
import { getThemeManifest } from "@/themes/theme-manifest";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { themeId } = useTheme();
  const { user } = useUser();
  const themeManifest = getThemeManifest(themeId);
  const isTransparentHeader = themeManifest.headerVariant === "transparent";
  const hidesUserMenu = themeManifest.sidebar.variant === "analytics";
  const usesSoftTransparentChip = themeManifest.sidebar.variant === "white-grid";
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inlineSlotRef = useRef<HTMLDivElement>(null);

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

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return;
    }

    const target = NAV_ITEMS.find((item) =>
      [item.label, item.caption].some((field) => field.toLowerCase().includes(keyword))
    );

    if (!target) {
      return;
    }

    const targetHref = resolveNavigationHref(target.href, themeId);

    if (targetHref === pathname) {
      return;
    }

    router.push(targetHref);
    setSearchValue("");
  }

  return (
    <header
      className="flex w-full justify-end bg-transparent"
    >
      <div className="flex min-h-[52px] w-full items-center gap-2 px-1 py-2 sm:min-h-[60px] sm:gap-3 sm:py-3">
        <div
          id="dashboard-header-inline-slot"
          ref={inlineSlotRef}
          className="hidden min-w-0 flex-1 md:block [&:empty]:hidden"
        />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="hidden md:block">
            <label
              className={cn(
                "flex h-11 w-[220px] items-center gap-2 rounded-2xl px-3 transition",
                isTransparentHeader 
                  ? "bg-white/60 hover:bg-white focus-within:bg-white shadow-sm" 
                  : "bg-white border shadow-[0_8px_24px_rgba(15,23,42,0.04)] focus-within:border-[var(--module-accent-ring)] focus-within:shadow-[0_12px_28px_rgba(15,118,110,0.08)]"
              )}
              style={isTransparentHeader ? {} : { borderColor: "var(--theme-input-border)" }}
            >
              <Search className="h-4 w-4" style={{ color: "var(--theme-muted-text)" }} />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="搜索页面"
                className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                aria-label="搜索页面"
              />
            </label>
          </form>
          <button
            type="button"
            aria-label="通知"
            className={cn(
              "nova-header-button relative inline-flex h-10 w-10 items-center justify-center rounded-2xl transition hover:-translate-y-0.5 hover:brightness-105",
              isTransparentHeader ? "bg-white/60 hover:bg-white shadow-sm" : "bg-white border shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            )}
            style={isTransparentHeader ? { color: "var(--theme-muted-text)" } : {
              color: "var(--theme-muted-text)",
              borderColor: "var(--theme-input-border)",
            }}
          >
            <Search className="h-4 w-4 md:hidden" />
            <Bell className="hidden h-4 w-4 md:block" />
            <span
              className="absolute right-[10px] top-[10px] h-1.5 w-1.5 rounded-full sm:right-3 sm:top-3 sm:h-2 sm:w-2"
              style={{
                background: "var(--module-accent-strong)",
                boxShadow: "0 0 0 2px var(--theme-header-bg)",
              }}
            />
          </button>

          <div ref={dropdownRef} className={cn("relative", hidesUserMenu && "hidden md:hidden")}>
            <button
              type="button"
              onClick={() => setShowDropdown((value) => !value)}
              className={cn(
                "nova-header-user-button group flex items-center gap-2 rounded-full px-1.5 py-1.5 transition hover:-translate-y-0.5 hover:brightness-105",
                isTransparentHeader 
                  ? (usesSoftTransparentChip ? "bg-[#E2E7ED]/50 hover:bg-[#E2E7ED] shadow-none" : "bg-white/60 hover:bg-white shadow-sm") 
                  : "bg-white border shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
                showDropdown && "shadow-sm bg-white"
              )}
              style={isTransparentHeader ? {} : {
                borderColor: "var(--theme-input-border)",
              }}
              aria-label="用户菜单"
              aria-expanded={showDropdown}
            >
              <div
                className="nova-header-avatar flex h-9 w-9 items-center justify-center rounded-[15px]"
                style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}
              >
                <UserIcon className="h-4 w-4" />
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
                className="nova-header-menu absolute right-0 top-full z-50 mt-3 w-[240px] rounded-2xl border p-2"
                style={{
                  background: "var(--theme-surface-bg)",
                  borderColor: "var(--theme-surface-border)",
                  boxShadow: "var(--theme-surface-shadow)",
                }}
              >
                <div className="nova-header-menu-card rounded-xl p-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{displayName}</p>
                  <p className="mt-1 truncate text-xs" style={{ color: "var(--theme-muted-text)" }}>{emailText}</p>
                </div>

                <div className="mt-2 space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="nova-header-menu-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50/80"
                    style={{ color: "var(--theme-label-text)" }}
                  >
                    <Settings2 className="h-4 w-4" style={{ color: "var(--theme-muted-text)" }} />
                    个人设置
                  </Link>

                  <button
                    onClick={logout}
                    className="nova-header-menu-danger flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-red-50"
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
