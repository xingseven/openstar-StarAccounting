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
      <div className="grid gap-3 xl:grid-cols-12">
        <LoadingWorkspaceCard className="xl:col-span-3" paddingClassName="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 rounded-full opacity-60" />
              <Skeleton className="h-6 w-12 rounded-[12px]" />
            </div>
          </div>
          <Skeleton className="mt-3 h-3 w-24 rounded-full opacity-60" />
        </LoadingWorkspaceCard>

        <LoadingWorkspaceCard className="xl:col-span-9" paddingClassName="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-16 rounded-full opacity-60" />
              <Skeleton className="h-4 w-40 rounded-[12px]" />
            </div>
          </div>
          <Skeleton className="h-3 w-64 rounded-full opacity-60 mb-4" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </LoadingWorkspaceCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
        <LoadingWorkspaceCard className="xl:col-span-3" paddingClassName="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-14 rounded-full opacity-60" />
              <Skeleton className="h-4 w-28 rounded-[12px]" />
            </div>
          </div>
          <Skeleton className="h-3 w-full rounded-full opacity-60 mb-4" />
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded-full opacity-60" />
                <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-10 rounded-full opacity-60" />
                <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-10 sm:h-11 w-full rounded-2xl" />
          </div>
        </LoadingWorkspaceCard>

        <LoadingWorkspaceCard className="xl:col-span-9" paddingClassName="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-14 rounded-full opacity-60" />
              <Skeleton className="h-4 w-48 rounded-[12px]" />
            </div>
          </div>
          <Skeleton className="h-3 w-80 rounded-full opacity-60 mb-4" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                  <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                  <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-14 rounded-full opacity-60" />
                  <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
                </div>
                <Skeleton className="h-9 sm:h-10 w-full sm:w-24 rounded-xl" />
              </div>
              <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded-full opacity-60" />
                </div>
                <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
                <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 sm:h-11 w-full sm:w-40 rounded-2xl" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-2.5 w-32 rounded-full opacity-60" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-[#e2e8f0] bg-white p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Skeleton className="h-3 w-20 rounded-full" />
                          <Skeleton className="h-4 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-2.5 w-32 rounded-full opacity-60" />
                        <Skeleton className="h-2 w-24 rounded-full opacity-40" />
                      </div>
                      <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LoadingWorkspaceCard>
      </div>

      <LoadingWorkspaceCard paddingClassName="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-32 rounded-full" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </LoadingWorkspaceCard>

      <LoadingWorkspaceTableCard columns={7} rows={6} />
    </LoadingPageShell>
  );
}
