import {
  LoadingPageShell,
  LoadingWorkspaceCard,
  LoadingWorkspaceCardHeader,
  LoadingWorkspaceChartCard,
  LoadingWorkspaceHighlightCard,
  LoadingWorkspaceProgressCard,
  LoadingWorkspaceTableCard,
  LoadingWorkspaceTrendList,
} from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";

function LoadingFocusAccountsCard() {
  return (
    <LoadingWorkspaceCard className="lg:col-span-4">
      <LoadingWorkspaceCardHeader action="badge" />

      <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`assets-focus-${index}`} className="space-y-2 rounded-[18px] bg-[#f8fafc] p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-[14px] bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20 rounded-full bg-slate-200" />
                <Skeleton className="h-3 w-16 rounded-full bg-slate-100" />
              </div>
              <Skeleton className="h-3 w-12 rounded-full bg-slate-200" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </LoadingWorkspaceCard>
  );
}

export function AssetsLoadingShell() {
  return (
    <LoadingPageShell
      aria-busy="true"
      aria-live="polite"
      className="px-0.5 sm:px-4"
      style={getThemeModuleStyle("assets")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <LoadingWorkspaceHighlightCard tone="blue" showTopMetaLine showFooter />
        <LoadingWorkspaceHighlightCard tone="emerald" showInlineStat />
        <LoadingWorkspaceProgressCard rowCount={3} />

        <LoadingWorkspaceCard tone="sky" paddingClassName="p-3 sm:p-3">
          <LoadingWorkspaceCardHeader tone="sky" />
          <div className="mt-3 sm:mt-3">
            <LoadingWorkspaceTrendList tone="sky" rowCount={4} showSparkline={false} />
          </div>
        </LoadingWorkspaceCard>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
        <LoadingWorkspaceChartCard chart="horizontal-bars" headerAction="badge" />
        <LoadingWorkspaceChartCard chart="donut" headerAction="badge" />
        <LoadingWorkspaceChartCard chart="stack" headerAction="dots" bodyHeightClassName="" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
        <LoadingFocusAccountsCard />
        <LoadingWorkspaceTableCard className="lg:col-span-8" headerMetaWidthClassName="w-12" />
      </div>
    </LoadingPageShell>
  );
}
