import {
  LoadingPageShell,
  LoadingWorkspaceCard,
  LoadingWorkspaceCardHeader,
  LoadingWorkspaceChartCard,
  LoadingWorkspaceHighlightCard,
  LoadingWorkspaceTableCard,
  LoadingWorkspaceTrendList,
} from "@/components/shared/PageLoadingShell";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";
import { Skeleton } from "@/components/shared/Skeletons";

function LoadingSectionHeading() {
  return (
    <div className="space-y-2 px-1">
      <Skeleton className="h-3 w-20 rounded-full bg-blue-100" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <Skeleton className="h-6 w-44 rounded-full bg-slate-200 sm:w-56" />
        <Skeleton className="h-4 w-full max-w-[420px] rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function ConsumptionLoadingShell() {
  return (
    <LoadingPageShell
      aria-busy="true"
      aria-live="polite"
      className="px-0.5 sm:px-4"
      style={getThemeModuleStyle("consumption")}
    >
      <div className="space-y-2 sm:space-y-4">
        <LoadingSectionHeading />
        <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.92fr)]">
          <LoadingWorkspaceCard paddingClassName="p-0">
            <div className="grid gap-3 p-3 sm:p-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-full bg-blue-100" />
                    <Skeleton className="h-8 w-56 rounded-full bg-slate-200 sm:w-72" />
                    <Skeleton className="h-4 w-52 rounded-full bg-slate-100 sm:w-64" />
                  </div>
                  <div className="flex gap-1.5">
                    <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
                    <Skeleton className="h-6 w-14 rounded-full bg-blue-100" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <LoadingWorkspaceHighlightCard tone="blue" showInlineStat />
                  <LoadingWorkspaceHighlightCard tone="emerald" showInlineStat />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`consumption-shell-stat-${index}`} className="rounded-[18px] bg-[#f8fafc] px-4 py-3">
                      <Skeleton className="h-3 w-14 rounded-full bg-slate-100" />
                      <Skeleton className="mt-2 h-5 w-20 rounded-full bg-slate-200" />
                      <Skeleton className="mt-2 h-3 w-24 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>

              <LoadingWorkspaceCard tone="sky" paddingClassName="p-4 sm:p-5">
                <LoadingWorkspaceCardHeader tone="sky" className="mb-4" titleWidthClassName="w-28" />
                <LoadingWorkspaceTrendList tone="sky" rowCount={4} />
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={`consumption-shell-side-${index}`} className="rounded-[18px] bg-white px-4 py-3">
                      <Skeleton className="h-3 w-14 rounded-full bg-slate-100" />
                      <Skeleton className="mt-2 h-5 w-16 rounded-full bg-slate-200" />
                      <Skeleton className="mt-2 h-3 w-24 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              </LoadingWorkspaceCard>
            </div>
          </LoadingWorkspaceCard>

          <LoadingWorkspaceTableCard rows={5} headerMetaWidthClassName="w-20" />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <LoadingSectionHeading />
        <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]">
          <LoadingWorkspaceChartCard chart="area" bodyHeightClassName="h-[220px] sm:h-[280px] xl:h-[320px]" />
          <div className="grid gap-2 sm:gap-4">
            <LoadingWorkspaceChartCard chart="bars" />
            <LoadingWorkspaceChartCard chart="donut" />
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <LoadingSectionHeading />
        <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
          <LoadingWorkspaceChartCard chart="area" className="lg:col-span-4" bodyHeightClassName="h-[220px] sm:h-[260px]" />
          <LoadingWorkspaceChartCard chart="stack" className="lg:col-span-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1.95fr)_minmax(320px,1fr)]">
        <LoadingWorkspaceTableCard columns={2} rows={5} headerMetaWidthClassName="w-20" />
        <LoadingWorkspaceChartCard chart="horizontal-bars" headerAction="dots" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-2">
        <LoadingWorkspaceChartCard chart="donut" headerAction="dots" />
        <LoadingWorkspaceChartCard chart="horizontal-bars" headerAction="dots" />
        <LoadingWorkspaceChartCard chart="bars" headerAction="dots" />
        <LoadingWorkspaceChartCard chart="bars" headerAction="dots" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <LoadingWorkspaceChartCard chart="bars" headerAction="dots" />
        <LoadingWorkspaceTableCard columns={3} rows={4} headerMetaWidthClassName="w-12" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
        <LoadingWorkspaceChartCard chart="area" headerAction="dots" />
        <LoadingWorkspaceChartCard chart="donut" headerAction="dots" />
      </div>

      <LoadingWorkspaceChartCard
        chart="horizontal-bars"
        headerAction="dots"
        bodyHeightClassName="h-[220px] sm:h-[280px] md:h-[320px]"
      />

      <div className="grid grid-cols-1 gap-2 sm:gap-4 xl:grid-cols-2">
        <LoadingWorkspaceChartCard chart="area" headerAction="dots" />
        <LoadingWorkspaceChartCard chart="bars" headerAction="dots" />
      </div>
    </LoadingPageShell>
  );
}
