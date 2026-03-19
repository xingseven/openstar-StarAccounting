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
  stackedBar: MOCK_STACKED_BAR,
  pareto: MOCK_PARETO,
  weekdayWeekend: MOCK_WEEKDAY_WEEKEND,
  calendar: MOCK_CALENDAR,
  heatmap: MOCK_HEATMAP,
  sankey: MOCK_SANKEY,
  scatter: MOCK_SCATTER,
  histogram: MOCK_HISTOGRAM,
  transactions: MOCK_TRANSACTIONS,
};
