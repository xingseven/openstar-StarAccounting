import { Skeleton } from "@/components/shared/Skeletons";
import { LoadingPageShell, LoadingTableSurface } from "@/components/shared/PageLoadingShell";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";
import { cn } from "@/lib/utils";

function LoadingCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sm:rounded-[24px] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LoadingChartCard({
  chart = "area",
  className,
}: {
  chart?: "area" | "bars" | "horizontal-bars";
  className?: string;
}) {
  return (
    <LoadingCard className={className}>
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
        <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:h-5 sm:w-24" />
        <Skeleton className="h-5 w-14 rounded-full bg-slate-100 sm:h-6 sm:w-16" />
      </div>

      <div className="h-[140px] w-full sm:h-[180px] md:h-[220px]">
        {chart === "area" ? (
          <div className="flex h-full w-full items-end opacity-20">
            <svg viewBox="0 0 200 80" className="h-full w-full" preserveAspectRatio="none">
              <path d="M0 60 Q 30 20, 60 40 T 120 30 T 200 50 L 200 80 L 0 80 Z" fill="currentColor" className="text-slate-300" />
            </svg>
          </div>
        ) : chart === "horizontal-bars" ? (
          <div className="flex h-full w-full flex-col justify-center gap-3 px-1">
            {["88%", "72%", "64%", "49%", "36%"].map((width, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-3 w-12 rounded-full bg-slate-200" />
                <Skeleton className="h-4 rounded-full bg-slate-200" style={{ width }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-end gap-2 px-3 sm:gap-3 sm:px-4">
            {["35%", "55%", "45%", "70%", "50%", "80%", "60%"].map((height, index) => (
              <Skeleton key={index} className="w-full rounded-t-md bg-slate-200" style={{ height }} />
            ))}
          </div>
        )}
      </div>
    </LoadingCard>
  );
}

function LoadingDonutCard({ className }: { className?: string }) {
  return (
    <LoadingCard className={className}>
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
        <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:h-5 sm:w-24" />
        <Skeleton className="h-5 w-14 rounded-full bg-slate-100 sm:h-6 sm:w-16" />
      </div>

      <div className="flex h-[140px] sm:h-[180px] md:h-[220px]">
        <div className="flex w-1/2 items-center justify-center">
          <Skeleton className="h-[96px] w-[96px] rounded-full bg-slate-100 sm:h-[120px] sm:w-[120px] md:h-[140px] md:w-[140px]" />
        </div>
        <div className="flex w-1/2 flex-col justify-center gap-2 pl-2 sm:gap-2.5 sm:pl-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-sm bg-slate-200 sm:h-2.5 sm:w-2.5" />
              <Skeleton className="h-3 flex-1 rounded-full bg-slate-200" />
              <Skeleton className="h-3 w-10 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </LoadingCard>
  );
}

export function DashboardLoadingShell() {
  return (
    <LoadingPageShell
      aria-busy="true"
      aria-live="polite"
      className="px-0.5 sm:px-4"
      style={getThemeModuleStyle("dashboard")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <LoadingCard className="bg-blue-200/50 p-3 pb-4 sm:p-6 sm:pb-8">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-14 rounded-full bg-white/40 sm:w-16" />
            <Skeleton className="h-6 w-6 rounded-full bg-white/20 sm:h-7 sm:w-7" />
          </div>
          <Skeleton className="mt-2 h-7 w-20 rounded-lg bg-white/50 sm:mt-4 sm:h-8 sm:w-24" />
        </LoadingCard>

        <LoadingCard className="bg-emerald-200/50 p-3 pb-4 sm:p-6 sm:pb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-14 rounded-full bg-white/40 sm:w-16" />
              <Skeleton className="h-3 w-24 rounded-full bg-white/30 sm:w-32" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full bg-white/20 sm:h-7 sm:w-7" />
          </div>
          <Skeleton className="mt-2 h-7 w-20 rounded-lg bg-white/50 sm:mt-4 sm:h-8 sm:w-24" />
        </LoadingCard>

        <LoadingCard>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:h-5 sm:w-24" />
            <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
          </div>
          <div className="mt-3 space-y-2 sm:mt-5">
            <Skeleton className="h-3 w-24 rounded-full bg-slate-200 sm:w-32" />
            <Skeleton className="h-2 w-full rounded-full bg-slate-100 sm:h-2.5" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-3 w-16 rounded-full bg-slate-200 sm:w-20" />
              <Skeleton className="h-3 w-8 rounded-full bg-slate-200 sm:w-10" />
            </div>
          </div>
        </LoadingCard>

        <LoadingCard className="bg-[#D8E6FC]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-full bg-white/60 sm:h-5 sm:w-24" />
            <Skeleton className="h-6 w-6 rounded-full bg-white/50" />
          </div>
          <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3">
                <div className="flex w-[80px] items-center gap-1.5 sm:w-[100px] sm:gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-sm bg-slate-200 sm:h-3 sm:w-3" />
                  <Skeleton className="h-3 w-14 rounded-full bg-white/70 sm:w-20" />
                </div>
                <Skeleton className="h-6 flex-1 rounded-full bg-white/55 sm:h-8" />
                <Skeleton className="h-3 w-[60px] rounded-full bg-white/75 sm:w-[70px]" />
              </div>
            ))}
          </div>
        </LoadingCard>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
        <LoadingChartCard chart="area" />
        <LoadingChartCard chart="bars" />
        <LoadingChartCard chart="horizontal-bars" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
        <LoadingChartCard chart="area" className="lg:col-span-4" />
        <LoadingDonutCard className="lg:col-span-4" />
        <LoadingTableSurface className="lg:col-span-4" />
      </div>
    </LoadingPageShell>
  );
}
