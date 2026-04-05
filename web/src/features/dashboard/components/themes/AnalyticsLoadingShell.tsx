import { Skeleton } from "@/components/shared/Skeletons";
import { cn } from "@/lib/utils";

function LoadingCard({ className, children, style }: { className?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function LoadingChartCard({ chart = "area", className, style }: { chart?: "bars" | "area" | "donut"; className?: string; style?: React.CSSProperties }) {
  return (
    <LoadingCard className={className} style={style}>
      <div className="flex items-center justify-between gap-3 mb-6">
        <Skeleton className="h-5 w-24 rounded-full bg-slate-200/50" />
        <Skeleton className="h-6 w-16 rounded-full bg-slate-100/50" />
      </div>

      <div className="h-full w-full flex-1">
        {chart === "area" ? (
          <div className="h-full w-full flex items-end opacity-20">
            <svg viewBox="0 0 200 80" className="h-[120px] w-full" preserveAspectRatio="none">
              <path d="M0 60 Q 30 20, 60 40 T 120 30 T 200 50 L 200 80 L 0 80 Z" fill="currentColor" className="text-slate-400" />
            </svg>
          </div>
        ) : chart === "donut" ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[120px] w-[120px] rounded-full bg-slate-100/50" />
          </div>
        ) : (
          <div className="h-[120px] w-full flex items-end gap-3 px-4">
            {["35%", "55%", "45%", "70%", "50%", "80%", "60%"].map((height, index) => (
              <Skeleton key={index} className="w-full rounded-t-md bg-slate-200/50" style={{ height }} />
            ))}
          </div>
        )}
      </div>
    </LoadingCard>
  );
}

export function AnalyticsLoadingShell() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-[1680px] space-y-5 pb-4 min-h-screen" style={{ background: "#F4EFEA", padding: "20px 24px", borderRadius: "32px" }}>
      {/* ═══════ ROW 1 ═══════ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr_1.8fr]">
        <LoadingCard style={{ backgroundColor: "#2E62A6" }} className="min-h-[220px]">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-24 rounded-full bg-white/30" />
            <Skeleton className="h-6 w-6 rounded-full bg-white/20" />
          </div>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-2 w-3/4 rounded-full bg-white/20" />
            <Skeleton className="h-2 w-full rounded-full bg-white/20" />
            <Skeleton className="h-2 w-2/3 rounded-full bg-white/20" />
          </div>
        </LoadingCard>

        <LoadingChartCard chart="area" className="min-h-[220px]" />
        
        <LoadingChartCard chart="area" style={{ backgroundColor: "#BFE2DC" }} className="min-h-[220px]" />
      </div>

      {/* ═══════ ROW 2 ═══════ */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <LoadingChartCard chart="area" className="h-[240px]" />
        <LoadingChartCard chart="bars" style={{ backgroundColor: "#CAE3D9" }} className="h-[240px]" />
        <LoadingChartCard chart="bars" className="h-[240px]" />
        <LoadingChartCard chart="donut" className="h-[240px]" />
      </div>

      {/* ═══════ ROW 3 ═══════ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1.5fr_1fr]">
        <LoadingCard style={{ backgroundColor: "#A692CD" }} className="min-h-[220px]">
          <Skeleton className="h-5 w-32 rounded-full bg-white/40 mb-8" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-3 w-16 rounded-full bg-white/40" />
                <Skeleton className="h-3.5 flex-1 rounded-full bg-white/20" />
                <Skeleton className="h-3 w-12 rounded-full bg-white/40" />
              </div>
            ))}
          </div>
        </LoadingCard>

        <LoadingCard className="min-h-[220px]">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-5 w-32 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-20 rounded-full bg-slate-200" />
                <Skeleton className="h-3 w-24 rounded-full bg-slate-200" />
                <Skeleton className="h-3 w-16 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </LoadingCard>

        <LoadingCard className="min-h-[220px]">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
          </div>
          <div className="grid grid-cols-7 gap-y-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="mx-auto h-5 w-5 rounded-full bg-slate-100" />
            ))}
          </div>
        </LoadingCard>
      </div>
    </div>
  );
}
