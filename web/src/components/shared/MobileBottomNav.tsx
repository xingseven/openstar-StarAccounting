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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] md:hidden">
      <div className="mx-auto max-w-screen-sm rounded-[28px] border border-white/70 bg-white/88 p-1.5 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-white/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-white/95 to-transparent" />

          <nav className="pointer-events-auto flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 no-scrollbar">
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
                    "min-w-[76px] snap-center rounded-[22px] px-3 py-2.5 text-center transition-all",
                    isActive
                      ? "bg-slate-950 text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                      : "text-slate-500 hover:bg-slate-100/90 hover:text-slate-950"
                  )}
                >
                  <Icon className="mx-auto h-4.5 w-4.5" />
                  <span className="mt-1.5 block truncate text-[11px] font-medium tracking-[0.01em]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
