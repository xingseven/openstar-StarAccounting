import { Skeleton } from "@/components/shared/Skeletons";

function LoadingMetricShell() {
  return (
    <div className="rounded-[20px] p-3 sm:rounded-[22px] sm:p-4" style={{ background: "var(--theme-metric-bg)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full bg-white/70" />
          <Skeleton className="h-7 w-28 rounded-[12px] bg-white/85 sm:h-8" />
          <Skeleton className="h-3 w-24 rounded-full bg-white/60" />
        </div>
        <div className="hidden rounded-2xl bg-white/78 p-2.5 ring-1 ring-white/70 sm:block">
          <Skeleton className="h-4 w-4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function LoadingLoanCard() {
  return (
    <div className="overflow-hidden rounded-[22px] sm:rounded-[24px]" style={{ background: "var(--theme-surface-bg)" }}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full opacity-60" />
            </div>
          </div>
          <Skeleton className="h-6 w-14 rounded-full opacity-60" />
        </div>

        <div className="mt-4 space-y-1.5">
          <Skeleton className="h-3.5 w-16 rounded-full opacity-60" />
          <Skeleton className="h-8 w-36 rounded-[12px]" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12 rounded-full opacity-60" />
            <Skeleton className="h-3 w-8 rounded-full opacity-60" />
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--theme-surface-border,rgba(148,163,184,0.2))" }}>
            <div className="h-full w-[55%] rounded-full bg-white/45" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[14px] p-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
              <Skeleton className="mb-1.5 h-3 w-12 rounded-full opacity-60" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-[18px]" />
          <Skeleton className="h-10 rounded-[18px]" />
        </div>
      </div>
    </div>
  );
}

export function LoansLoadingShell() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-[1680px] space-y-3 sm:space-y-5">
      <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-4 sm:rounded-[26px] sm:p-6 lg:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-[30%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_70%)] lg:block" />
        <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl sm:h-52 sm:w-52" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36 rounded-[14px] bg-white/80 sm:h-7 sm:w-44" />
            <Skeleton className="h-4 w-52 rounded-full bg-white/60" />
          </div>
          <Skeleton className="h-10 w-28 rounded-2xl bg-slate-900/85" />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingMetricShell key={index} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingLoanCard key={index} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
            <div className="space-y-2 mb-5">
              <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
              <Skeleton className="h-7 w-36 rounded-[12px]" />
              <Skeleton className="h-3 w-48 rounded-full opacity-50" />
            </div>
            <div className="flex h-[260px] w-full items-end gap-3 rounded-[16px] p-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
              {["60%", "40%", "75%", "55%", "85%", "65%"].map((height, barIndex) => (
                <Skeleton key={barIndex} className="w-full rounded-t-[10px]" style={{ height }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
