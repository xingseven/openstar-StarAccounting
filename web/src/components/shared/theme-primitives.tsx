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

const NOTICE_CLASS_MAP: Record<ThemeTone, string> = {
  blue: "border-transparent bg-blue-50 text-blue-900 sm:border-blue-200",
  green: "border-transparent bg-emerald-50 text-emerald-900 sm:border-emerald-200",
  emerald: "border-transparent bg-emerald-50 text-emerald-900 sm:border-emerald-200",
  violet: "border-transparent bg-violet-50 text-violet-900 sm:border-violet-200",
  red: "border-transparent bg-red-50 text-red-900 sm:border-red-200",
  amber: "border-transparent bg-amber-50 text-amber-900 sm:border-amber-200",
  slate: "border-transparent bg-slate-50 text-slate-900 sm:border-slate-200",
};

export const THEME_SURFACE_CLASS =
  "relative overflow-hidden rounded-[20px] border border-transparent [background:var(--theme-surface-bg)] [box-shadow:none] sm:rounded-[24px] sm:[border-color:var(--theme-surface-border)] sm:[box-shadow:var(--theme-surface-shadow)]";

export const THEME_HERO_CLASS =
  "relative overflow-hidden rounded-[24px] border border-transparent [background:var(--theme-hero-bg)] [box-shadow:none] p-4 sm:rounded-[28px] sm:[border-color:var(--theme-hero-border)] sm:[box-shadow:var(--theme-hero-shadow)] sm:p-6 lg:p-8";

export const THEME_DARK_PANEL_CLASS =
  "relative overflow-hidden rounded-[20px] border border-transparent [background:var(--theme-dark-panel-bg)] [box-shadow:none] text-white sm:rounded-[24px] sm:[border-color:var(--theme-dark-panel-border)] sm:[box-shadow:var(--theme-dark-panel-shadow)]";

export const THEME_DIALOG_INPUT_CLASS =
  "h-11 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-400 shadow-none sm:border-slate-200";

export const THEME_DIALOG_SELECT_CLASS =
  "h-11 w-full appearance-none rounded-2xl border border-slate-100 bg-white px-3 text-sm text-slate-950 transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:border-slate-200";

export const THEME_TEXTAREA_CLASS =
  "min-h-[96px] w-full rounded-[20px] border border-slate-100 bg-white px-3 py-2.5 text-sm text-slate-950 transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:border-slate-200";

export const THEME_COMPACT_SELECT_CLASS =
  "rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-950 transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:border-slate-200";

export const THEME_WHITE_ACTION_BUTTON_CLASS =
  "h-11 rounded-2xl bg-white text-slate-950 shadow-none hover:bg-blue-50";

export const THEME_ICON_BUTTON_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 sm:border-slate-200 sm:hover:border-slate-300";

export const THEME_LIST_ITEM_CLASS =
  "flex items-center justify-between rounded-2xl border border-transparent bg-white px-4 py-3 text-xs transition hover:bg-slate-50 sm:border-slate-200 sm:text-sm sm:hover:border-slate-300";

export const THEME_STATUS_SUCCESS_SURFACE_CLASS = "border-transparent bg-green-50 sm:border-green-200";

export const THEME_STATUS_SUCCESS_SOFT_SURFACE_CLASS = "border-transparent bg-green-50/70 sm:border-green-200";

export const THEME_STATUS_NEUTRAL_SURFACE_CLASS = "border-transparent bg-white hover:bg-slate-50 sm:border-slate-200 sm:hover:border-slate-300";

export const THEME_STATUS_MUTED_SURFACE_CLASS = "border-transparent bg-slate-50/70 sm:border-slate-200";

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
        {eyebrow ? <p className="text-xs font-medium text-slate-500 sm:text-sm">{eyebrow}</p> : null}
        <h2 className="mt-1 text-lg font-semibold text-slate-950 sm:text-xl">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p> : null}
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
    <div className={cn("rounded-[18px] border border-transparent [background:var(--theme-metric-bg)] [box-shadow:none] p-3 sm:rounded-[20px] sm:[border-color:var(--theme-metric-border)] sm:[box-shadow:var(--theme-metric-shadow)] sm:p-4", className)}>
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:block">
            {showMobileIcon ? (
              <div className={cn("rounded-lg p-1.5 ring-1 sm:hidden", toneClass)}>
                <Icon className="h-3 w-3" />
              </div>
            ) : null}
            <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
          </div>

          <p className="mt-1.5 break-all text-sm font-semibold leading-5 tracking-tight text-slate-950 sm:hidden">
            {mobileValue ?? value}
          </p>
          <p className="mt-2 hidden text-xl font-semibold tracking-tight text-slate-950 sm:block">{value}</p>

          {detail && detailPosition === "body" ? (
            <p className={cn("mt-2 text-[11px] leading-5 text-slate-500 sm:text-xs", hideDetailOnMobile && "hidden sm:block")}>{detail}</p>
          ) : null}
        </div>

        {showDesktopIcon && hasIcon ? (
          <div className={cn("hidden rounded-xl p-2 ring-1 sm:block sm:rounded-2xl sm:p-2.5", toneClass)}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        ) : null}

        {detail && detailPosition === "badge" ? (
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium ring-1", toneClass)}>{detail}</span>
        ) : null}
      </div>
    </div>
  );
}

export function ThemeToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-[18px] border border-transparent [background:var(--theme-surface-bg)] [box-shadow:none] px-4 py-3 sm:rounded-[20px] sm:[border-color:var(--theme-surface-border)] sm:[box-shadow:var(--theme-surface-shadow)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ThemeFormGrid({
  children,
  className,
  columns = 2,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ThemeFormField({
  label,
  hint,
  htmlFor,
  className,
  labelClassName,
  hintClassName,
  children,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  labelClassName?: string;
  hintClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className={cn("text-sm font-medium text-slate-700", labelClassName)}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className={cn("text-xs text-slate-500", hintClassName)}>{hint}</p> : null}
    </div>
  );
}

export function ThemeTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(THEME_SURFACE_CLASS, "overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function ThemeNotice({
  tone = "slate",
  title,
  description,
  className,
  children,
}: {
  tone?: ThemeTone;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[18px] border px-4 py-3", NOTICE_CLASS_MAP[tone], className)}>
      {title ? <div className="text-xs font-semibold sm:text-sm">{title}</div> : null}
      {description ? <div className={cn("text-xs leading-5 sm:text-sm", title ? "mt-1 opacity-90" : "")}>{description}</div> : null}
      {children ? <div className={cn(title || description ? "mt-2" : "")}>{children}</div> : null}
    </div>
  );
}

export function ThemeEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-12 text-center", className)}>
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Icon className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="mb-1 text-base font-medium text-slate-900 sm:text-lg">{title}</h3>
      {description ? <p className="mb-4 max-w-sm text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function ThemeDialogSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[18px] border border-transparent bg-slate-50/60 p-4 sm:border-slate-200 sm:bg-slate-50/70", className)}>
      {children}
    </div>
  );
}

export function ThemeActionBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-row justify-end gap-3 border-t border-transparent pt-4 sm:border-slate-200", className)}>
      {children}
    </div>
  );
}
