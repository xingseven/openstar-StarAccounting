/**
 * 统一模拟数据模块
 * 用于所有页面的展示/演示
 */

import type { DashboardData, BudgetAlert, Asset, Loan, SavingsGoal } from "@/types";
import type { ConsumptionData } from "@/features/consumption/components/ConsumptionDefaultTheme";
import {
  MOCK_SUMMARY,
  MOCK_PLATFORM_DISTRIBUTION,
  MOCK_INCOME_EXPENSE,
  MOCK_MERCHANTS,
  MOCK_TREND,
  MOCK_TREND_YEARLY,
  MOCK_STACKED_BAR,
  MOCK_PARETO,
  MOCK_WEEKDAY_WEEKEND,
  MOCK_CALENDAR,
  MOCK_HEATMAP,
  MOCK_SANKEY,
  MOCK_SCATTER,
  MOCK_HISTOGRAM,
  MOCK_TRANSACTIONS,
} from "@/features/consumption/mockData";

// ============= Dashboard 模拟数据 =============
export const MOCK_DASHBOARD: DashboardData = {
  totalAssets: 285000,
  totalDebt: 125000,
  monthExpense: 8560,
  monthIncome: 25000,
  lastMonthExpense: 7980,
  lastMonthIncome: 23800,
  monthSavingsIncome: 5000,
  monthSavingsExpense: 1200,
  recentTransactions: [
    { id: "1", date: "2024-03-15 14:30", type: "EXPENSE", amount: "1299.00", category: "购物", platform: "alipay", merchant: "京东商城" },
    { id: "2", date: "2024-03-15 09:15", type: "EXPENSE", amount: "38.00", category: "餐饮", platform: "wechat", merchant: "星巴克" },
    { id: "3", date: "2024-03-14 18:45", type: "EXPENSE", amount: "45.50", category: "交通", platform: "wechat", merchant: "滴滴出行" },
    { id: "4", date: "2024-03-13 11:20", type: "INCOME", amount: "500.00", category: "收入", platform: "alipay", merchant: "兼职收入" },
    { id: "5", date: "2024-03-12 20:00", type: "EXPENSE", amount: "68.00", category: "娱乐", platform: "wechat", merchant: "爱奇艺" },
  ],
  budgetAlerts: [
    { id: "1", category: "餐饮", period: "monthly", scopeType: "category", amount: "3000", used: "2450", percent: 81.67, status: "warning", alertPercent: 80 },
    { id: "2", category: "购物", period: "monthly", scopeType: "category", amount: "5000", used: "5200", percent: 104, status: "overdue", alertPercent: 100 },
  ] as BudgetAlert[],
};

// ============= Assets 模拟数据 =============
export const MOCK_ASSETS: Asset[] = [
  { id: "1", name: "招商银行储蓄卡", type: "BANK_CARD", balance: 45000, currency: "CNY", estimatedValue: 45000 },
  { id: "2", name: "工商银行信用卡", type: "CREDIT_CARD", balance: -8500, currency: "CNY", estimatedValue: -8500 },
  { id: "3", name: "支付宝", type: "ALIPAY", balance: 12000, currency: "CNY", estimatedValue: 12000 },
  { id: "4", name: "微信钱包", type: "WECHAT", balance: 3500, currency: "CNY", estimatedValue: 3500 },
  { id: "5", name: "余额宝", type: "INVESTMENT", balance: 35000, currency: "CNY", estimatedValue: 35000 },
  { id: "6", name: "基金定投", type: "INVESTMENT", balance: 28000, currency: "CNY", estimatedValue: 28000 },
  { id: "7", name: "现金", type: "CASH", balance: 2000, currency: "CNY", estimatedValue: 2000 },
];

// ============= Loans 模拟数据 =============
export const MOCK_LOANS: Loan[] = [
  {
    id: "1",
    platform: "招商银行房贷",
    totalAmount: 2000000,
    remainingAmount: 1250000,
    periods: 360,
    paidPeriods: 120,
    monthlyPayment: 8500,
    dueDate: 5,
    status: "ACTIVE",
    createdAt: "2019-01-15",
  },
  {
    id: "2",
    platform: "车贷-工商银行",
    totalAmount: 150000,
    remainingAmount: 85000,
    periods: 36,
    paidPeriods: 18,
    monthlyPayment: 4500,
    dueDate: 20,
    status: "ACTIVE",
    createdAt: "2022-06-01",
  },
  {
    id: "3",
    platform: "花呗",
    totalAmount: 10000,
    remainingAmount: 2500,
    periods: 12,
    paidPeriods: 10,
    monthlyPayment: 850,
    dueDate: 1,
    status: "ACTIVE",
    createdAt: "2024-01-01",
  },
];

export const MOCK_LOANS_PLATFORM_DATA = [
  { name: "房贷", value: 1250000, fill: "#1d4ed8" },
  { name: "车贷", value: 85000, fill: "#3b82f6" },
  { name: "花呗", value: 2500, fill: "#60a5fa" },
  { name: "信用贷", value: 0, fill: "#93c5fd" },
  { name: "其他", value: 0, fill: "#dbeafe" },
];

export const MOCK_LOANS_PAID_VS_REMAINING = [
  { platform: "招商银行房贷", paid: 750000, remaining: 1250000 },
  { platform: "车贷-工商银行", paid: 65000, remaining: 85000 },
  { platform: "花呗", paid: 7500, remaining: 2500 },
];

// ============= Savings 模拟数据 =============
export const MOCK_SAVINGS: SavingsGoal[] = [
  {
    id: "1",
    name: "旅游基金",
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: "2024-06-01",
    type: "MONTHLY",
    depositType: "HELP_DEPOSIT",
    status: "ACTIVE",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "购车计划",
    targetAmount: 100000,
    currentAmount: 45000,
    deadline: "2025-12-31",
    type: "YEARLY",
    depositType: "FIXED_TERM",
    status: "ACTIVE",
    createdAt: "2023-01-15",
  },
  {
    id: "3",
    name: "应急储备金",
    targetAmount: 50000,
    currentAmount: 50000,
    deadline: null,
    type: "LONG_TERM",
    depositType: "CASH",
    status: "COMPLETED",
    createdAt: "2022-06-01",
  },
  {
    id: "4",
    name: "装修基金",
    targetAmount: 80000,
    currentAmount: 32000,
    deadline: "2024-12-31",
    type: "BI_MONTHLY_ODD",
    depositType: "HELP_DEPOSIT",
    status: "ACTIVE",
    createdAt: "2023-09-01",
  },
];

export type MockSavingsTransaction = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
};

export const MOCK_SAVINGS_TRANSACTIONS: MockSavingsTransaction[] = [
  { id: "1", date: "2024-03-01", type: "INCOME", amount: "5000", category: "储蓄", description: "每月储蓄" },
  { id: "2", date: "2024-03-05", type: "EXPENSE", amount: "800", category: "支出", description: "旅游花费" },
  { id: "3", date: "2024-03-10", type: "INCOME", amount: "3000", category: "储蓄", description: "额外储蓄" },
  { id: "4", date: "2024-03-15", type: "EXPENSE", amount: "200", category: "支出", description: "取出零用" },
  { id: "5", date: "2024-03-20", type: "INCOME", amount: "5000", category: "储蓄", description: "每月储蓄" },
];

// ============= Consumption 模拟数据 =============
// 组合消费页面的所有 mock 数据
export const MOCK_CONSUMPTION: ConsumptionData = {
  summary: MOCK_SUMMARY,
  platformDistribution: MOCK_PLATFORM_DISTRIBUTION,
  incomeExpense: MOCK_INCOME_EXPENSE,
  merchants: MOCK_MERCHANTS,
  trend: MOCK_TREND,
  trendYearly: MOCK_TREND_YEARLY,
  stackedBar: MOCK_STACKED_BAR,
  pareto: MOCK_PARETO,
  weekdayWeekend: MOCK_WEEKDAY_WEEKEND,
  calendar: MOCK_CALENDAR,
  heatmap: MOCK_HEATMAP,
  sankey: MOCK_SANKEY,
  scatter: MOCK_SCATTER,
  histogram: MOCK_HISTOGRAM,
  transactions: MOCK_TRANSACTIONS.map((transaction, index) => ({
    ...transaction,
    description: ["每月房租", "工作日早餐", "3 月工资", "下班打车", "换季置办"][index] ?? "",
  })),
  insights: {
    spendingStyle: [
      { name: "固定支出", value: 3680, share: 29.3, fill: "#2563eb", description: "租房、缴费、订阅类" },
      { name: "弹性支出", value: 5120, share: 40.7, fill: "#16a34a", description: "日常可调节开支" },
      { name: "冲动消费", value: 3780, share: 30.0, fill: "#f59e0b", description: "夜间/购物娱乐型" },
    ],
    necessitySplit: [
      { name: "必要消费", value: 7020, share: 55.8, fill: "#2563eb" },
      { name: "可选消费", value: 5560, share: 44.2, fill: "#7c3aed" },
    ],
    transactionNature: [
      { name: "真实消费", value: 11240, share: 89.3, fill: "#2563eb" },
      { name: "转账/还款", value: 980, share: 7.8, fill: "#ef4444" },
      { name: "退款回流", value: 360, share: 2.9, fill: "#16a34a" },
    ],
    recurringMerchants: [
      { merchant: "腾讯视频", total: 68, count: 2, cadenceLabel: "约 30 天/次", tag: "订阅候选", category: "娱乐" },
      { merchant: "中国移动", total: 98, count: 2, cadenceLabel: "约 30 天/次", tag: "订阅候选", category: "生活" },
      { merchant: "瑞幸咖啡", total: 126, count: 4, cadenceLabel: "4 次出现", tag: "高频商户", category: "餐饮" },
      { merchant: "滴滴出行", total: 188, count: 3, cadenceLabel: "8 天/次", tag: "稳定复购", category: "交通" },
    ],
    budgetVariance: [
      { name: "餐饮", budget: 3000, spent: 2450, variance: -550, percent: 81.7, status: "warning" },
      { name: "购物", budget: 2600, spent: 3200, variance: 600, percent: 123.1, status: "over" },
      { name: "娱乐", budget: 1500, spent: 980, variance: -520, percent: 65.3, status: "healthy" },
    ],
    budgetContext: {
      applicable: true,
      label: "当前筛选对应月度预算",
    },
    remarkOverview: {
      total: 4636,
      count: 12,
      distinctCount: 5,
      share: 36.9,
    },
    remarkBreakdown: [
      { name: "每月房租", total: 2500, count: 1, share: 19.9, category: "住房", merchant: "房东", fill: "#2563eb" },
      { name: "给家里", total: 960, count: 2, share: 7.6, category: "转账支出", merchant: "家人", fill: "#16a34a" },
      { name: "水电费", total: 468, count: 3, share: 3.7, category: "生活", merchant: "物业", fill: "#f59e0b" },
      { name: "固定订阅", total: 388, count: 4, share: 3.1, category: "娱乐", merchant: "腾讯视频", fill: "#7c3aed" },
      { name: "孩子兴趣班", total: 320, count: 2, share: 2.5, category: "教育", merchant: "培训机构", fill: "#0ea5e9" },
    ],
    timeCategoryHotspots: [
      { label: "晚间 · 购物", bucket: "晚间", category: "购物", total: 2860, count: 5 },
      { label: "午间 · 餐饮", bucket: "午间", category: "餐饮", total: 1680, count: 11 },
      { label: "深夜 · 娱乐", bucket: "深夜", category: "娱乐", total: 920, count: 3 },
      { label: "下午 · 交通", bucket: "下午", category: "交通", total: 760, count: 6 },
    ],
    weekendPreference: [
      { name: "娱乐", weekend: 760, weekday: 220, weekendShare: 77.6 },
      { name: "购物", weekend: 1980, weekday: 1220, weekendShare: 61.9 },
      { name: "餐饮", weekend: 1360, weekday: 1090, weekendShare: 55.5 },
      { name: "交通", weekend: 380, weekday: 540, weekendShare: 41.3 },
    ],
    largeExpenses: [
      { merchant: "京东商城", category: "购物", amount: 2450, date: "2024-03-15T14:30:00.000Z", reason: "超高单笔" },
      { merchant: "山姆会员店", category: "购物", amount: 1800, date: "2024-03-12T11:20:00.000Z", reason: "高于均值" },
      { merchant: "中国石化", category: "交通", amount: 1200, date: "2024-03-10T18:10:00.000Z", reason: "高于均值" },
      { merchant: "爱奇艺会员", category: "娱乐", amount: 680, date: "2024-03-08T23:15:00.000Z", reason: "夜间大额" },
    ],
    concentration: {
      topMerchant: "京东商城",
      topMerchantShare: 19.5,
      top3MerchantShare: 43.3,
      topCategory: "餐饮",
      topCategoryShare: 35.8,
      repeatMerchantShare: 48.2,
    },
  },
};
