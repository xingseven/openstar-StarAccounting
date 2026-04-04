"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/shared/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(env(safe-area-inset-bottom),0.375rem)] md:hidden">
      <div className="mobile-bottom-nav-shell mx-auto max-w-screen-sm rounded-[22px] bg-white/84 p-1 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="relative">
          <div className="mobile-bottom-nav-edge-left pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-white/90 to-transparent" />
          <div className="mobile-bottom-nav-edge-right pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-white/90 to-transparent" />

          <nav className="pointer-events-auto flex snap-x snap-mandatory gap-1 overflow-x-auto px-0.5 no-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={isActive ? activeItemRef : null}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "mobile-bottom-nav-link min-w-[68px] snap-center rounded-[18px] px-2.5 py-2 text-center transition-all",
                    isActive
                      ? "bg-slate-950 text-white shadow-[0_8px_16px_rgba(15,23,42,0.16)]"
                      : "text-slate-500 hover:bg-slate-100/90 hover:text-slate-950"
                  )}
                >
                  <Icon className="mx-auto h-4 w-4" />
                  <span className="mt-1 block truncate text-[10px] font-medium tracking-[0.01em]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
