import { cn } from "@/lib/utils";

const CHART_SKELETON_BAR_HEIGHTS = ["28%", "54%", "41%", "72%", "35%", "63%"];

/**
 * 通用骨架屏基础组件
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

/**
 * 统计卡片骨架屏
 */
export function StatsCardSkeleton() {
  return (
    <div className="border-l-4 border-l-gray-300 shadow-sm rounded-xl bg-white p-4 min-h-[80px] sm:min-h-[45px] py-2">
      <div className="flex flex-row items-center justify-between pb-1">
        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
        <Skeleton className="h-2 sm:h-3 w-32 sm:w-40" />
      </div>
    </div>
  );
}

/**
 * 基础图表骨架屏 (默认矩形)
 */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col rounded-xl bg-white border p-4", className)}>
      <div className="pb-2">
        <Skeleton className="h-4 w-32 mb-2" />
      </div>
      <div className="flex-1 relative w-full h-full min-h-[150px] flex items-end justify-between gap-2">
        {CHART_SKELETON_BAR_HEIGHTS.map((height, i) => (
          <Skeleton key={i} className="w-full rounded-t-md" style={{ height }} />
        ))}
      </div>
    </div>
  );
}

/**
 * 饼图骨架屏
 */
export function PieChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col rounded-xl bg-white border p-4", className)}>
      <div className="pb-2">
        <Skeleton className="h-4 w-24 mb-2" />
      </div>
      <div className="flex-1 relative w-full h-full min-h-[150px] flex items-center justify-center">
        <Skeleton className="h-[125px] w-[125px] md:h-[200px] md:w-[200px] rounded-full" />
      </div>
    </div>
  );
}

/**
 * 列表表格骨架屏
 */
export function ListTableSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  const headers = Array(columns).fill(null);
  return (
    <div className="overflow-hidden rounded-xl bg-white border min-h-[350px]">
      <div className="flex flex-row items-center justify-between p-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {headers.map((_, i) => (
                <th key={i} className="text-left px-3 py-2 whitespace-nowrap">
                  <Skeleton className="h-4 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {[...Array(rows)].map((_, i) => (
              <tr key={i} className="hover:bg-gray-50/70">
                {headers.map((_, j) => (
                  <td key={j} className="px-3 py-3">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 简单卡片列表骨架屏
 */
export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="rounded-xl bg-white border h-full">
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-0 divide-y px-6">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 -mx-6 px-6"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
