import '../../../core/api_client.dart';
import 'dashboard_model.dart';

class DashboardRepository {
  final ApiClient _api;
  DashboardRepository(this._api);

  Future<DashboardData> fetchDashboard() async {
    try {
      final now = DateTime.now();
      final start = DateTime(now.year, now.month, 1).toIso8601String();
      final end = DateTime(now.year, now.month + 1, 0, 23, 59, 59).toIso8601String();
      final lastStart = DateTime(now.year, now.month - 1, 1).toIso8601String();
      final lastEnd = DateTime(now.year, now.month, 0, 23, 59, 59).toIso8601String();

      final responses = await Future.wait([
        _api.get('/api/assets'),
        _api.get('/api/loans'),
        _api.get('/api/savings'),
        _api.get('/api/metrics/consumption/summary?type=EXPENSE&startDate=$start&endDate=$end'),
        _api.get('/api/metrics/consumption/summary?type=INCOME&startDate=$start&endDate=$end'),
        _api.get('/api/metrics/consumption/summary?type=EXPENSE&startDate=$lastStart&endDate=$lastEnd'),
        _api.get('/api/metrics/consumption/summary?type=INCOME&startDate=$lastStart&endDate=$lastEnd'),
        _api.get('/api/transactions?page=1&pageSize=5'),
        _api.get('/api/transactions?pageSize=100'),
        _api.get('/api/budgets/alerts'),
      ]);

      // 每个 Response 的 data 字段才是 Map
      Map<String, dynamic> d(int i) =>
          responses[i].data as Map<String, dynamic>;

      final assets = (d(0)['items'] as List? ?? []);
      final loans = (d(1)['items'] as List? ?? []);
      final savings = (d(2)['items'] as List? ?? []);
      final expenseData = d(3);
      final incomeData = d(4);
      final lastExpenseData = d(5);
      final lastIncomeData = d(6);
      final transactions = (d(7)['items'] as List? ?? []);
      final allTx = (d(8)['items'] as List? ?? []);
      final alerts = (d(9)['alerts'] as List? ?? []);

      final assetsTotal = assets.fold<double>(
        0,
        (sum, a) => sum + double.parse(
            ((a as Map)['estimatedValue'] ?? a['balance']).toString()),
      );
      final loansTotal = loans.fold<double>(
        0,
        (sum, l) => sum +
            double.parse((l as Map)['remainingAmount'].toString()),
      );

      double unsyncedSavings = 0;
      for (final s in savings) {
        final m = s as Map;
        final cfg = m['planConfig'];
        final synced = cfg?['syncToAssets'] == true;
        if (!synced) {
          unsyncedSavings += double.parse(m['currentAmount'].toString());
        }
      }

      final savingsKeywords = ['储蓄', '存款'];
      final monthStart = DateTime.parse(start);
      double savingsIncome = 0, savingsExpense = 0;
      for (final tx in allTx) {
        final m = tx as Map;
        final cat = m['category'] as String? ?? '';
        final mer = m['merchant'] as String? ?? '';
        if (!savingsKeywords.any((k) => cat.contains(k) || mer.contains(k))) {
          continue;
        }
        final txDate = DateTime.tryParse(m['date'] as String? ?? '');
        if (txDate == null || txDate.isBefore(monthStart)) continue;
        final amt = double.parse(m['amount'].toString());
        if (m['type'] == 'INCOME') {
          savingsIncome += amt;
        } else {
          savingsExpense += amt;
        }
      }

      final data = DashboardData(
        totalAssets: assetsTotal + unsyncedSavings,
        totalDebt: loansTotal,
        monthExpense: double.parse(
            (expenseData['totalExpense'] ?? '0').toString()),
        monthIncome: double.parse(
            (incomeData['totalExpense'] ?? '0').toString()),
        lastMonthExpense: double.parse(
            (lastExpenseData['totalExpense'] ?? '0').toString()),
        lastMonthIncome: double.parse(
            (lastIncomeData['totalExpense'] ?? '0').toString()),
        monthSavingsIncome: savingsIncome,
        monthSavingsExpense: savingsExpense,
        recentTransactions: transactions
            .map((e) => DashboardTransaction.fromJson(e as Map<String, dynamic>))
            .toList(),
        budgetAlerts: alerts
            .map((e) => BudgetAlert.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

      if (data.totalAssets == 0 &&
          data.totalDebt == 0 &&
          data.monthExpense == 0 &&
          data.monthIncome == 0 &&
          data.recentTransactions.isEmpty) {
        return kMockDashboard;
      }
      return data;
    } catch (_) {
      return kMockDashboard;
    }
  }
}
