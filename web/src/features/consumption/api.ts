import { apiFetch } from "@/lib/api";
import type { ConsumptionData } from "@/features/consumption/components/ConsumptionDefaultTheme";

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
  items: Array<{ day?: string; date?: string; total: string; count?: number }>;
};

type DailyCategoryResponse = {
  items: Array<{ day?: string; date?: string; category: string; total: string }>;
};

type PlatformCategoryResponse = {
  items: Array<{ platform: string; category: string; total: string }>;
};

type TransactionsResponse = {
  items: Array<{
    id: string;
    merchant: string | null;
    date: string;
    category: string;
    platform: string;
    type: string;
    amount: string;
  }>;
};

type PlatformKey = "wechat" | "alipay" | "cloudpay" | "unknown";

const PLATFORM_COLORS: Record<PlatformKey, string> = {
  wechat: "#16a34a",
  alipay: "#1677ff",
  cloudpay: "#0ea5e9",
  unknown: "#94a3b8",
};

const CATEGORY_COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];

const PLATFORM_NAMES: Record<PlatformKey, string> = {
  wechat: "微信",
  alipay: "支付宝",
  cloudpay: "云闪付",
  unknown: "其他",
};

function normalizePlatform(platform: string | null | undefined): PlatformKey {
  const value = (platform ?? "").trim().toLowerCase();
  if (!value) return "unknown";
  if (value === "wechat" || value.includes("微信")) return "wechat";
  if (value === "alipay" || value.includes("支付宝")) return "alipay";
  if (
    value === "cloudpay"
    || value === "unionpay"
    || value.includes("云闪付")
    || value.includes("银联")
  ) {
    return "cloudpay";
  }
  return "unknown";
}

function getPlatformName(platform: PlatformKey) {
  return PLATFORM_NAMES[platform];
}

function getDayKey(item: { day?: string; date?: string }) {
  return item.day || item.date || "";
}

function buildPath(path: string, params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

async function fetchOptional<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiFetch<T>(path);
  } catch (error) {
    console.warn(`Failed to fetch ${path}, using fallback data`, error);
    return fallback;
  }
}

function aggregatePlatforms(items: PlatformResponse["items"]) {
  const map = new Map<PlatformKey, { total: number; count: number }>();

  for (const item of items) {
    const key = normalizePlatform(item.platform);
    const current = map.get(key) ?? { total: 0, count: 0 };
    current.total += Number(item.total ?? 0);
    current.count += item.count ?? 0;
    map.set(key, current);
  }

  return map;
}

function aggregatePlatformCategories(items: PlatformCategoryResponse["items"]) {
  const map = new Map<string, { platform: PlatformKey; category: string; total: number }>();

  for (const item of items) {
    const platform = normalizePlatform(item.platform);
    const category = item.category || "未分类";
    const id = `${platform}__${category}`;
    const current = map.get(id) ?? { platform, category, total: 0 };
    current.total += Number(item.total ?? 0);
    map.set(id, current);
  }

  return Array.from(map.values());
}

export async function fetchConsumptionData(startDate?: string, endDate?: string): Promise<ConsumptionData> {
  const expenseSummaryPath = buildPath("/api/metrics/consumption/summary", {
    type: "EXPENSE",
    startDate,
    endDate,
  });
  const incomeSummaryPath = buildPath("/api/metrics/consumption/summary", {
    type: "INCOME",
    startDate,
    endDate,
  });
  const transactionsPath = buildPath("/api/transactions", {
    startDate,
    endDate,
  });

  const [expenseSummary, incomeSummary, transactionsData] = await Promise.all([
    apiFetch<SummaryResponse>(expenseSummaryPath),
    apiFetch<SummaryResponse>(incomeSummaryPath),
    apiFetch<TransactionsResponse>(transactionsPath),
  ]);

  const [
    platformData,
    categoryData,
    merchantData,
    dailyData,
    dailyCategoryData,
    platformCategoryData,
    incomePlatformData,
  ] = await Promise.all([
    fetchOptional<PlatformResponse>(
      buildPath("/api/metrics/consumption/by-platform", { type: "EXPENSE", startDate, endDate }),
      { items: [] },
    ),
    fetchOptional<CategoryResponse>(
      buildPath("/api/metrics/consumption/by-category", { type: "EXPENSE", startDate, endDate }),
      { items: [] },
    ),
    fetchOptional<MerchantResponse>(
      buildPath("/api/metrics/consumption/by-merchant", { type: "EXPENSE", startDate, endDate }),
      { items: [] },
    ),
    fetchOptional<DailyResponse>(
      buildPath("/api/metrics/consumption/daily", { type: "EXPENSE", startDate, endDate }),
      { items: [] },
    ),
    fetchOptional<DailyCategoryResponse>(
      buildPath("/api/metrics/consumption/daily-category", { type: "EXPENSE", startDate, endDate }),
      { items: [] },
    ),
    fetchOptional<PlatformCategoryResponse>(
      buildPath("/api/metrics/consumption/platform-category", { type: "EXPENSE", startDate, endDate }),
      { items: [] },
    ),
    fetchOptional<PlatformResponse>(
      buildPath("/api/metrics/consumption/by-platform", { type: "INCOME", startDate, endDate }),
      { items: [] },
    ),
  ]);

  const expensePlatformTotals = aggregatePlatforms(platformData.items);
  const incomePlatformTotals = aggregatePlatforms(incomePlatformData.items);

  const summary = {
    totalExpense: Number(expenseSummary.totalExpense),
    totalIncome: Number(incomeSummary.totalExpense),
    expenseCount: expenseSummary.expenseCount,
    wechat: {
      expense: expensePlatformTotals.get("wechat")?.total ?? 0,
      income: incomePlatformTotals.get("wechat")?.total ?? 0,
    },
    alipay: {
      expense: expensePlatformTotals.get("alipay")?.total ?? 0,
      income: incomePlatformTotals.get("alipay")?.total ?? 0,
    },
  };

  const platformDistribution = Array.from(expensePlatformTotals.entries())
    .filter(([, value]) => value.total > 0)
    .map(([platform, value]) => ({
      name: getPlatformName(platform),
      value: value.total,
      fill: PLATFORM_COLORS[platform],
    }));

  const incomeExpense = [
    { name: "支出", value: summary.totalExpense, fill: "#ef4444" },
    { name: "收入", value: summary.totalIncome, fill: "#16a34a" },
  ];

  const merchants = merchantData.items.slice(0, 10).map((item, index) => ({
    merchant: item.merchant || "未知商户",
    total: Number(item.total),
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const trend = dailyData.items
    .map((item) => ({
      day: getDayKey(item),
      total: Number(item.total),
    }))
    .filter((item) => item.day);

  type StackedBarItem = { day: string; [key: string]: string | number };
  const dailyCategoryItems = dailyCategoryData.items
    .map((item) => ({
      day: getDayKey(item),
      category: item.category || "未分类",
      total: Number(item.total),
    }))
    .filter((item) => item.day);
  const categories = [...new Set(dailyCategoryItems.map((item) => item.category))];
  const stackedBar: StackedBarItem[] = trend.map((item) => {
    const row = { day: item.day } as StackedBarItem;
    categories.forEach((category) => {
      const found = dailyCategoryItems.find(
        (dailyCategoryItem) => dailyCategoryItem.day === item.day && dailyCategoryItem.category === category,
      );
      row[category] = found ? found.total : 0;
    });
    return row;
  });

  const sortedCategories = categoryData.items
    .map((item) => ({ name: item.category, value: Number(item.total) }))
    .sort((a, b) => b.value - a.value);

  let cumulative = 0;
  const totalCategoryValue = sortedCategories.reduce((total, item) => total + item.value, 0);
  const pareto = sortedCategories.map((item, index) => {
    cumulative += item.value;
    return {
      name: item.name,
      value: item.value,
      cumulativePercentage: totalCategoryValue > 0 ? (cumulative / totalCategoryValue) * 100 : 0,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    };
  });

  const weekdayWeekendMap: Record<string, number> = {
    "周一": 0,
    "周二": 0,
    "周三": 0,
    "周四": 0,
    "周五": 0,
    "周六": 0,
    "周日": 0,
  };
  const weekdayWeekendCount: Record<string, number> = {
    "周一": 0,
    "周二": 0,
    "周三": 0,
    "周四": 0,
    "周五": 0,
    "周六": 0,
    "周日": 0,
  };
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  trend.forEach((item) => {
    const date = new Date(item.day);
    const dayName = dayNames[date.getDay()];
    weekdayWeekendMap[dayName] += item.total;
    weekdayWeekendCount[dayName] += 1;
  });
  const weekdayWeekend = Object.entries(weekdayWeekendMap).map(([name, total]) => ({
    name,
    value: weekdayWeekendCount[name] > 0 ? Math.round(total / weekdayWeekendCount[name]) : 0,
    fill: name === "周六" || name === "周日" ? "#1d4ed8" : "#93c5fd",
  }));

  const calendar = trend.map((item) => ({
    date: item.day,
    day: new Date(item.day).getDate(),
    value: item.total,
  }));

  const heatmapRows = aggregatePlatformCategories(platformCategoryData.items);
  const heatmapPlatforms = [...new Set(heatmapRows.map((item) => getPlatformName(item.platform)))];
  const heatmapCategories = [...new Set(heatmapRows.map((item) => item.category))];
  const heatmap = {
    platforms: heatmapPlatforms,
    categories: heatmapCategories,
    data: heatmapRows.map((item) => ({
      platform: getPlatformName(item.platform),
      category: item.category,
      total: item.total,
    })),
  };

  const sankeyNodes = [
    ...heatmap.platforms.map((name) => ({ name })),
    ...heatmap.categories.map((name) => ({ name })),
  ];
  const platformIndexMap = new Map(heatmap.platforms.map((name, index) => [name, index]));
  const categoryOffset = heatmap.platforms.length;
  const sankeyLinks: Array<{ source: number; target: number; value: number }> = heatmap.data
    .map((item) => {
      const source = platformIndexMap.get(item.platform);
      const targetCategoryIndex = heatmap.categories.indexOf(item.category);
      if (source === undefined || targetCategoryIndex < 0) return null;
      return {
        source,
        target: categoryOffset + targetCategoryIndex,
        value: item.total,
      };
    })
    .filter((item): item is { source: number; target: number; value: number } => item !== null);

  const scatter = categoryData.items.flatMap((item, index) => {
    const count = Math.min(item.count, 10);
    return Array.from({ length: count }, (_, pointIndex) => ({
      id: index * 10 + pointIndex,
      hour: Math.random() * 24,
      amount: Math.random() * Number(item.total) * 0.2 + 10,
      category: item.category,
    }));
  });

  const histogram = [
    { range: "0-50", count: 0, fill: "#dbeafe" },
    { range: "50-200", count: 0, fill: "#93c5fd" },
    { range: "200-500", count: 0, fill: "#60a5fa" },
    { range: "500-1k", count: 0, fill: "#3b82f6" },
    { range: "1k-5k", count: 0, fill: "#2563eb" },
    { range: "5k+", count: 0, fill: "#1d4ed8" },
  ];
  transactionsData.items
    .filter((item) => item.type === "EXPENSE")
    .forEach((item) => {
      const amount = Number(item.amount);
      if (amount < 50) histogram[0].count++;
      else if (amount < 200) histogram[1].count++;
      else if (amount < 500) histogram[2].count++;
      else if (amount < 1000) histogram[3].count++;
      else if (amount < 5000) histogram[4].count++;
      else histogram[5].count++;
    });

  const transactions = transactionsData.items.map((item) => ({
    id: item.id,
    merchant: item.merchant || "未知商户",
    date: item.date,
    category: item.category,
    platform: normalizePlatform(item.platform),
    type: item.type,
    amount: item.amount,
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
