import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../data/dashboard_model.dart';
import '../dashboard_utils.dart';

class CategoryPieCard extends StatelessWidget {
  final List<DashboardTransaction> transactions;

  const CategoryPieCard({super.key, required this.transactions});

  @override
  Widget build(BuildContext context) {
    final expenses = transactions.where((tx) => tx.type == 'EXPENSE');
    final categoryMap = <String, double>{};

    for (final tx in expenses) {
      categoryMap[tx.category] = (categoryMap[tx.category] ?? 0) + tx.amount;
    }

    final sorted = categoryMap.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final topEntries = sorted.take(5).toList();

    if (topEntries.isEmpty) {
      topEntries.addAll([
        const MapEntry('餐饮美食', 2450),
        const MapEntry('购物消费', 1800),
        const MapEntry('日常缴费', 1200),
        const MapEntry('交通出行', 800),
        const MapEntry('休闲娱乐', 600),
      ]);
    }

    const colors = [
      Color(0xFF2563EB),
      Color(0xFF0F766E),
      Color(0xFFF59E0B),
      Color(0xFFEF4444),
      Color(0xFF7C3AED),
    ];

    final sections = topEntries.asMap().entries.map((entry) {
      final index = entry.key;
      final item = entry.value;
      return PieChartSectionData(
        value: item.value,
        color: colors[index % colors.length],
        title: '',
        radius: 52,
      );
    }).toList();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: dashboardSurfaceDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '近期消费构成',
            style: TextStyle(fontSize: 12, color: dashboardMutedText),
          ),
          const SizedBox(height: 2),
          const Text(
            '最近交易里的主要花费',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: dashboardBodyText,
            ),
          ),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              final chartSize = constraints.maxWidth >= 420 ? 156.0 : 118.0;
              return Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(
                    width: chartSize,
                    height: chartSize,
                    child: PieChart(
                      PieChartData(
                        sections: sections,
                        centerSpaceRadius: chartSize * 0.24,
                        sectionsSpace: 3,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      children: topEntries.take(3).toList().asMap().entries.map(
                        (entry) {
                          final index = entry.key;
                          final item = entry.value;
                          return Container(
                            margin: EdgeInsets.only(bottom: index == 2 ? 0 : 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                            decoration: dashboardSoftPanelDecoration(
                              radius: 18,
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    color: colors[index % colors.length],
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    item.key,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: dashboardLabelText,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  formatCurrency(item.value, compact: true),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: dashboardBodyText,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ).toList(),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
