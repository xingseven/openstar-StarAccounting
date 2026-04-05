import { Skeleton } from "@/components/shared/Skeletons";
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

function LoadingChartCard({ className }: { className?: string }) {
  return (
    <LoadingCard className={className}>
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
        <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:h-5 sm:w-24" />
        <Skeleton className="h-6 w-14 rounded-full bg-slate-100" />
      </div>

      <div className="h-[140px] sm:h-[180px] md:h-[220px]">
        <div className="flex h-full w-full items-end gap-2 px-3 sm:gap-3 sm:px-4">
          {["86%", "70%", "58%", "74%", "48%"].map((height, index) => (
            <Skeleton key={index} className="w-full rounded-t-md bg-slate-200" style={{ height }} />
          ))}
        </div>
      </div>
    </LoadingCard>
  );
}

function LoadingDonutCard() {
  return (
    <LoadingCard>
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
        <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:h-5 sm:w-24" />
        <Skeleton className="h-6 w-14 rounded-full bg-slate-100" />
      </div>

      <div className="flex h-[140px] sm:h-[180px] md:h-[220px]">
        <div className="flex w-1/2 items-center justify-center">
          <Skeleton className="h-[96px] w-[96px] rounded-full bg-slate-100 sm:h-[120px] sm:w-[120px] md:h-[140px] md:w-[140px]" />
        </div>
        <div className="flex w-1/2 flex-col justify-center gap-2 pl-2 sm:gap-2.5 sm:pl-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-sm bg-slate-200" />
              <Skeleton className="h-3 flex-1 rounded-full bg-slate-200" />
              <Skeleton className="h-3 w-10 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </LoadingCard>
  );
}

function LoadingFocusCard() {
  return (
    <LoadingCard className="lg:col-span-4">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
        <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:h-5 sm:w-24" />
        <Skeleton className="h-6 w-12 rounded-full bg-slate-100" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[18px] border border-slate-100 bg-slate-50/70 p-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-[16px]" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-28 rounded-full bg-slate-200" />
                <Skeleton className="h-4 w-24 rounded-full bg-slate-100" />
                <Skeleton className="h-3 w-full rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </LoadingCard>
  );
}

function LoadingAccountList() {
  return (
    <LoadingCard className="lg:col-span-8 p-0">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:w-24" />
          <Skeleton className="h-3 w-40 rounded-full bg-slate-100 sm:w-56" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full bg-slate-100" />
      </div>

      <div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:px-4 sm:py-4">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28 rounded-full bg-slate-200" />
                <Skeleton className="h-4 w-10 rounded-full bg-slate-100" />
                <Skeleton className="h-3 w-8 rounded-full bg-slate-100" />
              </div>
              <Skeleton className="h-3 w-36 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-4 w-24 rounded-full bg-slate-200" />
              <Skeleton className="ml-auto h-4 w-12 rounded-full bg-slate-100" />
            </div>
            <Skeleton className="h-7 w-7 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </LoadingCard>
  );
}

export function AssetsLoadingShell() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-[1680px] space-y-4 px-0.5 pb-2 sm:space-y-5 sm:px-4"
      style={getThemeModuleStyle("assets")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <LoadingCard className="bg-blue-200/50 p-3 pb-4 sm:p-3 sm:pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded-full bg-white/45" />
              <Skeleton className="h-3 w-24 rounded-full bg-white/30" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full bg-white/25" />
          </div>
          <Skeleton className="mt-3 h-8 w-28 rounded-lg bg-white/55" />
          <Skeleton className="mt-2 h-3 w-32 rounded-full bg-white/35" />
        </LoadingCard>

        <LoadingCard className="bg-emerald-200/55 p-3 pb-4 sm:p-3 sm:pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded-full bg-white/45" />
              <Skeleton className="h-3 w-24 rounded-full bg-white/30" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full bg-white/25" />
          </div>
          <Skeleton className="mt-3 h-8 w-28 rounded-lg bg-white/55" />
          <Skeleton className="mt-2 h-3 w-32 rounded-full bg-white/35" />
        </LoadingCard>

        <LoadingCard>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
          </div>
          <div className="mt-3 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-20 rounded-full bg-slate-200" />
                  <Skeleton className="h-3 w-12 rounded-full bg-slate-100" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[16px] bg-slate-50 px-3 py-2">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-7 w-16 rounded-lg bg-slate-200" />
              <Skeleton className="h-7 w-10 rounded-lg bg-slate-100" />
            </div>
          </div>
        </LoadingCard>

        <LoadingCard className="bg-[#D8E6FC]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-full bg-white/70" />
            <Skeleton className="h-6 w-6 rounded-full bg-white/50" />
          </div>
          <div className="mt-3 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-[14px] bg-white/65" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-20 rounded-full bg-white/80" />
                    <Skeleton className="h-3 w-16 rounded-full bg-white/65" />
                  </div>
                  <Skeleton className="h-3 w-10 rounded-full bg-white/80" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-white/65" />
              </div>
            ))}
          </div>
        </LoadingCard>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
        <LoadingChartCard />
        <LoadingDonutCard />
        <LoadingCard>
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
            <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:h-5 sm:w-24" />
            <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-11 w-full rounded-2xl bg-slate-100" />
            <Skeleton className="h-11 w-full rounded-2xl bg-blue-100" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[18px] bg-slate-50 p-3">
                <Skeleton className="h-3 w-16 rounded-full bg-slate-200" />
                <Skeleton className="mt-2 h-4 w-24 rounded-full bg-slate-200" />
                <Skeleton className="mt-2 h-3 w-28 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </LoadingCard>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
        <LoadingFocusCard />
        <LoadingAccountList />
      </div>
    </div>
  );
}
