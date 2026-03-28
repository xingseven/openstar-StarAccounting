"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/shared/navigation";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-hidden [background:var(--theme-sidebar-bg)]">
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
            OS
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-950">Star Accounting</p>
            <p className="mt-0.5 truncate text-xs [color:var(--theme-sidebar-muted)]">分析过去，规划未来</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] [color:var(--theme-sidebar-muted)]">Navigation</div>

        <div className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-[16px] px-3 py-2.5 transition-colors",
                  isActive
                    ? "[background:var(--theme-sidebar-active-bg)] [color:var(--theme-sidebar-active-text)]"
                    : "[color:var(--theme-sidebar-text)] hover:[background:var(--theme-sidebar-hover-bg)] hover:[color:var(--theme-sidebar-hover-text)]"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] transition-colors",
                    isActive
                      ? "[background:var(--theme-sidebar-icon-active-bg)] [color:var(--theme-sidebar-icon-active-text)]"
                      : "[background:var(--theme-sidebar-icon-bg)] [color:var(--theme-sidebar-icon-text)] group-hover:bg-white/88 group-hover:text-slate-600"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className={cn("mt-0.5 truncate text-xs", isActive ? "opacity-80" : "[color:var(--theme-sidebar-muted)] group-hover:text-slate-500")}>
                      {item.caption}
                    </p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-72 shrink-0 md:flex">
      <div className="h-full w-full overflow-hidden rounded-[22px] [background:var(--theme-sidebar-bg)] backdrop-blur-md">
        <SidebarContent />
      </div>
    </aside>
  );
}
