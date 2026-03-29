/**
 * 共享类型定义
 * 集中管理各模块的 TypeScript 类型
 */

// ============= 资产类型 =============
export type Asset = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  estimatedValue: number;
};

// ============= 贷款类型 =============
export type Loan = {
  id: string;
  platform: string;
  totalAmount: number;
  remainingAmount: number;
  periods: number;
  paidPeriods: number;
  monthlyPayment: number;
  dueDate: number;
  status: "ACTIVE" | "COMPLETED" | "DEFAULT";
  createdAt: string;
};

// ============= 储蓄目标类型 =============
export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  type: "MONTHLY" | "YEARLY" | "LONG_TERM" | "BI_MONTHLY_ODD" | "BI_MONTHLY_EVEN";
  depositType: "CASH" | "FIXED_TERM" | "HELP_DEPOSIT";
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  image?: string | null;
  planConfig?: SavingsPlanConfig | null;
};

export type SavingsAssetSyncConfig = {
  syncToAssets?: boolean;
  sourceAssetId?: string | null;
  holdingAssetId?: string | null;
};

export type SavingsPlanConfig = {
  expenseColumns?: Array<{ id: string; name: string }>;
  startMonth?: string;
  duration?: number;
  assetSync?: SavingsAssetSyncConfig;
};

export type SavingsPlan = {
  id: string;
  goalId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  month: string;
  salary?: number;
  expenses?: Record<string, number>;
  remark?: string;
  proofImage?: string;
};

// ============= Dashboard 类型 =============
export type BudgetAlert = {
  id: string;
  category: string;
  platform?: string | null;
  period: string;
  scopeType: string;
  amount: string;
  used: string;
  percent: number;
  status: "normal" | "warning" | "overdue";
  alertPercent: number;
};

export type Transaction = {
  id: string;
  date: string;
  type: "EXPENSE" | "INCOME";
  amount: string;
  category: string;
  platform: string;
  merchant?: string;
};

export type DashboardData = {
  totalAssets: number;
  totalDebt: number;
  monthExpense: number;
  monthIncome: number;
  lastMonthExpense: number;
  lastMonthIncome: number;
  monthSavingsIncome: number;
  monthSavingsExpense: number;
  recentTransactions: Transaction[];
  budgetAlerts: BudgetAlert[];
};

// ============= 消费类型 =============
export type ConsumptionData = {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  platformData: Array<{ name: string; value: number; fill: string }>;
  categoryData: Array<{ name: string; value: number; fill: string }>;
  monthlyTrend: Array<{ month: string; expense: number; income: number }>;
  topMerchants: Array<{ merchant: string; amount: number; count: number }>;
  weekdayData: Array<{ day: string; amount: number }>;
  calendar: Array<{ date: string; total: number }>;
  heatmap: {
    data: Array<{ platform: string; category: string; total: number }>;
  };
  transactions: Transaction[];
  incomeExpense: Array<{ type: string; value: number }>;
};
