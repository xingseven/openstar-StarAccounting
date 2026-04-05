"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeTone = "blue" | "green" | "emerald" | "violet" | "red" | "amber" | "slate";
export type ThemeModuleAccent = "dashboard" | "consumption" | "assets" | "loans" | "savings";

const TONE_CLASS_MAP: Record<ThemeTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100/80 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.15)]",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100/80 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.15)]",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100/80 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.15)]",
  violet: "bg-violet-50 text-violet-700 ring-violet-100/80 shadow-[0_2px_10px_-3px_rgba(139,92,246,0.15)]",
  red: "bg-red-50 text-red-700 ring-red-100/80 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.15)]",
  amber: "bg-amber-50 text-amber-700 ring-amber-100/80 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.15)]",
  slate: "bg-slate-100 text-slate-700 ring-slate-200/80 shadow-[0_2px_10px_-3px_rgba(100,116,139,0.1)]",
};

const NOTICE_CLASS_MAP: Record<ThemeTone, string> = {
  blue: "border-transparent bg-blue-50/95 text-blue-900 shadow-sm",
  green: "border-transparent bg-emerald-50/95 text-emerald-900 shadow-sm",
  emerald: "border-transparent bg-emerald-50/95 text-emerald-900 shadow-sm",
  violet: "border-transparent bg-violet-50/95 text-violet-900 shadow-sm",
  red: "border-transparent bg-red-50/95 text-red-900 shadow-sm",
  amber: "border-transparent bg-amber-50/95 text-amber-900 shadow-sm",
  slate: "border-transparent bg-slate-50/95 text-slate-900 shadow-sm",
};

const TONE_ICON_STYLE_MAP: Record<ThemeTone, CSSProperties> = {
  blue: {
    background: "var(--module-accent-soft)",
    color: "var(--module-accent-text)",
    boxShadow: "inset 0 0 0 1px var(--module-accent-ring)",
  },
  green: {
    background: "rgba(94, 179, 149, 0.14)",
    color: "#3f8f77",
    boxShadow: "inset 0 0 0 1px rgba(94, 179, 149, 0.16)",
  },
  emerald: {
    background: "rgba(94, 179, 149, 0.14)",
    color: "#3f8f77",
    boxShadow: "inset 0 0 0 1px rgba(94, 179, 149, 0.16)",
  },
  violet: {
    background: "rgba(124, 141, 255, 0.14)",
    color: "#6676e8",
    boxShadow: "inset 0 0 0 1px rgba(124, 141, 255, 0.16)",
  },
  red: {
    background: "rgba(255, 138, 114, 0.14)",
    color: "#dd745f",
    boxShadow: "inset 0 0 0 1px rgba(255, 138, 114, 0.16)",
  },
  amber: {
    background: "rgba(230, 170, 78, 0.14)",
    color: "#c88f2e",
    boxShadow: "inset 0 0 0 1px rgba(230, 170, 78, 0.16)",
  },
  slate: {
    background: "rgba(117, 129, 154, 0.12)",
    color: "#647089",
    boxShadow: "inset 0 0 0 1px rgba(117, 129, 154, 0.14)",
  },
};

export const THEME_SURFACE_CLASS =
  "relative overflow-hidden rounded-2xl bg-white sm:border sm:[border-color:var(--module-surface-border)] sm:[background:var(--theme-surface-bg)] sm:[box-shadow:var(--theme-surface-shadow)]";

export const THEME_HERO_CLASS =
  "relative overflow-hidden rounded-2xl bg-white p-4 sm:border sm:[border-color:var(--module-hero-border)] sm:[background:var(--theme-hero-bg)] sm:[box-shadow:var(--theme-hero-shadow)] sm:p-7 lg:p-9";

export const THEME_DARK_PANEL_CLASS =
  "relative overflow-hidden rounded-xl bg-[#0066ff] shadow-[0_4px_12px_rgba(0,102,255,0.2)] text-white sm:rounded-2xl sm:[background:var(--theme-dark-panel-bg)] sm:[box-shadow:var(--theme-dark-panel-shadow)]";

export const THEME_DIALOG_INPUT_CLASS =
  "h-12 w-full rounded-xl border px-4 text-sm [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] [color:var(--theme-body-text)] placeholder:text-[var(--theme-hint-text)] transition-all outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

export const THEME_DIALOG_SELECT_CLASS =
  "h-12 w-full appearance-none rounded-xl border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-4 text-sm [color:var(--theme-body-text)] transition-all outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

export const THEME_TEXTAREA_CLASS =
  "min-h-[110px] w-full rounded-xl border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-4 py-3 text-sm [color:var(--theme-body-text)] transition-all outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20";

export const THEME_COMPACT_SELECT_CLASS =
  "rounded-xl border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-5 py-3 text-sm [color:var(--theme-body-text)] transition-all outline-none md:hover:shadow-md active:opacity-70 active:scale-[0.98]";

export const THEME_WHITE_ACTION_BUTTON_CLASS =
  "h-12 rounded-xl [background:var(--theme-input-bg)] [color:var(--theme-body-text)] shadow-sm md:hover:shadow-md hover:brightness-105 active:opacity-70 active:scale-[0.98] transition-all";

export const THEME_ICON_BUTTON_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg [background:var(--theme-input-bg)] [color:var(--theme-muted-text)] transition-all md:hover:shadow-md hover:brightness-105 hover:[color:var(--theme-body-text)] active:opacity-70 active:scale-[0.98]";

export const THEME_LIST_ITEM_CLASS =
  "flex items-center justify-between rounded-[18px] border [border-color:var(--module-surface-border)] [background:var(--theme-surface-bg)] px-5 py-3.5 text-xs transition-all md:hover:[box-shadow:var(--theme-surface-shadow)] sm:text-sm";

export const THEME_FLOATING_PANEL_CLASS =
  "rounded-[24px] border [border-color:var(--theme-surface-border)] [background:var(--theme-surface-bg)] [box-shadow:var(--theme-surface-shadow)]";

export const THEME_FLOATING_SECTION_CLASS =
  "rounded-[20px] p-3 ring-1 ring-inset ring-black/5 [background:var(--theme-dialog-section-bg)]";

export const THEME_FLOATING_TRIGGER_CLASS =
  "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] [color:var(--theme-body-text)] hover:brightness-95";

const MODULE_ACCENT_STYLE_MAP: Record<ThemeModuleAccent, CSSProperties> = {
  dashboard: {
    "--module-surface-tint": "rgba(22, 143, 156, 0.06)",
    "--module-surface-border": "rgba(224, 234, 236, 0.96)",
    "--module-hero-tint": "rgba(22, 143, 156, 0.08)",
    "--module-hero-border": "rgba(221, 235, 233, 0.98)",
    "--module-metric-tint": "rgba(22, 143, 156, 0.06)",
    "--module-metric-border": "rgba(226, 236, 238, 0.98)",
    "--module-accent-strong": "#168f9c",
    "--module-accent-text": "#136c76",
    "--module-accent-soft": "rgba(22, 143, 156, 0.12)",
    "--module-accent-ring": "rgba(22, 143, 156, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #2f6fed 0%, #33b07a 100%)",
    "--module-soft-panel": "#eef8f7",
  } as CSSProperties,
  consumption: {
    "--module-surface-tint": "rgba(13, 148, 136, 0.08)",
    "--module-surface-border": "rgba(14, 165, 233, 0.12)",
    "--module-hero-tint": "rgba(14, 165, 233, 0.12)",
    "--module-hero-border": "rgba(13, 148, 136, 0.14)",
    "--module-metric-tint": "rgba(16, 185, 129, 0.08)",
    "--module-metric-border": "rgba(14, 165, 233, 0.1)",
    "--module-accent-strong": "#0f766e",
    "--module-accent-text": "#0f766e",
    "--module-accent-soft": "rgba(16, 185, 129, 0.14)",
    "--module-accent-ring": "rgba(14, 165, 233, 0.14)",
    "--module-progress-gradient": "linear-gradient(90deg, #07c160 0%, #1677ff 100%)",
    "--module-soft-panel": "#ecfdf5",
  } as CSSProperties,
  assets: {
    "--module-surface-tint": "rgba(99, 102, 241, 0.1)",
    "--module-surface-border": "rgba(129, 140, 248, 0.16)",
    "--module-hero-tint": "rgba(129, 140, 248, 0.14)",
    "--module-hero-border": "rgba(129, 140, 248, 0.18)",
    "--module-metric-tint": "rgba(124, 58, 237, 0.1)",
    "--module-metric-border": "rgba(129, 140, 248, 0.14)",
    "--module-accent-strong": "#4f46e5",
    "--module-accent-text": "#4338ca",
    "--module-accent-soft": "rgba(99, 102, 241, 0.14)",
    "--module-accent-ring": "rgba(129, 140, 248, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)",
    "--module-soft-panel": "#eef2ff",
  } as CSSProperties,
  loans: {
    "--module-surface-tint": "rgba(245, 158, 11, 0.1)",
    "--module-surface-border": "rgba(251, 191, 36, 0.16)",
    "--module-hero-tint": "rgba(251, 146, 60, 0.14)",
    "--module-hero-border": "rgba(251, 191, 36, 0.18)",
    "--module-metric-tint": "rgba(245, 158, 11, 0.1)",
    "--module-metric-border": "rgba(251, 191, 36, 0.14)",
    "--module-accent-strong": "#b45309",
    "--module-accent-text": "#92400e",
    "--module-accent-soft": "rgba(245, 158, 11, 0.14)",
    "--module-accent-ring": "rgba(245, 158, 11, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #b45309 0%, #f59e0b 100%)",
    "--module-soft-panel": "#fff7ed",
  } as CSSProperties,
  savings: {
    "--module-surface-tint": "rgba(16, 185, 129, 0.1)",
    "--module-surface-border": "rgba(52, 211, 153, 0.14)",
    "--module-hero-tint": "rgba(16, 185, 129, 0.14)",
    "--module-hero-border": "rgba(52, 211, 153, 0.16)",
    "--module-metric-tint": "rgba(16, 185, 129, 0.08)",
    "--module-metric-border": "rgba(52, 211, 153, 0.12)",
    "--module-accent-strong": "#059669",
    "--module-accent-text": "#047857",
    "--module-accent-soft": "rgba(16, 185, 129, 0.14)",
    "--module-accent-ring": "rgba(52, 211, 153, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #059669 0%, #34d399 100%)",
    "--module-soft-panel": "#ecfdf5",
  } as CSSProperties,
};

export const THEME_STATUS_SUCCESS_SURFACE_CLASS = "border-emerald-200/50 bg-green-50/80 backdrop-blur-sm";
export const THEME_STATUS_SUCCESS_SOFT_SURFACE_CLASS = "border-emerald-200/40 bg-green-50/40 backdrop-blur-sm";
export const THEME_STATUS_NEUTRAL_SURFACE_CLASS = "border-slate-200/60 bg-white/80 backdrop-blur-sm hover:bg-slate-50/90";
export const THEME_STATUS_MUTED_SURFACE_CLASS = "border-slate-200/40 bg-slate-50/50 backdrop-blur-sm";

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
    <div className={cn("flex flex-wrap items-center justify-between gap-3 px-1", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold tracking-[0.18em] uppercase opacity-60" style={{ color: "var(--theme-muted-text)" }}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className="text-lg font-semibold tracking-tight sm:text-[1.35rem]"
          style={{ color: "var(--theme-body-text)" }}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--theme-muted-text)" }}>
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
  const iconStyle = TONE_ICON_STYLE_MAP[tone];
  const hasIcon = Icon && iconVisibility !== "none";
  const showMobileIcon = Icon && iconVisibility === "always";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[18px] sm:border transition-all duration-200 [border-color:var(--module-metric-border)] [background:var(--theme-metric-bg)] [box-shadow:var(--theme-metric-shadow)] p-4 md:hover:[box-shadow:0_12px_24px_rgba(47,42,36,0.06)] sm:rounded-[20px] sm:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p
            className={cn("text-xs font-bold tracking-wide uppercase opacity-60 sm:text-[11px]", labelClassName)}
            style={{ color: "var(--theme-muted-text)" }}
          >
            {label}
          </p>

          <div className="mt-2">
            <p
              className="break-all text-[22px] font-bold tracking-tight sm:hidden font-numbers"
              style={{ color: "var(--theme-body-text)" }}
            >
              {mobileValue ?? value}
            </p>
            <p
              className="hidden text-[26px] font-bold tracking-tight sm:block font-numbers"
              style={{ color: "var(--theme-body-text)" }}
            >
              {value}
            </p>
          </div>

          {detail && detailPosition === "body" ? (
            <p
              className={cn(
                "mt-2.5 text-xs font-medium opacity-80",
                hideDetailOnMobile && "hidden sm:block"
              )}
              style={{ color: "var(--theme-muted-text)" }}
            >
              {detail}
            </p>
          ) : null}
        </div>

        {hasIcon && (
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-[12px] transition-all duration-200 group-hover:scale-[1.03]",
              !showMobileIcon && "hidden sm:flex",
              showMobileIcon && "flex",
              "h-8 w-8 sm:h-10 sm:w-10",
            )}
            style={iconStyle}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}

        {detail && detailPosition === "badge" ? (
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ring-1", toneClass)}>
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
        "flex flex-wrap items-center gap-3 rounded-[18px] border [border-color:var(--theme-surface-border)] [background:var(--theme-surface-bg)] px-5 py-3.5 [box-shadow:var(--theme-surface-shadow)] sm:rounded-[20px]",
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
        "grid gap-4",
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
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className={cn("text-xs font-bold tracking-wide uppercase px-0.5 opacity-70", labelClassName)}
          style={{ color: "var(--theme-label-text)" }}
        >
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <p
          className={cn("text-[11px] px-1 opacity-60", hintClassName)}
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
    <div className={cn("rounded-[22px] border-l-[6px] px-5 py-4", NOTICE_CLASS_MAP[tone], className)}>
      {title ? <div className="text-sm font-bold tracking-tight">{title}</div> : null}
      {description ? (
        <div className={cn("text-xs leading-relaxed mt-1.5 opacity-90 font-medium", title ? "" : "")}>
          {description}
        </div>
      ) : null}
      {children ? <div className={cn(title || description ? "mt-3" : "")}>{children}</div> : null}
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
    <div className={cn("flex flex-col items-center justify-center px-4 py-16 text-center", className)}>
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl backdrop-blur-md shadow-2xl ring-1 ring-white/20"
        style={{ background: "var(--theme-empty-icon-bg)" }}
      >
        <Icon className="h-9 w-9" style={{ color: "var(--theme-empty-icon-text)" }} />
      </div>
      <h3
        className="mb-2 text-xl font-bold tracking-tight"
        style={{ color: "var(--theme-body-text)" }}
      >
        {title}
      </h3>
      {description ? (
        <p
          className="mb-8 max-w-md text-sm leading-relaxed opacity-60"
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
      className={cn("rounded-[22px] p-5 shadow-inner ring-1 ring-inset ring-black/5", className)}
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
    <div className={cn("flex flex-row justify-end gap-3 pt-6", className)}>
      {children}
    </div>
  );
}
