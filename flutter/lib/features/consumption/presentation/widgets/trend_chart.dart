import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

class TrendChart extends StatelessWidget {
  final List<DailyTrend> trend;

  const TrendChart({super.key, required this.trend});

  @override
  Widget build(BuildContext context) {
    if (trend.isEmpty) return const SizedBox(height: 160);

    // 每隔几天取一个标签避免重叠
    final step = (trend.length / 6).ceil().clamp(1, trend.length);

    final expenseSpots = trend.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value.expense);
    }).toList();

    final incomeSpots = trend.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value.income);
    }).toList();

    final maxY = trend.fold<double>(0, (prev, e) {
      final m = e.expense > e.income ? e.expense : e.income;
      return m > prev ? m : prev;
    });

    return SizedBox(
      height: 180,
      child: LineChart(
        LineChartData(
          minX: 0,
          maxX: (trend.length - 1).toDouble(),
          minY: 0,
          maxY: maxY * 1.15,
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            getDrawingHorizontalLine: (_) => FlLine(
              color: const Color(0xFFE2E8F0),
              strokeWidth: 1,
            ),
          ),
          borderData: FlBorderData(show: false),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 44,
                getTitlesWidget: (v, _) => Text(
                  v >= 1000 ? '${(v / 1000).toStringAsFixed(0)}k' : v.toInt().toString(),
                  style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
              ),
            ),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 22,
                interval: step.toDouble(),
                getTitlesWidget: (v, _) {
                  final idx = v.toInt();
                  if (idx < 0 || idx >= trend.length) return const SizedBox();
                  return Text(
                    trend[idx].day,
                    style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8)),
                  );
                },
              ),
            ),
          ),
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipItems: (spots) => spots.map((s) {
                final isExpense = s.barIndex == 0;
                return LineTooltipItem(
                  '${isExpense ? "支出" : "收入"} ¥${s.y.toStringAsFixed(0)}',
                  TextStyle(
                    color: isExpense ? const Color(0xFF1d4ed8) : const Color(0xFF16a34a),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                );
              }).toList(),
            ),
          ),
          lineBarsData: [
            // 支出线
            LineChartBarData(
              spots: expenseSpots,
              isCurved: true,
              curveSmoothness: 0.3,
              color: const Color(0xFF1d4ed8),
              barWidth: 2,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: const Color(0xFF1d4ed8).withAlpha(25),
              ),
            ),
            // 收入线
            LineChartBarData(
              spots: incomeSpots,
              isCurved: true,
              curveSmoothness: 0.3,
              color: const Color(0xFF16a34a),
              barWidth: 2,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: const Color(0xFF16a34a).withAlpha(20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
