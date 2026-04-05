import {
  LoadingCardGrid,
  LoadingChartSurface,
  LoadingMetricGrid,
  LoadingPageShell,
} from "@/components/shared/PageLoadingShell";
import { GridDecoration } from "@/components/shared/GridDecoration";
import { Skeleton } from "@/components/shared/Skeletons";

function LoadingHeroStat() {
  return (
    <div className="rounded-[18px] bg-white/68 p-3 ring-1 ring-white/55 sm:rounded-[20px] sm:p-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 rounded-full bg-white/80" />
        <Skeleton className="h-6 w-20 rounded-[10px] bg-white/90 sm:h-7" />
      </div>
    </div>
  );
}

export function AssetsLoadingShell() {
  return (
    <LoadingPageShell>
      <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-4 sm:rounded-[26px] sm:p-6 lg:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),transparent_70%)] lg:block" />
        <div className="absolute -right-20 top-8 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl sm:h-56 sm:w-56" />
        <div className="absolute left-6 top-0 h-28 w-28 rounded-full bg-white/80 blur-3xl sm:left-10 sm:h-40 sm:w-40" />
        <GridDecoration mode="light" opacity={0.05} className="mix-blend-multiply" />

        <div className="relative z-10 space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
              资产工作台
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              <Skeleton className="h-3 w-20 rounded-full bg-white/40" />
            </span>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-full max-w-xl rounded-full bg-white/60" />
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-16 rounded-full bg-white/55" />
                <Skeleton className="h-10 w-48 rounded-[16px] bg-white/75 sm:h-12 sm:w-60" />
              </div>
              <Skeleton className="h-9 w-44 rounded-full bg-white/70" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingHeroStat key={`asset-hero-stat-${index}`} />
            ))}
          </div>

          <div className="overflow-hidden rounded-[20px] bg-[var(--theme-dark-panel-bg)] p-4 text-white sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-11 flex-1 rounded-2xl bg-white/12" />
              <Skeleton className="h-11 w-32 rounded-2xl bg-white/12" />
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(260px,0.92fr)_minmax(0,1.4fr)]">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 space-y-3">
                <Skeleton className="h-3 w-24 rounded-full bg-white/20" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-2xl bg-white/15" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-28 rounded-full bg-white/20" />
                    <Skeleton className="h-3 w-20 rounded-full bg-white/12" />
                  </div>
                </div>
              </div>
              <div className="grid gap-3 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`asset-hero-progress-${index}`} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4 space-y-2.5">
                    <Skeleton className="h-3 w-20 rounded-full bg-white/20" />
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-16 rounded-full bg-white/15" />
                        <Skeleton className="h-3 w-12 rounded-full bg-white/15" />
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-white/25" style={{ width: `${70 - index * 14}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoadingMetricGrid count={4} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.4fr)]">
        <LoadingChartSurface variant="donut" />
        <LoadingCardGrid count={3} />
      </div>
    </LoadingPageShell>
  );
}
