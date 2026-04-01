import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

/// 帕累托图：柱状（金额）+ 折线（累计百分比）
class ParetoChart extends StatelessWidget {
  final List<ParetoItem> items;

  const ParetoChart({super.key, required this.items});

  Color _parseColor(String hex) {
    final h = hex.replaceAll('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox(height: 200);

    final maxVal = items.fold<double>(0, (p, e) => e.value > p ? e.value : p);

    return SizedBox(
      height: 210,
      child: Stack(
        children: [
          // 柱状图层
          BarChart(
            BarChartData(
              alignment: BarChartAlignment.spaceAround,
              maxY: maxVal * 1.2,
              barTouchData: BarTouchData(
                touchTooltipData: BarTouchTooltipData(
                  getTooltipItem: (group, gi, rod, ri) => BarTooltipItem(
                    '${items[gi].name}\n¥${rod.toY.toStringAsFixed(0)}',
                    const TextStyle(color: Colors.white, fontSize: 11),
                  ),
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
                rightTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 36,
                    getTitlesWidget: (v, _) {
                      // 右轴显示百分比（对应折线）
                      final pct = v / maxVal / 1.2 * 100;
                      return Text(
                        '${pct.toStringAsFixed(0)}%',
                        style: const TextStyle(fontSize: 9, color: Color(0xFFF97316)),
                      );
                    },
                  ),
                ),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 30,
                    getTitlesWidget: (v, _) {
                      final idx = v.toInt();
                      if (idx < 0 || idx >= items.length) return const SizedBox();
                      final name = items[idx].name;
                      return Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          name.length > 3 ? name.substring(0, 3) : name,
                          style: const TextStyle(fontSize: 9, color: Color(0xFF64748B)),
                        ),
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
              barGroups: items.asMap().entries.map((e) {
                return BarChartGroupData(
                  x: e.key,
                  barRods: [
                    BarChartRodData(
                      toY: e.value.value,
                      color: _parseColor(e.value.fill),
                      width: 20,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),

          // 折线图层（累计百分比）叠加在柱状图上
          Positioned.fill(
            child: LineChart(
              LineChartData(
                minX: 0,
                maxX: (items.length - 1).toDouble(),
                minY: 0,
                maxY: maxVal * 1.2,
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                titlesData: const FlTitlesData(
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: items.asMap().entries.map((e) {
                      // 将百分比映射到柱状图的 Y 轴范围
                      final yVal = e.value.cumulativePercentage / 100 * maxVal * 1.2;
                      return FlSpot(e.key.toDouble(), yVal);
                    }).toList(),
                    isCurved: false,
                    color: const Color(0xFFF97316),
                    barWidth: 2,
                    dotData: FlDotData(
                      show: true,
                      getDotPainter: (_, __, ___, ____) => FlDotCirclePainter(
                        radius: 3,
                        color: const Color(0xFFF97316),
                        strokeWidth: 0,
                        strokeColor: Colors.transparent,
                      ),
                    ),
                    belowBarData: BarAreaData(show: false),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
