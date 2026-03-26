// Mock Data for Consumption Page

export const MOCK_SUMMARY = {
  totalExpense: 12580.50,
  totalIncome: 25000.00,
  expenseCount: 42,
  wechat: { expense: 5230.00, income: 8000.00 },
  alipay: { expense: 7350.50, income: 17000.00 },
  comparison: {
    totalExpenseRate: 12.4,
    totalIncomeRate: 6.8,
    wechatExpenseRate: 4.9,
    wechatIncomeRate: 3.2,
    alipayExpenseRate: 18.7,
    alipayIncomeRate: 8.5,
  },
};

export const MOCK_PLATFORM_DISTRIBUTION = [
  { name: "微信", value: 5230, fill: "#3b82f6" },
  { name: "支付宝", value: 7350, fill: "#1d4ed8" },
  { name: "云闪付", value: 0, fill: "#93c5fd" },
];

export const MOCK_INCOME_EXPENSE = [
  { name: "支出", value: 12580, fill: "#3b82f6" },
  { name: "收入", value: 25000, fill: "#1d4ed8" },
];

export const MOCK_MERCHANTS = [
  { merchant: "京东商城", total: 2450 },
  { merchant: "山姆会员店", total: 1800 },
  { merchant: "中国石化", total: 1200 },
  { merchant: "美团外卖", total: 980 },
  { merchant: "星巴克", total: 650 },
  { merchant: "滴滴出行", total: 420 },
  { merchant: "瑞幸咖啡", total: 320 },
  { merchant: "全家便利店", total: 180 },
  { merchant: "肯德基", total: 150 },
  { merchant: "麦当劳", total: 120 },
].map((item, i) => {
  const colors = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];
  return { ...item, fill: colors[i % 5] };
});

export const MOCK_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: `2024-03-${String(i + 1).padStart(2, "0")}`,
  total: Math.floor(Math.random() * 1000) + 100,
}));

export const MOCK_STACKED_BAR = MOCK_TREND.slice(0, 14).map(d => ({
  day: d.day,
  "餐饮": Math.floor(d.total * 0.4),
  "购物": Math.floor(d.total * 0.3),
  "交通": Math.floor(d.total * 0.2),
  "娱乐": Math.floor(d.total * 0.1),
}));

export const MOCK_PARETO = [
  { name: "餐饮", value: 4500, cumulativePercentage: 35, fill: "#1d4ed8" },
  { name: "购物", value: 3200, cumulativePercentage: 60, fill: "#3b82f6" },
  { name: "住房", value: 2500, cumulativePercentage: 80, fill: "#60a5fa" },
  { name: "交通", value: 1200, cumulativePercentage: 90, fill: "#93c5fd" },
  { name: "娱乐", value: 800, cumulativePercentage: 96, fill: "#dbeafe" },
  { name: "医疗", value: 380, cumulativePercentage: 100, fill: "#eff6ff" },
];

export const MOCK_WEEKDAY_WEEKEND = [
  { name: "周一", value: 320, fill: "#93c5fd" },
  { name: "周二", value: 280, fill: "#93c5fd" },
  { name: "周三", value: 350, fill: "#93c5fd" },
  { name: "周四", value: 300, fill: "#93c5fd" },
  { name: "周五", value: 450, fill: "#60a5fa" },
  { name: "周六", value: 850, fill: "#1d4ed8" },
  { name: "周日", value: 780, fill: "#3b82f6" },
];

export const MOCK_CALENDAR = Array.from({ length: 35 }, (_, i) => ({
  date: `2024-03-${String(i + 1).padStart(2, "0")}`,
  day: i + 1,
  value: Math.floor(Math.random() * 2000),
})).filter(d => d.day <= 31);

export const MOCK_HEATMAP = {
  platforms: ["wechat", "alipay"],
  categories: ["餐饮", "购物", "交通", "娱乐", "居家", "医疗"],
  data: [
    { platform: "wechat", category: "餐饮", total: 1200 },
    { platform: "alipay", category: "餐饮", total: 800 },
    { platform: "wechat", category: "购物", total: 500 },
    { platform: "alipay", category: "购物", total: 2500 },
    { platform: "wechat", category: "交通", total: 300 },
    { platform: "alipay", category: "交通", total: 100 },
  ]
};

export const MOCK_TRANSACTIONS = [
  { id: "1", merchant: "京东商城", date: "2024-03-15 14:30", category: "购物", platform: "alipay", type: "EXPENSE", amount: "1299.00" },
  { id: "2", merchant: "星巴克", date: "2024-03-15 09:15", category: "餐饮", platform: "wechat", type: "EXPENSE", amount: "38.00" },
  { id: "3", merchant: "工资发放", date: "2024-03-10 10:00", category: "收入", platform: "alipay", type: "INCOME", amount: "15000.00" },
  { id: "4", merchant: "滴滴出行", date: "2024-03-14 18:45", category: "交通", platform: "wechat", type: "EXPENSE", amount: "45.50" },
  { id: "5", merchant: "山姆会员店", date: "2024-03-12 11:20", category: "购物", platform: "alipay", type: "EXPENSE", amount: "860.00" },
];

export const MOCK_SANKEY = {
  nodes: [
    { name: "工资收入" },      // 0
    { name: "理财收益" },      // 1
    { name: "微信钱包" },      // 2
    { name: "支付宝" },        // 3
    { name: "餐饮美食" },      // 4
    { name: "购物消费" },      // 5
    { name: "交通出行" },      // 6
    { name: "休闲娱乐" },      // 7
    { name: "生活服务" },      // 8
    // 第4级节点
    { name: "星巴克" },        // 9
    { name: "麦当劳" },        // 10
    { name: "瑞幸咖啡" },      // 11
    { name: "美团外卖" },      // 12
    { name: "京东商城" },      // 13
    { name: "淘宝" },          // 14
    { name: "拼多多" },        // 15
    { name: "滴滴出行" },      // 16
    { name: "地铁" },          // 17
    { name: "公交" },          // 18
    { name: "爱奇艺" },        // 19
    { name: "腾讯视频" },      // 20
    { name: "话费充值" },      // 21
    { name: "水电费" },        // 22
  ],
  links: [
    // 第1级 → 第2级
    { source: 0, target: 2, value: 8000 },
    { source: 0, target: 3, value: 12000 },
    { source: 1, target: 3, value: 5000 },
    // 第2级 → 第3级
    { source: 2, target: 4, value: 3000 },
    { source: 2, target: 6, value: 1500 },
    { source: 2, target: 8, value: 3500 },
    { source: 3, target: 5, value: 8000 },
    { source: 3, target: 7, value: 4000 },
    { source: 3, target: 4, value: 2000 },
    { source: 3, target: 6, value: 3000 },
    // 第3级 → 第4级（餐饮美食）
    { source: 4, target: 9, value: 800 },   // 餐饮 → 星巴克
    { source: 4, target: 10, value: 600 },  // 餐饮 → 麦当劳
    { source: 4, target: 11, value: 500 },  // 餐饮 → 瑞幸咖啡
    { source: 4, target: 12, value: 400 },  // 餐饮 → 美团外卖
    // 第3级 → 第4级（购物消费）
    { source: 5, target: 13, value: 2500 },  // 购物 → 京东商城
    { source: 5, target: 14, value: 1500 },  // 购物 → 淘宝
    { source: 5, target: 15, value: 800 },   // 购物 → 拼多多
    // 第3级 → 第4级（交通出行）
    { source: 6, target: 16, value: 2000 },  // 交通 → 滴滴出行
    { source: 6, target: 17, value: 1500 },  // 交通 → 地铁
    { source: 6, target: 18, value: 500 },   // 交通 → 公交
    // 第3级 → 第4级（休闲娱乐）
    { source: 7, target: 19, value: 1500 },  // 娱乐 → 爱奇艺
    { source: 7, target: 20, value: 1200 },  // 娱乐 → 腾讯视频
    // 第3级 → 第4级（生活服务）
    { source: 8, target: 21, value: 2000 },  // 生活 → 话费充值
    { source: 8, target: 22, value: 1500 },  // 生活 → 水电费
  ],
};

export const MOCK_SCATTER = Array.from({ length: 50 }, (_, i) => {
  const hour = Math.floor(Math.random() * 24);
  const isNight = hour < 6 || hour > 22;
  const baseAmount = isNight ? 200 : 50;
  return {
    id: i,
    hour: hour + Math.random() * 0.9, // 浮点数时间，如 14.5 = 14:30
    amount: Math.floor(Math.random() * 1000) + baseAmount,
    category: ["餐饮", "购物", "交通", "娱乐"][Math.floor(Math.random() * 4)],
  };
});

export const MOCK_HISTOGRAM = [
  { range: "0-50", count: 145, fill: "#dbeafe" },
  { range: "50-200", count: 86, fill: "#93c5fd" },
  { range: "200-500", count: 42, fill: "#60a5fa" },
  { range: "500-1k", count: 18, fill: "#3b82f6" },
  { range: "1k-5k", count: 8, fill: "#2563eb" },
  { range: "5k+", count: 2, fill: "#1d4ed8" },
];
