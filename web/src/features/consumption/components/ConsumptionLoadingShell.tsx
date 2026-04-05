import {
  LoadingHeroShell,
  LoadingMetricGrid,
  LoadingPageShell,
  LoadingSplitSurface,
} from "@/components/shared/PageLoadingShell";

export function ConsumptionLoadingShell() {
  return (
    <LoadingPageShell>
      <LoadingHeroShell />

      <LoadingMetricGrid count={4} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.92fr)]">
        <LoadingSplitSurface />
        <LoadingSplitSurface className="hidden xl:block" />
      </div>
    </LoadingPageShell>
  );
}
