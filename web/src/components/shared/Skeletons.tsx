import { cn } from "@/lib/utils";

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
    <div className="border-l-4 border-l-gray-300 shadow-sm rounded-xl bg-white p-4 min-h-[100px]">
      <div className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

/**
 * 图表骨架屏
 */
export function ChartSkeleton() {
  return (
    <div className="flex flex-col min-h-[350px] rounded-xl bg-white border p-4">
      <div className="flex items-center justify-center pb-0">
        <Skeleton className="h-4 w-24 mb-2" />
      </div>
      <div className="flex-1 pb-0 relative min-h-[280px]">
        <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
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
    <div className="rounded-xl bg-white border p-4 min-h-[300px]">
      <div className="flex flex-row items-center justify-between p-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-0 divide-y">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3"
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
