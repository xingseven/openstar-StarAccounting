import {
  LoadingPageShell,
  LoadingWorkspaceCard,
  LoadingWorkspaceCardHeader,
  LoadingWorkspaceHighlightCard,
  LoadingWorkspaceTableCard,
} from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";

export function DataLoadingShell() {
  return (
    <LoadingPageShell
      aria-busy="true"
      aria-live="polite"
      className="px-0.5 sm:px-4"
      style={getThemeModuleStyle("dashboard")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <LoadingWorkspaceHighlightCard tone="blue" showFooter={false} />
        <LoadingWorkspaceHighlightCard tone="emerald" showFooter={false} />
        
        <LoadingWorkspaceCard paddingClassName="p-3 sm:p-3">
          <LoadingWorkspaceCardHeader />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </LoadingWorkspaceCard>

        <LoadingWorkspaceCard tone="sky" paddingClassName="p-3 sm:p-3">
          <LoadingWorkspaceCardHeader tone="sky" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-3 w-32 rounded-full opacity-60" />
        </LoadingWorkspaceCard>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
        <LoadingWorkspaceCard className="lg:col-span-4" paddingClassName="p-3 sm:p-4">
          <LoadingWorkspaceCardHeader />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded-full opacity-60" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded-full opacity-60" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded-full opacity-60" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded-full opacity-60" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded-full opacity-60" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-12 rounded-full opacity-60" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        </LoadingWorkspaceCard>

        <LoadingWorkspaceCard className="lg:col-span-8" paddingClassName="p-3 sm:p-4">
          <LoadingWorkspaceCardHeader />
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
                <div className="flex items-end">
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded-full opacity-60" />
                </div>
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3 space-y-3">
              <Skeleton className="h-3 w-16 rounded-full" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-[#e2e8f0] bg-white p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-3 w-20 rounded-full" />
                          <Skeleton className="h-4 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-2.5 w-32 rounded-full opacity-60" />
                      </div>
                      <Skeleton className="h-7 w-7 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LoadingWorkspaceCard>
      </div>

      <LoadingWorkspaceCard paddingClassName="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Skeleton className="h-4 w-48 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3 border-t border-[#f1f5f9]">
          <Skeleton className="h-4 w-32 rounded-full" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </LoadingWorkspaceCard>

      <LoadingWorkspaceTableCard columns={7} rows={6} />
    </LoadingPageShell>
  );
}
