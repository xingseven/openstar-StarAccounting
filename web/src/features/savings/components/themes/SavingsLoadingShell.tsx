import {
  LoadingCompactHeroShell,
  LoadingDonut,
  LoadingListRows,
  LoadingMetricGrid,
  LoadingPageShell,
  LoadingSurfaceHeader,
  LoadingSurfaceShell,
} from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";

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
    <LoadingPageShell className="space-y-3 sm:space-y-5">
      <LoadingCompactHeroShell />

      <LoadingMetricGrid count={3} className="md:grid-cols-3" />

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingSavingsCard key={`savings-card-${index}`} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <LoadingSurfaceShell>
          <LoadingSurfaceHeader actionWidthClassName="w-0 opacity-0" />
          <div className="mt-4 space-y-3">
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
        </LoadingSurfaceShell>

        <LoadingSurfaceShell>
          <LoadingSurfaceHeader actionWidthClassName="w-0 opacity-0" />
          <div className="mt-4">
            <LoadingDonut className="sm:grid-cols-[180px_minmax(0,1fr)]" />
          </div>
        </LoadingSurfaceShell>
      </div>

      <LoadingSurfaceShell>
        <LoadingSurfaceHeader actionWidthClassName="w-0 opacity-0" />
        <div className="mt-4">
          <LoadingListRows count={4} />
        </div>
      </LoadingSurfaceShell>
    </LoadingPageShell>
  );
}
