"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isNavigationItemActive, resolveNavigationHref } from "@/components/shared/navigation";
import { useTheme } from "@/components/shared/theme-provider";
import { getThemeManifest, type SidebarVariantId } from "@/themes/theme-manifest";
import type { ThemeId } from "@/themes/registry";

function getResolvedNavState(itemHref: string, pathname: string, themeId: ThemeId) {
  return {
    href: resolveNavigationHref(itemHref, themeId),
    isActive: isNavigationItemActive(itemHref, pathname),
  };
}

/* ────────── Default Theme Sidebar Content ────────── */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { themeId } = useTheme();
  const primaryItems = NAV_ITEMS.slice(0, Math.max(NAV_ITEMS.length - 2, 0));
  const secondaryItems = NAV_ITEMS.slice(Math.max(NAV_ITEMS.length - 2, 0));

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[34px] px-4 pb-4 pt-4"
      style={{ background: "var(--theme-sidebar-bg)" }}
    >
      <div className="px-1 pb-5">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border"
          style={{
            background: "var(--theme-sidebar-icon-bg)",
            borderColor: "var(--theme-sidebar-border)",
            color: "var(--theme-sidebar-icon-active-text)",
            boxShadow: "var(--theme-surface-shadow)",
          }}
        >
          <span className="text-sm font-semibold tracking-[0.18em]">OS</span>
          <span className="sr-only">OpenStar</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-1 pb-2">
        <div className="space-y-1.5">
          {primaryItems.map((item) => {
            const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "nova-sidebar-link group flex items-center gap-3 rounded-[18px] border border-transparent px-3.5 py-3 transition-all duration-200",
                  isActive
                    ? ""
                    : "text-[var(--theme-sidebar-text)] hover:bg-[var(--theme-sidebar-hover-bg)] hover:text-[var(--theme-sidebar-hover-text)]"
                )}
                style={
                  isActive
                    ? {
                        background: "var(--theme-sidebar-active-bg)",
                        borderColor: "var(--theme-sidebar-border)",
                        boxShadow: "var(--theme-surface-shadow)",
                        color: "var(--theme-sidebar-active-text)",
                      }
                    : undefined
                }
              >
                <div
                  className={cn(
                    "nova-sidebar-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] transition-all duration-200",
                    isActive
                      ? ""
                      : "bg-transparent text-[var(--theme-sidebar-icon-text)] group-hover:bg-[var(--theme-sidebar-icon-bg)] group-hover:text-[var(--theme-sidebar-hover-text)]"
                  )}
                  style={isActive ? { background: "var(--theme-sidebar-icon-active-bg)", color: "var(--theme-sidebar-icon-active-text)" } : undefined}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <p className="min-w-0 flex-1 truncate text-sm font-medium tracking-[0.01em]">{item.label}</p>
              </Link>
            );
          })}
        </div>

        {secondaryItems.length > 0 ? (
          <div className="mt-8 space-y-1.5 border-t pt-6" style={{ borderColor: "var(--theme-sidebar-border)" }}>
            {secondaryItems.map((item) => {
              const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-[18px] border border-transparent px-3.5 py-3 transition-all duration-200",
                    isActive
                      ? ""
                      : "text-[var(--theme-sidebar-text)] hover:bg-[var(--theme-sidebar-hover-bg)] hover:text-[var(--theme-sidebar-hover-text)]"
                  )}
                  style={
                    isActive
                      ? {
                          background: "var(--theme-sidebar-active-bg)",
                          borderColor: "var(--theme-sidebar-border)",
                          boxShadow: "var(--theme-surface-shadow)",
                          color: "var(--theme-sidebar-active-text)",
                        }
                      : undefined
                  }
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] transition-all duration-200",
                      isActive
                        ? ""
                        : "bg-transparent text-[var(--theme-sidebar-icon-text)] group-hover:bg-[var(--theme-sidebar-icon-bg)] group-hover:text-[var(--theme-sidebar-hover-text)]"
                    )}
                    style={isActive ? { background: "var(--theme-sidebar-icon-active-bg)", color: "var(--theme-sidebar-icon-active-text)" } : undefined}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <p className="min-w-0 flex-1 truncate text-sm font-medium tracking-[0.01em]">{item.label}</p>
                </Link>
              );
            })}
          </div>
        ) : null}
      </nav>
    </div>
  );
}

/* ────────── Analytics Theme Sidebar Content ────────── */
export function AnalyticsSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { themeId } = useTheme();
  
  // Splitting items by semantic meaning to match the "GENERAL" and "SUPPORT" sections in design
  const generalItems = NAV_ITEMS.slice(0, Math.max(NAV_ITEMS.length - 2, 0));
  const supportItems = NAV_ITEMS.slice(Math.max(NAV_ITEMS.length - 2, 0));

  return (
    <div className="flex h-full flex-col px-6 py-6 pb-8" style={{ background: "#F4EFEA" }}>
      {/* 1. Profile Block */}
      <div className="mb-8 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5EDFB] text-[#2E62A6] font-bold text-lg">
            A
          </div>
          <span className="font-bold text-[#0f172a] text-[15px]">Alexia</span>
        </div>
        <ChevronDown className="h-5 w-5 text-slate-400" />
      </div>

      <nav className="flex-1 overflow-y-auto space-y-8 scrollbar-none">
        {/* 2. General Section */}
        <div>
          <h4 className="mb-4 px-2 text-[11px] font-bold tracking-wider text-[#94a3b8]">GENERAL</h4>
          <div className="space-y-1.5">
            {generalItems.map((item) => {
              const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-4 rounded-[20px] px-4 py-3.5 transition-all",
                    isActive
                      ? "bg-[#2E62A6] text-white shadow-[0_8px_24px_rgba(46,98,166,0.2)]"
                      : "text-[#64748b] hover:bg-white/50 hover:text-[#334155]"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-[#94a3b8]")} />
                  <span className={cn("text-[14px]", isActive ? "font-bold" : "font-semibold")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Support Section */}
        <div>
          <h4 className="mb-4 px-2 text-[11px] font-bold tracking-wider text-[#94a3b8]">SUPPORT</h4>
          <div className="space-y-1.5">
            {supportItems.map((item) => {
              const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-4 rounded-[20px] px-4 py-3.5 transition-all",
                    isActive
                      ? "bg-[#2E62A6] text-white shadow-[0_8px_24px_rgba(46,98,166,0.2)]"
                      : "text-[#64748b] hover:bg-white/50 hover:text-[#334155]"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-[#94a3b8]")} />
                  <span className={cn("text-[14px]", isActive ? "font-bold" : "font-semibold")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 4. Bottom Dark Mode Toggle */}
      <div className="mt-6 flex justify-center">
        <div className="flex h-12 w-full max-w-[180px] items-center justify-between rounded-full bg-white p-1.5 shadow-sm">
          <button className="flex h-9 w-1/2 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <Sun className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-1/2 items-center justify-center rounded-full bg-[#1e293b] text-white shadow-md transition-colors">
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────── Orange-Purple Theme Sidebar Content ────────── */
export function OrangePurpleSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { themeId } = useTheme();
  const primaryItems = NAV_ITEMS.slice(0, Math.max(NAV_ITEMS.length - 2, 0));
  const bottomItems  = NAV_ITEMS.slice(Math.max(NAV_ITEMS.length - 2, 0));

  return (
    <div className="flex h-full flex-col bg-white px-4 py-6">
      {/* Logo area */}
      <div className="mb-8 px-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#FF8C5A] to-[#FF5533]">
          <div className="h-4 w-4 rounded-[4px] bg-white/80" />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
        {primaryItems.map((item) => {
          const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-[14px] px-3 py-3 text-[13px] font-semibold transition-all",
                isActive
                  ? "bg-[#fff3ef] text-[#FF6B35]"
                  : "text-[#8b92a9] hover:bg-[#f7f8fc] hover:text-[#1a1d2e]",
              )}
            >
              {/* left bar indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FF6B35]" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#FF6B35]" : "text-[#b0b8cc] group-hover:text-[#8b92a9]")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom items (Settings / Help) */}
      {bottomItems.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-[#f0f1f7] pt-4">
          {bottomItems.map((item) => {
            const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[14px] px-3 py-3 text-[13px] font-semibold transition-all",
                  isActive
                    ? "bg-[#f3f0ff] text-[#7B61FF]"
                    : "text-[#8b92a9] hover:bg-[#f7f8fc] hover:text-[#1a1d2e]",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#7B61FF]" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#7B61FF]" : "text-[#b0b8cc]")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────── Dusty Blue Theme Sidebar Content ────────── */
export function DustyBlueSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { themeId } = useTheme();
  const primaryItems = NAV_ITEMS.slice(0, Math.max(NAV_ITEMS.length - 2, 0));
  const bottomItems  = NAV_ITEMS.slice(Math.max(NAV_ITEMS.length - 2, 0));

  return (
    <div className="flex h-full flex-col bg-[#F9FAFC] px-3 py-6">
      {/* Logo area */}
      <div className="mb-8 px-4 flex items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7D8C9F] text-white">
          <div className="h-4 w-4 rounded-full border-2 border-white/80" />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto space-y-2 scrollbar-none">
        {primaryItems.map((item) => {
          const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center justify-center mx-auto h-12 w-12 rounded-[16px] transition-all",
                isActive
                  ? "bg-[#2E4156] text-white shadow-[0_8px_20px_rgba(46,65,86,0.3)]"
                  : "text-[#7D8C9F] hover:bg-[#EEF1F5] hover:text-[#4A5F7A]",
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      {bottomItems.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-[#E4E9F0] pt-4">
          {bottomItems.map((item) => {
            const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center justify-center mx-auto h-12 w-12 rounded-[16px] transition-all",
                  isActive
                    ? "bg-[#2E4156] text-white shadow-[0_8px_20px_rgba(46,65,86,0.3)]"
                    : "text-[#7D8C9F] hover:bg-[#EEF1F5] hover:text-[#4A5F7A]",
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────── Vibrant Theme Sidebar Content ────────── */
export function VibrantSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { themeId } = useTheme();
  const primaryItems = NAV_ITEMS.slice(0, Math.max(NAV_ITEMS.length - 2, 0));
  const bottomItems  = NAV_ITEMS.slice(Math.max(NAV_ITEMS.length - 2, 0));

  return (
    <div className="flex h-full flex-col bg-white px-3 py-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo area */}
      <div className="mb-8 px-4 flex items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0062FF] text-white shadow-md shadow-blue-500/30">
          <div className="h-4 w-4 rounded-sm border-2 border-white" />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto space-y-2 scrollbar-none">
        {primaryItems.map((item) => {
          const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center justify-center mx-auto h-[52px] w-[52px] rounded-[18px] transition-all duration-300",
                isActive
                  ? "bg-[#0062FF] text-white shadow-[0_8px_20px_rgba(0,98,255,0.3)]"
                  : "text-[#9CA3AF] hover:bg-[#F5F7FA] hover:text-[#111827]",
              )}
              title={item.label}
            >
              <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      {bottomItems.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {bottomItems.map((item) => {
            const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center justify-center mx-auto h-[52px] w-[52px] rounded-[18px] transition-all duration-300",
                  isActive
                    ? "bg-[#0062FF] text-white shadow-[0_8px_20px_rgba(0,98,255,0.3)]"
                    : "text-[#9CA3AF] hover:bg-[#F5F7FA] hover:text-[#111827]",
                )}
                title={item.label}
              >
                <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────── Charming Purple Theme Sidebar Content ────────── */
export function CharmingPurpleSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { themeId } = useTheme();
  const primaryItems = NAV_ITEMS.slice(0, Math.max(NAV_ITEMS.length - 2, 0));
  const bottomItems  = NAV_ITEMS.slice(Math.max(NAV_ITEMS.length - 2, 0));

  return (
    <div className="flex h-full flex-col bg-transparent px-5 py-6">
      {/* Logo area */}
      <div className="mb-8 px-4 flex items-center justify-start">
        <div className="flex h-10 w-10 items-center justify-center font-black">
          <div className="h-6 w-6 rounded-[6px] border-[3px] border-[#1A1D2E]" />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto space-y-3 scrollbar-none mt-4">
        {primaryItems.map((item) => {
          const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-4 rounded-full px-4 py-3 text-[14px] font-bold transition-all",
                isActive
                  ? "bg-[#365CA8] text-white shadow-md shadow-blue-900/10"
                  : "text-[#1A1D2E] hover:bg-white/40",
              )}
            >
              <Icon className="h-[20px] w-[20px] shrink-0" strokeWidth={2.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      {bottomItems.length > 0 && (
        <div className="mt-4 space-y-3 pt-4">
          {bottomItems.map((item) => {
            const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-4 rounded-full px-4 py-3 text-[14px] font-bold transition-all",
                  isActive
                    ? "bg-[#365CA8] text-white shadow-md shadow-blue-900/10"
                    : "text-[#1A1D2E] hover:bg-white/40",
                )}
              >
                <Icon className="h-[20px] w-[20px] shrink-0" strokeWidth={2.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────── White Grid Theme Sidebar Content ────────── */
export function WhiteGridSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { themeId } = useTheme();
  const primaryItems = NAV_ITEMS.slice(0, Math.max(NAV_ITEMS.length - 2, 0));
  const bottomItems  = NAV_ITEMS.slice(Math.max(NAV_ITEMS.length - 2, 0));

  return (
    <div className="flex h-full flex-col bg-transparent px-2 py-6">
      {/* Logo area */}
      <div className="mb-10 px-4">
        <div className="h-5 w-5 rounded-full border-[3px] border-[#31465F]" />
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none">
        {primaryItems.map((item) => {
          const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all",
                isActive
                  ? "bg-[#31465F] text-white shadow-md"
                  : "text-[#8D98A9] hover:bg-white/50 hover:text-[#31465F]",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      {bottomItems.length > 0 && (
        <div className="mt-4 space-y-1.5 pt-4">
          {bottomItems.map((item) => {
            const { href, isActive } = getResolvedNavState(item.href, pathname, themeId);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all",
                  isActive
                    ? "bg-[#31465F] text-white shadow-md"
                    : "text-[#8D98A9] hover:bg-white/50 hover:text-[#31465F]",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SIDEBAR_VARIANT_COMPONENTS: Record<SidebarVariantId, ComponentType<{ onNavigate?: () => void }>> = {
  default: SidebarContent,
  analytics: AnalyticsSidebarContent,
  "orange-purple": OrangePurpleSidebarContent,
  "dusty-blue": DustyBlueSidebarContent,
  vibrant: VibrantSidebarContent,
  "charming-purple": CharmingPurpleSidebarContent,
  "white-grid": WhiteGridSidebarContent,
};

/* ────────── Main Sidebar Wrapper ────────── */
export function Sidebar() {
  const { themeId } = useTheme();
  const themeManifest = getThemeManifest(themeId);
  const { sidebar } = themeManifest;
  const SidebarVariantComponent = SIDEBAR_VARIANT_COMPONENTS[sidebar.variant];

  if (sidebar.floating) {
    return (
      <aside className={cn("hidden h-full shrink-0 md:flex z-[10] py-4", sidebar.widthClass)}>
        <div className="flex h-full flex-1 flex-col rounded-[32px] overflow-hidden bg-transparent pl-2 pr-4">
          <SidebarVariantComponent />
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn("hidden h-full shrink-0 md:flex z-[10]", sidebar.widthClass)}>
      <div
        className={cn("flex h-full flex-1 flex-col", sidebar.shellClass)}
        style={sidebar.variant === "default" ? {
          background: "var(--theme-sidebar-bg)",
          borderColor: "var(--theme-sidebar-border)",
          boxShadow: sidebar.shadow === "default" ? "0 22px 54px rgba(148, 163, 184, 0.16)" : undefined,
        } : undefined}
      >
        <SidebarVariantComponent />
      </div>
    </aside>
  );
}
