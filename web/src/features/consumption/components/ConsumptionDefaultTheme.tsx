import { useEffect, useMemo, useRef, useState } from "react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  ComposedChart, 
  LabelList, 
  Layer,
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  Rectangle,
  Sankey,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis, 
  YAxis,
  ZAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { siAlipay, siWechat } from "simple-icons";
import { 
    ArrowDownIcon, 
    ArrowUpIcon, 
    Wallet,
    ShoppingBag,
    Search
  } from "lucide-react";
  import { Input } from "@/components/ui/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
  import { Button } from "@/components/ui/button";
  import { Filter } from "lucide-react";
  import { Label } from "@/components/ui/label";

  // Types
  export type ConsumptionData = {
  // ... (Keep existing types)
  summary: {
    totalExpense: number;
    totalIncome: number;
    expenseCount: number;
    wechat: { expense: number; income: number };
    alipay: { expense: number; income: number };
  };
  platformDistribution: Array<{ name: string; value: number; fill: string }>;
  incomeExpense: Array<{ name: string; value: number; fill: string }>;
  merchants: Array<{ merchant: string; total: number; fill: string }>;
  trend: Array<{ day: string; total: number }>;
  stackedBar: Array<{ day: string; [key: string]: string | number }>;
  pareto: Array<{ name: string; value: number; cumulativePercentage: number; fill: string }>;
  weekdayWeekend: Array<{ name: string; value: number; fill: string }>;
  calendar: Array<{ date: string; day: number; value: number }>;
  heatmap: {
    platforms: string[];
    categories: string[];
    data: Array<{ platform: string; category: string; total: number }>;
  };
  sankey: {
    nodes: Array<{ name: string }>;
    links: Array<{ source: number; target: number; value: number }>;
  };
  scatter: Array<{ id: number; hour: number; amount: number; category: string }>;
  histogram: Array<{ range: string; count: number; fill: string }>;
  transactions: Array<{
    id: string;
    merchant: string;
    date: string;
    category: string;
    platform: string;
    type: string;
    amount: string;
  }>;
};

interface ConsumptionViewProps {
  data: ConsumptionData;
  dateRangeLabel: string;
}

// Helper component for skeleton loading
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-gray-100", className)} {...props} />;
}

function WechatOfficialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`#${siWechat.hex}`} />
      <path d={siWechat.path} fill="#FFFFFF" transform="translate(1.5 1.5) scale(0.875)" />
    </svg>
  );
}

function AlipayOfficialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`#${siAlipay.hex}`} />
      <path d={siAlipay.path} fill="#FFFFFF" transform="translate(1.5 1.5) scale(0.875)" />
    </svg>
  );
}

// Helper component for staggered animation and lazy loading
function DelayedRender({ 
  children, 
  delay, 
  lazy = false,
  className,
  fallback
}: { 
  children: React.ReactNode; 
  delay: number; 
  lazy?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timerId: number | undefined;
    let idleId: number | undefined;
    let observer: IntersectionObserver | undefined;
    let rafId: number | undefined;

    const renderWithDelay = () => {
      if (delay > 0) {
        timerId = window.setTimeout(() => {
          setShouldRender(true);
          rafId = window.requestAnimationFrame(() => setIsVisible(true));
        }, delay);
        return;
      }
      setShouldRender(true);
      rafId = window.requestAnimationFrame(() => setIsVisible(true));
    };

    const scheduleRender = () => {
      if ("requestIdleCallback" in window) {
        const requestIdle = window.requestIdleCallback as (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions
        ) => number;
        idleId = requestIdle(() => renderWithDelay(), { timeout: 600 });
        return;
      }
      renderWithDelay();
    };

    if (lazy) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            scheduleRender();
            observer.disconnect();
          }
        },
        { rootMargin: "120px" }
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      
      return () => {
        observer?.disconnect();
        if (timerId !== undefined) {
          window.clearTimeout(timerId);
        }
        if (idleId !== undefined && "cancelIdleCallback" in window) {
          const cancelIdle = window.cancelIdleCallback as (handle: number) => void;
          cancelIdle(idleId);
        }
        if (rafId !== undefined) {
          window.cancelAnimationFrame(rafId);
        }
      };
    } 
    else {
      timerId = window.setTimeout(() => {
        setShouldRender(true);
        rafId = window.requestAnimationFrame(() => setIsVisible(true));
      }, delay);
      return () => {
        if (timerId !== undefined) {
          window.clearTimeout(timerId);
        }
        if (rafId !== undefined) {
          window.cancelAnimationFrame(rafId);
        }
      };
    }
  }, [delay, lazy]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? (
        <div
          className={cn(
            "transition-opacity duration-500 ease-out",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {children}
        </div>
      ) : fallback ? (
        fallback
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center bg-white/50 animate-pulse space-y-4 p-6">
          <div className="w-full flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="flex-1 w-full flex items-end justify-between gap-2">
             {[...Array(7)].map((_, i) => (
               <Skeleton key={i} className="w-full" style={{ height: `${22 + i * 8}%` }} />
             ))}
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      )}
    </div>
  );
}

function AnimatedCalendarGrid({ calendar }: { calendar: ConsumptionData["calendar"] }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timer = window.setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= calendar.length) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 35);

    return () => window.clearInterval(timer);
  }, [calendar]);

  return (
    <div className="w-full h-[250px] flex flex-col justify-between">
      <div className="grid grid-cols-7 gap-3 text-center text-sm mb-2">
        {["日", "一", "二", "三", "四", "五", "六"].map(d => (
          <div key={d} className="font-bold text-gray-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 flex-1">
        <div /> <div /> <div /> <div />
        {calendar.map((d, index) => {
          const max = 2000;
          const intensity = max > 0 ? d.value / max : 0;
          const bg = intensity === 0 ? "bg-gray-50" :
                     intensity < 0.2 ? "bg-blue-100" :
                     intensity < 0.5 ? "bg-blue-300" :
                     intensity < 0.8 ? "bg-blue-500" : "bg-blue-700";
          const text = intensity > 0.5 ? "text-white" : "text-gray-700";
          const visible = index < visibleCount;
          
          return (
            <div
              key={d.date}
              className={cn(
                "h-8 rounded-md flex flex-col items-center justify-center p-0.5 shadow-sm transition-all duration-300",
                visible ? "opacity-100 scale-100" : "opacity-0 scale-90",
                visible ? "hover:scale-105" : "",
                bg,
                text
              )}
              title={`${d.date}: ¥${d.value}`}
            >
              <span className="font-bold text-xs mb-0.5">{d.day}</span>
              {d.value > 0 && <span className="text-[10px] font-medium leading-none scale-90">¥{Math.round(d.value)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConsumptionDefaultTheme({ data, dateRangeLabel }: ConsumptionViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("month");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const commonConfig = useMemo(() => ({
    expense: { label: "支出", color: "var(--color-chart-1)" },
    income: { label: "收入", color: "var(--color-chart-2)" },
  } satisfies ChartConfig), []);
  const emptyChartConfig = useMemo(() => ({} as ChartConfig), []);
  const trendChartConfig = useMemo(() => ({
    total: { label: "支出", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig), []);
  const lowerSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
  const incomeExpenseTotal = useMemo(
    () => data.incomeExpense.reduce((acc, curr) => acc + curr.value, 0),
    [data.incomeExpense]
  );
  const heatmapValueMap = useMemo(() => {
    const map = new Map<string, number>();
    data.heatmap.data.forEach((item) => {
      map.set(`${item.platform}::${item.category}`, Number(item.total) || 0);
    });
    return map;
  }, [data.heatmap.data]);

  const filteredTransactions = useMemo(() => data.transactions.filter((t) => {
    const matchesSearch = lowerSearchTerm === "" || 
      t.merchant.toLowerCase().includes(lowerSearchTerm) ||
      t.category.toLowerCase().includes(lowerSearchTerm);
    const matchesPlatform = platformFilter === "all" || t.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  }), [data.transactions, lowerSearchTerm, platformFilter]);

  const [showFloatingFilter, setShowFloatingFilter] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Find the main scroll container
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const handleScroll = () => {
      setShowFloatingFilter(mainContent.scrollTop > 200);
    };

    mainContent.addEventListener("scroll", handleScroll);
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, []);

  const pieStrokeWidth = isMobile ? 12 : 4;
  const pieInnerRadius = isMobile ? 25 : 35;

  // 计算周数 - 假设一个月最多 5 周
  const weekLabels = useMemo(() => {
    const weeks = ['第 1 周', '第 2 周', '第 3 周', '第 4 周', '第 5 周'];
    return weeks.slice(0, 5);
  }, []);

  // 获取某月 1 号是周几 (0=周日，1=周一，..., 6=周六)
  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // 获取某月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 计算当前周的日期
  const getWeekDates = (week: number) => {
    const year = 2026;
    const month = 2; // 3 月 (0-indexed)
    const firstDay = getFirstDayOfWeek(year, month); // 3 月 1 号是周几 (0=周日)
    const daysInMonth = getDaysInMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1); // 2 月的天数
    
    const dates = [];
    
    // 计算第 week 周的日期
    if (week === 1) {
      // 第一周：从 1 号开始，1 号是周日，所以周一到六是上个月的日期
      for (let i = 0; i < 7; i++) {
        // i=0 是周一，i=6 是周日
        // 1 号是周日 (i=6)，所以 i<6 时是上个月的日期
        if (i < 6) {
          // 上个月的日期：从 (daysInPrevMonth - 5) 开始
          dates.push({ day: daysInPrevMonth - 5 + i, month: 2, isCurrentMonth: false });
        } else {
          dates.push({ day: 1, month: 3, isCurrentMonth: true }); // 3 月 1 号
        }
      }
    } else {
      // 第 2 周及以后
      const startDay = (week - 1) * 7 - (7 - firstDay) + 1;
      for (let i = 0; i < 7; i++) {
        const day = startDay + i;
        if (day >= 1 && day <= daysInMonth) {
          dates.push({ day, month: 3, isCurrentMonth: true });
        } else {
          dates.push({ day: day - daysInMonth, month: 4, isCurrentMonth: false }); // 下个月的日期
        }
      }
    }
    
    return dates;
  };

  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto relative">
      {/* Floating Filter Button */}
      <div 
        className={cn(
          "fixed bottom-8 right-8 z-50 transition-all duration-300 transform",
          showFloatingFilter ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
      >
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <button 
            type="button" 
            className="h-14 w-14 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 flex items-center justify-center"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-6 w-6" />
          </button>
          <PopoverContent className="w-80 p-4 mr-8 mb-4" side="top" align="end">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">快捷筛选</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="搜索..."
                      className="pl-9 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">平台</Label>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="所有平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有平台</SelectItem>
                      <SelectItem value="wechat">微信</SelectItem>
                      <SelectItem value="alipay">支付宝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">时间</Label>
                  <div className="flex items-center gap-2 border rounded-md p-1">
                    <button 
                      onClick={() => setDateFilter("month")}
                      className={cn("flex-1 px-2 py-1 text-xs rounded font-medium transition-colors", dateFilter === "month" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900")}
                    >
                      本月
                    </button>
                    <div className="h-3 w-px bg-gray-200" />
                    <span className="flex-1 text-center text-xs text-gray-500 px-1 truncate">{dateRangeLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">消费分析</h1>
          <p className="text-gray-500 mt-1">全方位洞察您的收支状况</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜索消费明细..."
              className="pl-9 w-[200px] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Platform Filter */}
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="所有平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有平台</SelectItem>
              <SelectItem value="wechat">微信</SelectItem>
              <SelectItem value="alipay">支付宝</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <button 
              onClick={() => setDateFilter("month")}
              className={cn("px-3 py-1 text-sm rounded font-medium transition-colors", dateFilter === "month" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900")}
            >
              本月
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <span className="text-sm text-gray-500 px-2 cursor-pointer hover:text-gray-900">{dateRangeLabel}</span>
          </div>
        </div>
      </div>

      {/* Row 1: Summary Cards (4 cols) - Instant Render */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <ShoppingBag className="absolute -right-3 -bottom-4 h-24 w-24 text-orange-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">总消费金额</CardTitle>
            <div className="h-9 w-9 rounded-full bg-orange-100/90 ring-4 ring-orange-50/80 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">¥{data.summary.totalExpense.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">共 {data.summary.expenseCount} 笔支出</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <Wallet className="absolute -right-3 -bottom-4 h-24 w-24 text-blue-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">本月收支</CardTitle>
            <div className="h-9 w-9 rounded-full bg-blue-100/90 ring-4 ring-blue-50/80 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500 flex items-center gap-1"><ArrowDownIcon className="h-3 w-3 text-green-500" /> 收入</div>
              <div className="text-lg font-semibold text-green-600">¥{data.summary.totalIncome.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 flex items-center gap-1"><ArrowUpIcon className="h-3 w-3 text-red-500" /> 支出</div>
              <div className="text-lg font-semibold text-red-600">¥{data.summary.totalExpense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-[#07C160] shadow-sm hover:shadow-md transition-shadow">
          <WechatOfficialIcon className="absolute -right-3 -bottom-4 h-24 w-24 opacity-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">微信收支</CardTitle>
            <div className="h-9 w-9 rounded-full bg-[#07C160]/15 ring-4 ring-[#07C160]/10 flex items-center justify-center">
              <WechatOfficialIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">收入</div>
              <div className="text-lg font-semibold text-gray-900">¥{data.summary.wechat.income.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">支出</div>
              <div className="text-lg font-semibold text-gray-900">¥{data.summary.wechat.expense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-[#1677FF] shadow-sm hover:shadow-md transition-shadow">
          <AlipayOfficialIcon className="absolute -right-3 -bottom-4 h-24 w-24 opacity-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">支付宝收支</CardTitle>
            <div className="h-9 w-9 rounded-full bg-[#1677FF]/15 ring-4 ring-[#1677FF]/10 flex items-center justify-center">
              <AlipayOfficialIcon className="h-5 w-5 rounded-sm" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">收入</div>
              <div className="text-lg font-semibold text-gray-900">¥{data.summary.alipay.income.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">支出</div>
              <div className="text-lg font-semibold text-gray-900">¥{data.summary.alipay.expense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts (3 cols) */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="col-span-1 flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-base">支付平台分布</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 pt-0 px-4 relative flex flex-col items-center justify-center">
            <DelayedRender 
              delay={80}
              className="h-[100px] w-[100px] md:h-[220px] md:w-[220px] flex items-center justify-center"
              fallback={<Skeleton className="h-[100px] w-[100px] md:h-[220px] md:w-[220px] rounded-full" />}
            >
              <ChartContainer config={emptyChartConfig} className="h-[100px] w-[100px] md:h-[220px] md:w-[220px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={data.platformDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={0}
                    labelLine={false}
                    isAnimationActive
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {data.platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend 
                    content={<ChartLegendContent />} 
                    className="hidden" 
                  />
                </PieChart>
              </ChartContainer>
            </DelayedRender>
            <div className="w-full flex justify-center mt-0">
              <div className="flex flex-col gap-0.5 text-xs md:grid md:grid-cols-2 md:gap-x-4 md:gap-y-1">
                 {data.platformDistribution.map((item, index) => (
                   <div key={index} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                     <span className="text-gray-500">{item.name}</span>
                     <span className="font-medium">{(item.value / data.summary.totalExpense * 100).toFixed(0)}%</span>
                   </div>
                 ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-base">收支分析</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 pt-0 px-4 relative flex flex-col items-center justify-center">
            <DelayedRender 
              delay={220}
              className="h-[100px] w-[100px] md:h-[220px] md:w-[220px] flex items-center justify-center"
              fallback={<Skeleton className="h-[100px] w-[100px] md:h-[220px] md:w-[220px] rounded-full border-4 border-white" />}
            >
              <ChartContainer config={commonConfig} className="h-[100px] w-[100px] md:h-[220px] md:w-[220px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={data.incomeExpense}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={pieInnerRadius}
                    strokeWidth={pieStrokeWidth}
                    labelLine={false}
                    isAnimationActive
                    animationDuration={750}
                    animationEasing="ease-out"
                  >
                    {data.incomeExpense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend 
                    content={<ChartLegendContent />} 
                    className="hidden" 
                  />
                </PieChart>
              </ChartContainer>
            </DelayedRender>
            <div className="w-full flex justify-center mt-0">
              <div className="flex flex-col gap-0.5 text-xs md:grid md:grid-cols-2 md:gap-x-4 md:gap-y-1">
                 {data.incomeExpense.map((item, index) => {
                   return (
                     <div key={index} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                       <span className="text-gray-500">{item.name}</span>
                       <span className="font-medium">{(item.value / incomeExpenseTotal * 100).toFixed(0)}%</span>
                     </div>
                   );
                 })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">热门商家 Top 10</CardTitle>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={360} className="h-[200px] w-full">
              <ChartContainer config={emptyChartConfig} className="h-[200px] w-full">
                <BarChart
                  accessibilityLayer
                  data={data.merchants}
                  layout="vertical"
                  margin={{ left: 0, right: 0 }}
                >
                  <YAxis
                    dataKey="merchant"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <XAxis dataKey="total" type="number" hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="total" layout="vertical" radius={4} barSize={20} isAnimationActive animationDuration={650} animationEasing="ease-out">
                    {data.merchants.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </DelayedRender>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Charts (2 cols) - Lazy Load */}
      <div className="grid gap-4 md:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">支出趋势</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="w-[1200px] md:w-full">
              <DelayedRender delay={120} lazy className="h-[250px] w-full">
                <ChartContainer config={trendChartConfig} className="h-[250px] w-full">
                  <LineChart
                    accessibilityLayer
                    data={data.trend}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                      dataKey="total"
                      type="monotone"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ChartContainer>
              </DelayedRender>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">消费分类堆积</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="w-[750px] md:w-full">
              <DelayedRender delay={240} lazy className="h-[250px] w-full">
                <ChartContainer config={emptyChartConfig} className="h-[250px] w-full">
                  <BarChart accessibilityLayer data={data.stackedBar}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(8)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {["餐饮", "购物", "交通", "娱乐"].map((key, i, arr) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={`var(--color-chart-${(i % 5) + 1})`}
                        radius={i === arr.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationBegin={i * 120}
                        animationEasing="ease-out"
                      />
                    ))}
                  </BarChart>
                </ChartContainer>
              </DelayedRender>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Charts (2 cols) - Lazy Load */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">帕累托分析 (20/80法则)</CardTitle>
            <CardDescription>识别主要支出分类</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <DelayedRender delay={360} lazy className="h-[250px] w-full">
              <ChartContainer config={emptyChartConfig} className="h-[250px] w-full">
                  <ComposedChart data={data.pareto} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" scale="band" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={0} />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} width={40} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" axisLine={false} tickLine={false} width={40} />
                    <ChartTooltip />
                    <Bar yAxisId="left" dataKey="value" barSize={60} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700} animationEasing="ease-out">
                      {data.pareto.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} isAnimationActive animationDuration={900} animationEasing="ease-out" />
                  </ComposedChart>
                </ChartContainer>
            </DelayedRender>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">消费日历</CardTitle>
            <CardDescription>每日消费强度分布</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <DelayedRender delay={480} lazy className="h-[250px] w-full">
              <AnimatedCalendarGrid calendar={data.calendar} />
            </DelayedRender>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Charts (2 cols) - Lazy Load */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">平台 x 分类 热力分布</CardTitle>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={600} lazy className="h-[250px] w-full">
              <div className="overflow-x-auto h-[250px]">
                <table className="w-full text-sm text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border-b bg-gray-50 text-left text-xs">分类</th>
                      {data.heatmap.platforms.map(p => (
                        <th key={p} className="p-2 border-b bg-gray-50 text-xs">
                          {p === "wechat" ? "微信" : p === "alipay" ? "支付宝" : p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.heatmap.categories.map(cat => (
                      <tr key={cat}>
                        <td className="p-2 border-b font-medium text-left bg-gray-50 text-xs">{cat}</td>
                        {data.heatmap.platforms.map(plat => {
                          const val = heatmapValueMap.get(`${plat}::${cat}`) ?? 0;
                          const maxVal = 2500;
                          const intensity = maxVal > 0 ? val / maxVal : 0;
                          
                          return (
                            <td key={plat} className="p-2 border-b relative group">
                              <div 
                                className="absolute inset-1 rounded bg-blue-600 transition-opacity"
                                style={{ opacity: intensity * 0.8 + (val > 0 ? 0.1 : 0) }}
                              />
                              <span className={cn("relative z-10 text-xs", intensity > 0.5 ? "text-white" : "text-gray-900")}>
                                {val > 0 ? `¥${val.toFixed(0)}` : "-"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DelayedRender>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base">每日平均消费 (按周)</CardTitle>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {weekLabels.map((week, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedWeek(index + 1)}
                    className={cn(
                      "px-2 py-1 text-xs rounded font-medium transition-colors",
                      selectedWeek === index + 1 
                        ? "bg-gray-900 text-white" 
                        : "bg-gray-100 text-gray-500 hover:text-gray-900"
                    )}
                  >
                    {week}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={720} lazy className="h-[250px] w-full">
              <ChartContainer config={commonConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={data.weekdayWeekend}>
                  <CartesianGrid vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={0}
                    height={50}
                    tick={({ x, y, payload }) => {
                      const dayIndex = payload.index;
                      const weekDates = getWeekDates(selectedWeek);
                      const dateInfo = weekDates[dayIndex];
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={10} textAnchor="middle" fill="#666" fontSize={12}>
                            {payload.value}
                          </text>
                          <text x={0} y={0} dy={26} textAnchor="middle" fill="#999" fontSize={10}>
                            {dateInfo ? `${dateInfo.month}月${dateInfo.day}日` : ''}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--color-chart-1)" isAnimationActive animationDuration={700} animationEasing="ease-out">
                    <LabelList dataKey="value" position="top" formatter={(v: number) => `¥${v.toFixed(0)}`} fontSize={12} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </DelayedRender>
          </CardContent>
        </Card>
      </div>

      {/* Row 7: Sankey Diagram - Lazy Load */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">资金流向 (桑基图)</CardTitle>
          <CardDescription>收入来源 ➔ 支付账户 ➔ 支出去向</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[600px] md:w-full">
            <DelayedRender delay={960} className="h-[300px] w-full">
              <ChartContainer config={emptyChartConfig} className="h-[300px] w-full">
                <Sankey
                  data={data.sankey}
                  margin={{ left: 0, right: 120, top: 10, bottom: 10 }}
                  node={({ x, y, width, height, index, payload }) => {
                    const nodeColors = [
                      'var(--color-chart-1)',
                      'var(--color-chart-2)',
                      'var(--color-chart-3)',
                      'var(--color-chart-4)',
                      'var(--color-chart-5)',
                      'var(--color-chart-1)',
                      'var(--color-chart-2)',
                      'var(--color-chart-3)',
                      'var(--color-chart-4)',
                    ];
                    return (
                      <Layer key={`node-${index}`}>
                        <Rectangle x={x} y={y} width={width} height={height} fill={nodeColors[index] || 'var(--color-chart-1)'} fillOpacity={0.8} radius={[2, 2, 2, 2]} />
                        <text
                          x={x + width + 6}
                          y={y + height / 2}
                          dy="0.35em"
                          fontSize={12}
                          fill="#333"
                        >
                          {`${payload.name} (${payload.value})`}
                        </text>
                      </Layer>
                    );
                  }}
                  nodePadding={50}
                  link={({ source, target }) => {
                    if (!source || !target) {
                      return { stroke: 'var(--color-chart-1)', fillOpacity: 0.3 };
                    }
                    const sourceIndex = typeof source === 'number' ? source : source.index;
                    const targetIndex = typeof target === 'number' ? target : target.index;
                    const linkColors: Record<string, string> = {
                      '0-2': 'var(--color-chart-1)',
                      '0-3': 'var(--color-chart-2)',
                      '1-3': 'var(--color-chart-3)',
                      '2-4': 'var(--color-chart-1)',
                      '2-6': 'var(--color-chart-2)',
                      '2-8': 'var(--color-chart-3)',
                      '3-5': 'var(--color-chart-4)',
                      '3-7': 'var(--color-chart-5)',
                      '3-4': 'var(--color-chart-1)',
                      '3-6': 'var(--color-chart-2)',
                    };
                    const key = `${sourceIndex}-${targetIndex}`;
                    return { stroke: linkColors[key] || 'var(--color-chart-1)', fillOpacity: 0.3 };
                  }}
                >
                  <Tooltip />
                </Sankey>
              </ChartContainer>
            </DelayedRender>
          </div>
        </CardContent>
      </Card>

      {/* Row 8: Scatter & Histogram - Lazy Load */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">消费时段分布 (散点图)</CardTitle>
            <CardDescription>24小时消费习惯透视</CardDescription>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={1080} lazy className="h-[300px] w-full">
              <ChartContainer config={emptyChartConfig} className="h-[300px] w-full">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    type="number" 
                    dataKey="hour" 
                    name="时间" 
                    unit="h" 
                    domain={[0, 24]} 
                    tickCount={7}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="amount" 
                    name="金额" 
                    unit="¥" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ZAxis type="number" dataKey="amount" range={[50, 400]} />
                  <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                  <Scatter name="消费记录" data={data.scatter} fill="var(--color-chart-2)" isAnimationActive animationDuration={800} />
                </ScatterChart>
              </ChartContainer>
            </DelayedRender>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">单笔金额分布 (直方图)</CardTitle>
            <CardDescription>消费力度画像分析</CardDescription>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={1200} lazy className="h-[300px] w-full">
              <ChartContainer config={emptyChartConfig} className="h-[300px] w-full">
                <BarChart data={data.histogram} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700} animationEasing="ease-out">
                    {data.histogram.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="count" position="top" fontSize={12} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </DelayedRender>
          </CardContent>
        </Card>
      </div>

      {/* Row 9: Transactions - Lazy Load */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base">交易明细</CardTitle>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded text-xs bg-black text-white">支出</button>
            <button className="px-3 py-1 rounded text-xs bg-gray-100">收入</button>
          </div>
        </CardHeader>
        <CardContent>
          <DelayedRender 
            delay={840}
            lazy 
            fallback={
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                   <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                     <div className="space-y-2">
                       <Skeleton className="h-4 w-32" />
                       <div className="flex gap-2">
                         <Skeleton className="h-3 w-16" />
                         <Skeleton className="h-3 w-12" />
                       </div>
                     </div>
                     <Skeleton className="h-5 w-20" />
                   </div>
                ))}
              </div>
            }
          >
            <div className="space-y-2">
              {filteredTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-sm">{t.merchant}</div>
                    <div className="text-xs text-gray-500 flex gap-2">
                      <span>{t.date}</span>
                      <span className="bg-gray-100 px-1 rounded">{t.category}</span>
                      <span>{t.platform === "wechat" ? "微信" : "支付宝"}</span>
                    </div>
                  </div>
                  <div className={cn("font-bold text-sm", t.type === "INCOME" ? "text-green-600" : "")}>
                    {t.type === "EXPENSE" ? "-" : "+"}¥{Number(t.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </DelayedRender>
        </CardContent>
      </Card>
    </div>
  );
}
