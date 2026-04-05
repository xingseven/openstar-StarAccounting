import { cn } from "@/lib/utils";
import { GridDecoration } from "./GridDecoration";
import { Skeleton } from "./Skeletons";
import { THEME_HERO_CLASS, THEME_SURFACE_CLASS } from "./theme-primitives";

const BAR_HEIGHTS = ["22%", "48%", "38%", "68%", "44%", "74%", "58%"];
const LEGEND_WIDTHS = ["68%", "52%", "40%"];

function LoadingPill({
  widthClassName,
  dark = false,
  className,
}: {
  widthClassName: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3",
        dark ? "bg-slate-900" : "bg-white/78 ring-1 ring-white/65",
        className,
      )}
    >
      <Skeleton
        className={cn(
          "h-3 rounded-full",
          dark ? "bg-white/40" : "bg-white/70",
          widthClassName,
        )}
      />
    </div>
  );
}

function LoadingHeroStatCard() {
  return (
    <div className="space-y-3 rounded-[22px] bg-white/68 px-4 py-4 ring-1 ring-white/55">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded-full bg-white/80" />
          <Skeleton className="h-3 w-24 rounded-full bg-white/60" />
        </div>
        <div className="rounded-2xl bg-white/80 p-2.5 ring-1 ring-white/70">
          <Skeleton className="h-4 w-4 rounded-lg bg-slate-200/80" />
        </div>
      </div>
      <Skeleton className="h-8 w-28 rounded-[16px] bg-white/85" />
      <Skeleton className="h-3 w-32 rounded-full bg-white/60" />
    </div>
  );
}

export function LoadingMetricCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-[18px] p-3 sm:rounded-[20px] sm:p-4", className)}
      style={{ background: "var(--theme-metric-bg)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full bg-white/70 sm:h-4" />
          <Skeleton className="h-7 w-24 rounded-[14px] bg-white/85 sm:h-8 sm:w-28" />
          <Skeleton className="h-3 w-28 rounded-full bg-white/60 sm:w-32" />
        </div>
        <div className="rounded-2xl bg-white/78 p-2.5 ring-1 ring-white/70">
          <Skeleton className="h-4 w-4 rounded-lg bg-slate-200/80" />
        </div>
      </div>
    </div>
  );
}

export function LoadingBars({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-[20px] p-4",
        className,
      )}
      style={{ background: "var(--theme-dialog-section-bg)" }}
    >
      {BAR_HEIGHTS.map((height, index) => (
        <Skeleton key={`loading-bar-${index}`} className="w-full rounded-t-[14px]" style={{ height }} />
      ))}
    </div>
  );
}

export function LoadingListRows({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`loading-row-${index}`}
          className="flex items-center justify-between gap-3 rounded-[18px] px-3 py-3"
          style={{ background: "var(--theme-dialog-section-bg)" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full opacity-70" />
            </div>
          </div>
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function LoadingDonut({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("grid items-center gap-4 rounded-[20px] p-4 sm:grid-cols-[160px_minmax(0,1fr)]", className)}
      style={{ background: "var(--theme-dialog-section-bg)" }}
    >
      <Skeleton className="mx-auto h-[132px] w-[132px] rounded-full sm:h-[160px] sm:w-[160px]" />
      <div className="space-y-3">
        {LEGEND_WIDTHS.map((width, index) => (
          <div key={`loading-legend-${index}`} className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-3.5 rounded-full" style={{ width }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSurfaceHeader({
  actionWidthClassName = "w-24",
  className,
}: {
  actionWidthClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-7 w-40 rounded-[14px] sm:h-8 sm:w-52" />
        <Skeleton className="h-3 w-48 rounded-full sm:w-64" />
      </div>
      <Skeleton className={cn("h-8 rounded-full", actionWidthClassName)} />
    </div>
  );
}

export function LoadingFeatureCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn(THEME_SURFACE_CLASS, "p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full opacity-70" />
          </div>
        </div>
        <Skeleton className="h-7 w-7 rounded-xl opacity-70" />
      </div>

      <div className="mt-4 space-y-2">
        <Skeleton className="h-3.5 w-16 rounded-full opacity-70" />
        <Skeleton className="h-8 w-36 rounded-[14px]" />
        <Skeleton className="h-3 w-24 rounded-full opacity-60" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`loading-card-meta-${index}`}
            className="rounded-[14px] p-3"
            style={{ background: "var(--theme-dialog-section-bg)" }}
          >
            <Skeleton className="mb-1.5 h-3 w-12 rounded-full opacity-60" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingPageShell({
  children,
  className,
  maxWidth = "dashboard",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "dashboard" | "5xl";
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy={props["aria-busy"] ?? "true"}
      aria-live={props["aria-live"] ?? "polite"}
      className={cn(
        "mx-auto space-y-4 pb-2 sm:space-y-5",
        maxWidth === "dashboard" ? "max-w-[1680px]" : "max-w-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LoadingSurfaceShell({
  children,
  className,
  paddingClassName = "p-3.5 sm:p-6",
}: {
  children: React.ReactNode;
  className?: string;
  paddingClassName?: string;
}) {
  return <section className={cn(THEME_SURFACE_CLASS, paddingClassName, className)}>{children}</section>;
}

export function LoadingCompactHeroShell({
  className,
  titleWidthClassName = "w-36",
  descriptionWidthClassName = "w-52",
  actionWidthClassName = "w-28",
  darkAction = true,
}: {
  className?: string;
  titleWidthClassName?: string;
  descriptionWidthClassName?: string;
  actionWidthClassName?: string;
  darkAction?: boolean;
}) {
  return (
    <section className={cn(THEME_HERO_CLASS, "relative overflow-hidden p-4 sm:p-6 lg:p-8", className)}>
      <div className="absolute inset-y-0 right-0 hidden w-[30%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_70%)] lg:block" />
      <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl sm:h-52 sm:w-52" />

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className={cn("h-6 rounded-[14px] bg-white/80 sm:h-7", titleWidthClassName)} />
          <Skeleton className={cn("h-4 rounded-full bg-white/60", descriptionWidthClassName)} />
        </div>
        <Skeleton
          className={cn(
            "h-10 rounded-2xl",
            actionWidthClassName,
            darkAction ? "bg-slate-900/85" : "bg-white/75",
          )}
        />
      </div>
    </section>
  );
}

export function LoadingHeroShell({
  className,
  sidePanel = true,
  statCardCount = 3,
}: {
  className?: string;
  sidePanel?: boolean;
  statCardCount?: number;
}) {
  return (
    <section className={cn(THEME_HERO_CLASS, "p-3.5 sm:p-6 lg:p-8", className)}>
      <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),transparent_70%)] lg:block" />
      <div className="absolute -right-20 top-8 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl sm:h-56 sm:w-56" />
      <div className="absolute left-6 top-0 h-28 w-28 rounded-full bg-white/80 blur-3xl sm:left-10 sm:h-40 sm:w-40" />
      <GridDecoration mode="light" opacity={0.05} className="mix-blend-multiply" />

      <div
        className={cn(
          "relative z-10 grid gap-5",
          sidePanel && "xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.92fr)]",
        )}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <LoadingPill widthClassName="w-24" />
            <LoadingPill widthClassName="w-16" dark />
            <LoadingPill widthClassName="w-20" />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/75" />
              <Skeleton className="h-5 w-full max-w-xl rounded-full bg-white/55" />
            </div>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-full bg-white/55" />
                <Skeleton className="h-11 w-40 rounded-[18px] bg-white/80 sm:h-14 sm:w-48" />
              </div>
              <Skeleton className="h-9 w-36 rounded-full bg-white/70" />
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {Array.from({ length: statCardCount }).map((_, index) => (
              <LoadingHeroStatCard key={`loading-hero-card-${index}`} />
            ))}
          </div>
        </div>

        {sidePanel ? (
          <div className="self-end xl:justify-self-end">
            <div className="grid gap-2.5 sm:min-w-[320px]">
              <div className="rounded-[24px] bg-white/72 p-4 ring-1 ring-white/65">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-full bg-slate-200" />
                    <Skeleton className="h-3 w-40 rounded-full bg-slate-200/80" />
                  </div>
                  <LoadingPill widthClassName="w-12" className="px-2.5" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-11 rounded-[18px] bg-white" />
                  <Skeleton className="h-11 rounded-[18px] bg-white" />
                  <Skeleton className="h-11 rounded-[18px] bg-white sm:col-span-2" />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function LoadingMetricGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        count <= 2 ? "md:grid-cols-2" : count === 3 ? "md:grid-cols-3" : "md:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <LoadingMetricCard key={`loading-metric-${index}`} />
      ))}
    </div>
  );
}

export function LoadingToolbarShell({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn(THEME_SURFACE_CLASS, "p-3 sm:p-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 min-w-[160px] flex-1 rounded-[14px]" />
        <Skeleton className="h-9 w-[100px] rounded-[14px]" />
        <Skeleton className="h-9 w-[100px] rounded-[14px]" />
        <Skeleton className="ml-auto h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function LoadingSplitSurface({
  className,
  rowCount = 4,
}: {
  className?: string;
  rowCount?: number;
}) {
  return (
    <section className={cn(THEME_SURFACE_CLASS, className)}>
      <div className="space-y-4 p-3.5 sm:p-6">
        <LoadingSurfaceHeader />
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <LoadingBars className="h-[220px] sm:h-[280px]" />
          <LoadingListRows count={rowCount} />
        </div>
      </div>
    </section>
  );
}

export function LoadingChartSurface({
  className,
  variant = "bars",
  blockHeightClassName = "h-[220px] sm:h-[280px]",
}: {
  className?: string;
  variant?: "bars" | "donut" | "block";
  blockHeightClassName?: string;
}) {
  return (
    <section className={cn(THEME_SURFACE_CLASS, "p-3.5 sm:p-6", className)}>
      <LoadingSurfaceHeader />
      <div className="mt-4 sm:mt-5">
        {variant === "donut" ? <LoadingDonut /> : null}
        {variant === "bars" ? <LoadingBars className={blockHeightClassName} /> : null}
        {variant === "block" ? (
          <div className={cn("rounded-[20px]", blockHeightClassName)} style={{ background: "var(--theme-dialog-section-bg)" }} />
        ) : null}
      </div>
    </section>
  );
}

export function LoadingListSurface({
  className,
  rowCount = 4,
}: {
  className?: string;
  rowCount?: number;
}) {
  return (
    <section className={cn(THEME_SURFACE_CLASS, "p-3.5 sm:p-6", className)}>
      <LoadingSurfaceHeader actionWidthClassName="w-20" />
      <div className="mt-4 sm:mt-5">
        <LoadingListRows count={rowCount} />
      </div>
    </section>
  );
}

export function LoadingCardGrid({
  className,
  count = 3,
  gridClassName = "md:grid-cols-2 xl:grid-cols-3",
}: {
  className?: string;
  count?: number;
  gridClassName?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:gap-4", gridClassName, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingFeatureCard key={`loading-card-${index}`} />
      ))}
    </div>
  );
}

export function LoadingTableSurface({
  className,
  columns = 5,
  rows = 5,
}: {
  className?: string;
  columns?: number;
  rows?: number;
}) {
  return (
    <LoadingSurfaceShell className={className} paddingClassName="p-0">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:w-24" />
          <Skeleton className="h-3 w-28 rounded-full bg-slate-100 sm:w-36" />
        </div>
      </div>

      <div className="px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="border-b border-slate-200 pb-1.5 sm:pb-2">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={`loading-table-head-${index}`} className="h-3 rounded-full bg-slate-100" />
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`loading-table-row-${rowIndex}`}
              className="grid items-center gap-2 border-b border-slate-100 pb-2 last:border-b-0"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((__, colIndex) => (
                <Skeleton
                  key={`loading-table-cell-${rowIndex}-${colIndex}`}
                  className={cn(
                    "h-3 rounded-full",
                    colIndex === 0 ? "w-10 bg-slate-100" : colIndex === columns - 1 ? "ml-auto w-12 bg-slate-200" : "w-full max-w-[64px] bg-slate-200",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </LoadingSurfaceShell>
  );
}
