"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeTone = "blue" | "green" | "emerald" | "violet" | "red" | "amber" | "slate";

const TONE_CLASS_MAP: Record<ThemeTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const THEME_SURFACE_CLASS =
  "relative overflow-hidden rounded-[20px] border [background:var(--theme-surface-bg)] [border-color:var(--theme-surface-border)] [box-shadow:var(--theme-surface-shadow)] sm:rounded-[24px]";

export const THEME_HERO_CLASS =
  "relative overflow-hidden rounded-[24px] border [background:var(--theme-hero-bg)] [border-color:var(--theme-hero-border)] [box-shadow:var(--theme-hero-shadow)] p-4 sm:rounded-[28px] sm:p-6 lg:p-8";

export const THEME_DARK_PANEL_CLASS =
  "relative overflow-hidden rounded-[20px] border [background:var(--theme-dark-panel-bg)] [border-color:var(--theme-dark-panel-border)] [box-shadow:var(--theme-dark-panel-shadow)] text-white sm:rounded-[24px]";

export function getThemeToneClass(tone: ThemeTone) {
  return TONE_CLASS_MAP[tone];
}

export function ThemeSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(THEME_SURFACE_CLASS, className)}>{children}</div>;
}

export function ThemeHero({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn(THEME_HERO_CLASS, className)}>{children}</section>;
}

export function ThemeDarkPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(THEME_DARK_PANEL_CLASS, className)}>{children}</div>;
}

export function ThemeSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        {eyebrow ? <p className="text-sm font-medium text-slate-500">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ThemeMetricCard({
  label,
  value,
  mobileValue,
  tone,
  icon: Icon,
  detail,
  detailPosition = "body",
  hideDetailOnMobile = false,
  iconVisibility = "always",
  className,
}: {
  label: string;
  value: string;
  mobileValue?: string;
  tone: ThemeTone;
  icon?: LucideIcon;
  detail?: string;
  detailPosition?: "body" | "badge" | "none";
  hideDetailOnMobile?: boolean;
  iconVisibility?: "always" | "desktop" | "none";
  className?: string;
}) {
  const toneClass = getThemeToneClass(tone);
  const hasIcon = Icon && iconVisibility !== "none";
  const showMobileIcon = Icon && iconVisibility === "always";
  const showDesktopIcon = Icon && (iconVisibility === "always" || iconVisibility === "desktop");

  return (
    <div className={cn("rounded-[18px] border [background:var(--theme-metric-bg)] [border-color:var(--theme-metric-border)] [box-shadow:var(--theme-metric-shadow)] p-3 sm:rounded-[20px] sm:p-4", className)}>
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:block">
            {showMobileIcon ? (
              <div className={cn("rounded-lg p-1.5 ring-1 sm:hidden", toneClass)}>
                <Icon className="h-3 w-3" />
              </div>
            ) : null}
            <p className="text-[11px] font-medium text-slate-500 sm:text-sm">{label}</p>
          </div>

          <p className="mt-1.5 break-all text-[12px] font-semibold leading-4 tracking-tight text-slate-950 sm:hidden">
            {mobileValue ?? value}
          </p>
          <p className="mt-2 hidden text-xl font-semibold tracking-tight text-slate-950 sm:block">{value}</p>

          {detail && detailPosition === "body" ? (
            <p className={cn("mt-2 text-xs leading-5 text-slate-500", hideDetailOnMobile && "hidden sm:block")}>{detail}</p>
          ) : null}
        </div>

        {showDesktopIcon && hasIcon ? (
          <div className={cn("hidden rounded-xl p-2 ring-1 sm:block sm:rounded-2xl sm:p-2.5", toneClass)}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        ) : null}

        {detail && detailPosition === "badge" ? (
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium ring-1", toneClass)}>{detail}</span>
        ) : null}
      </div>
    </div>
  );
}
