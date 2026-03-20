import { StatsCardSkeleton, ChartSkeleton, PieChartSkeleton, ListTableSkeleton, Skeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-8 min-h-screen">
      {/* 顶部标题与功能区骨架 */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-7 sm:h-9 w-24 sm:w-32 mb-1 sm:mb-2" />
            <Skeleton className="h-4 sm:h-5 w-36 sm:w-48" />
          </div>
          {/* AI 分析卡片占位 (仅 PC 端显示) */}
          <Skeleton className="max-w-xl w-full hidden md:block h-[42px] rounded-xl bg-blue-50/50" />
          {/* AI 记账按钮占位 */}
          <Skeleton className="h-10 w-[90px] sm:w-[100px] rounded-md shrink-0 bg-blue-500/20" />
        </div>
        
        {/* 筛选栏占位 */}
        <Skeleton className="h-[60px] sm:h-[66px] w-full rounded-xl" />
      </div>

      {/* 核心数据卡片骨架 */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Row 2 图表区骨架 */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <PieChartSkeleton className="col-span-1 min-h-[250px] md:min-h-[280px]" />
        <PieChartSkeleton className="col-span-1 min-h-[250px] md:min-h-[280px]" />
        <ChartSkeleton className="col-span-2 min-h-[250px] md:min-h-[280px]" />
      </div>

      {/* Row 3 图表区骨架: 支出趋势 & 消费分类堆积 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
        <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
      </div>

      {/* Row 4 图表区骨架: 帕累托 & 消费日历 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
        <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
      </div>

      {/* Row 5 图表区骨架: 热力分布 & 每日平均消费 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
        <ChartSkeleton className="min-h-[250px] md:min-h-[300px]" />
      </div>

      {/* Row 6 桑基图骨架 (全宽) */}
      <div className="w-full">
        <ChartSkeleton className="min-h-[300px] md:min-h-[450px]" />
      </div>

      {/* Row 7 图表区骨架: 散点图 & 直方图 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton className="min-h-[300px] md:min-h-[350px]" />
        <ChartSkeleton className="min-h-[300px] md:min-h-[350px]" />
      </div>

      <ListTableSkeleton />
    </div>
  );
}