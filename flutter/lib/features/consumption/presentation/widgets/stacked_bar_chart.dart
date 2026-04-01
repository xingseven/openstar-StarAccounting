import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

const _categoryColors = {
  '餐饮': Color(0xFF1d4ed8),
  '购物': Color(0xFF2563eb),
  '交通': Color(0xFF3b82f6),
  '娱乐': Color(0xFF60a5fa),
  '其他': Color(0xFF93c5fd),
  '医疗': Color(0xFFbfdbfe),
  '住房': Color(0xFFdbeafe),
  '教育': Color(0xFFeff6ff),
};

class StackedBarChart extends StatelessWidget {
  final List<StackedBarItem> items;

  const StackedBarChart({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox(height: 200);

    // 收集所有分类
    final categories = <String>{};
    for (final item in items) {
      categories.addAll(item.categories.keys);
    }
    final catList = categories.toList();

    // 计算每条 bar 总高度
    final maxY = items.fold<double>(0, (p, item) {
      final total = item.categories.values.fold<double>(0, (s, v) => s + v);
      return total > p ? total : p;
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 200,
          child: BarChart(
            BarChartData(
              alignment: BarChartAlignment.spaceAround,
              maxY: maxY * 1.15,
              barTouchData: BarTouchData(
                touchTooltipData: BarTouchTooltipData(
                  getTooltipItem: (group, gi, rod, ri) {
                    final item = items[gi];
                    final cat = catList[ri];
                    final val = item.categories[cat] ?? 0;
                    return BarTooltipItem(
                      '$cat\n¥${val.toStringAsFixed(0)}',
                      const TextStyle(color: Colors.white, fontSize: 11),
                    );
                  },
                ),
              ),
              titlesData: FlTitlesData(
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 40,
                    getTitlesWidget: (v, _) => Text(
                      v >= 1000 ? '${(v / 1000).toStringAsFixed(0)}k' : v.toInt().toString(),
                      style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8)),
                    ),
                  ),
                ),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 28,
                    getTitlesWidget: (v, _) {
                      final idx = v.toInt();
                      if (idx < 0 || idx >= items.length) return const SizedBox();
                      return Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(items[idx].day,
                            style: const TextStyle(
                                fontSize: 9, color: Color(0xFF64748B))),
                      );
                    },
                  ),
                ),
              ),
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                getDrawingHorizontalLine: (_) =>
                    const FlLine(color: Color(0xFFE2E8F0), strokeWidth: 1),
              ),
              borderData: FlBorderData(show: false),
              barGroups: items.asMap().entries.map((entry) {
                final idx = entry.key;
                final item = entry.value;
                double fromY = 0;
                final rods = catList.asMap().entries.map((catEntry) {
                  final cat = catEntry.value;
                  final val = item.categories[cat] ?? 0;
                  final rod = BarChartRodStackItem(
                    fromY,
                    fromY + val,
                    _categoryColors[cat] ?? const Color(0xFF93c5fd),
                  );
                  fromY += val;
                  return rod;
                }).toList();

                return BarChartGroupData(
                  x: idx,
                  barRods: [
                    BarChartRodData(
                      toY: fromY,
                      rodStackItems: rods,
                      width: 20,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
        ),
        const SizedBox(height: 10),
        // 图例
        Wrap(
          spacing: 10,
          runSpacing: 4,
          children: catList.map((cat) {
            final color = _categoryColors[cat] ?? const Color(0xFF93c5fd);
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                const SizedBox(width: 3),
                Text(cat,
                    style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
              ],
            );
          }).toList(),
        ),
      ],
    );
  }
}
