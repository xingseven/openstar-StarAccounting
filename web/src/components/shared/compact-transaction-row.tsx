"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

export function formatCompactTransactionDateTime(value: string, options?: { year?: boolean; seconds?: boolean }) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const formatter = new Intl.DateTimeFormat("zh-CN", {
    ...(options?.year ? { year: "numeric" } : {}),
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(options?.seconds ? { second: "2-digit" } : {}),
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const datePart = options?.year
    ? `${get("year")}-${get("month")}-${get("day")}`
    : `${get("month")}-${get("day")}`;
  const timePart = options?.seconds
    ? `${get("hour")}:${get("minute")}:${get("second")}`
    : `${get("hour")}:${get("minute")}`;

  return `${datePart} ${timePart}`;
}

type CompactTransactionRowProps = {
  leading?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  meta?: React.ReactNode[];
  trailing?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  primaryClassName?: string;
};

export function CompactTransactionRow({
  leading,
  icon,
  iconClassName,
  primary,
  secondary,
  meta = [],
  trailing,
  className,
  contentClassName,
  primaryClassName,
}: CompactTransactionRowProps) {
  return (
    <div
      className={cn("flex items-center gap-2.5 py-2.5 transition sm:gap-3 sm:py-3", className)}
      style={{ borderBottom: "1px solid var(--theme-surface-border,rgba(148,163,184,0.12))" }}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      {icon ? (
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[14px]", iconClassName)}>
          {icon}
        </div>
      ) : null}
      <div className={cn("flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-[11px] sm:gap-2.5 sm:text-xs", contentClassName)} style={{ color: "var(--theme-muted-text)" }}>
        <span className={cn("shrink-0 truncate text-[13px] font-semibold sm:text-sm", primaryClassName)} style={{ color: "var(--theme-body-text)" }}>
          {primary}
        </span>
        {secondary ? <span className="min-w-0 truncate">{secondary}</span> : null}
        {meta.map((item, index) => (
          <Fragment key={index}>
            {item ? <span className="shrink-0">{item}</span> : null}
          </Fragment>
        ))}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
