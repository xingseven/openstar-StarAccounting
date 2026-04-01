import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/consumption_model.dart';
import '../data/consumption_repository.dart';

// ─── 筛选状态 ──────────────────────────────────────────────────
class ConsumptionFilter {
  final String dateFilter; // month | all | custom
  final String year;
  final String month;
  final String platform; // '' = 全部
  final String searchTerm;

  const ConsumptionFilter({
    this.dateFilter = 'month',
    this.year = '',
    this.month = '',
    this.platform = '',
    this.searchTerm = '',
  });

  ConsumptionFilter copyWith({
    String? dateFilter,
    String? year,
    String? month,
    String? platform,
    String? searchTerm,
  }) =>
      ConsumptionFilter(
        dateFilter: dateFilter ?? this.dateFilter,
        year: year ?? this.year,
        month: month ?? this.month,
        platform: platform ?? this.platform,
        searchTerm: searchTerm ?? this.searchTerm,
      );
}

// ─── 看板状态 ──────────────────────────────────────────────────
class ConsumptionState {
  final ConsumptionData data;
  final bool loading;
  final bool usingMock;
  final ConsumptionFilter filter;

  const ConsumptionState({
    required this.data,
    this.loading = false,
    this.usingMock = false,
    required this.filter,
  });

  ConsumptionState copyWith({
    ConsumptionData? data,
    bool? loading,
    bool? usingMock,
    ConsumptionFilter? filter,
  }) =>
      ConsumptionState(
        data: data ?? this.data,
        loading: loading ?? this.loading,
        usingMock: usingMock ?? this.usingMock,
        filter: filter ?? this.filter,
      );

  /// 客户端二次过滤：按搜索词 & 平台
  List<Transaction> get filteredTransactions {
    final term = filter.searchTerm.trim().toLowerCase();
    return data.transactions.where((tx) {
      final matchSearch = term.isEmpty ||
          tx.merchant.toLowerCase().contains(term) ||
          tx.category.toLowerCase().contains(term);
      final matchPlatform =
          filter.platform.isEmpty || tx.platform == filter.platform;
      return matchSearch && matchPlatform;
    }).toList();
  }
}

// ─── Notifier（Riverpod 3.x 用 Notifier，不用 StateNotifier）───
class ConsumptionNotifier extends Notifier<ConsumptionState> {
  @override
  ConsumptionState build() {
    // 初始状态，异步加载
    Future.microtask(_load);
    return ConsumptionState(
      data: ConsumptionData.mock,
      loading: true,
      filter: const ConsumptionFilter(),
    );
  }

  ConsumptionRepository get _repo =>
      ref.read(consumptionRepositoryProvider);

  Future<void> _load() async {
    state = state.copyWith(loading: true);
    final f = state.filter;
    final data = await _repo.fetchDashboard(
      dateFilter: f.dateFilter,
      year: f.year.isEmpty ? null : f.year,
      month: f.month.isEmpty ? null : f.month,
      platform: f.platform.isEmpty ? null : f.platform,
    );
    state = state.copyWith(
      data: data,
      loading: false,
      usingMock: data.summary.expenseCount == 87,
    );
  }

  void setDateFilter(String value) {
    state = state.copyWith(filter: state.filter.copyWith(dateFilter: value));
    _load();
  }

  void setCustomPeriod({required String year, required String month}) {
    state = state.copyWith(
      filter: state.filter.copyWith(
        dateFilter: 'custom',
        year: year,
        month: month,
      ),
    );
    _load();
  }

  void setPlatform(String value) {
    state = state.copyWith(filter: state.filter.copyWith(platform: value));
    _load();
  }

  void setSearchTerm(String value) {
    state = state.copyWith(filter: state.filter.copyWith(searchTerm: value));
  }

  Future<void> refresh() => _load();

  Future<void> addTransaction(Transaction tx) async {
    await _repo.addTransaction(tx);
    await _load();
  }

  Future<void> deleteTransaction(String id) async {
    await _repo.deleteTransaction(id);
    await _load();
  }
}

// ─── Providers ────────────────────────────────────────────────
final consumptionRepositoryProvider =
    Provider<ConsumptionRepository>((_) => ConsumptionRepository());

final consumptionProvider =
    NotifierProvider<ConsumptionNotifier, ConsumptionState>(
        ConsumptionNotifier.new);
