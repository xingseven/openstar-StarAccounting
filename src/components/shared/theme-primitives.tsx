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

// 现代化容器：引入玻璃化 + 隐形内边框 (ring-inset) + 分层长阴影
export const THEME_SURFACE_CLASS =
  "relative overflow-hidden rounded-[24px] border backdrop-blur-md [border-color:var(--module-surface-border)] [background:var(--theme-surface-bg)] [box-shadow:var(--theme-surface-shadow)] ring-1 ring-inset ring-white/10 sm:rounded-[28px]";

// 现代化 Hero：取消厚重边框，用渐变和软阴影
export const THEME_HERO_CLASS =
  "relative overflow-hidden rounded-[28px] border backdrop-blur-xl [border-color:var(--module-hero-border)] [background:var(--theme-hero-bg)] [box-shadow:var(--theme-hero-shadow)] p-5 ring-1 ring-inset ring-white/15 sm:rounded-[32px] sm:p-7 lg:p-9";

export const THEME_DARK_PANEL_CLASS =
  "relative overflow-hidden rounded-[24px] [background:var(--theme-dark-panel-bg)] [box-shadow:var(--theme-dark-panel-shadow)] text-white ring-1 ring-inset ring-white/5 sm:rounded-[28px]";

export const THEME_DIALOG_INPUT_CLASS =
  "h-12 rounded-[20px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] [color:var(--theme-body-text)] placeholder:text-[color:var(--theme-muted-text)] shadow-sm transition-all focus:ring-4 focus:ring-primary/10";

export const THEME_DIALOG_SELECT_CLASS =
  "h-12 w-full appearance-none rounded-[20px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-4 text-sm [color:var(--theme-body-text)] transition-all outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20";

export const THEME_TEXTAREA_CLASS =
  "min-h-[110px] w-full rounded-[20px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-4 py-3 text-sm [color:var(--theme-body-text)] transition-all outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20";

export const THEME_COMPACT_SELECT_CLASS =
  "rounded-[20px] border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] px-5 py-3 text-sm [color:var(--theme-body-text)] transition-all outline-none hover:shadow-md active:scale-95";

export const THEME_WHITE_ACTION_BUTTON_CLASS =
  "h-12 rounded-[20px] [background:var(--theme-input-bg)] [color:var(--theme-body-text)] shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all";

export const THEME_ICON_BUTTON_CLASS =
  "inline-flex h-11 w-11 items-center justify-center rounded-[18px] [background:var(--theme-input-bg)] [color:var(--theme-muted-text)] transition-all hover:shadow-md hover:brightness-105 hover:[color:var(--theme-body-text)] active:scale-90";

export const THEME_LIST_ITEM_CLASS =
  "flex items-center justify-between rounded-[20px] border [border-color:var(--module-surface-border)] [background:var(--theme-surface-bg)] px-5 py-3.5 text-xs transition-all hover:shadow-lg hover:translate-y-[-1px] sm:text-sm";

const MODULE_ACCENT_STYLE_MAP: Record<ThemeModuleAccent, CSSProperties> = {
  dashboard: {
    "--module-surface-tint": "rgba(59, 130, 246, 0.12)",
    "--module-surface-border": "rgba(96, 165, 250, 0.16)",
    "--module-hero-tint": "rgba(59, 130, 246, 0.16)",
    "--module-hero-border": "rgba(96, 165, 250, 0.18)",
    "--module-metric-tint": "rgba(59, 130, 246, 0.1)",
    "--module-metric-border": "rgba(96, 165, 250, 0.14)",
    "--module-accent-strong": "#2563eb",
    "--module-accent-text": "#1d4ed8",
    "--module-accent-soft": "rgba(59, 130, 246, 0.14)",
    "--module-accent-ring": "rgba(59, 130, 246, 0.16)",
    "--module-progress-gradient": "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
    "--module-soft-panel": "#eff6ff",
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
    <div className={cn("flex flex-wrap items-start justify-between gap-4 px-1", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-bold tracking-widest uppercase mb-1.5 opacity-60" style={{ color: "var(--theme-muted-text)" }}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className="text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: "var(--theme-body-text)" }}
        >
          {title}
        </h2>
        {description ? (
          <p
            className="mt-2 text-sm leading-relaxed opacity-80"
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
        "group relative overflow-hidden rounded-[22px] border transition-all duration-300 [border-color:var(--module-metric-border)] [background:var(--theme-metric-bg)] [box-shadow:var(--theme-metric-shadow)] p-4 ring-1 ring-inset ring-white/10 hover:shadow-xl hover:translate-y-[-2px] sm:rounded-[24px] sm:p-5",
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
              className="break-all text-xl font-bold tracking-tight sm:hidden"
              style={{ color: "var(--theme-body-text)" }}
            >
              {mobileValue ?? value}
            </p>
            <p
              className="hidden text-2xl font-bold tracking-tight sm:block"
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

        {/* 更加现代化的图标容器：带微妙阴影和缩放动画 */}
        {hasIcon && (
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-[18px] transition-transform duration-300 group-hover:scale-110",
            !showMobileIcon && "hidden sm:flex",
            showMobileIcon && "flex",
            "h-11 w-11 sm:h-12 sm:w-12",
            toneClass
          )}>
            <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
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
        "flex flex-wrap items-center gap-3 rounded-[20px] backdrop-blur-md [background:var(--theme-surface-bg)] px-5 py-3.5 shadow-lg ring-1 ring-white/10 sm:rounded-[24px]",
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
