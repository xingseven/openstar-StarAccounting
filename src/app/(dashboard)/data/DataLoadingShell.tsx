import { LoadingPageShell } from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";

export function DataLoadingShell() {
  return (
    <LoadingPageShell className="py-4 sm:py-6 lg:py-8">
      <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-4 sm:rounded-[26px] sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-36 rounded-[14px] bg-white/85" />
            <Skeleton className="h-4 w-72 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[20px] p-4" style={{ background: "var(--theme-metric-bg)" }}>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-20 rounded-full bg-white/70" />
              <Skeleton className="h-7 w-24 rounded-[12px] bg-white/85" />
              <Skeleton className="h-3 w-24 rounded-full bg-white/60" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
          <Skeleton className="h-7 w-40 rounded-[12px]" />
          <Skeleton className="h-3 w-64 rounded-full opacity-60" />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Skeleton className="h-11 w-36 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
      </div>

      <div className="rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
          <Skeleton className="h-7 w-40 rounded-[12px]" />
          <Skeleton className="h-3 w-72 rounded-full opacity-60" />
        </div>
        <div className="mt-5 space-y-4">
          <div className="rounded-[18px] p-4" style={{ background: "var(--theme-dialog-section-bg)" }}>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
                  <Skeleton className="h-11 w-full rounded-[18px]" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-11 w-36 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="rounded-[20px] p-3 sm:p-4" style={{ background: "var(--theme-surface-bg)" }}>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-full" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px]" style={{ background: "var(--theme-surface-bg)" }}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <Skeleton className="h-4 w-52 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[28px_1.2fr_0.8fr_0.7fr_0.8fr_0.7fr] gap-3">
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <Skeleton key={cellIndex} className="h-10 rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </LoadingPageShell>
  );
}
