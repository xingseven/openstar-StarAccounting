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
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";

export function ConsumptionLoadingShell() {
  return (
    <LoadingPageShell
      aria-busy="true"
      aria-live="polite"
      className="px-0.5 sm:px-4"
      style={getThemeModuleStyle("consumption")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <LoadingWorkspaceHighlightCard tone="blue" showInlineStat />
        <LoadingWorkspaceHighlightCard tone="emerald" showInlineStat />
        <LoadingWorkspaceProgressCard rowCount={1} />

        <LoadingWorkspaceCard tone="sky" paddingClassName="p-3 sm:p-3">
          <LoadingWorkspaceCardHeader tone="sky" />
          <div className="mt-3 sm:mt-3">
            <LoadingWorkspaceTrendList tone="sky" rowCount={3} />
          </div>
        </LoadingWorkspaceCard>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
        <LoadingWorkspaceChartCard chart="area" />
        <LoadingWorkspaceChartCard chart="bars" />
        <LoadingWorkspaceChartCard chart="horizontal-bars" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
        <LoadingWorkspaceChartCard chart="area" className="lg:col-span-4" />
        <LoadingWorkspaceChartCard chart="donut" className="lg:col-span-4" />
        <LoadingWorkspaceTableCard className="lg:col-span-4" headerMetaWidthClassName="w-24" />
      </div>
    </LoadingPageShell>
  );
}
