import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

class PlatformPieChart extends StatefulWidget {
  final List<ChartItem> items;

  const PlatformPieChart({super.key, required this.items});

  @override
  State<PlatformPieChart> createState() => _PlatformPieChartState();
}

class _PlatformPieChartState extends State<PlatformPieChart> {
  int _touched = -1;

  Color _parseColor(String hex) {
    final h = hex.replaceAll('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty) return const SizedBox(height: 160);

    final total = widget.items.fold<double>(0, (s, e) => s + e.value);

    return Row(
      children: [
        // 饼图
        SizedBox(
          width: 130,
          height: 130,
          child: PieChart(
            PieChartData(
              sectionsSpace: 3,
              centerSpaceRadius: 34,
              pieTouchData: PieTouchData(
                touchCallback: (event, resp) {
                  setState(() {
                    _touched = resp?.touchedSection?.touchedSectionIndex ?? -1;
                  });
                },
              ),
              sections: widget.items.asMap().entries.map((e) {
                final isTouched = e.key == _touched;
                final pct = total > 0 ? e.value.value / total * 100 : 0;
                return PieChartSectionData(
                  color: _parseColor(e.value.fill),
                  value: e.value.value,
                  radius: isTouched ? 44 : 38,
                  title: isTouched ? '${pct.toStringAsFixed(1)}%' : '',
                  titleStyle: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.white),
                );
              }).toList(),
            ),
          ),
        ),
        const SizedBox(width: 16),
        // 图例
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: widget.items.map((item) {
              final pct = total > 0 ? item.value / total * 100 : 0;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: _parseColor(item.fill),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(item.name,
                          style: const TextStyle(
                              fontSize: 12, color: Color(0xFF475569))),
                    ),
                    Text(
                      '${pct.toStringAsFixed(1)}%',
                      style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF334155)),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
