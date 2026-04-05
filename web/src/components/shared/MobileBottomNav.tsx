"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavigationItemActive, resolveNavigationHref } from "@/components/shared/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { getThemeManifest } from "@/themes/theme-manifest";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { themeId } = useTheme();
  const themeManifest = getThemeManifest(themeId);
  const isAnalytics = themeManifest.mobileNavVariant === "analytics";

  return (
    <div
      className={cn(
        "pointer-events-auto fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] md:hidden",
        isAnalytics ? "border-t-0 backdrop-blur-md" : "border-t backdrop-blur-xl"
      )}
      style={isAnalytics ? { background: "rgba(244,239,234,0.95)" } : { background: "var(--theme-header-bg)", borderColor: "var(--theme-shell-border)" }}
    >
      <nav className="flex w-full items-center overflow-x-auto no-scrollbar gap-2 px-3 pt-2 pb-2">
        {NAV_ITEMS.map((item) => {
          const href = resolveNavigationHref(item.href, themeId);
          const isActive = isNavigationItemActive(item.href, pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex shrink-0 min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl p-1 transition-all duration-200 active:scale-95",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200",
                  isActive
                    ? isAnalytics ? "bg-[#2E62A6] text-white" : ""
                    : "text-gray-500 group-hover:text-gray-900 group-active:bg-gray-100"
                )}
                style={isActive && !isAnalytics ? { background: "var(--theme-sidebar-active-bg)", color: "var(--theme-sidebar-active-text)" } : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide transition-colors duration-200",
                  isActive 
                    ? isAnalytics ? "font-bold text-[#2E62A6]" : ""
                    : "text-gray-500"
                )}
                style={isActive && !isAnalytics ? { color: "var(--theme-sidebar-active-text)" } : undefined}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
