import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../dashboard_utils.dart';

class CashflowChartCard extends StatelessWidget {
  final double income;
  final double expense;
  final double totalAssets;
  final int criticalAlertsCount;
  final double? minHeight;

  const CashflowChartCard({
    super.key,
    required this.income,
    required this.expense,
    required this.totalAssets,
    required this.criticalAlertsCount,
    this.minHeight,
  });

  @override
  Widget build(BuildContext context) {
    final retainedBalance = (income - expense)
        .clamp(0, double.infinity)
        .toDouble();
    final netBalance = income - expense;
    final maxY = [
      income,
      expense,
      retainedBalance,
    ].reduce((a, b) => a > b ? a : b);

    final barGroups = [
      _buildBar(0, expense, const Color(0xFFEF4444)),
      _buildBar(1, income, const Color(0xFF2563EB)),
      _buildBar(2, retainedBalance, const Color(0xFF0F766E)),
    ];

    final coverRatio = expense > 0
        ? '${(income / expense * 100).toStringAsFixed(0)}%'
        : '100%';
    final assetBuffer = expense > 0
        ? '${(totalAssets / expense).toStringAsFixed(1)} 月'
        : '充足';
    final budgetRisk = criticalAlertsCount > 0 ? '$criticalAlertsCount 项' : '低';

    return Container(
      constraints: BoxConstraints(minHeight: minHeight ?? 0),
      padding: const EdgeInsets.all(20),
      decoration: dashboardSurfaceDecoration(),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final wideStats = constraints.maxWidth >= 900;
          final stats = [
            _CompactStat(
              label: '收入覆盖支出',
              value: coverRatio,
              valueBackground: income >= expense
                  ? const Color(0xFFECFDF5)
                  : const Color(0xFFFEF2F2),
              valueColor: income >= expense
                  ? const Color(0xFF065F46)
                  : const Color(0xFF991B1B),
            ),
            _CompactStat(
              label: '资产缓冲',
              value: assetBuffer,
              valueBackground: const Color(0xFFEFF6FF),
              valueColor: const Color(0xFF1D4ED8),
            ),
            _CompactStat(
              label: '预算风险',
              value: budgetRisk,
              valueBackground: criticalAlertsCount > 0
                  ? const Color(0xFFFEF3C7)
                  : const Color(0xFFECFDF5),
              valueColor: criticalAlertsCount > 0
                  ? const Color(0xFF92400E)
                  : const Color(0xFF065F46),
            ),
          ];

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '本月现金流',
                          style: TextStyle(
                            fontSize: 12,
                            color: dashboardMutedText,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          '收入、支出与可留存空间',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: dashboardBodyText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: netBalance >= 0
                          ? const Color(0xFFECFDF5)
                          : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: netBalance >= 0
                            ? const Color(0xFFBBF7D0)
                            : const Color(0xFFFECACA),
                      ),
                    ),
                    child: Text(
                      '结余 ${formatCurrency(netBalance)}',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: netBalance >= 0
                            ? const Color(0xFF065F46)
                            : const Color(0xFF991B1B),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (wideStats)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 220,
                        child: _CashflowBarChart(
                          maxY: maxY,
                          barGroups: barGroups,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    SizedBox(
                      width: 200,
                      child: Column(
                        children: [
                          for (var i = 0; i < stats.length; i++) ...[
                            if (i > 0) const SizedBox(height: 10),
                            stats[i],
                          ],
                        ],
                      ),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    SizedBox(
                      height: 168,
                      child: _CashflowBarChart(
                        maxY: maxY,
                        barGroups: barGroups,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (var i = 0; i < stats.length; i++) ...[
                          Expanded(child: stats[i]),
                          if (i < stats.length - 1) const SizedBox(width: 8),
                        ],
                      ],
                    ),
                  ],
                ),
            ],
          );
        },
      ),
    );
  }

  BarChartGroupData _buildBar(int x, double y, Color color) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: color,
          width: 24,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
        ),
      ],
    );
  }
}

class _CashflowBarChart extends StatelessWidget {
  final double maxY;
  final List<BarChartGroupData> barGroups;

  const _CashflowBarChart({required this.maxY, required this.barGroups});

  @override
  Widget build(BuildContext context) {
    final safeMaxY = maxY <= 0 ? 1.0 : maxY;
    final interval = safeMaxY / 3;
    const labels = ['支出', '收入', '结余'];

    return BarChart(
      BarChartData(
        maxY: safeMaxY * 1.25,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: interval,
          getDrawingHorizontalLine: (_) =>
              const FlLine(color: Color(0xFFF1F5F9), strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 52,
              interval: interval,
              getTitlesWidget: (value, _) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Text(
                  formatCurrency(value, compact: true),
                  textAlign: TextAlign.right,
                  style: const TextStyle(
                    fontSize: 9,
                    color: dashboardMutedText,
                  ),
                ),
              ),
            ),
          ),
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, _) => Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  labels[value.toInt()],
                  style: const TextStyle(
                    fontSize: 11,
                    color: dashboardLabelText,
                  ),
                ),
              ),
            ),
          ),
        ),
        barGroups: barGroups,
        barTouchData: BarTouchData(enabled: false),
      ),
      duration: Duration.zero,
    );
  }
}

class _CompactStat extends StatelessWidget {
  final String label;
  final String value;
  final Color valueBackground;
  final Color valueColor;

  const _CompactStat({
    required this.label,
    required this.value,
    required this.valueBackground,
    required this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: dashboardSoftPanelDecoration(radius: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 10, color: dashboardMutedText),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: valueBackground,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              value,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: valueColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
