import {
  LoadingChartSurface,
  LoadingCompactHeroShell,
  LoadingMetricGrid,
  LoadingPageShell,
} from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";

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
            <div key={`loan-meta-${index}`} className="rounded-[14px] p-3" style={{ background: "var(--theme-dialog-section-bg)" }}>
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
    <LoadingPageShell className="space-y-3 sm:space-y-5">
      <LoadingCompactHeroShell />

      <LoadingMetricGrid count={4} />

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingLoanCard key={`loan-card-${index}`} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        <LoadingChartSurface blockHeightClassName="h-[260px]" />
        <LoadingChartSurface blockHeightClassName="h-[260px]" />
      </div>
    </LoadingPageShell>
  );
}
