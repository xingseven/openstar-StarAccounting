import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../data/dashboard_model.dart';
import 'dashboard_provider.dart';
import 'dashboard_utils.dart';
import 'widgets/cashflow_chart_card.dart';
import 'widgets/category_pie_card.dart';
import 'widgets/hero_section.dart';
import 'widgets/income_expense_card.dart';
import 'widgets/recent_transactions_card.dart';

class DashboardPage extends ConsumerStatefulWidget {
  const DashboardPage({super.key});

  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  bool _alertsDismissed = false;

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: dashboardPageBackground,
      body: async.when(
        loading: () => const _LoadingShell(),
        error: (_, __) =>
            _ErrorShell(onRetry: () => ref.invalidate(dashboardProvider)),
        data: (data) => _DashboardBody(
          data: data,
          alertsDismissed: _alertsDismissed,
          onDismissAlerts: () => setState(() => _alertsDismissed = true),
          onViewAll: () => context.go('/consumption'),
          onViewBudgets: () => context.go('/budgets'),
          onRefresh: () async {
            ref.invalidate(dashboardProvider);
            await ref.read(dashboardProvider.future);
          },
        ),
      ),
    );
  }
}

class _DashboardBody extends StatelessWidget {
  final DashboardData data;
  final bool alertsDismissed;
  final VoidCallback onDismissAlerts;
  final VoidCallback onViewAll;
  final VoidCallback onViewBudgets;
  final Future<void> Function() onRefresh;

  const _DashboardBody({
    required this.data,
    required this.alertsDismissed,
    required this.onDismissAlerts,
    required this.onViewAll,
    required this.onViewBudgets,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final horizontalPadding = width >= 1280
            ? 24.0
            : width >= 720
            ? 20.0
            : 16.0;
        final criticalAlertsCount = data.budgetAlerts
            .where((alert) => alert.status != 'normal')
            .length;

        return RefreshIndicator(
          onRefresh: onRefresh,
          color: const Color(0xFF2563EB),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            slivers: [
              SliverPadding(
                padding: EdgeInsets.fromLTRB(
                  horizontalPadding,
                  width >= 720 ? 20 : 16,
                  horizontalPadding,
                  32,
                ),
                sliver: SliverToBoxAdapter(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1680),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          DashboardHeroSection(
                            data: data,
                            alertsDismissed: alertsDismissed,
                            onDismissAlerts: onDismissAlerts,
                            onViewBudgets: onViewBudgets,
                          ),
                          const SizedBox(height: 16),
                          _DashboardPanels(
                            width: width,
                            data: data,
                            criticalAlertsCount: criticalAlertsCount,
                            onViewAll: onViewAll,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _DashboardPanels extends StatelessWidget {
  final double width;
  final DashboardData data;
  final int criticalAlertsCount;
  final VoidCallback onViewAll;

  const _DashboardPanels({
    required this.width,
    required this.data,
    required this.criticalAlertsCount,
    required this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    final incomeCard = IncomeExpenseCard(
      income: data.monthIncome,
      expense: data.monthExpense,
      lastMonthIncome: data.lastMonthIncome,
      lastMonthExpense: data.lastMonthExpense,
    );

    final cashflowCard = CashflowChartCard(
      income: data.monthIncome,
      expense: data.monthExpense,
      totalAssets: data.totalAssets,
      criticalAlertsCount: criticalAlertsCount,
    );

    final categoryCard = CategoryPieCard(transactions: data.recentTransactions);

    if (width >= 1280) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 10,
            child: Column(
              children: [
                incomeCard,
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 12, child: cashflowCard),
                    const SizedBox(width: 16),
                    Expanded(flex: 10, child: categoryCard),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            flex: 5,
            child: RecentTransactionsCard(
              transactions: data.recentTransactions,
              onViewAll: onViewAll,
              minHeight: 560,
            ),
          ),
        ],
      );
    }

    if (width >= 900) {
      return Column(
        children: [
          incomeCard,
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 10,
                child: RecentTransactionsCard(
                  transactions: data.recentTransactions,
                  onViewAll: onViewAll,
                  minHeight: 520,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 9,
                child: Column(
                  children: [
                    cashflowCard,
                    const SizedBox(height: 16),
                    categoryCard,
                  ],
                ),
              ),
            ],
          ),
        ],
      );
    }

    return Column(
      children: [
        incomeCard,
        const SizedBox(height: 16),
        RecentTransactionsCard(
          transactions: data.recentTransactions,
          onViewAll: onViewAll,
        ),
        const SizedBox(height: 16),
        cashflowCard,
        const SizedBox(height: 16),
        categoryCard,
      ],
    );
  }
}

class _LoadingShell extends StatelessWidget {
  const _LoadingShell();

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          sliver: SliverToBoxAdapter(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1680),
                child: const Column(
                  children: [
                    _SkeletonBlock(height: 320, radius: 26),
                    SizedBox(height: 16),
                    _SkeletonBlock(height: 180, radius: 22),
                    SizedBox(height: 16),
                    _SkeletonBlock(height: 260, radius: 22),
                    SizedBox(height: 16),
                    _SkeletonBlock(height: 220, radius: 22),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _SkeletonBlock extends StatelessWidget {
  final double height;
  final double radius;

  const _SkeletonBlock({required this.height, required this.radius});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

class _ErrorShell extends StatelessWidget {
  final VoidCallback onRetry;

  const _ErrorShell({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.error_outline_rounded,
            size: 40,
            color: dashboardMutedText,
          ),
          const SizedBox(height: 12),
          const Text(
            '加载失败',
            style: TextStyle(fontSize: 15, color: dashboardLabelText),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded, size: 16),
            label: const Text('重试'),
          ),
        ],
      ),
    );
  }
}
