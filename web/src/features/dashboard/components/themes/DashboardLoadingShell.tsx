import {
  LoadingPageShell,
  LoadingWorkspaceCard,
  LoadingWorkspaceChartCard,
} from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";

function DashboardHeroCardSkeleton({
  tone,
  showInlineStat = false,
  showFooter = true,
}: {
  tone: "blue" | "emerald";
  showInlineStat?: boolean;
  showFooter?: boolean;
}) {
  return (
    <LoadingWorkspaceCard tone={tone} paddingClassName="p-3 sm:p-3 pb-4 sm:pb-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-16 rounded-full bg-white/55" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 sm:h-5 sm:w-5">
          <Skeleton className="h-3 w-3 rounded-full bg-white/55" />
        </div>
      </div>

      <div className={showInlineStat ? "mt-2 flex items-end gap-2 sm:mt-4" : "mt-2"}>
        <Skeleton className="h-10 w-24 rounded-[14px] bg-white/75 sm:h-[64px] sm:w-40" />
        {showInlineStat ? <Skeleton className="mb-1 h-3 w-12 rounded-full bg-white/50" /> : null}
      </div>

      {showFooter ? (
        <Skeleton className="mt-1 h-3 w-36 rounded-full bg-white/50 sm:mt-6 sm:w-44" />
      ) : null}
    </LoadingWorkspaceCard>
  );
}

function DashboardBudgetCardSkeleton() {
  return (
    <LoadingWorkspaceCard paddingClassName="p-3 sm:p-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded-full bg-slate-200" />
        <Skeleton className="h-6 w-6 rounded-full bg-slate-100" />
      </div>

      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-24 rounded-full bg-slate-100" />
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
          <Skeleton className="h-full w-[68%] rounded-full bg-[#4CC98F]" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-32 rounded-full bg-slate-100" />
          <Skeleton className="h-3 w-10 rounded-full bg-slate-200" />
        </div>
      </div>
    </LoadingWorkspaceCard>
  );
}

function DashboardRankingCardSkeleton() {
  return (
    <LoadingWorkspaceCard tone="sky" paddingClassName="p-3 sm:p-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded-full bg-white/75" />
        <Skeleton className="h-6 w-6 rounded-full bg-white/60" />
      </div>

      <div className="mt-3 space-y-2 sm:space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`dashboard-ranking-skeleton-${index}`} className="flex items-center gap-2 sm:gap-3">
            <div className="flex w-[80px] items-center gap-1.5 sm:w-[100px] sm:gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-sm bg-white/80 sm:h-3 sm:w-3" />
              <Skeleton className="h-3 w-12 rounded-full bg-white/70 sm:w-16" />
            </div>
            <div className="flex h-[30px] flex-1 items-center sm:h-[40px]">
              <Skeleton className="h-5 w-full rounded-full bg-white/65 sm:h-6" />
            </div>
            <div className="w-[60px] text-right sm:w-[70px]">
              <Skeleton className="ml-auto h-3 w-12 rounded-full bg-white/80 sm:w-14" />
            </div>
          </div>
        ))}
      </div>
    </LoadingWorkspaceCard>
  );
}

function DashboardMerchantCompositionSkeleton() {
  return (
    <LoadingWorkspaceCard className="lg:col-span-4">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
        <Skeleton className="h-4 w-20 rounded-full bg-slate-200" />
        <Skeleton className="h-6 w-14 rounded-full bg-slate-100" />
      </div>

      <div className="flex h-[140px] sm:h-[180px] md:h-[220px]">
        <div className="relative flex w-1/2 items-center justify-center">
          <Skeleton className="h-[92px] w-[92px] rounded-full bg-slate-100 sm:h-[122px] sm:w-[122px] md:h-[146px] md:w-[146px]" />
          <div className="pointer-events-none absolute inset-0 m-auto flex flex-col items-center justify-center gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`dashboard-composition-percent-${index}`} className="flex items-center gap-1.5">
                <Skeleton className="h-2 w-2 rounded-full bg-slate-200" />
                <Skeleton className="h-3 w-8 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-1/2 flex-col justify-center gap-2 pl-2 sm:gap-2.5 sm:pl-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`dashboard-composition-legend-${index}`} className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="h-2 w-2 rounded-sm bg-slate-200 sm:h-2.5 sm:w-2.5" />
              <Skeleton className="h-3 flex-1 rounded-full bg-slate-200" />
              <Skeleton className="h-3 w-10 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </LoadingWorkspaceCard>
  );
}

function DashboardRecentTransactionsSkeleton() {
  return (
    <LoadingWorkspaceCard className="lg:col-span-4" paddingClassName="p-0">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20 rounded-full bg-slate-200 sm:w-24" />
          <Skeleton className="h-3 w-24 rounded-full bg-slate-100 sm:w-32" />
        </div>
      </div>

      <div className="px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="border-b border-slate-200 pb-1.5 sm:pb-2">
          <div className="grid grid-cols-5 gap-2 px-2 py-1.5 sm:px-3 sm:py-2">
            <Skeleton className="h-3 w-10 rounded-full bg-slate-100" />
            <Skeleton className="h-3 w-10 rounded-full bg-slate-100" />
            <Skeleton className="h-3 w-12 rounded-full bg-slate-100" />
            <Skeleton className="h-3 w-12 rounded-full bg-slate-100" />
            <Skeleton className="ml-auto h-3 w-10 rounded-full bg-slate-100" />
          </div>
        </div>

        <div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={`dashboard-recent-row-${rowIndex}`}
              className="grid grid-cols-5 items-center gap-2 border-b border-slate-100 px-2 py-1.5 last:border-b-0 sm:px-3 sm:py-2"
            >
              <Skeleton className="h-5 w-10 rounded-full bg-slate-100" />
              <Skeleton className="h-3 w-12 rounded-full bg-slate-200" />
              <Skeleton className="h-3 w-14 rounded-full bg-slate-100" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16 rounded-full bg-slate-100" />
              </div>
              <Skeleton className="ml-auto h-3 w-12 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </LoadingWorkspaceCard>
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
        <DashboardHeroCardSkeleton tone="blue" showFooter={false} />
        <DashboardHeroCardSkeleton tone="emerald" showInlineStat />
        <DashboardBudgetCardSkeleton />
        <DashboardRankingCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
        <LoadingWorkspaceChartCard chart="area" />
        <LoadingWorkspaceChartCard chart="bars" />
        <LoadingWorkspaceChartCard chart="horizontal-bars" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
        <LoadingWorkspaceChartCard chart="area" className="lg:col-span-4" />
        <DashboardMerchantCompositionSkeleton />
        <DashboardRecentTransactionsSkeleton />
      </div>
    </LoadingPageShell>
  );
}
