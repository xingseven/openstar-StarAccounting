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

function LoadingSavingsCard() {
  return (
    <div className="overflow-hidden rounded-[22px] sm:rounded-[24px]" style={{ background: "var(--theme-surface-bg)" }}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full opacity-60" />
            <Skeleton className="h-5 w-16 rounded-full opacity-50" />
          </div>
          <Skeleton className="h-7 w-7 rounded-xl opacity-40" />
        </div>

        <div className="mt-4 space-y-1.5">
          <Skeleton className="h-8 w-36 rounded-[12px]" />
          <Skeleton className="h-3 w-24 rounded-full opacity-60" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16 rounded-full opacity-60" />
            <Skeleton className="h-3 w-10 rounded-full opacity-60" />
          </div>
          <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--theme-surface-border,rgba(148,163,184,0.2))" }}>
            <div className="h-full w-[62%] rounded-full bg-white/45" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-[18px]" />
          <Skeleton className="h-10 rounded-[18px]" />
        </div>
      </div>
    </div>
  );
}

export function SavingsLoadingShell() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-[1680px] space-y-3 sm:space-y-5">
      <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-4 sm:rounded-[26px] sm:p-6 lg:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-[32%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_70%)] lg:block" />
        <div className="absolute -right-16 top-6 h-44 w-44 rounded-full bg-blue-200/30 blur-3xl sm:h-56 sm:w-56" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36 rounded-[14px] bg-white/80 sm:h-7 sm:w-44" />
            <Skeleton className="h-4 w-52 rounded-full bg-white/60" />
          </div>
          <Skeleton className="h-10 w-28 rounded-2xl bg-slate-900/85" />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingMetricShell key={index} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingSavingsCard key={index} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="overflow-hidden rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
          <div className="space-y-2 mb-5">
            <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
            <Skeleton className="h-7 w-40 rounded-[12px]" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-11 min-w-[220px] flex-1 rounded-2xl" />
              <Skeleton className="h-11 w-[120px] rounded-2xl" />
              <Skeleton className="h-11 w-[120px] rounded-2xl" />
            </div>
            <div className="rounded-[18px] p-4" style={{ background: "var(--theme-dialog-section-bg)" }}>
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 rounded-full opacity-60" />
                <Skeleton className="h-5 w-12 rounded-full opacity-60" />
              </div>
              <div className="h-3 overflow-hidden rounded-full" style={{ background: "var(--theme-surface-border,rgba(148,163,184,0.2))" }}>
                <div className="h-full w-[48%] rounded-full bg-white/45" />
              </div>
              <div className="mt-3 flex justify-between">
                <Skeleton className="h-3 w-28 rounded-full opacity-50" />
                <Skeleton className="h-3 w-20 rounded-full opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
          <div className="space-y-2 mb-5">
            <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
            <Skeleton className="h-7 w-40 rounded-[12px]" />
          </div>
          <div className="grid items-center gap-4 rounded-[18px] p-4 sm:grid-cols-[180px_minmax(0,1fr)]" style={{ background: "var(--theme-dialog-section-bg)" }}>
            <Skeleton className="mx-auto h-[180px] w-[180px] rounded-full" />
            <div className="space-y-2.5">
              {["64%", "48%", "38%"].map((width, index) => (
                <div key={index} className="rounded-[18px] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.55)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <Skeleton className="h-3.5 rounded-full" style={{ width }} />
                    </div>
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
          <Skeleton className="h-7 w-40 rounded-[12px]" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3 rounded-[18px] px-4 py-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-28 rounded-full" />
                  <Skeleton className="h-3 w-20 rounded-full opacity-60" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="ml-auto h-3 w-20 rounded-full opacity-60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
