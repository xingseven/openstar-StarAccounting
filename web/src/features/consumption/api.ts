import { apiFetch } from "@/lib/api";
import type { ConsumptionData } from "@/features/consumption/components/ConsumptionDefaultTheme";

// API response types from backend
type SummaryResponse = {
  totalExpense: string;
  expenseCount: number;
  avgExpense: string;
};

type PlatformResponse = {
  items: Array<{ platform: string; total: string; count: number }>;
};

type CategoryResponse = {
  items: Array<{ category: string; total: string; count: number }>;
};

type MerchantResponse = {
  items: Array<{ merchant: string; total: string; count: number }>;
};

type DailyResponse = {
  items: Array<{ date: string; total: string }>;
};

type DailyCategoryResponse = {
  items: Array<{ date: string; category: string; total: string }>;
};

type PlatformCategoryResponse = {
  items: Array<{ platform: string; category: string; total: string }>;
};

type TransactionsResponse = {
  items: Array<{
    id: string;
    merchant: string;
    date: string;
    category: string;
    platform: string;
    type: string;
    amount: string;
  }>;
};

// Color palette for charts
const PLATFORM_COLORS: Record<string, string> = {
  wechat: "#3b82f6",
  alipay: "#1d4ed8",
  cloudpay: "#93c5fd",
  unknown: "#dbeafe",
};

const CATEGORY_COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];

// Platform display names
const PLATFORM_NAMES: Record<string, string> = {
  wechat: "微信",
  alipay: "支付宝",
  cloudpay: "云闪付",
  unknown: "其他",
};

// Fetch all consumption metrics from API
export async function fetchConsumptionData(startDate?: string, endDate?: string): Promise<ConsumptionData> {
  const queryParams = startDate || endDate
    ? `?${startDate ? `start=${startDate}` : ""}${endDate ? `&end=${endDate}` : ""}`
    : "";

  // Fetch all data in parallel (11 API calls)
  const [expenseSummary, incomeSummary, platformData, categoryData, merchantData, dailyData, dailyCategoryData, platformCategoryData, transactionsData, wechatIncomeData, alipayIncomeData] = await Promise.all([
    apiFetch<SummaryResponse>(`/api/metrics/consumption/summary?type=EXPENSE${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<SummaryResponse>(`/api/metrics/consumption/summary?type=INCOME${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<PlatformResponse>(`/api/metrics/consumption/by-platform?type=EXPENSE${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<CategoryResponse>(`/api/metrics/consumption/by-category?type=EXPENSE${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<MerchantResponse>(`/api/metrics/consumption/by-merchant?type=EXPENSE${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<DailyResponse>(`/api/metrics/consumption/daily?type=EXPENSE${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<DailyCategoryResponse>(`/api/metrics/consumption/daily-category?type=EXPENSE${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<PlatformCategoryResponse>(`/api/metrics/consumption/platform-category?type=EXPENSE${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<TransactionsResponse>(`/api/transactions${queryParams ? `?start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<PlatformResponse>(`/api/metrics/consumption/by-platform?type=INCOME${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
    apiFetch<PlatformResponse>(`/api/metrics/consumption/by-platform?type=INCOME${queryParams ? `&start=${startDate}&end=${endDate}` : ""}`),
  ]);

  // Extract wechat/alipay expense and income
  const wechatExpense = platformData.items.find(p => p.platform === "wechat");
  const alipayExpense = platformData.items.find(p => p.platform === "alipay");
  const wechatIncome = wechatIncomeData.items.find(p => p.platform === "wechat");
  const alipayIncome = alipayIncomeData.items.find(p => p.platform === "alipay");

  // Build summary
  const summary = {
    totalExpense: Number(expenseSummary.totalExpense),
    totalIncome: Number(incomeSummary.totalExpense),
    expenseCount: expenseSummary.expenseCount,
    wechat: {
      expense: Number(wechatExpense?.total ?? 0),
      income: Number(wechatIncome?.total ?? 0),
    },
    alipay: {
      expense: Number(alipayExpense?.total ?? 0),
      income: Number(alipayIncome?.total ?? 0),
    },
  };

  // Build platform distribution
  const platformDistribution = platformData.items.map((p, i) => ({
    name: PLATFORM_NAMES[p.platform] || p.platform,
    value: Number(p.total),
    fill: PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.unknown,
  }));

  // Build income vs expense
  const incomeExpense = [
    { name: "支出", value: summary.totalExpense, fill: "#3b82f6" },
    { name: "收入", value: summary.totalIncome, fill: "#1d4ed8" },
  ];

  // Build merchants (top 10 by total)
  const merchants = merchantData.items.slice(0, 10).map((m, i) => ({
    merchant: m.merchant,
    total: Number(m.total),
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  // Build trend (daily)
  const trend = dailyData.items.map(d => ({
    day: d.date,
    total: Number(d.total),
  }));

  // Build stacked bar (daily category breakdown)
  type StackedBarItem = { day: string; [key: string]: string | number };
  const categories = [...new Set(dailyCategoryData.items.map(d => d.category))];
  const stackedBar: StackedBarItem[] = dailyData.items.map(d => {
    const item = { day: d.date } as StackedBarItem;
    categories.forEach(cat => {
      const found = dailyCategoryData.items.find(
        dc => dc.date === d.date && dc.category === cat
      );
      item[cat] = found ? Number(found.total) : 0;
    });
    return item;
  });

  // Build pareto (category by total with cumulative percentage)
  const sortedCategories = categoryData.items
    .map(c => ({ name: c.category, value: Number(c.total) }))
    .sort((a, b) => b.value - a.value);

  let cumulative = 0;
  const totalCategoryValue = sortedCategories.reduce((acc, c) => acc + c.value, 0);
  const pareto = sortedCategories.map((c, i) => {
    cumulative += c.value;
    return {
      name: c.name,
      value: c.value,
      cumulativePercentage: totalCategoryValue > 0 ? (cumulative / totalCategoryValue) * 100 : 0,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    };
  });

  // Build weekday/weekend (aggregate daily data by day of week)
  const weekdayWeekendMap: Record<string, number> = {
    "周一": 0, "周二": 0, "周三": 0, "周四": 0, "周五": 0, "周六": 0, "周日": 0,
  };
  const weekdayWeekendCount: Record<string, number> = {
    "周一": 0, "周二": 0, "周三": 0, "周四": 0, "周五": 0, "周六": 0, "周日": 0,
  };
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  dailyData.items.forEach(d => {
    const date = new Date(d.date);
    const dayName = dayNames[date.getDay()];
    weekdayWeekendMap[dayName] += Number(d.total);
    weekdayWeekendCount[dayName]++;
  });
  const weekdayWeekend = Object.entries(weekdayWeekendMap).map(([name, total]) => ({
    name,
    value: weekdayWeekendCount[name] > 0 ? Math.round(total / weekdayWeekendCount[name]) : 0,
    fill: name === "周六" || name === "周日" ? "#1d4ed8" : "#93c5fd",
  }));

  // Build calendar (daily totals for the month)
  const calendar = dailyData.items.map(d => ({
    date: d.date,
    day: new Date(d.date).getDate(),
    value: Number(d.total),
  }));

  // Build heatmap (platform x category)
  const platforms = [...new Set(platformCategoryData.items.map(p => p.platform))];
  const heatmapCategories = [...new Set(platformCategoryData.items.map(p => p.category))];
  const heatmap = {
    platforms,
    categories: heatmapCategories,
    data: platformCategoryData.items.map(p => ({
      platform: p.platform,
      category: p.category,
      total: Number(p.total),
    })),
  };

  // Build sankey (simplified from category data)
  const sankeyNodes = [
    { name: "工资收入" },
    { name: "微信钱包" },
    { name: "支付宝" },
    ...heatmapCategories.map(c => ({ name: c })),
  ];
  const sankeyLinks: Array<{ source: number; target: number; value: number }> = [];
  platformData.items.forEach((p, pIdx) => {
    const sourceIdx = p.platform === "wechat" ? 1 : 2;
    heatmapCategories.forEach((cat, cIdx) => {
      const found = platformCategoryData.items.find(
        pc => pc.platform === p.platform && pc.category === cat
      );
      if (found && Number(found.total) > 0) {
        sankeyLinks.push({
          source: sourceIdx,
          target: 3 + cIdx,
          value: Number(found.total),
        });
      }
    });
  });

  // Build scatter (random distribution based on category totals for demo)
  const scatter = categoryData.items.flatMap((cat, i) => {
    const count = Math.min(cat.count, 10); // Limit points per category
    return Array.from({ length: count }, (_, j) => ({
      id: i * 10 + j,
      hour: Math.random() * 24,
      amount: Math.random() * Number(cat.total) * 0.2 + 10,
      category: cat.category,
    }));
  });

  // Build histogram (expense amount distribution)
  const histogram = [
    { range: "0-50", count: 0, fill: "#dbeafe" },
    { range: "50-200", count: 0, fill: "#93c5fd" },
    { range: "200-500", count: 0, fill: "#60a5fa" },
    { range: "500-1k", count: 0, fill: "#3b82f6" },
    { range: "1k-5k", count: 0, fill: "#2563eb" },
    { range: "5k+", count: 0, fill: "#1d4ed8" },
  ];
  // Calculate histogram from transactions
  transactionsData.items
    .filter(t => t.type === "EXPENSE")
    .forEach(t => {
      const amount = Number(t.amount);
      if (amount < 50) histogram[0].count++;
      else if (amount < 200) histogram[1].count++;
      else if (amount < 500) histogram[2].count++;
      else if (amount < 1000) histogram[3].count++;
      else if (amount < 5000) histogram[4].count++;
      else histogram[5].count++;
    });

  // Build transactions
  const transactions = transactionsData.items.map(t => ({
    id: t.id,
    merchant: t.merchant,
    date: t.date,
    category: t.category,
    platform: t.platform,
    type: t.type,
    amount: t.amount,
  }));

  return {
    summary,
    platformDistribution,
    incomeExpense,
    merchants,
    trend,
    stackedBar,
    pareto,
    weekdayWeekend,
    calendar,
    heatmap,
    sankey: { nodes: sankeyNodes, links: sankeyLinks },
    scatter,
    histogram,
    transactions,
  };
}
