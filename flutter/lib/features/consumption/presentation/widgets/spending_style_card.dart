import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

class SpendingStyleCard extends StatefulWidget {
  final List<SpendingStyleItem> items;
  final List<ChartItem> necessitySplit;
  final List<ChartItem> transactionNature;

  const SpendingStyleCard({
    super.key,
    required this.items,
    required this.necessitySplit,
    required this.transactionNature,
  });

  @override
  State<SpendingStyleCard> createState() => _SpendingStyleCardState();
}

class _SpendingStyleCardState extends State<SpendingStyleCard> {
  int _touched = -1;

  Color _parseColor(String hex) {
    final h = hex.replaceAll('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final items = widget.items;
    final total = items.fold<double>(0, (s, e) => s + e.value);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 消费风格环形图 + 列表
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 110,
              height: 110,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 3,
                  centerSpaceRadius: 28,
                  pieTouchData: PieTouchData(
                    touchCallback: (_, resp) => setState(() {
                      _touched = resp?.touchedSection?.touchedSectionIndex ?? -1;
                    }),
                  ),
                  sections: items.asMap().entries.map((e) {
                    final isTouched = e.key == _touched;
                    return PieChartSectionData(
                      color: _parseColor(e.value.fill),
                      value: e.value.value,
                      radius: isTouched ? 38 : 32,
                      title: '',
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                children: items.map((item) {
                  final pct = total > 0 ? item.value / total * 100 : 0;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                              color: _parseColor(item.fill),
                              shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(item.name,
                              style: const TextStyle(
                                  fontSize: 11, color: Color(0xFF475569))),
                        ),
                        Text(
                          '${pct.toStringAsFixed(1)}%',
                          style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E293B)),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        // 必要性 / 交易性质 两行小卡片
        Row(
          children: [
            Expanded(
              child: _MiniPieSection(
                label: '必要 vs 非必要',
                items: widget.necessitySplit,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _MiniPieSection(
                label: '线上 vs 线下',
                items: widget.transactionNature,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _MiniPieSection extends StatelessWidget {
  final String label;
  final List<ChartItem> items;
  const _MiniPieSection({required this.label, required this.items});

  Color _parseColor(String hex) {
    final h = hex.replaceAll('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final total = items.fold<double>(0, (s, e) => s + e.value);
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
          const SizedBox(height: 8),
          ...items.map((item) {
            final pct = total > 0 ? item.value / total * 100 : 0;
            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                            color: _parseColor(item.fill),
                            shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(item.name,
                            style: const TextStyle(
                                fontSize: 10, color: Color(0xFF475569))),
                      ),
                      Text('${pct.toStringAsFixed(1)}%',
                          style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E293B))),
                    ],
                  ),
                  const SizedBox(height: 2),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: pct / 100,
                      backgroundColor: const Color(0xFFE2E8F0),
                      color: _parseColor(item.fill),
                      minHeight: 3,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
