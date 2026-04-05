import {
  LoadingMetricGrid,
  LoadingPageShell,
  LoadingSurfaceShell,
  LoadingTableSurface,
  LoadingToolbarShell,
} from "@/components/shared/PageLoadingShell";
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

      <LoadingMetricGrid count={3} className="md:grid-cols-3" />

      <LoadingSurfaceShell>
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
      </LoadingSurfaceShell>

      <LoadingSurfaceShell>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
          <Skeleton className="h-7 w-40 rounded-[12px]" />
          <Skeleton className="h-3 w-72 rounded-full opacity-60" />
        </div>
        <div className="mt-5 space-y-4">
          <div className="rounded-[18px] p-4" style={{ background: "var(--theme-dialog-section-bg)" }}>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`data-form-${index}`} className="space-y-2">
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
      </LoadingSurfaceShell>

      <LoadingToolbarShell />

      <LoadingTableSurface columns={6} rows={6} />
    </LoadingPageShell>
  );
}
