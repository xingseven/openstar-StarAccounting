"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeTone = "blue" | "green" | "emerald" | "violet" | "red" | "amber" | "slate";
export type ThemeModuleAccent = "dashboard" | "consumption" | "assets" | "loans" | "savings";

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
  blue: "border-transparent bg-blue-50/90 text-blue-900",
  green: "border-transparent bg-emerald-50/90 text-emerald-900",
  emerald: "border-transparent bg-emerald-50/90 text-emerald-900",
  violet: "border-transparent bg-violet-50/90 text-violet-900",
  red: "border-transparent bg-red-50/90 text-red-900",
  amber: "border-transparent bg-amber-50/90 text-amber-900",
  slate: "border-transparent bg-slate-50/90 text-slate-900",
};

export const THEME_SURFACE_CLASS =
  "relative overflow-hidden rounded-[18px] border [border-color:var(--module-surface-border)] [background:var(--theme-surface-bg)] [box-shadow:var(--theme-surface-shadow)] sm:rounded-[22px]";

export const THEME_HERO_CLASS =
  "relative overflow-hidden rounded-[22px] border [border-color:var(--module-hero-border)] [background:var(--theme-hero-bg)] [box-shadow:var(--theme-hero-shadow)] p-4 sm:rounded-[26px] sm:p-6 lg:p-8";

export const THEME_DARK_PANEL_CLASS =
  "relative overflow-hidden rounded-[18px] [background:var(--theme-dark-panel-bg)] [box-shadow:var(--theme-dark-panel-shadow)] text-white sm:rounded-[22px]";

export const THEME_DIALOG_INPUT_CLASS =
  "h-11 rounded-[18px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] [color:var(--theme-body-text)] placeholder:text-[color:var(--theme-muted-text)] shadow-none";

export const THEME_DIALOG_SELECT_CLASS =
  "h-11 w-full appearance-none rounded-[18px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-3 text-sm [color:var(--theme-body-text)] transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export const THEME_TEXTAREA_CLASS =
  "min-h-[96px] w-full rounded-[18px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-3 py-2.5 text-sm [color:var(--theme-body-text)] transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export const THEME_COMPACT_SELECT_CLASS =
  "rounded-[18px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-4 py-2.5 text-sm [color:var(--theme-body-text)] transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export const THEME_WHITE_ACTION_BUTTON_CLASS =
  "h-11 rounded-[18px] [background:var(--theme-input-bg)] [color:var(--theme-body-text)] shadow-none hover:brightness-105";

export const THEME_ICON_BUTTON_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded-[18px] [background:var(--theme-input-bg)] [color:var(--theme-muted-text)] transition hover:brightness-105 hover:[color:var(--theme-body-text)]";

export const THEME_LIST_ITEM_CLASS =
  "flex items-center justify-between rounded-[18px] border [border-color:var(--module-surface-border)] [background:var(--theme-surface-bg)] px-4 py-3 text-xs transition hover:brightness-105 sm:text-sm";

const MODULE_ACCENT_STYLE_MAP: Record<ThemeModuleAccent, CSSProperties> = {
  dashboard: {
    "--module-surface-tint": "rgba(59, 130, 246, 0.12)",
    "--module-surface-border": "rgba(96, 165, 250, 0.18)",
    "--module-hero-tint": "rgba(59, 130, 246, 0.18)",
    "--module-hero-border": "rgba(96, 165, 250, 0.2)",
    "--module-metric-tint": "rgba(59, 130, 246, 0.12)",
    "--module-metric-border": "rgba(96, 165, 250, 0.16)",
    "--module-accent-strong": "#2563eb",
    "--module-accent-text": "#1d4ed8",
    "--module-accent-soft": "rgba(59, 130, 246, 0.14)",
    "--module-accent-ring": "rgba(59, 130, 246, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
    "--module-soft-panel": "#eff6ff",
  } as CSSProperties,
  consumption: {
    "--module-surface-tint": "rgba(13, 148, 136, 0.08)",
    "--module-surface-border": "rgba(14, 165, 233, 0.14)",
    "--module-hero-tint": "rgba(14, 165, 233, 0.14)",
    "--module-hero-border": "rgba(13, 148, 136, 0.16)",
    "--module-metric-tint": "rgba(16, 185, 129, 0.08)",
    "--module-metric-border": "rgba(14, 165, 233, 0.12)",
    "--module-accent-strong": "#0f766e",
    "--module-accent-text": "#0f766e",
    "--module-accent-soft": "rgba(16, 185, 129, 0.14)",
    "--module-accent-ring": "rgba(14, 165, 233, 0.14)",
    "--module-progress-gradient": "linear-gradient(90deg, #07c160 0%, #1677ff 100%)",
    "--module-soft-panel": "#ecfdf5",
  } as CSSProperties,
  assets: {
    "--module-surface-tint": "rgba(99, 102, 241, 0.12)",
    "--module-surface-border": "rgba(129, 140, 248, 0.18)",
    "--module-hero-tint": "rgba(129, 140, 248, 0.16)",
    "--module-hero-border": "rgba(129, 140, 248, 0.2)",
    "--module-metric-tint": "rgba(124, 58, 237, 0.12)",
    "--module-metric-border": "rgba(129, 140, 248, 0.16)",
    "--module-accent-strong": "#4f46e5",
    "--module-accent-text": "#4338ca",
    "--module-accent-soft": "rgba(99, 102, 241, 0.14)",
    "--module-accent-ring": "rgba(129, 140, 248, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)",
    "--module-soft-panel": "#eef2ff",
  } as CSSProperties,
  loans: {
    "--module-surface-tint": "rgba(245, 158, 11, 0.12)",
    "--module-surface-border": "rgba(251, 191, 36, 0.18)",
    "--module-hero-tint": "rgba(251, 146, 60, 0.16)",
    "--module-hero-border": "rgba(251, 191, 36, 0.2)",
    "--module-metric-tint": "rgba(245, 158, 11, 0.12)",
    "--module-metric-border": "rgba(251, 191, 36, 0.16)",
    "--module-accent-strong": "#b45309",
    "--module-accent-text": "#92400e",
    "--module-accent-soft": "rgba(245, 158, 11, 0.14)",
    "--module-accent-ring": "rgba(245, 158, 11, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #b45309 0%, #f59e0b 100%)",
    "--module-soft-panel": "#fff7ed",
  } as CSSProperties,
  savings: {
    "--module-surface-tint": "rgba(16, 185, 129, 0.12)",
    "--module-surface-border": "rgba(52, 211, 153, 0.16)",
    "--module-hero-tint": "rgba(16, 185, 129, 0.16)",
    "--module-hero-border": "rgba(52, 211, 153, 0.18)",
    "--module-metric-tint": "rgba(16, 185, 129, 0.1)",
    "--module-metric-border": "rgba(52, 211, 153, 0.14)",
    "--module-accent-strong": "#059669",
    "--module-accent-text": "#047857",
    "--module-accent-soft": "rgba(16, 185, 129, 0.14)",
    "--module-accent-ring": "rgba(52, 211, 153, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #059669 0%, #34d399 100%)",
    "--module-soft-panel": "#ecfdf5",
  } as CSSProperties,
};

export const THEME_STATUS_SUCCESS_SURFACE_CLASS = "border-emerald-200 bg-green-50";

export const THEME_STATUS_SUCCESS_SOFT_SURFACE_CLASS = "border-emerald-200/70 bg-green-50/70";

export const THEME_STATUS_NEUTRAL_SURFACE_CLASS = "border-slate-200 bg-white hover:bg-slate-50";

export const THEME_STATUS_MUTED_SURFACE_CLASS = "border-slate-200/80 bg-slate-50/70";

export function getThemeToneClass(tone: ThemeTone) {
  return TONE_CLASS_MAP[tone];
}

export function getThemeModuleStyle(module: ThemeModuleAccent) {
  return MODULE_ACCENT_STYLE_MAP[module];
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
        {eyebrow ? (
          <p className="text-xs font-medium sm:text-sm" style={{ color: "var(--theme-muted-text)" }}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className="mt-1 text-lg font-semibold sm:text-xl"
          style={{ color: "var(--theme-body-text)" }}
        >
          {title}
        </h2>
        {description ? (
          <p
            className="mt-1 text-xs leading-5 sm:text-sm"
            style={{ color: "var(--theme-muted-text)" }}
          >
            {description}
          </p>
        ) : null}
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
  labelClassName,
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
  labelClassName?: string;
}) {
  const toneClass = getThemeToneClass(tone);
  const hasIcon = Icon && iconVisibility !== "none";
  const showMobileIcon = Icon && iconVisibility === "always";
  const showDesktopIcon = Icon && (iconVisibility === "always" || iconVisibility === "desktop");

  return (
    <div
        className={cn(
        "rounded-[16px] border [border-color:var(--module-metric-border)] [background:var(--theme-metric-bg)] [box-shadow:var(--theme-metric-shadow)] p-2.5 sm:rounded-[18px] sm:p-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-2.5">
        <div className="flex-1">
          <div className="sm:block">
            <p
              className="break-all text-sm font-semibold leading-5 tracking-tight sm:hidden"
              style={{ color: "var(--theme-body-text)" }}
            >
              {mobileValue ?? value}
            </p>
            <p
              className={cn("mt-1 text-xs font-medium sm:text-sm", labelClassName)}
              style={{ color: "var(--theme-muted-text)" }}
            >
              {label}
            </p>
          </div>

          <p
            className="mt-1.5 hidden text-lg font-semibold tracking-tight sm:block"
            style={{ color: "var(--theme-body-text)" }}
          >
            {value}
          </p>

          {detail && detailPosition === "body" ? (
            <p
              className={cn(
                "mt-1.5 text-[11px] leading-5 sm:text-xs",
                hideDetailOnMobile && "hidden sm:block"
              )}
              style={{ color: "var(--theme-muted-text)" }}
            >
              {detail}
            </p>
          ) : null}
        </div>

        {showMobileIcon && hasIcon ? (
          <div className={cn("rounded-lg p-1.5 ring-1 sm:hidden", toneClass)}>
            <Icon className="h-3 w-3" />
          </div>
        ) : null}

        {showDesktopIcon && hasIcon ? (
          <div className={cn("hidden rounded-xl p-1.5 ring-1 sm:block sm:rounded-2xl sm:p-2", toneClass)}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        ) : null}

        {detail && detailPosition === "badge" ? (
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium ring-1", toneClass)}>
            {detail}
          </span>
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
        "flex flex-wrap items-center gap-3 rounded-[16px] [background:var(--theme-surface-bg)] px-4 py-3 sm:rounded-[18px]",
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
        <label
          htmlFor={htmlFor}
          className={cn("text-sm font-medium", labelClassName)}
          style={{ color: "var(--theme-label-text)" }}
        >
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <p
          className={cn("text-xs", hintClassName)}
          style={{ color: "var(--theme-hint-text)" }}
        >
          {hint}
        </p>
      ) : null}
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
      {description ? (
        <div className={cn("text-xs leading-5 sm:text-sm", title ? "mt-1 opacity-90" : "")}>
          {description}
        </div>
      ) : null}
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
      <div
        className="mb-4 rounded-full p-4"
        style={{ background: "var(--theme-empty-icon-bg)" }}
      >
        <Icon className="h-8 w-8" style={{ color: "var(--theme-empty-icon-text)" }} />
      </div>
      <h3
        className="mb-1 text-base font-medium sm:text-lg"
        style={{ color: "var(--theme-body-text)" }}
      >
        {title}
      </h3>
      {description ? (
        <p
          className="mb-4 max-w-sm text-sm leading-6"
          style={{ color: "var(--theme-muted-text)" }}
        >
          {description}
        </p>
      ) : null}
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
    <div
      className={cn("rounded-[16px] p-4", className)}
      style={{ background: "var(--theme-dialog-section-bg)" }}
    >
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
    <div className={cn("flex flex-row justify-end gap-3 pt-4", className)}>
      {children}
    </div>
  );
}
