// ─── 汇总指标 ────────────────────────────────────────────────
class PlatformSummary {
  final double expense;
  final double income;
  const PlatformSummary({required this.expense, required this.income});

  factory PlatformSummary.fromJson(Map<String, dynamic> j) => PlatformSummary(
        expense: (j['expense'] as num?)?.toDouble() ?? 0,
        income: (j['income'] as num?)?.toDouble() ?? 0,
      );
}

class SummaryComparison {
  final double? totalExpenseRate;
  final double? totalIncomeRate;
  final double? wechatExpenseRate;
  final double? alipayExpenseRate;
  const SummaryComparison({
    this.totalExpenseRate,
    this.totalIncomeRate,
    this.wechatExpenseRate,
    this.alipayExpenseRate,
  });

  factory SummaryComparison.fromJson(Map<String, dynamic> j) =>
      SummaryComparison(
        totalExpenseRate: (j['totalExpenseRate'] as num?)?.toDouble(),
        totalIncomeRate: (j['totalIncomeRate'] as num?)?.toDouble(),
        wechatExpenseRate: (j['wechatExpenseRate'] as num?)?.toDouble(),
        alipayExpenseRate: (j['alipayExpenseRate'] as num?)?.toDouble(),
      );
}

class ConsumptionSummary {
  final double totalExpense;
  final double totalIncome;
  final int expenseCount;
  final PlatformSummary wechat;
  final PlatformSummary alipay;
  final SummaryComparison comparison;

  const ConsumptionSummary({
    required this.totalExpense,
    required this.totalIncome,
    required this.expenseCount,
    required this.wechat,
    required this.alipay,
    required this.comparison,
  });

  double get balance => totalIncome - totalExpense;
  double get avgPerTransaction =>
      expenseCount > 0 ? totalExpense / expenseCount : 0;

  factory ConsumptionSummary.fromJson(Map<String, dynamic> j) =>
      ConsumptionSummary(
        totalExpense: (j['totalExpense'] as num?)?.toDouble() ?? 0,
        totalIncome: (j['totalIncome'] as num?)?.toDouble() ?? 0,
        expenseCount: (j['expenseCount'] as num?)?.toInt() ?? 0,
        wechat: PlatformSummary.fromJson(
            (j['wechat'] as Map<String, dynamic>?) ?? {}),
        alipay: PlatformSummary.fromJson(
            (j['alipay'] as Map<String, dynamic>?) ?? {}),
        comparison: SummaryComparison.fromJson(
            (j['comparison'] as Map<String, dynamic>?) ?? {}),
      );

  static ConsumptionSummary get mock => ConsumptionSummary(
        totalExpense: 8420.50,
        totalIncome: 12000.00,
        expenseCount: 87,
        wechat: const PlatformSummary(expense: 3600, income: 0),
        alipay: const PlatformSummary(expense: 4200, income: 12000),
        comparison: const SummaryComparison(
          totalExpenseRate: -5.2,
          totalIncomeRate: 0.0,
          wechatExpenseRate: 3.1,
          alipayExpenseRate: -8.4,
        ),
      );
}

// ─── 趋势数据 ─────────────────────────────────────────────────
class DailyTrend {
  final String day;
  final double expense;
  final double income;
  final double total;
  const DailyTrend(
      {required this.day,
      required this.expense,
      required this.income,
      required this.total});

  factory DailyTrend.fromJson(Map<String, dynamic> j) => DailyTrend(
        day: j['day'] as String,
        expense: (j['expense'] as num?)?.toDouble() ?? 0,
        income: (j['income'] as num?)?.toDouble() ?? 0,
        total: (j['total'] as num?)?.toDouble() ?? 0,
      );

  static List<DailyTrend> get mockList {
    final now = DateTime.now();
    return List.generate(30, (i) {
      final d = now.subtract(Duration(days: 29 - i));
      final label =
          '${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      final exp = 100 + (i % 7) * 80.0 + (i % 3) * 150.0;
      final inc = i % 10 == 0 ? 3000.0 : 0.0;
      return DailyTrend(day: label, expense: exp, income: inc, total: inc - exp);
    });
  }
}

// ─── 平台分布 / 分类 / 商家 ────────────────────────────────────
class ChartItem {
  final String name;
  final double value;
  final String fill;
  const ChartItem(
      {required this.name, required this.value, required this.fill});

  factory ChartItem.fromJson(Map<String, dynamic> j) => ChartItem(
        name: (j['name'] ?? j['merchant'] ?? '') as String,
        value: (j['value'] ?? j['total'] ?? 0 as num).toDouble(),
        fill: (j['fill'] ?? '#3b82f6') as String,
      );
}

class MerchantRank {
  final String merchant;
  final double total;
  final String fill;
  const MerchantRank(
      {required this.merchant, required this.total, required this.fill});

  factory MerchantRank.fromJson(Map<String, dynamic> j) => MerchantRank(
        merchant: j['merchant'] as String,
        total: (j['total'] as num).toDouble(),
        fill: (j['fill'] ?? '#3b82f6') as String,
      );

  static List<MerchantRank> get mockList => const [
        MerchantRank(merchant: '美团外卖', total: 860, fill: '#1d4ed8'),
        MerchantRank(merchant: '淘宝', total: 720, fill: '#2563eb'),
        MerchantRank(merchant: '滴滴出行', total: 540, fill: '#3b82f6'),
        MerchantRank(merchant: '盒马鲜生', total: 480, fill: '#60a5fa'),
        MerchantRank(merchant: '京东', total: 420, fill: '#93c5fd'),
        MerchantRank(merchant: '星巴克', total: 380, fill: '#bfdbfe'),
        MerchantRank(merchant: '711便利店', total: 320, fill: '#dbeafe'),
        MerchantRank(merchant: '优衣库', total: 280, fill: '#eff6ff'),
      ];
}

// ─── 单笔交易 ─────────────────────────────────────────────────
class Transaction {
  final String id;
  final String merchant;
  final String date;
  final String category;
  final String platform;
  final String type; // INCOME / EXPENSE
  final double amount;
  final String? description;

  const Transaction({
    required this.id,
    required this.merchant,
    required this.date,
    required this.category,
    required this.platform,
    required this.type,
    required this.amount,
    this.description,
  });

  factory Transaction.fromJson(Map<String, dynamic> j) => Transaction(
        id: j['id'] as String,
        merchant: j['merchant'] as String,
        date: j['date'] as String,
        category: j['category'] as String,
        platform: j['platform'] as String,
        type: j['type'] as String,
        amount: double.tryParse(j['amount'].toString()) ?? 0,
        description: j['description'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'merchant': merchant,
        'date': date,
        'category': category,
        'platform': platform,
        'type': type,
        'amount': amount.toString(),
        if (description != null) 'description': description,
      };

  static List<Transaction> get mockList => [
        Transaction(
          id: '1', amount: 68.5, type: 'EXPENSE', category: '餐饮',
          platform: 'wechat', merchant: '美团外卖',
          date: DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
        ),
        Transaction(
          id: '2', amount: 12000.0, type: 'INCOME', category: '工资',
          platform: 'alipay', merchant: '公司转账',
          date: DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        ),
        Transaction(
          id: '3', amount: 199.0, type: 'EXPENSE', category: '购物',
          platform: 'alipay', merchant: '淘宝',
          date: DateTime.now().subtract(const Duration(days: 1, hours: 3)).toIso8601String(),
        ),
        Transaction(
          id: '4', amount: 45.0, type: 'EXPENSE', category: '交通',
          platform: 'alipay', merchant: '滴滴出行',
          date: DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
        ),
        Transaction(
          id: '5', amount: 38.0, type: 'EXPENSE', category: '餐饮',
          platform: 'wechat', merchant: '星巴克',
          date: DateTime.now().subtract(const Duration(days: 2, hours: 5)).toIso8601String(),
        ),
        Transaction(
          id: '6', amount: 320.0, type: 'EXPENSE', category: '购物',
          platform: 'wechat', merchant: '711便利店',
          date: DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
        ),
      ];
}

// ─── 帕累托数据 ───────────────────────────────────────────────
class ParetoItem {
  final String name;
  final double value;
  final double cumulativePercentage;
  final String fill;
  const ParetoItem({required this.name, required this.value, required this.cumulativePercentage, required this.fill});

  factory ParetoItem.fromJson(Map<String, dynamic> j) => ParetoItem(
        name: j['name'] as String,
        value: (j['value'] as num).toDouble(),
        cumulativePercentage: (j['cumulativePercentage'] as num).toDouble(),
        fill: (j['fill'] ?? '#3b82f6') as String,
      );

  static List<ParetoItem> get mockList => const [
        ParetoItem(name: '餐饮', value: 2100, cumulativePercentage: 24.9, fill: '#1d4ed8'),
        ParetoItem(name: '购物', value: 1800, cumulativePercentage: 46.3, fill: '#2563eb'),
        ParetoItem(name: '交通', value: 980, cumulativePercentage: 57.9, fill: '#3b82f6'),
        ParetoItem(name: '娱乐', value: 860, cumulativePercentage: 68.1, fill: '#60a5fa'),
        ParetoItem(name: '医疗', value: 560, cumulativePercentage: 74.7, fill: '#93c5fd'),
        ParetoItem(name: '住房', value: 480, cumulativePercentage: 80.4, fill: '#bfdbfe'),
        ParetoItem(name: '教育', value: 320, cumulativePercentage: 84.2, fill: '#dbeafe'),
        ParetoItem(name: '其他', value: 320.5, cumulativePercentage: 100.0, fill: '#eff6ff'),
      ];
}

// ─── 堆叠柱数据 ───────────────────────────────────────────────
class StackedBarItem {
  final String day;
  final Map<String, double> categories;
  const StackedBarItem({required this.day, required this.categories});

  factory StackedBarItem.fromJson(Map<String, dynamic> j) {
    final Map<String, double> cats = {};
    j.forEach((k, v) {
      if (k != 'day' && v is num) cats[k] = v.toDouble();
    });
    return StackedBarItem(day: j['day'] as String, categories: cats);
  }

  static List<StackedBarItem> get mockList {
    final now = DateTime.now();
    return List.generate(7, (i) {
      final d = now.subtract(Duration(days: 6 - i));
      final label = '${d.month}/${d.day}';
      return StackedBarItem(day: label, categories: {
        '餐饮': 80.0 + i * 20,
        '购物': 60.0 + i * 15,
        '交通': 40.0 + i * 8,
        '娱乐': 20.0 + i * 5,
        '其他': 30.0 + i * 10,
      });
    });
  }
}

// ─── 直方图数据 ───────────────────────────────────────────────
class HistogramItem {
  final String range;
  final int count;
  final String fill;
  const HistogramItem({required this.range, required this.count, required this.fill});

  factory HistogramItem.fromJson(Map<String, dynamic> j) => HistogramItem(
        range: j['range'] as String,
        count: (j['count'] as num).toInt(),
        fill: (j['fill'] ?? '#3b82f6') as String,
      );

  static List<HistogramItem> get mockList => const [
        HistogramItem(range: '0-50', count: 28, fill: '#1d4ed8'),
        HistogramItem(range: '50-100', count: 22, fill: '#2563eb'),
        HistogramItem(range: '100-200', count: 15, fill: '#3b82f6'),
        HistogramItem(range: '200-500', count: 12, fill: '#60a5fa'),
        HistogramItem(range: '500+', count: 10, fill: '#93c5fd'),
      ];
}

// ─── 日历热力图数据 ───────────────────────────────────────────
class CalendarDay {
  final String date;
  final double value;
  const CalendarDay({required this.date, required this.value});

  factory CalendarDay.fromJson(Map<String, dynamic> j) => CalendarDay(
        date: j['date'] as String,
        value: (j['value'] ?? j['day'] ?? 0 as num).toDouble(),
      );

  static List<CalendarDay> get mockList {
    final now = DateTime.now();
    return List.generate(30, (i) {
      final d = now.subtract(Duration(days: 29 - i));
      final ds = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      final v = (i % 5 == 0 ? 800.0 : i % 3 == 0 ? 450.0 : 150.0 + i * 10);
      return CalendarDay(date: ds, value: v);
    });
  }
}

// ─── Insights 数据结构 ────────────────────────────────────────
class SpendingStyleItem {
  final String name;
  final double value;
  final String fill;
  final String description;
  const SpendingStyleItem({required this.name, required this.value, required this.fill, required this.description});

  factory SpendingStyleItem.fromJson(Map<String, dynamic> j) => SpendingStyleItem(
        name: j['name'] as String,
        value: (j['value'] as num).toDouble(),
        fill: (j['fill'] ?? '#3b82f6') as String,
        description: (j['description'] ?? '') as String,
      );

  static List<SpendingStyleItem> get mockList => const [
        SpendingStyleItem(name: '餐饮娱乐', value: 2960, fill: '#1d4ed8', description: '日常餐饮和休闲娱乐支出'),
        SpendingStyleItem(name: '购物消费', value: 1800, fill: '#3b82f6', description: '线上线下购物'),
        SpendingStyleItem(name: '出行交通', value: 980, fill: '#60a5fa', description: '交通出行费用'),
        SpendingStyleItem(name: '生活必需', value: 2680.5, fill: '#bfdbfe', description: '医疗、住房等刚需支出'),
      ];
}

class BudgetVarianceItem {
  final String name;
  final double budget;
  final double spent;
  final double variance;
  final double percent;
  final String status; // healthy | warning | over

  const BudgetVarianceItem({
    required this.name,
    required this.budget,
    required this.spent,
    required this.variance,
    required this.percent,
    required this.status,
  });

  factory BudgetVarianceItem.fromJson(Map<String, dynamic> j) => BudgetVarianceItem(
        name: j['name'] as String,
        budget: (j['budget'] as num).toDouble(),
        spent: (j['spent'] as num).toDouble(),
        variance: (j['variance'] as num).toDouble(),
        percent: (j['percent'] as num).toDouble(),
        status: j['status'] as String,
      );

  static List<BudgetVarianceItem> get mockList => const [
        BudgetVarianceItem(name: '餐饮', budget: 2000, spent: 2100, variance: 100, percent: 105, status: 'over'),
        BudgetVarianceItem(name: '购物', budget: 2500, spent: 1800, variance: -700, percent: 72, status: 'healthy'),
        BudgetVarianceItem(name: '交通', budget: 1000, spent: 980, variance: -20, percent: 98, status: 'warning'),
        BudgetVarianceItem(name: '娱乐', budget: 1000, spent: 860, variance: -140, percent: 86, status: 'healthy'),
        BudgetVarianceItem(name: '医疗', budget: 500, spent: 560, variance: 60, percent: 112, status: 'over'),
      ];
}

class RecurringMerchant {
  final String merchant;
  final double total;
  final int count;
  final String cadenceLabel;
  final String tag;
  final String category;

  const RecurringMerchant({
    required this.merchant,
    required this.total,
    required this.count,
    required this.cadenceLabel,
    required this.tag,
    required this.category,
  });

  factory RecurringMerchant.fromJson(Map<String, dynamic> j) => RecurringMerchant(
        merchant: j['merchant'] as String,
        total: (j['total'] as num).toDouble(),
        count: (j['count'] as num).toInt(),
        cadenceLabel: (j['cadenceLabel'] ?? '') as String,
        tag: (j['tag'] ?? '') as String,
        category: (j['category'] ?? '') as String,
      );

  static List<RecurringMerchant> get mockList => const [
        RecurringMerchant(merchant: '美团外卖', total: 860, count: 18, cadenceLabel: '每天', tag: '高频', category: '餐饮'),
        RecurringMerchant(merchant: '滴滴出行', total: 540, count: 23, cadenceLabel: '每天', tag: '高频', category: '交通'),
        RecurringMerchant(merchant: '星巴克', total: 380, count: 14, cadenceLabel: '每2天', tag: '高频', category: '餐饮'),
        RecurringMerchant(merchant: '711便利店', total: 320, count: 31, cadenceLabel: '每天', tag: '高频', category: '购物'),
      ];
}

class LargeExpense {
  final String merchant;
  final String category;
  final double amount;
  final String date;
  final String reason;

  const LargeExpense({
    required this.merchant,
    required this.category,
    required this.amount,
    required this.date,
    required this.reason,
  });

  factory LargeExpense.fromJson(Map<String, dynamic> j) => LargeExpense(
        merchant: j['merchant'] as String,
        category: j['category'] as String,
        amount: (j['amount'] as num).toDouble(),
        date: j['date'] as String,
        reason: (j['reason'] ?? '') as String,
      );

  static List<LargeExpense> get mockList => [
        LargeExpense(merchant: '京东', category: '购物', amount: 2999, date: DateTime.now().subtract(const Duration(days: 5)).toIso8601String(), reason: '电子产品'),
        LargeExpense(merchant: '齐家装修', category: '住房', amount: 1800, date: DateTime.now().subtract(const Duration(days: 12)).toIso8601String(), reason: '家装维修'),
      ];
}

class ConsumptionInsights {
  final List<SpendingStyleItem> spendingStyle;
  final List<ChartItem> necessitySplit;
  final List<ChartItem> transactionNature;
  final List<RecurringMerchant> recurringMerchants;
  final List<BudgetVarianceItem> budgetVariance;
  final List<LargeExpense> largeExpenses;

  const ConsumptionInsights({
    required this.spendingStyle,
    required this.necessitySplit,
    required this.transactionNature,
    required this.recurringMerchants,
    required this.budgetVariance,
    required this.largeExpenses,
  });

  factory ConsumptionInsights.fromJson(Map<String, dynamic> j) => ConsumptionInsights(
        spendingStyle: (j['spendingStyle'] as List? ?? [])
            .map((e) => SpendingStyleItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        necessitySplit: (j['necessitySplit'] as List? ?? [])
            .map((e) => ChartItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        transactionNature: (j['transactionNature'] as List? ?? [])
            .map((e) => ChartItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        recurringMerchants: (j['recurringMerchants'] as List? ?? [])
            .map((e) => RecurringMerchant.fromJson(e as Map<String, dynamic>))
            .toList(),
        budgetVariance: (j['budgetVariance'] as List? ?? [])
            .map((e) => BudgetVarianceItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        largeExpenses: (j['largeExpenses'] as List? ?? [])
            .map((e) => LargeExpense.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  static ConsumptionInsights get mock => ConsumptionInsights(
        spendingStyle: SpendingStyleItem.mockList,
        necessitySplit: const [
          ChartItem(name: '必要支出', value: 5200, fill: '#1d4ed8'),
          ChartItem(name: '非必要支出', value: 3220.5, fill: '#60a5fa'),
        ],
        transactionNature: const [
          ChartItem(name: '线上', value: 6800, fill: '#1d4ed8'),
          ChartItem(name: '线下', value: 1620.5, fill: '#93c5fd'),
        ],
        recurringMerchants: RecurringMerchant.mockList,
        budgetVariance: BudgetVarianceItem.mockList,
        largeExpenses: LargeExpense.mockList,
      );
}

// ─── 完整看板数据 ──────────────────────────────────────────────
class ConsumptionData {
  final ConsumptionSummary summary;
  final List<DailyTrend> trend;
  final List<ChartItem> platformDistribution;
  final List<ChartItem> incomeExpense;
  final List<MerchantRank> merchants;
  final List<Transaction> transactions;
  final List<ParetoItem> pareto;
  final List<StackedBarItem> stackedBar;
  final List<HistogramItem> histogram;
  final List<CalendarDay> calendar;
  final ConsumptionInsights insights;

  const ConsumptionData({
    required this.summary,
    required this.trend,
    required this.platformDistribution,
    required this.incomeExpense,
    required this.merchants,
    required this.transactions,
    required this.pareto,
    required this.stackedBar,
    required this.histogram,
    required this.calendar,
    required this.insights,
  });

  factory ConsumptionData.fromJson(Map<String, dynamic> j) => ConsumptionData(
        summary: ConsumptionSummary.fromJson(j['summary'] as Map<String, dynamic>),
        trend: (j['trend'] as List? ?? []).map((e) => DailyTrend.fromJson(e as Map<String, dynamic>)).toList(),
        platformDistribution: (j['platformDistribution'] as List? ?? []).map((e) => ChartItem.fromJson(e as Map<String, dynamic>)).toList(),
        incomeExpense: (j['incomeExpense'] as List? ?? []).map((e) => ChartItem.fromJson(e as Map<String, dynamic>)).toList(),
        merchants: (j['merchants'] as List? ?? []).map((e) => MerchantRank.fromJson(e as Map<String, dynamic>)).toList(),
        transactions: (j['transactions'] as List? ?? []).map((e) => Transaction.fromJson(e as Map<String, dynamic>)).toList(),
        pareto: (j['pareto'] as List? ?? []).map((e) => ParetoItem.fromJson(e as Map<String, dynamic>)).toList(),
        stackedBar: (j['stackedBar'] as List? ?? []).map((e) => StackedBarItem.fromJson(e as Map<String, dynamic>)).toList(),
        histogram: (j['histogram'] as List? ?? []).map((e) => HistogramItem.fromJson(e as Map<String, dynamic>)).toList(),
        calendar: (j['calendar'] as List? ?? []).map((e) => CalendarDay.fromJson(e as Map<String, dynamic>)).toList(),
        insights: j['insights'] != null ? ConsumptionInsights.fromJson(j['insights'] as Map<String, dynamic>) : ConsumptionInsights.mock,
      );

  static ConsumptionData get mock => ConsumptionData(
        summary: ConsumptionSummary.mock,
        trend: DailyTrend.mockList,
        platformDistribution: const [
          ChartItem(name: '支付宝', value: 4200, fill: '#1d4ed8'),
          ChartItem(name: '微信', value: 3600, fill: '#16a34a'),
          ChartItem(name: '云闪付', value: 620.5, fill: '#ef4444'),
        ],
        incomeExpense: const [
          ChartItem(name: '支出', value: 8420.5, fill: '#1d4ed8'),
          ChartItem(name: '收入', value: 12000, fill: '#60a5fa'),
        ],
        merchants: MerchantRank.mockList,
        transactions: Transaction.mockList,
        pareto: ParetoItem.mockList,
        stackedBar: StackedBarItem.mockList,
        histogram: HistogramItem.mockList,
        calendar: CalendarDay.mockList,
        insights: ConsumptionInsights.mock,
      );
}
