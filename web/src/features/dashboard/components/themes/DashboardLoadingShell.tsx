import { Skeleton } from "@/components/shared/Skeletons";
import { cn } from "@/lib/utils";

function LoadingCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LoadingChartCard({ chart = "area", className }: { chart?: "bars" | "area" | "donut"; className?: string }) {
  return (
    <LoadingCard className={className}>
      <div className="flex items-center justify-between gap-3 mb-6">
        <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
        <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
      </div>

      <div className="h-[180px] sm:h-[220px] w-full">
        {chart === "area" ? (
          <div className="h-full w-full flex items-end opacity-20">
            <svg viewBox="0 0 200 80" className="h-full w-full" preserveAspectRatio="none">
              <path d="M0 60 Q 30 20, 60 40 T 120 30 T 200 50 L 200 80 L 0 80 Z" fill="currentColor" className="text-slate-300" />
            </svg>
          </div>
        ) : chart === "donut" ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[140px] w-[140px] rounded-full bg-slate-100" />
          </div>
        ) : (
          <div className="h-full w-full flex items-end gap-3 px-4">
            {["35%", "55%", "45%", "70%", "50%", "80%", "60%"].map((height, index) => (
              <Skeleton key={index} className="w-full rounded-t-md bg-slate-200" style={{ height }} />
            ))}
          </div>
        )}
      </div>
    </LoadingCard>
  );
}

export function DashboardLoadingShell() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5 rounded-[24px] bg-[#F5F6FA] p-4 min-h-screen">
      {/* ═══════ ROW 1: 4 Cards ═══════ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <LoadingCard className="bg-blue-200/50 pb-8">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-16 rounded-full bg-white/40" />
            <Skeleton className="h-6 w-6 rounded-full bg-white/20" />
          </div>
          <Skeleton className="mt-5 h-8 w-24 rounded-lg bg-white/50" />
        </LoadingCard>

        <LoadingCard className="bg-emerald-200/50 pb-8">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-16 rounded-full bg-white/40" />
            <Skeleton className="h-6 w-6 rounded-full bg-white/20" />
          </div>
          <Skeleton className="mt-5 h-8 w-24 rounded-lg bg-white/50" />
        </LoadingCard>

        <LoadingCard>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-3 w-32 rounded-full bg-slate-200" />
            <Skeleton className="h-2.5 w-full rounded-full bg-slate-100" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-3 w-20 rounded-full bg-slate-200" />
              <Skeleton className="h-3 w-10 rounded-full bg-slate-200" />
            </div>
          </div>
        </LoadingCard>

        <LoadingCard>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
          </div>
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-sm bg-slate-200" />
                <Skeleton className="h-3 w-24 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </LoadingCard>
      </div>

      {/* ═══════ ROW 2: 3 Chart Cards ═══════ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LoadingChartCard chart="area" />
        <LoadingChartCard chart="bars" />
        <LoadingChartCard chart="bars" />
      </div>

      {/* ═══════ ROW 3: 3 Chart Cards ═══════ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LoadingChartCard chart="area" />
        <LoadingChartCard chart="bars" />
        <LoadingChartCard chart="donut" />
      </div>
    </div>
  );
}