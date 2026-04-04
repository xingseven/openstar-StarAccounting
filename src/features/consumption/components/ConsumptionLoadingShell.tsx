import { BarChart3, CreditCard, Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeletons";

function LoadingMetricShell() {
  return (
    <div className="rounded-[18px] [background:var(--theme-metric-bg)] p-3 sm:rounded-[20px] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full bg-white/70 sm:h-4" />
          <Skeleton className="h-7 w-24 rounded-[14px] bg-white/85 sm:h-8 sm:w-28" />
          <Skeleton className="h-3 w-28 rounded-full bg-white/60 sm:w-32" />
        </div>
        <div className="rounded-2xl bg-white/75 p-2.5 ring-1 ring-white/70">
          <CreditCard className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
}

function LoadingSurfaceShell({ className }: { className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[18px] [background:var(--theme-surface-bg)] sm:rounded-[22px] ${className ?? ""}`}
    >
      <div className="space-y-4 p-3.5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-[14px] sm:h-8 sm:w-52" />
            <Skeleton className="h-3 w-48 rounded-full sm:w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="flex h-[220px] items-end gap-2 rounded-[20px] bg-slate-50/85 p-4 sm:h-[280px]">
            {["22%", "48%", "38%", "68%", "44%", "74%", "58%"].map((height, index) => (
              <Skeleton key={`consumption-shell-bar-${index}`} className="w-full rounded-t-[14px]" style={{ height }} />
            ))}
          </div>

          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`consumption-shell-row-${index}`}
                className="flex items-center justify-between gap-3 rounded-[18px] bg-slate-50/85 px-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-24 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ConsumptionLoadingShell() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5">
      <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-3.5 sm:rounded-[26px] sm:p-6 lg:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),transparent_70%)] lg:block" />
        <div className="absolute -right-20 top-8 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl sm:h-56 sm:w-56" />

        <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.92fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                消费工作台
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                正在准备看板
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-white/70">
                <BarChart3 className="h-3.5 w-3.5" />
                分段加载图表
              </span>
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

            <div className="overflow-hidden rounded-[24px] bg-slate-200/70 ring-1 ring-slate-200/70 sm:grid sm:grid-cols-3 sm:[&>*:not(:last-child)]:border-r sm:[&>*:not(:last-child)]:border-slate-200/70">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`consumption-shell-platform-${index}`} className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20 rounded-full bg-white/80" />
                      <Skeleton className="h-3 w-24 rounded-full bg-white/55" />
                    </div>
                    <div className="rounded-2xl bg-white/75 p-2.5 ring-1 ring-white/70">
                      <CreditCard className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-28 rounded-[16px] bg-white/85" />
                  <Skeleton className="h-3 w-32 rounded-full bg-white/55" />
                </div>
              ))}
            </div>
          </div>

          <div className="self-end xl:justify-self-end">
            <div className="grid gap-2.5 sm:min-w-[320px]">
              <div className="rounded-[24px] bg-white/72 p-4 ring-1 ring-white/65">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-full bg-slate-200" />
                    <Skeleton className="h-3 w-40 rounded-full bg-slate-200/80" />
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                    同步中
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-11 rounded-[18px] bg-white" />
                  <Skeleton className="h-11 rounded-[18px] bg-white" />
                  <Skeleton className="h-11 rounded-[18px] bg-white sm:col-span-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingMetricShell key={`consumption-shell-metric-${index}`} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.92fr)]">
        <LoadingSurfaceShell />
        <LoadingSurfaceShell className="hidden xl:block" />
      </div>
    </div>
  );
}
