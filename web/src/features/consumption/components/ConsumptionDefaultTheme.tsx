import { useEffect, useMemo, useRef, useState } from "react";
// Recharts imports removed for performance optimization
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { siAlipay, siWechat } from "simple-icons";
import dynamic from "next/dynamic";
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

  const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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
            "h-full w-full transition-opacity duration-500 ease-out",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {children}
        </div>
      ) : fallback ? (
        fallback
      ) : null}
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

  const incomeExpenseTotal = useMemo(
    () => data.incomeExpense.reduce((acc, curr) => acc + curr.value, 0),
    [data.incomeExpense]
  );
  const lowerSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
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
    let timeoutId: NodeJS.Timeout;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const debouncedCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 200);
    };

    checkMobile();
    window.addEventListener('resize', debouncedCheckMobile);
    
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // Find the main scroll container
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    let ticking = false;
    let lastScrollTop = mainContent.scrollTop;

    const handleScroll = () => {
      lastScrollTop = mainContent.scrollTop;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowFloatingFilter(lastScrollTop > 200);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive event listener for better scrolling performance
    mainContent.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
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

  // Refs for ECharts instances
  const chartsRef = useRef<any[]>([]);
  const addChartRef = (el: any) => {
    if (el && !chartsRef.current.includes(el)) {
      chartsRef.current.push(el);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      chartsRef.current.forEach((chart) => {
        if (chart?.getEchartsInstance) {
          chart.getEchartsInstance().resize();
        }
      });
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 200);
    };

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto relative">
      {/* Floating Filter Button */}
      <div 
        className={cn(
          "fixed bottom-8 right-8 z-50 transition-all duration-300 transform",
          showFloatingFilter ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <button 
              type="button" 
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            >
              <Filter className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 sm:w-80 p-3 sm:p-4 mr-4 sm:mr-8 mb-4" side="top" align="end">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium leading-none text-sm sm:text-base">快捷筛选</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] sm:text-xs text-gray-500">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="搜索..."
                      className="pl-9 h-8 sm:h-9 text-xs sm:text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] sm:text-xs text-gray-500">平台</Label>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
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
                  <Label className="text-[10px] sm:text-xs text-gray-500">时间</Label>
                  <div className="flex items-center gap-2 border rounded-md p-1">
                    <button 
                      onClick={() => setDateFilter("month")}
                      className={cn("flex-1 px-2 py-1 text-[10px] sm:text-xs rounded font-medium transition-colors", dateFilter === "month" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900")}
                    >
                      本月
                    </button>
                    <div className="h-3 w-px bg-gray-200" />
                    <span className="flex-1 text-center text-[10px] sm:text-xs text-gray-500 px-1 truncate">{dateRangeLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900">消费分析</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">全方位洞察您的收支状况</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜索消费明细..."
              className="pl-9 w-full bg-white h-9 sm:h-10 text-xs sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Platform Filter */}
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[100px] sm:w-[140px] bg-white h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="所有平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有平台</SelectItem>
              <SelectItem value="wechat">微信</SelectItem>
              <SelectItem value="alipay">支付宝</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <div className="hidden sm:flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
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
      <div className="grid gap-2 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow h-auto min-h-[80px] sm:min-h-[45px] py-1 sm:py-2">
          <ShoppingBag className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 text-orange-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-1 sm:p-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">总消费金额</CardTitle>
          </CardHeader>
          <CardContent className="p-1 sm:p-2 pt-0 pb-1 sm:pb-2">
            <div className="text-lg sm:text-lg font-bold text-gray-900">¥{data.summary.totalExpense.toLocaleString()}</div>
            <p className="text-[10px] sm:text-[10px] text-gray-500">共 {data.summary.expenseCount} 笔支出</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow h-auto min-h-[80px] sm:min-h-[45px] py-1 sm:py-2">
          <Wallet className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 text-blue-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-1 sm:p-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">本月收支</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-0.5 sm:gap-1 p-1 sm:p-2 pt-0 pb-1 sm:pb-2">
            <div>
              <div className="text-[10px] sm:text-[10px] text-gray-500 flex items-center gap-0.5"><ArrowDownIcon className="h-2 w-2 sm:h-2 sm:w-2 text-green-500" /> 收入</div>
              <div className="text-base sm:text-lg font-semibold text-green-600">¥{data.summary.totalIncome.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[10px] text-gray-500 flex items-center gap-0.5"><ArrowUpIcon className="h-2 w-2 sm:h-2 sm:w-2 text-red-500" /> 支出</div>
              <div className="text-base sm:text-lg font-semibold text-red-600">¥{data.summary.totalExpense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-[#07C160] shadow-sm hover:shadow-md transition-shadow h-auto min-h-[80px] sm:min-h-[45px] py-1 sm:py-2">
          <WechatOfficialIcon className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 opacity-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-1 sm:p-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">微信收支</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-0.5 sm:gap-1 p-1 sm:p-2 pt-0 pb-1 sm:pb-2">
            <div>
              <div className="text-[10px] sm:text-[10px] text-gray-500">收入</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">¥{data.summary.wechat.income.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[10px] text-gray-500">支出</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">¥{data.summary.wechat.expense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-[#1677FF] shadow-sm hover:shadow-md transition-shadow h-auto min-h-[80px] sm:min-h-[45px] py-1 sm:py-2">
          <AlipayOfficialIcon className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 opacity-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-1 sm:p-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">支付宝收支</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-0.5 sm:gap-1 p-1 sm:p-2 pt-0 pb-1 sm:pb-2">
            <div>
              <div className="text-[10px] sm:text-[10px] text-gray-500">收入</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">¥{data.summary.alipay.income.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[10px] text-gray-500">支出</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">¥{data.summary.alipay.expense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts (3 cols) */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="col-span-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">支付平台分布</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-1 pt-0 px-0 relative flex flex-col items-center justify-center md:block md:p-6 md:pt-0">
            <DelayedRender
              delay={80}
              className="mx-auto h-[125px] w-[125px] flex items-center justify-center md:h-[200px] md:w-[200px]"
              fallback={<Skeleton className="h-[125px] w-[125px] md:h-[200px] md:w-[200px] rounded-full" />}
            >
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: { trigger: 'item' },
                  series: [{
                    name: '平台分布',
                    type: 'pie',
                    radius: ['0%', '70%'],
                    label: { show: false },
                    data: data.platformDistribution.map(item => ({
                      value: item.value,
                      name: item.name,
                      itemStyle: { color: item.fill }
                    })),
                    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
              />
            </DelayedRender>
            <div className="w-full flex justify-center mt-2 md:absolute md:bottom-4 md:right-4 md:w-auto md:mt-0 md:justify-end">
              <div className="flex flex-col gap-1 text-[10px] md:text-xs">
                 {data.platformDistribution.map((item, index) => (
                   <div key={index} className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                     <span className="text-gray-500">{item.name}</span>
                     <span className="font-medium">{(item.value / data.summary.totalExpense * 100).toFixed(0)}%</span>
                   </div>
                 ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">收支分析</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-1 pt-0 px-0 relative flex flex-col items-center justify-center md:block md:p-6 md:pt-0">
            <DelayedRender
              delay={220}
              className="mx-auto h-[125px] w-[125px] flex items-center justify-center md:h-[200px] md:w-[200px]"
              fallback={<Skeleton className="h-[125px] w-[125px] md:h-[200px] md:w-[200px] rounded-full border-4 border-white" />}
            >
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: { trigger: 'item' },
                  series: [{
                    name: '收支分析',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    label: { show: false },
                    data: data.incomeExpense.map(item => ({
                      value: item.value,
                      name: item.name,
                      itemStyle: { color: item.fill }
                    })),
                    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
              />
            </DelayedRender>
            <div className="w-full flex justify-center mt-2 md:absolute md:bottom-4 md:right-4 md:w-auto md:mt-0 md:justify-end">
              <div className="flex flex-col gap-1 text-[10px] md:text-xs">
                 {data.incomeExpense.map((item, index) => {
                   return (
                     <div key={index} className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
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
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                  grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
                  xAxis: { type: 'value', show: false },
                  yAxis: { 
                    type: 'category', 
                    data: data.merchants.map(m => m.merchant),
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { fontSize: 12, color: '#666' }
                  },
                  series: [{
                    name: '消费金额',
                    type: 'bar',
                    data: data.merchants.map(m => ({
                      value: m.total,
                      itemStyle: { color: m.fill, borderRadius: [0, 4, 4, 0] }
                    })),
                    barWidth: 12,
                    label: { show: true, position: 'right', formatter: '¥{c}' }
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
              />
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
                <ReactECharts
                  ref={addChartRef}
                  autoResize={false}
                  option={{
                    tooltip: { trigger: 'axis' },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: { 
                      type: 'category', 
                      boundaryGap: false, 
                      data: data.trend.map(t => t.day.slice(5)),
                      axisLine: { show: false },
                      axisTick: { show: false }
                    },
                    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed' } } },
                    series: [{
                    name: '支出',
                    type: 'line',
                    data: data.trend.map(t => t.total),
                    smooth: true,
                    itemStyle: { color: '#3b82f6' },
                    areaStyle: { opacity: 0.1, color: '#3b82f6' }
                  }]
                  }}
                  style={{ height: '100%', width: '100%' }}
                />
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
                <ReactECharts
                  ref={addChartRef}
                  autoResize={false}
                  option={{
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                    legend: { data: ["餐饮", "购物", "交通", "娱乐"], bottom: 0 },
                    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
                    xAxis: { 
                      type: 'category', 
                      data: data.stackedBar.map(t => t.day.slice(8)),
                      axisLine: { show: false },
                      axisTick: { show: false }
                    },
                    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed' } } },
                    series: ["餐饮", "购物", "交通", "娱乐"].map((key, i) => {
                      const colors = ['#1d4ed8', '#3b82f6', '#93c5fd', '#dbeafe'];
                      return {
                        name: key,
                        type: 'bar',
                        stack: 'total',
                        data: data.stackedBar.map(t => t[key]),
                        itemStyle: { 
                          color: colors[i],
                          borderRadius: i === 3 ? [4, 4, 0, 0] : [0, 0, 0, 0] 
                        }
                      };
                    })
                  }}
                  style={{ height: '100%', width: '100%' }}
                />
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
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                  grid: { left: '3%', right: '3%', bottom: '3%', containLabel: true },
                  xAxis: { 
                    type: 'category', 
                    data: data.pareto.map(t => t.name),
                    axisLine: { show: false },
                    axisTick: { show: false }
                  },
                  yAxis: [
                    { type: 'value', name: '金额', position: 'left', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed' } } },
                    { type: 'value', name: '占比', min: 0, max: 100, position: 'right', axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { formatter: '{value} %' } }
                  ],
                  series: [
                    {
                      name: '金额',
                      type: 'bar',
                      data: data.pareto.map(t => ({ value: t.value, itemStyle: { color: t.fill } })),
                      barWidth: '60%',
                      itemStyle: { borderRadius: [4, 4, 0, 0] }
                    },
                    {
                      name: '累计占比',
                      type: 'line',
                      yAxisIndex: 1,
                      data: data.pareto.map(t => t.cumulativePercentage),
                      smooth: true,
                      itemStyle: { color: '#fb923c' } // Use an orange/amber color for contrast against blue bars
                    }
                  ]
                }}
                style={{ height: '100%', width: '100%' }}
              />
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
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                  grid: { left: '3%', right: '3%', bottom: '10%', top: '15%', containLabel: true },
                  xAxis: { 
                    type: 'category', 
                    data: data.weekdayWeekend.map((item, index) => {
                      const weekDates = getWeekDates(selectedWeek);
                      const dateInfo = weekDates[index];
                      return `${item.name}\n${dateInfo ? `${dateInfo.month}月${dateInfo.day}日` : ''}`;
                    }),
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { 
                      interval: 0,
                      lineHeight: 16,
                      color: '#666',
                      fontSize: 12
                    }
                  },
                  yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed' } } },
                  series: [{
                    name: '平均消费',
                    type: 'bar',
                    data: data.weekdayWeekend.map(t => t.value),
                    itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '¥{c}' }
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
              />
            </DelayedRender>
          </CardContent>
        </Card>
      </div>

      {/* Row 7: Sankey Diagram - ECharts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">资金流向 (桑基图)</CardTitle>
          <CardDescription>收入来源 ➔ 支付账户 ➔ 支出去向</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[900px] md:w-full">
            <DelayedRender delay={960} className="h-[450px] w-full">
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove',
                  },
                  series: [
                    {
                      type: 'sankey',
                      layout: 'sankey',
                      emphasis: {
                        focus: 'adjacency',
                      },
                      nodeAlign: 'left',
                      left: '2%',
                      right: '10%',
                      top: '5%',
                      bottom: '5%',
                      nodeWidth: 22,
                      nodeGap: 12,
                      layoutIterations: 32,
                      draggable: false,
                      data: data.sankey.nodes.map((node, index) => {
                           const colors = [
                             '#166534', // 0: 工资收入 - 深绿
                             '#15803D', // 1: 理财收益 - 深绿
                             '#07C160', // 2: 微信钱包 - 绿色
                             '#1677FF', // 3: 支付宝 - 蓝色
                             '#22C55E', // 4: 餐饮美食 - 绿色
                             '#3B82F6', // 5: 购物消费 - 蓝色
                             '#06B6D4', // 6: 交通出行 - 青色
                             '#14B8A6', // 7: 休闲娱乐 - 青色
                             '#0EA5E9', // 8: 生活服务 - 浅蓝
                             // 第4级 - 浅绿色系
                             '#4ADE80', // 9: 星巴克
                             '#86EFAC', // 10: 麦当劳
                             '#A7F3D0', // 11: 瑞幸咖啡
                             '#BBF7D0', // 12: 美团外卖
                             '#93C5FD', // 13: 京东商城
                             '#BFDBFE', // 14: 淘宝
                             '#C7D2FE', // 15: 拼多多
                             '#99F6E4', // 16: 滴滴出行
                             '#CCFBF1', // 17: 地铁
                             '#E0F2FE', // 18: 公交
                             '#F0F9FF', // 19: 爱奇艺
                             '#F1F5F9', // 20: 腾讯视频
                             '#F8FAFC', // 21: 话费充值
                             '#FCFCFD', // 22: 水电费
                           ];
                           return {
                             name: node.name,
                             itemStyle: {
                               color: colors[index] || '#4ADE80',
                             },
                           };
                         }),
                      links: data.sankey.links.map(link => ({
                        source: data.sankey.nodes[link.source].name,
                        target: data.sankey.nodes[link.target].name,
                        value: link.value,
                      })),
                      lineStyle: {
                        color: 'gradient',
                        curveness: 0.5,
                        opacity: 0.4,
                      },
                      label: {
                        show: true,
                        position: 'right',
                        fontSize: 12,
                        color: '#333',
                        formatter: '{b}',
                      },
                    },
                  ],
                }}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
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
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: {
                    trigger: 'item',
                    formatter: (params: any) => {
                      const v = params.value;
                      return `${v[0]}点<br/>金额: ¥${v[1]}<br/>分类: ${v[2]}`;
                    }
                  },
                  grid: { left: '3%', right: '7%', bottom: '3%', top: '10%', containLabel: true },
                  xAxis: { type: 'value', min: 0, max: 24, name: '时间', splitLine: { show: false } },
                  yAxis: { type: 'value', name: '金额', splitLine: { lineStyle: { type: 'dashed' } } },
                  series: [{
                    name: '消费记录',
                    type: 'scatter',
                    data: data.scatter.map(item => [item.hour, item.amount, item.category]),
                    symbolSize: (val: any[]) => Math.max(Math.min(val[1] / 10, 20), 5),
                    itemStyle: { color: '#3b82f6', opacity: 0.7 }
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
              />
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
              <ReactECharts
                ref={addChartRef}
                autoResize={false}
                option={{
                  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                  grid: { left: '3%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
                  xAxis: { 
                    type: 'category', 
                    data: data.histogram.map(h => h.range),
                    axisLine: { show: false },
                    axisTick: { show: false }
                  },
                  yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed' } } },
                  series: [{
                    name: '笔数',
                    type: 'bar',
                    data: data.histogram.map(h => ({ value: h.count, itemStyle: { color: h.fill, borderRadius: [4, 4, 0, 0] } })),
                    label: { show: true, position: 'top' },
                    barWidth: '60%'
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
              />
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
