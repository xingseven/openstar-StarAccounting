// ─── Dashboard 数据模型 ─────────────────────────────────────

class BudgetAlert {
  final String id;
  final String category;
  final String? platform;
  final String period; // MONTHLY | YEARLY
  final String scopeType; // CATEGORY | PLATFORM | ALL
  final double amount;
  final double used;
  final double percent;
  final String status; // normal | warning | overdue
  final double alertPercent;

  const BudgetAlert({
    required this.id,
    required this.category,
    this.platform,
    required this.period,
    required this.scopeType,
    required this.amount,
    required this.used,
    required this.percent,
    required this.status,
    required this.alertPercent,
  });

  factory BudgetAlert.fromJson(Map<String, dynamic> json) => BudgetAlert(
        id: json['id'] as String,
        category: json['category'] as String,
        platform: json['platform'] as String?,
        period: json['period'] as String,
        scopeType: json['scopeType'] as String,
        amount: double.parse(json['amount'].toString()),
        used: double.parse(json['used'].toString()),
        percent: (json['percent'] as num).toDouble(),
        status: json['status'] as String,
        alertPercent: (json['alertPercent'] as num).toDouble(),
      );
}

class DashboardTransaction {
  final String id;
  final String date;
  final String type; // EXPENSE | INCOME
  final double amount;
  final String category;
  final String platform;
  final String? merchant;

  const DashboardTransaction({
    required this.id,
    required this.date,
    required this.type,
    required this.amount,
    required this.category,
    required this.platform,
    this.merchant,
  });

  factory DashboardTransaction.fromJson(Map<String, dynamic> json) =>
      DashboardTransaction(
        id: json['id'] as String,
        date: json['date'] as String,
        type: json['type'] as String,
        amount: double.parse(json['amount'].toString()),
        category: json['category'] as String? ?? '未分类',
        platform: json['platform'] as String? ?? '',
        merchant: json['merchant'] as String?,
      );
}

class DashboardData {
  final double totalAssets;
  final double totalDebt;
  final double monthExpense;
  final double monthIncome;
  final double lastMonthExpense;
  final double lastMonthIncome;
  final double monthSavingsIncome;
  final double monthSavingsExpense;
  final List<DashboardTransaction> recentTransactions;
  final List<BudgetAlert> budgetAlerts;

  const DashboardData({
    required this.totalAssets,
    required this.totalDebt,
    required this.monthExpense,
    required this.monthIncome,
    required this.lastMonthExpense,
    required this.lastMonthIncome,
    required this.monthSavingsIncome,
    required this.monthSavingsExpense,
    required this.recentTransactions,
    required this.budgetAlerts,
  });

  double get netWorth => totalAssets - totalDebt;
  double get monthlyBalance => monthIncome - monthExpense;
  double get savingsDelta => monthSavingsIncome - monthSavingsExpense;
  double get debtRatio =>
      totalAssets > 0 ? (totalDebt / totalAssets * 100).clamp(0, 100) : 0;
  double get savingsRate =>
      monthIncome > 0 ? monthlyBalance / monthIncome * 100 : 0;

  factory DashboardData.fromJson(Map<String, dynamic> json) => DashboardData(
        totalAssets: (json['totalAssets'] as num).toDouble(),
        totalDebt: (json['totalDebt'] as num).toDouble(),
        monthExpense: (json['monthExpense'] as num).toDouble(),
        monthIncome: (json['monthIncome'] as num).toDouble(),
        lastMonthExpense: (json['lastMonthExpense'] as num).toDouble(),
        lastMonthIncome: (json['lastMonthIncome'] as num).toDouble(),
        monthSavingsIncome: (json['monthSavingsIncome'] as num).toDouble(),
        monthSavingsExpense: (json['monthSavingsExpense'] as num).toDouble(),
        recentTransactions: (json['recentTransactions'] as List)
            .map((e) => DashboardTransaction.fromJson(e as Map<String, dynamic>))
            .toList(),
        budgetAlerts: ((json['budgetAlerts'] as List?) ?? [])
            .map((e) => BudgetAlert.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

// ─── Mock 数据 ───────────────────────────────────────────────
const kMockDashboard = DashboardData(
  totalAssets: 286500,
  totalDebt: 45000,
  monthExpense: 8420,
  monthIncome: 15800,
  lastMonthExpense: 9100,
  lastMonthIncome: 15200,
  monthSavingsIncome: 3000,
  monthSavingsExpense: 500,
  recentTransactions: [
    DashboardTransaction(
      id: '1',
      date: '2026-04-01T09:30:00',
      type: 'EXPENSE',
      amount: 58.5,
      category: '餐饮美食',
      platform: '微信',
      merchant: '沙县小吃',
    ),
    DashboardTransaction(
      id: '2',
      date: '2026-04-01T08:00:00',
      type: 'INCOME',
      amount: 15800,
      category: '工资薪酬',
      platform: '支付宝',
      merchant: '公司转账',
    ),
    DashboardTransaction(
      id: '3',
      date: '2026-03-31T20:15:00',
      type: 'EXPENSE',
      amount: 299,
      category: '购物消费',
      platform: '支付宝',
      merchant: '淘宝',
    ),
    DashboardTransaction(
      id: '4',
      date: '2026-03-31T18:40:00',
      type: 'EXPENSE',
      amount: 35,
      category: '交通出行',
      platform: '微信',
      merchant: '滴滴出行',
    ),
    DashboardTransaction(
      id: '5',
      date: '2026-03-30T12:00:00',
      type: 'EXPENSE',
      amount: 128,
      category: '休闲娱乐',
      platform: '微信',
      merchant: '电影院',
    ),
  ],
  budgetAlerts: [
    BudgetAlert(
      id: 'b1',
      category: '餐饮美食',
      period: 'MONTHLY',
      scopeType: 'CATEGORY',
      amount: 1500,
      used: 1380,
      percent: 92,
      status: 'warning',
      alertPercent: 80,
    ),
    BudgetAlert(
      id: 'b2',
      category: '购物消费',
      period: 'MONTHLY',
      scopeType: 'CATEGORY',
      amount: 2000,
      used: 2250,
      percent: 112.5,
      status: 'overdue',
      alertPercent: 80,
    ),
  ],
);
