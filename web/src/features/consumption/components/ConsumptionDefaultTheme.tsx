import { useEffect, useState, useRef } from "react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  ComposedChart, 
  LabelList, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  XAxis, 
  YAxis,
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
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#07C160" />
      <ellipse cx="10" cy="10.2" rx="5.2" ry="3.9" fill="#FFFFFF" />
      <ellipse cx="14.6" cy="14.5" rx="4.4" ry="3.3" fill="#FFFFFF" />
      <circle cx="8.3" cy="9.8" r="0.7" fill="#07C160" />
      <circle cx="11.5" cy="9.8" r="0.7" fill="#07C160" />
      <circle cx="13.3" cy="14.2" r="0.6" fill="#07C160" />
      <circle cx="15.9" cy="14.2" r="0.6" fill="#07C160" />
    </svg>
  );
}

function AlipayOfficialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#1677FF" />
      <path
        fill="#FFFFFF"
        d="M7 8.1h10.1v1.8h-4v1.3h4.9V13h-3.2c1.1 1.2 2.3 2.2 3.7 2.9l-1.1 1.6c-1.5-.8-2.9-2-4.2-3.6V18h-2v-3.4c-1.5 1.4-3.2 2.5-5.2 3.3L5 16.3c1.9-.7 3.6-1.8 5-3.3H6.8v-1.8h4.4V9.9H7V8.1z"
      />
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If lazy, wait for intersection
    if (lazy) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            // Add a small delay even after intersection to prevent jank during scroll
            setTimeout(() => setShouldRender(true), delay);
            observer.disconnect();
          }
        },
        { rootMargin: "50px" } // Start loading slightly before view
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      
      return () => observer.disconnect();
    } 
    // If not lazy, just use timeout
    else {
      const timer = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay, lazy]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? (
        <div className="animate-in fade-in duration-500">{children}</div>
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

export function ConsumptionDefaultTheme({ data, dateRangeLabel }: ConsumptionViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("month");

  // Configs
  const commonConfig = {
    expense: { label: "支出", color: "var(--color-chart-1)" },
    income: { label: "收入", color: "var(--color-chart-2)" },
  } satisfies ChartConfig;

  // Filtered transactions
  const filteredTransactions = data.transactions.filter(t => {
    const matchesSearch = searchTerm === "" || 
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "all" || t.platform === platformFilter;
    // Date filter would typically need backend support or more complex client logic, 
    // for now we just show the selector UI as requested
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-6">
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

      {/* Row 2: Charts (3 cols) - Delay 200ms */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="col-span-1 flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-base">支付平台分布</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 relative">
            <DelayedRender 
              delay={200} 
              className="mx-auto h-[200px] w-[200px] flex items-center justify-center"
              fallback={<Skeleton className="h-[200px] w-[200px] rounded-full" />}
            >
              <ChartContainer config={{}} className="h-[200px] w-[200px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={data.platformDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={0}
                    labelLine={false}
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
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-xs">
               {data.platformDistribution.map((item, index) => (
                 <div key={index} className="flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                   <span className="text-gray-500">{item.name}</span>
                   <span className="font-medium">{(item.value / data.summary.totalExpense * 100).toFixed(0)}%</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-base">收支分析</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 relative">
            <DelayedRender 
              delay={200} 
              className="mx-auto h-[200px] w-[200px] flex items-center justify-center"
              fallback={<Skeleton className="h-[200px] w-[200px] rounded-full border-4 border-white" />}
            >
              <ChartContainer config={commonConfig} className="h-[200px] w-[200px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={data.incomeExpense}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    strokeWidth={5}
                    labelLine={false}
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
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-xs">
               {data.incomeExpense.map((item, index) => {
                 const total = data.incomeExpense.reduce((acc, curr) => acc + curr.value, 0);
                 return (
                   <div key={index} className="flex items-center gap-1">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                     <span className="text-gray-500">{item.name}</span>
                     <span className="font-medium">{(item.value / total * 100).toFixed(0)}%</span>
                   </div>
                 );
               })}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">热门商家 Top 10</CardTitle>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={200} className="h-[200px] w-full">
              <ChartContainer config={{}} className="h-[200px] w-full">
                <BarChart
                  accessibilityLayer
                  data={data.merchants}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
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
                  <Bar dataKey="total" layout="vertical" radius={4} barSize={20}>
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
          <CardContent>
            <DelayedRender delay={100} lazy className="h-[250px] w-full">
              <ChartContainer config={{ total: { label: "支出", color: "hsl(var(--chart-1))" } }} className="h-[250px] w-full">
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
                    minTickGap={32}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    dataKey="total"
                    type="monotone"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </DelayedRender>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">消费分类堆积</CardTitle>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={100} lazy className="h-[250px] w-full">
              <ChartContainer config={{}} className="h-[250px] w-full">
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
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </DelayedRender>
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
            <DelayedRender delay={100} lazy className="h-[250px] w-full">
              <ChartContainer config={{}} className="h-[250px] w-full">
                <ComposedChart data={data.pareto} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" scale="band" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" axisLine={false} tickLine={false} />
                  <ChartTooltip />
                  <Bar yAxisId="left" dataKey="value" barSize={30} radius={[4, 4, 0, 0]}>
                    {data.pareto.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} />
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
            <DelayedRender delay={100} lazy className="h-[250px] w-full">
              <div className="w-full h-[250px] flex flex-col justify-between">
                <div className="grid grid-cols-7 gap-3 text-center text-sm mb-2">
                  {["日", "一", "二", "三", "四", "五", "六"].map(d => (
                    <div key={d} className="font-bold text-gray-500">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 flex-1">
                  {/* Offset for first day of month (visual placeholder) */}
                  <div /> <div /> <div /> <div />
                  
                  {data.calendar.map((d) => {
                    const max = 2000;
                    const intensity = max > 0 ? d.value / max : 0;
                    const bg = intensity === 0 ? "bg-gray-50" :
                               intensity < 0.2 ? "bg-blue-100" :
                               intensity < 0.5 ? "bg-blue-300" :
                               intensity < 0.8 ? "bg-blue-500" : "bg-blue-700";
                    const text = intensity > 0.5 ? "text-white" : "text-gray-700";
                    
                    return (
                      <div 
                        key={d.date} 
                        className={cn("h-8 rounded-md flex flex-col items-center justify-center p-0.5 transition-transform hover:scale-105 shadow-sm", bg, text)}
                        title={`${d.date}: ¥${d.value}`}
                      >
                        <span className="font-bold text-xs mb-0.5">{d.day}</span>
                        {d.value > 0 && <span className="text-[10px] font-medium leading-none scale-90">¥{Math.round(d.value)}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
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
            <DelayedRender delay={100} lazy className="h-[250px] w-full">
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
                          const item = data.heatmap.data.find(i => i.platform === plat && i.category === cat);
                          const val = item ? Number(item.total) : 0;
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
            <CardTitle className="text-base">每日平均消费 (按周)</CardTitle>
          </CardHeader>
          <CardContent>
            <DelayedRender delay={100} lazy className="h-[250px] w-full">
              <ChartContainer config={commonConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={data.weekdayWeekend}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--color-chart-1)">
                    <LabelList dataKey="value" position="top" formatter={(v: number) => `¥${v.toFixed(0)}`} fontSize={12} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </DelayedRender>
          </CardContent>
        </Card>
      </div>

      {/* Row 6: Transactions - Lazy Load */}
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
            delay={100} 
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
              {data.transactions.map(t => (
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
