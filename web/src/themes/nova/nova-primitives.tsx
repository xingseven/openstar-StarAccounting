"use client";

import type { LucideIcon } from "lucide-react";
import type { ThemeTone } from "@/components/shared/theme-primitives";
import { cn } from "@/lib/utils";

const NOVA_ACCENT = "#63b3ff";

type NovaContainerProps = {
  children: React.ReactNode;
  className?: string;
};

type NovaMetricCardProps = {
  label: string;
  value: string;
  mobileValue?: string;
  tone?: ThemeTone;
  icon?: LucideIcon;
  detail?: string;
  detailPosition?: "body" | "badge" | "none";
  hideDetailOnMobile?: boolean;
  iconVisibility?: "always" | "desktop" | "none";
  className?: string;
  labelClassName?: string;
};

export function NovaSurface({ children, className }: NovaContainerProps) {
  return (
    <div
      className={cn(
        "nova-surface relative overflow-hidden rounded-[20px] text-[color:var(--theme-body-text)] backdrop-blur-xl sm:rounded-[22px]",
        className
      )}
      style={{
        background: "var(--theme-surface-bg)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.45)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,179,255,0.08),transparent_36%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function NovaHero({
  children,
  className,
  accentRail = true,
}: NovaContainerProps & { accentRail?: boolean }) {
  return (
    <section
      className={cn(
        "nova-surface relative overflow-hidden rounded-[24px] p-5 text-[color:var(--theme-body-text)] backdrop-blur-2xl sm:rounded-[28px] sm:p-7 lg:p-9",
        className
      )}
      style={{
        background: "var(--theme-hero-bg)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,179,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(5,11,26,0.52),transparent_44%)]" />
      {accentRail ? (
        <div
          className="pointer-events-none absolute bottom-5 left-0 top-5 w-1 rounded-full bg-gradient-to-b from-[#63b3ff] via-[#63b3ff] to-transparent sm:bottom-7 sm:top-7"
          style={{ boxShadow: "0 0 28px rgba(99,179,255,0.45)" }}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function NovaMetricCard({
  label,
  value,
  mobileValue,
  icon: Icon,
  detail,
  detailPosition = "body",
  hideDetailOnMobile = false,
  iconVisibility = "always",
  className,
  labelClassName,
}: NovaMetricCardProps) {
  const showIcon = Icon && iconVisibility !== "none";
  const iconClassName = iconVisibility === "desktop" ? "hidden sm:block" : "";

  return (
    <div
      className={cn(
        "group nova-surface relative flex min-h-[122px] gap-4 overflow-hidden rounded-[18px] px-4 py-4 text-[color:var(--theme-body-text)] transition-shadow duration-300 md:hover:[box-shadow:0_0_24px_rgba(99,179,255,0.15),0_8px_32px_rgba(0,0,0,0.4)] sm:min-h-[136px] sm:rounded-[20px] sm:px-5 sm:py-[18px]",
        className
      )}
      style={{
        background: "var(--theme-metric-bg)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="mt-1 h-8 w-[3px] shrink-0 rounded-full sm:h-10"
        style={{
          background: NOVA_ACCENT,
          boxShadow: "0 0 20px rgba(99,179,255,0.45)",
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              {showIcon ? <Icon className={cn("h-3.5 w-3.5 shrink-0 text-[#8ea6c8]", iconClassName)} /> : null}
              <p className={cn("truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a8b8d8]", labelClassName)}>
                {label}
              </p>
            </div>
            {detail && detailPosition === "badge" ? (
              <span
                className="mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase"
                style={{
                  background: "rgba(99,179,255,0.14)",
                  color: "#d8e9ff",
                  boxShadow: "inset 0 0 0 1px rgba(99,179,255,0.2)",
                }}
              >
                {detail}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="break-all text-2xl font-black tracking-[-0.05em] text-[#f0f4ff] sm:hidden">{mobileValue ?? value}</p>
            <p className="hidden break-all text-3xl font-black tracking-[-0.06em] text-[#f0f4ff] sm:block">{value}</p>
          </div>

          {detail && detailPosition === "body" ? (
            <p
              className={cn(
                "max-w-[11rem] text-right text-xs leading-5 text-[#4a5f80]",
                hideDetailOnMobile && "hidden sm:block"
              )}
            >
              {detail}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function NovaSectionHeader({
  eyebrow: _eyebrow,
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
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-black tracking-[-0.05em] text-[#f0f4ff] sm:text-[1.7rem]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-relaxed text-[#4a5f80]">{description}</p> : null}
      </div>
      {action ? (
        <div className="relative flex items-center gap-3 pl-4 before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-[linear-gradient(180deg,transparent,rgba(99,179,255,0.5),transparent)]">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function NovaDarkPanel({ children, className }: NovaContainerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] text-white backdrop-blur-xl sm:rounded-[22px]",
        className
      )}
      style={{
        background: "rgba(0,0,0,0.5)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), 0 20px 48px rgba(0,0,0,0.4)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,179,255,0.12),transparent_34%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
