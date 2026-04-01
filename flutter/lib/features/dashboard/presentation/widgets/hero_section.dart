import 'package:flutter/material.dart';
import '../../data/dashboard_model.dart';
import '../dashboard_utils.dart';

class DashboardHeroSection extends StatelessWidget {
  final DashboardData data;
  final bool alertsDismissed;
  final VoidCallback onDismissAlerts;
  final VoidCallback? onViewBudgets;

  const DashboardHeroSection({
    super.key,
    required this.data,
    required this.alertsDismissed,
    required this.onDismissAlerts,
    this.onViewBudgets,
  });

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final width = MediaQuery.sizeOf(context).width;
    final compact = width < 640;
    final criticalAlerts = data.budgetAlerts
        .where((alert) => alert.status != 'normal')
        .toList();
    final overdueAlerts = data.budgetAlerts
        .where((alert) => alert.status == 'overdue')
        .length;
    final warningAlerts = data.budgetAlerts
        .where((alert) => alert.status == 'warning')
        .length;

    final metricItems = <_HeroMetricItem>[
      _HeroMetricItem(
        label: '总资产',
        value: formatCurrency(data.totalAssets),
        mobileValue: formatCurrency(data.totalAssets, compact: true),
        detail: '含资产和储蓄计划',
        icon: Icons.account_balance_wallet_rounded,
        accent: const Color(0xFF93C5FD),
      ),
      _HeroMetricItem(
        label: '总负债',
        value: formatCurrency(data.totalDebt),
        mobileValue: formatCurrency(data.totalDebt, compact: true),
        detail: data.totalDebt > 0 ? '持续关注偿付节奏' : '当前状态健康',
        icon: Icons.credit_card_rounded,
        accent: const Color(0xFFFCA5A5),
      ),
      _HeroMetricItem(
        label: '储蓄净流入',
        value: formatCurrency(data.savingsDelta),
        mobileValue: formatCurrency(data.savingsDelta, compact: true),
        detail:
            '${formatCurrency(data.monthSavingsIncome)} 流入 / ${formatCurrency(data.monthSavingsExpense)} 流出',
        icon: Icons.savings_rounded,
        accent: data.savingsDelta >= 0
            ? const Color(0xFF6EE7B7)
            : const Color(0xFFFCD34D),
      ),
      _HeroMetricItem(
        label: '负债占比',
        value: '${data.debtRatio.toStringAsFixed(0)}%',
        detail: data.totalDebt > 0
            ? '总负债 ${formatCurrency(data.totalDebt)}'
            : '当前无负债压力',
        icon: Icons.pie_chart_rounded,
        accent: const Color(0xFF93C5FD),
      ),
      _HeroMetricItem(
        label: '预算预警',
        value: '${criticalAlerts.length} 项',
        detail: overdueAlerts > 0
            ? '$overdueAlerts 项已经超支'
            : warningAlerts > 0
            ? '$warningAlerts 项接近上限'
            : '预算执行稳定',
        icon: Icons.shield_rounded,
        accent: criticalAlerts.isNotEmpty
            ? const Color(0xFFFCA5A5)
            : const Color(0xFF93C5FD),
      ),
      _HeroMetricItem(
        label: '储蓄净流入',
        value: formatCurrency(data.savingsDelta),
        mobileValue: formatCurrency(data.savingsDelta, compact: true),
        detail: data.savingsDelta >= 0 ? '本月存下来的钱在增加' : '本月储蓄有回撤',
        icon: Icons.savings_outlined,
        accent: data.savingsDelta >= 0
            ? const Color(0xFF6EE7B7)
            : const Color(0xFFFCD34D),
      ),
    ];

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF173052), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(compact ? 22 : 26),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1F0F172A),
            blurRadius: 42,
            offset: Offset(0, 18),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            top: -36,
            left: 24,
            child: Container(
              width: compact ? 120 : 180,
              height: compact ? 120 : 180,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.08),
              ),
            ),
          ),
          Positioned(
            right: -48,
            top: 18,
            child: Container(
              width: compact ? 180 : 240,
              height: compact ? 180 : 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF60A5FA).withValues(alpha: 0.12),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(compact ? 16 : 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LayoutBuilder(
                  builder: (context, constraints) {
                    final stacked = constraints.maxWidth < 540;
                    final badges = Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _HeroBadge(
                          icon: Icons.auto_awesome_rounded,
                          label: '总览仪表盘',
                          background: Colors.white.withValues(alpha: 0.12),
                          foreground: const Color(0xFFD8EAFF),
                        ),
                        _HeroBadge(
                          icon: Icons.calendar_today_rounded,
                          label: '${now.year}年${now.month}月',
                          background: Colors.white.withValues(alpha: 0.08),
                          foreground: Colors.white,
                        ),
                      ],
                    );

                    final savingsCard = _SavingsRateCard(
                      savingsRate: data.savingsRate,
                      monthlyBalance: data.monthlyBalance,
                    );

                    if (stacked) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          badges,
                          const SizedBox(height: 12),
                          savingsCard,
                        ],
                      );
                    }

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: badges),
                        const SizedBox(width: 12),
                        savingsCard,
                      ],
                    );
                  },
                ),
                if (!compact) ...[
                  const SizedBox(height: 18),
                  const Text(
                    '资产、负债、现金流和预算风险放在同一屏里，优先看见本月真正影响决策的数字。',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: Color(0xFFAEC4DB),
                    ),
                  ),
                ],
                SizedBox(height: compact ? 14 : 18),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final stacked = constraints.maxWidth < 520;
                    final balanceBadge = Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: data.monthlyBalance >= 0
                            ? const Color(0xFFECFDF5).withValues(alpha: 0.14)
                            : const Color(0xFFFEF2F2).withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: data.monthlyBalance >= 0
                              ? const Color(0xFF6EE7B7).withValues(alpha: 0.35)
                              : const Color(0xFFFCA5A5).withValues(alpha: 0.35),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            data.monthlyBalance >= 0
                                ? Icons.arrow_upward_rounded
                                : Icons.trending_down_rounded,
                            size: 14,
                            color: data.monthlyBalance >= 0
                                ? const Color(0xFF6EE7B7)
                                : const Color(0xFFFCA5A5),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '本月结余 ${formatCurrency(data.monthlyBalance)}',
                            style: TextStyle(
                              fontSize: compact ? 11 : 12,
                              fontWeight: FontWeight.w600,
                              color: data.monthlyBalance >= 0
                                  ? const Color(0xFF6EE7B7)
                                  : const Color(0xFFFCA5A5),
                            ),
                          ),
                        ],
                      ),
                    );

                    final netWorthBlock = Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '当前净资产',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFFAEC4DB),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          formatCurrency(data.netWorth),
                          style: TextStyle(
                            fontSize: compact ? 34 : 46,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -1.3,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    );

                    if (stacked) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          netWorthBlock,
                          const SizedBox(height: 12),
                          balanceBadge,
                        ],
                      );
                    }

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(child: netWorthBlock),
                        const SizedBox(width: 16),
                        balanceBadge,
                      ],
                    );
                  },
                ),
                SizedBox(height: compact ? 14 : 18),
                LayoutBuilder(
                  builder: (context, constraints) {
                    const gap = 8.0;
                    final itemWidth = (constraints.maxWidth - gap * 2) / 3;
                    return Wrap(
                      spacing: gap,
                      runSpacing: gap,
                      children: metricItems
                          .map(
                            (item) => SizedBox(
                              width: itemWidth,
                              child: _HeroMetricCard(
                                item: item,
                                compact: compact,
                              ),
                            ),
                          )
                          .toList(),
                    );
                  },
                ),
                if (criticalAlerts.isNotEmpty &&
                    !alertsDismissed &&
                    width >= 640) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7).withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFFFDE68A).withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(
                              0xFFFBBF24,
                            ).withValues(alpha: 0.18),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.warning_amber_rounded,
                            size: 16,
                            color: Color(0xFFFBBF24),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '预算提醒正在升温',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '当前有 ${criticalAlerts.length} 项预算需要关注，其中 $overdueAlerts 项已经超支。',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFAEC4DB),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (onViewBudgets != null)
                          Padding(
                            padding: const EdgeInsets.only(left: 12),
                            child: FilledButton(
                              onPressed: onViewBudgets,
                              style: FilledButton.styleFrom(
                                backgroundColor: const Color(0xFF3B82F6),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 10,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                              child: const Text('查看预算'),
                            ),
                          ),
                        Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: TextButton(
                            onPressed: onDismissAlerts,
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFFAEC4DB),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 10,
                              ),
                            ),
                            child: const Text('暂时收起'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color background;
  final Color foreground;

  const _HeroBadge({
    required this.icon,
    required this.label,
    required this.background,
    required this.foreground,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: foreground),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: foreground,
            ),
          ),
        ],
      ),
    );
  }
}

class _SavingsRateCard extends StatelessWidget {
  final double savingsRate;
  final double monthlyBalance;

  const _SavingsRateCard({
    required this.savingsRate,
    required this.monthlyBalance,
  });

  @override
  Widget build(BuildContext context) {
    final positive = monthlyBalance >= 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            positive ? Icons.trending_up_rounded : Icons.trending_down_rounded,
            size: 15,
            color: positive ? const Color(0xFF6EE7B7) : const Color(0xFFFCD34D),
          ),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${savingsRate.toStringAsFixed(0)}%',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const Text(
                '本月结余率',
                style: TextStyle(fontSize: 10, color: Color(0xFFAEC4DB)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroMetricItem {
  final String label;
  final String value;
  final String? mobileValue;
  final String detail;
  final IconData icon;
  final Color accent;

  const _HeroMetricItem({
    required this.label,
    required this.value,
    this.mobileValue,
    required this.detail,
    required this.icon,
    required this.accent,
  });
}

class _HeroMetricCard extends StatelessWidget {
  final _HeroMetricItem item;
  final bool compact;

  const _HeroMetricCard({required this.item, required this.compact});

  @override
  Widget build(BuildContext context) {
    final displayValue = compact && item.mobileValue != null
        ? item.mobileValue!
        : item.value;

    return Container(
      constraints: BoxConstraints(minHeight: compact ? 96 : 108),
      padding: EdgeInsets.all(compact ? 10 : 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(item.icon, size: 13, color: item.accent),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  item.label,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFAEC4DB),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const Spacer(),
          Text(
            displayValue,
            style: TextStyle(
              fontSize: compact ? 15 : 18,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            item.detail,
            style: const TextStyle(fontSize: 10, color: Color(0xFF7FA0BE)),
            maxLines: compact ? 1 : 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
