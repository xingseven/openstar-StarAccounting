"use client";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// FrostSurface — 半透明毛玻璃容器，替代 ThemeSurface
// ─────────────────────────────────────────────
export function FrostSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[24px]", className)}
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        boxShadow:
          "0 4px 24px rgba(100,140,180,0.12), 0 1px 4px rgba(100,140,180,0.08)",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// FrostHero — 无容器透明 Hero，内容直接浮于背景渐变上
// ─────────────────────────────────────────────
export function FrostHero({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative", className)}>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────
// FrostMetricCard — 大数字 + 左侧 accent 竖线，无图标框
// ─────────────────────────────────────────────
export function FrostMetricCard({
  label,
  value,
  mobileValue,
  detail,
  accentColor = "#2d7dd2",
  className,
}: {
  label: string;
  value: string;
  mobileValue?: string;
  detail?: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[20px] p-4 transition-all duration-300 hover:-translate-y-0.5",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        boxShadow:
          "0 2px 16px rgba(100,140,180,0.1), 0 1px 3px rgba(100,140,180,0.08)",
      }}
    >
      {/* 左侧 accent 竖线 */}
      <div
        className="absolute left-0 top-4 h-8 w-[3px] rounded-r-full"
        style={{ background: accentColor }}
      />

      <div className="pl-4">
        {/* 标签 */}
        <p
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--theme-muted-text)" }}
        >
          {label}
        </p>

        {/* 大号数字 */}
        <p
          className="mt-1.5 text-2xl font-black tracking-tight sm:hidden"
          style={{ color: "var(--theme-body-text)" }}
        >
          {mobileValue ?? value}
        </p>
        <p
          className="mt-1.5 hidden text-3xl font-black tracking-tight sm:block"
          style={{ color: "var(--theme-body-text)" }}
        >
          {value}
        </p>

        {/* 副文字 */}
        {detail && (
          <p
            className="mt-2 text-xs font-medium"
            style={{ color: "var(--theme-muted-text)" }}
          >
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FrostSectionHeader — 大字重标题 + 冰蓝下划线，无容器框
// ─────────────────────────────────────────────
export function FrostSectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b pb-4",
        className
      )}
      style={{ borderColor: "rgba(100,140,180,0.18)" }}
    >
      <div>
        <h2
          className="text-xl font-black tracking-tight sm:text-2xl"
          style={{ color: "var(--theme-body-text)" }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--theme-muted-text)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────
// FrostDarkPanel — 深色毛玻璃面板（图表区）
// ─────────────────────────────────────────────
export function FrostDarkPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[20px]", className)}
      style={{
        background: "rgba(20,50,90,0.85)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07), 0 12px 40px rgba(20,50,90,0.2)",
      }}
    >
      {children}
    </div>
  );
}
