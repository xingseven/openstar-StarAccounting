import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.read(apiClientProvider));
});

final dashboardDataProvider = FutureProvider<DashboardData>((ref) async {
  return ref.watch(dashboardRepositoryProvider).fetchDashboardData();
});

class DashboardRepository {
  DashboardRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<DashboardData> fetchDashboardData() async {
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, 1);
    final end = DateTime(now.year, now.month + 1, 0, 23, 59, 59, 999);
    final lastMonthStart = DateTime(now.year, now.month - 1, 1);
    final lastMonthEnd = DateTime(now.year, now.month, 0, 23, 59, 59, 999);

    final assetsFuture = _apiClient.get<List<AssetRecord>>(
      '/api/assets',
      parser: (data) => _parseItems(data, AssetRecord.fromJson),
    );
    final loansFuture = _apiClient.get<List<LoanRecord>>(
      '/api/loans',
      parser: (data) => _parseItems(data, LoanRecord.fromJson),
    );
    final savingsFuture = _apiClient.get<List<SavingsGoalRecord>>(
      '/api/savings',
      parser: (data) => _parseItems(data, SavingsGoalRecord.fromJson),
    );
    final expenseFuture = _apiClient.get<ConsumptionSummary>(
      '/api/metrics/consumption/summary',
      queryParameters: _summaryQuery('EXPENSE', start, end),
      parser: (data) => ConsumptionSummary.fromJson(data as Map<String, dynamic>),
    );
    final incomeFuture = _apiClient.get<ConsumptionSummary>(
      '/api/metrics/consumption/summary',
      queryParameters: _summaryQuery('INCOME', start, end),
      parser: (data) => ConsumptionSummary.fromJson(data as Map<String, dynamic>),
    );
    final lastExpenseFuture = _apiClient.get<ConsumptionSummary>(
      '/api/metrics/consumption/summary',
      queryParameters: _summaryQuery('EXPENSE', lastMonthStart, lastMonthEnd),
      parser: (data) => ConsumptionSummary.fromJson(data as Map<String, dynamic>),
    );
    final lastIncomeFuture = _apiClient.get<ConsumptionSummary>(
      '/api/metrics/consumption/summary',
      queryParameters: _summaryQuery('INCOME', lastMonthStart, lastMonthEnd),
      parser: (data) => ConsumptionSummary.fromJson(data as Map<String, dynamic>),
    );
    final transactionsFuture = _apiClient.get<List<TransactionRecord>>(
      '/api/transactions',
      queryParameters: const {
        'page': 1,
        'pageSize': 5,
      },
      parser: (data) => _parseItems(data, TransactionRecord.fromJson),
    );
    final savingsTransactionsFuture = _apiClient.get<List<TransactionRecord>>(
      '/api/transactions',
      queryParameters: const {
        'pageSize': 100,
      },
      parser: (data) => _parseItems(data, TransactionRecord.fromJson),
    );
    final budgetAlertsFuture = _apiClient.get<List<BudgetAlertRecord>>(
      '/api/budgets/alerts',
      parser: (data) {
        final map = data as Map<String, dynamic>;
        final alerts = map['alerts'] as List<dynamic>? ?? const <dynamic>[];
        return alerts
            .map((item) => BudgetAlertRecord.fromJson(item as Map<String, dynamic>))
            .toList(growable: false);
      },
    );

    final assets = await assetsFuture;
    final loans = await loansFuture;
    final savings = await savingsFuture;
    final expenseData = await expenseFuture;
    final incomeData = await incomeFuture;
    final lastMonthExpenseData = await lastExpenseFuture;
    final lastMonthIncomeData = await lastIncomeFuture;
    final recentTransactions = await transactionsFuture;
    final savingsTransactions = await savingsTransactionsFuture;
    final budgetAlerts = await budgetAlertsFuture;

    final monthSavingsIncome = savingsTransactions
        .where((item) => item.isSavingsFlow && item.type == 'INCOME' && item.date.isAfter(start.subtract(const Duration(milliseconds: 1))))
        .fold<double>(0, (sum, item) => sum + item.amount);

    final monthSavingsExpense = savingsTransactions
        .where((item) => item.isSavingsFlow && item.type == 'EXPENSE' && item.date.isAfter(start.subtract(const Duration(milliseconds: 1))))
        .fold<double>(0, (sum, item) => sum + item.amount);

    final totalAssets = assets.fold<double>(0, (sum, item) => sum + item.estimatedValue);
    final unsyncedSavings = savings.where((item) => !item.syncToAssets).fold<double>(0, (sum, item) => sum + item.currentAmount);
    final totalDebt = loans.fold<double>(0, (sum, item) => sum + item.remainingAmount);

    return DashboardData(
      totalAssets: totalAssets + unsyncedSavings,
      totalDebt: totalDebt,
      monthExpense: expenseData.totalExpense,
      monthIncome: incomeData.totalExpense,
      lastMonthExpense: lastMonthExpenseData.totalExpense,
      lastMonthIncome: lastMonthIncomeData.totalExpense,
      monthSavingsIncome: monthSavingsIncome,
      monthSavingsExpense: monthSavingsExpense,
      recentTransactions: recentTransactions,
      budgetAlerts: budgetAlerts,
    );
  }

  Map<String, dynamic> _summaryQuery(String type, DateTime start, DateTime end) {
    return {
      'type': type,
      'startDate': start.toIso8601String(),
      'endDate': end.toIso8601String(),
    };
  }

  List<T> _parseItems<T>(
    dynamic data,
    T Function(Map<String, dynamic> json) fromJson,
  ) {
    final map = data as Map<String, dynamic>;
    final items = map['items'] as List<dynamic>? ?? const <dynamic>[];
    return items.map((item) => fromJson(item as Map<String, dynamic>)).toList(growable: false);
  }
}

class DashboardData {
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

  final double totalAssets;
  final double totalDebt;
  final double monthExpense;
  final double monthIncome;
  final double lastMonthExpense;
  final double lastMonthIncome;
  final double monthSavingsIncome;
  final double monthSavingsExpense;
  final List<TransactionRecord> recentTransactions;
  final List<BudgetAlertRecord> budgetAlerts;

  bool get isEmpty =>
      totalAssets == 0 &&
      totalDebt == 0 &&
      monthExpense == 0 &&
      monthIncome == 0 &&
      recentTransactions.isEmpty;
}

class AssetRecord {
  const AssetRecord({
    required this.estimatedValue,
  });

  final double estimatedValue;

  factory AssetRecord.fromJson(Map<String, dynamic> json) {
    return AssetRecord(
      estimatedValue: _toDouble(json['estimatedValue'] ?? json['balance']),
    );
  }
}

class LoanRecord {
  const LoanRecord({
    required this.remainingAmount,
  });

  final double remainingAmount;

  factory LoanRecord.fromJson(Map<String, dynamic> json) {
    return LoanRecord(
      remainingAmount: _toDouble(json['remainingAmount']),
    );
  }
}

class SavingsGoalRecord {
  const SavingsGoalRecord({
    required this.currentAmount,
    required this.syncToAssets,
  });

  final double currentAmount;
  final bool syncToAssets;

  factory SavingsGoalRecord.fromJson(Map<String, dynamic> json) {
    final planConfig = json['planConfig'];
    final assetSync = planConfig is Map<String, dynamic> ? planConfig['assetSync'] : null;
    final sourceAssetId = assetSync is Map<String, dynamic> ? (assetSync['sourceAssetId'] as String?)?.trim() : null;
    final holdingAssetId = assetSync is Map<String, dynamic> ? (assetSync['holdingAssetId'] as String?)?.trim() : null;
    final syncToAssets = assetSync is Map<String, dynamic> &&
        assetSync['syncToAssets'] == true &&
        ((sourceAssetId != null && sourceAssetId.isNotEmpty) || (holdingAssetId != null && holdingAssetId.isNotEmpty));

    return SavingsGoalRecord(
      currentAmount: _toDouble(json['currentAmount']),
      syncToAssets: syncToAssets,
    );
  }
}

class ConsumptionSummary {
  const ConsumptionSummary({
    required this.totalExpense,
  });

  final double totalExpense;

  factory ConsumptionSummary.fromJson(Map<String, dynamic> json) {
    return ConsumptionSummary(
      totalExpense: _toDouble(json['totalExpense']),
    );
  }
}

class TransactionRecord {
  const TransactionRecord({
    required this.id,
    required this.date,
    required this.type,
    required this.amount,
    required this.category,
    required this.platform,
    required this.merchant,
  });

  final String id;
  final DateTime date;
  final String type;
  final double amount;
  final String category;
  final String platform;
  final String? merchant;

  bool get isSavingsFlow {
    final text = '$category ${merchant ?? ''}';
    return text.contains('储蓄') || text.contains('存款');
  }

  factory TransactionRecord.fromJson(Map<String, dynamic> json) {
    return TransactionRecord(
      id: json['id'] as String? ?? '',
      date: DateTime.tryParse(json['date'] as String? ?? '') ?? DateTime.now(),
      type: json['type'] as String? ?? 'EXPENSE',
      amount: _toDouble(json['amount']),
      category: json['category'] as String? ?? '未分类',
      platform: json['platform'] as String? ?? 'unknown',
      merchant: json['merchant'] as String?,
    );
  }
}

class BudgetAlertRecord {
  const BudgetAlertRecord({
    required this.id,
    required this.category,
    required this.period,
    required this.status,
    required this.percent,
    this.platform,
  });

  final String id;
  final String category;
  final String period;
  final String status;
  final double percent;
  final String? platform;

  factory BudgetAlertRecord.fromJson(Map<String, dynamic> json) {
    return BudgetAlertRecord(
      id: json['id'] as String? ?? '',
      category: json['category'] as String? ?? '未命名预算',
      period: json['period'] as String? ?? '',
      status: json['status'] as String? ?? 'normal',
      percent: _toDouble(json['percent']),
      platform: json['platform'] as String?,
    );
  }
}

double _toDouble(dynamic value) {
  if (value is num) {
    return value.toDouble();
  }
  return double.tryParse('$value') ?? 0;
}
