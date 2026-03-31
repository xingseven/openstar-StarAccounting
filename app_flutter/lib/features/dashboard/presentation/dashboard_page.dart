import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../shared/widgets/state_views.dart';
import '../data/dashboard_repository.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardDataProvider);

    return dashboardAsync.when(
      data: (data) {
        if (data.isEmpty) {
          return const AppEmptyView(
            title: '总览页还没有真实数据',
            description: '后端接口已经接好，等导入账单或创建资产后，这里会自动显示真实概览。',
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(dashboardDataProvider);
            await ref.read(dashboardDataProvider.future);
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              _HeroSection(data: data),
              const SizedBox(height: 20),
              LayoutBuilder(
                builder: (context, constraints) {
                  final wide = constraints.maxWidth >= 1080;
                  if (wide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 7,
                          child: Column(
                            children: [
                              _MetricGrid(data: data),
                              const SizedBox(height: 20),
                              _RecentTransactionsCard(items: data.recentTransactions),
                            ],
                          ),
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          flex: 4,
                          child: _BudgetAlertsCard(items: data.budgetAlerts),
                        ),
                      ],
                    );
                  }

                  return Column(
                    children: [
                      _MetricGrid(data: data),
                      const SizedBox(height: 20),
                      _BudgetAlertsCard(items: data.budgetAlerts),
                      const SizedBox(height: 20),
                      _RecentTransactionsCard(items: data.recentTransactions),
                    ],
                  );
                },
              ),
            ],
          ),
        );
      },
      loading: () => const AppLoadingView(message: '总览数据加载中...'),
      error: (error, _) => AppErrorView(
        message: '$error',
        onRetry: () => ref.invalidate(dashboardDataProvider),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({
    required this.data,
  });

  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final balance = data.totalAssets - data.totalDebt;
    final incomeChange = _calcRate(data.monthIncome, data.lastMonthIncome);
    final expenseChange = _calcRate(data.monthExpense, data.lastMonthExpense);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0F2D52),
            Color(0xFF174A85),
            Color(0xFF2B6CB0),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 920;
          final info = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '总览页面已开始迁移到 Flutter',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 10),
              Text(
                '这版先打通真实数据链路，重点验证登录态、接口聚合和跨端壳层。',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.white.withValues(alpha: 0.84),
                    ),
              ),
              const SizedBox(height: 22),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _HeroPill(
                    label: '当前净资产',
                    value: _formatCurrency(balance),
                  ),
                  _HeroPill(
                    label: '本月收入环比',
                    value: _formatPercent(incomeChange),
                  ),
                  _HeroPill(
                    label: '本月支出环比',
                    value: _formatPercent(expenseChange),
                  ),
                ],
              ),
            ],
          );

          final summary = Container(
            width: wide ? 280 : double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SideMetricRow(label: '本月储蓄流入', value: _formatCurrency(data.monthSavingsIncome)),
                const SizedBox(height: 16),
                _SideMetricRow(label: '本月储蓄流出', value: _formatCurrency(data.monthSavingsExpense)),
                const SizedBox(height: 16),
                _SideMetricRow(
                  label: '预算预警数',
                  value: '${data.budgetAlerts.length} 项',
                ),
              ],
            ),
          );

          if (wide) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: info),
                const SizedBox(width: 20),
                summary,
              ],
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              info,
              const SizedBox(height: 20),
              summary,
            ],
          );
        },
      ),
    );
  }
}

class _MetricGrid extends StatelessWidget {
  const _MetricGrid({
    required this.data,
  });

  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final cards = [
      _MetricCardData(
        title: '总资产',
        value: _formatCurrency(data.totalAssets),
        detail: '包含未同步到资产账户的储蓄目标',
        color: const Color(0xFF175CD3),
        icon: Icons.account_balance_wallet_outlined,
      ),
      _MetricCardData(
        title: '总负债',
        value: _formatCurrency(data.totalDebt),
        detail: '贷款剩余金额自动汇总',
        color: const Color(0xFFB42318),
        icon: Icons.credit_card_off_outlined,
      ),
      _MetricCardData(
        title: '本月收入',
        value: _formatCurrency(data.monthIncome),
        detail: '上月 ${_formatCurrency(data.lastMonthIncome)}',
        color: const Color(0xFF079455),
        icon: Icons.trending_up_rounded,
      ),
      _MetricCardData(
        title: '本月支出',
        value: _formatCurrency(data.monthExpense),
        detail: '上月 ${_formatCurrency(data.lastMonthExpense)}',
        color: const Color(0xFFF79009),
        icon: Icons.trending_down_rounded,
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth >= 1100
            ? 4
            : constraints.maxWidth >= 760
                ? 2
                : 1;

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: cards.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: crossAxisCount == 1 ? 2.2 : 1.35,
          ),
          itemBuilder: (context, index) {
            final card = cards[index];
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: card.color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(card.icon, color: card.color),
                        ),
                        const Spacer(),
                        Text(
                          card.title,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                color: const Color(0xFF475467),
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(
                      card.value,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      card.detail,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF667085),
                          ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _RecentTransactionsCard extends StatelessWidget {
  const _RecentTransactionsCard({
    required this.items,
  });

  final List<TransactionRecord> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '近期流水',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              '第一阶段先保留最近 5 条流水，确认真实数据链路已经跑通。',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF667085),
                  ),
            ),
            const SizedBox(height: 18),
            if (items.isEmpty)
              const AppEmptyView(
                title: '暂无流水',
                description: '导入账单或手动新增交易后，这里会展示最近的收支记录。',
              )
            else
              ...items.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _TransactionRow(item: item),
                  )),
          ],
        ),
      ),
    );
  }
}

class _BudgetAlertsCard extends StatelessWidget {
  const _BudgetAlertsCard({
    required this.items,
  });

  final List<BudgetAlertRecord> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '预算提醒',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              '先接现有 `/api/budgets/alerts`，后续再继续补预算页和跨模块联动。',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF667085),
                  ),
            ),
            const SizedBox(height: 18),
            if (items.isEmpty)
              const AppEmptyView(
                title: '当前没有预算预警',
                description: '预算达到提醒阈值后，这里会优先提示需要关注的项目。',
              )
            else
              ...items.take(6).map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _BudgetAlertTile(item: item),
                  )),
          ],
        ),
      ),
    );
  }
}

class _TransactionRow extends StatelessWidget {
  const _TransactionRow({
    required this.item,
  });

  final TransactionRecord item;

  @override
  Widget build(BuildContext context) {
    final isExpense = item.type == 'EXPENSE';
    final color = isExpense ? const Color(0xFFB42318) : const Color(0xFF079455);
    final dateText = DateFormat('MM-dd HH:mm').format(item.date.toLocal());

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              isExpense ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
              color: color,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.merchant?.trim().isNotEmpty == true ? item.merchant! : item.category,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  '$dateText · ${item.platform} · ${item.category}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF667085),
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '${isExpense ? '-' : '+'}${_formatCurrency(item.amount)}',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
          ),
        ],
      ),
    );
  }
}

class _BudgetAlertTile extends StatelessWidget {
  const _BudgetAlertTile({
    required this.item,
  });

  final BudgetAlertRecord item;

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (item.status) {
      'overdue' => const Color(0xFFB42318),
      'warning' => const Color(0xFFF79009),
      _ => const Color(0xFF175CD3),
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: statusColor.withValues(alpha: 0.16)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  item.platform?.trim().isNotEmpty == true
                      ? '${item.category} · ${item.platform}'
                      : item.category,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  item.status == 'overdue' ? '超支' : item.status == 'warning' ? '预警' : '正常',
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: (item.percent / 100).clamp(0, 1),
            minHeight: 10,
            borderRadius: BorderRadius.circular(999),
            color: statusColor,
            backgroundColor: Colors.white,
          ),
          const SizedBox(height: 10),
          Text(
            '${item.period} · 已用 ${item.percent.toStringAsFixed(1)}%',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF667085),
                ),
          ),
        ],
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white70,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}

class _SideMetricRow extends StatelessWidget {
  const _SideMetricRow({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white70,
                ),
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
        ),
      ],
    );
  }
}

class _MetricCardData {
  const _MetricCardData({
    required this.title,
    required this.value,
    required this.detail,
    required this.color,
    required this.icon,
  });

  final String title;
  final String value;
  final String detail;
  final Color color;
  final IconData icon;
}

double _calcRate(double current, double previous) {
  if (previous == 0) {
    return current == 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

String _formatPercent(double value) {
  final prefix = value > 0 ? '+' : '';
  return '$prefix${value.toStringAsFixed(1)}%';
}

String _formatCurrency(double value) {
  final formatter = NumberFormat.compactCurrency(
    locale: 'zh_CN',
    symbol: '¥',
    decimalDigits: 2,
  );
  return formatter.format(value);
}
