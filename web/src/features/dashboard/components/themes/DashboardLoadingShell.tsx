import { GridDecoration } from "@/components/shared/GridDecoration";
import { Skeleton } from "@/components/shared/Skeletons";
import { cn } from "@/lib/utils";

function LoadingMetricShell({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[20px] p-3 sm:rounded-[22px] sm:p-4", className)} style={{ background: "var(--theme-metric-bg)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full bg-white/70" />
          <Skeleton className="h-7 w-28 rounded-[12px] bg-white/85 sm:h-8" />
          <Skeleton className="h-3 w-24 rounded-full bg-white/60" />
        </div>
        <div className="rounded-2xl bg-white/78 p-2.5 ring-1 ring-white/70">
          <Skeleton className="h-4 w-4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function LoadingChartShell({
  chart = "bars",
  className,
}: {
  chart?: "bars" | "donut";
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[22px] p-4 sm:p-6", className)} style={{ background: "var(--theme-surface-bg)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
          <Skeleton className="h-7 w-44 rounded-[12px]" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full opacity-70" />
      </div>

      {chart === "bars" ? (
        <div className="mt-5 flex h-[200px] w-full items-end gap-2 rounded-[16px] p-3 sm:h-[260px]" style={{ background: "var(--theme-dialog-section-bg)" }}>
          {["35%", "55%", "45%", "70%", "50%", "80%", "60%"].map((height, index) => (
            <Skeleton key={index} className="w-full rounded-t-[10px]" style={{ height }} />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid items-center gap-4 rounded-[16px] p-4 sm:grid-cols-[156px_minmax(0,1fr)]" style={{ background: "var(--theme-dialog-section-bg)" }}>
          <Skeleton className="mx-auto h-[118px] w-[118px] rounded-full sm:h-[156px] sm:w-[156px]" />
          <div className="space-y-2">
            {["68%", "54%", "42%"].map((width, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-3.5 rounded-full" style={{ width }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardLoadingShell() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-[1680px] space-y-3 pb-1 sm:space-y-5 sm:pb-2">
      <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-3.5 sm:rounded-[26px] sm:p-6 lg:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.14),transparent_70%)] lg:block" />
        <div className="absolute -right-20 top-8 h-40 w-40 rounded-full bg-blue-200/35 blur-3xl sm:-right-24 sm:top-10 sm:h-56 sm:w-56" />
        <div className="absolute left-6 top-0 h-28 w-28 rounded-full bg-white/80 blur-3xl sm:left-10 sm:h-40 sm:w-40" />
        <GridDecoration mode="light" opacity={0.05} className="mix-blend-multiply" />

        <div className="relative z-10 space-y-3 sm:space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
              总览仪表盘
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              <Skeleton className="h-3 w-16 rounded-full bg-white/40" />
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <Skeleton className="hidden h-4 w-full max-w-xl rounded-full bg-white/60 sm:block" />
              <div className="flex flex-wrap items-end gap-x-3 gap-y-2 sm:gap-x-6 sm:gap-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-20 rounded-full bg-white/55" />
                  <Skeleton className="h-9 w-44 rounded-[16px] bg-white/80 sm:h-12 sm:w-56" />
                </div>
                <Skeleton className="h-8 w-32 rounded-full bg-white/70" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingMetricShell key={`dashboard-hero-metric-${index}`} />
              ))}
            </div>

            <div className="hidden rounded-[18px] bg-white/60 px-4 py-3 ring-1 ring-white/45 sm:flex sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-40 rounded-full" />
                <Skeleton className="h-3 w-64 rounded-full opacity-60" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.45fr)_repeat(2,minmax(0,1fr))]">
        <LoadingMetricShell className="col-span-2 xl:col-span-1" />
        <LoadingMetricShell />
        <LoadingMetricShell />
      </section>

      <div className="grid gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.92fr)]">
        <div className="space-y-3 sm:space-y-5">
          <div className="grid gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.85fr)]">
            <LoadingChartShell chart="bars" />
            <LoadingChartShell chart="donut" className="sm:min-h-[320px]" />
          </div>

          <div className="overflow-hidden rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
                <Skeleton className="h-7 w-36 rounded-[12px]" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full opacity-70" />
            </div>
            <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-3 rounded-[18px] px-4 py-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-3.5 w-24 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="ml-auto h-3 w-10 rounded-full opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="overflow-hidden rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
            <div className="space-y-2 mb-4">
              <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
              <Skeleton className="h-7 w-40 rounded-[12px]" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-[18px] px-3 py-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Skeleton className="h-3.5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full opacity-70" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full opacity-50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
