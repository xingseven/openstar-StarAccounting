import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

class CalendarHeatmap extends StatelessWidget {
  final List<CalendarDay> days;

  const CalendarHeatmap({super.key, required this.days});

  static const _weekLabels = ['一', '二', '三', '四', '五', '六', '日'];

  @override
  Widget build(BuildContext context) {
    if (days.isEmpty) return const SizedBox(height: 120);

    final maxVal = days.fold<double>(0, (p, e) => e.value > p ? e.value : p);

    // 按日期排序，建立日期→值的映射
    final Map<String, double> valueMap = {
      for (final d in days) d.date: d.value,
    };

    // 找到第一天是星期几，构建日历格子
    final sorted = [...days]..sort((a, b) => a.date.compareTo(b.date));
    final firstDate = DateTime.tryParse(sorted.first.date) ?? DateTime.now();
    final lastDate = DateTime.tryParse(sorted.last.date) ?? DateTime.now();

    // 从第一天所在周的周一开始
    final startWeekday = firstDate.weekday; // 1=Mon
    final calStart = firstDate.subtract(Duration(days: startWeekday - 1));

    // 一共需要几行（周）
    final totalDays = lastDate.difference(calStart).inDays + 1;
    final weeks = (totalDays / 7).ceil();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 星期标题
        Row(
          children: _weekLabels.map((w) => Expanded(
            child: Center(
              child: Text(w,
                  style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8))),
            ),
          )).toList(),
        ),
        const SizedBox(height: 4),
        // 日期格子
        ...List.generate(weeks, (weekIdx) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 3),
            child: Row(
              children: List.generate(7, (dayIdx) {
                final date = calStart.add(Duration(days: weekIdx * 7 + dayIdx));
                final ds = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
                final val = valueMap[ds];
                final isInRange = !date.isBefore(firstDate) && !date.isAfter(lastDate);

                return Expanded(
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: Tooltip(
                      message: val != null ? '$ds\n¥${val.toStringAsFixed(0)}' : '',
                      child: Container(
                        margin: const EdgeInsets.all(1.5),
                        decoration: BoxDecoration(
                          color: isInRange && val != null
                              ? _heatColor(val, maxVal)
                              : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: Center(
                          child: Text(
                            '${date.day}',
                            style: TextStyle(
                              fontSize: 8,
                              color: isInRange && val != null && val > maxVal * 0.5
                                  ? Colors.white
                                  : const Color(0xFF94A3B8),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          );
        }),
        const SizedBox(height: 8),
        // 图例
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            const Text('少', style: TextStyle(fontSize: 9, color: Color(0xFF94A3B8))),
            const SizedBox(width: 4),
            ...List.generate(5, (i) => Container(
              width: 12,
              height: 12,
              margin: const EdgeInsets.symmetric(horizontal: 1.5),
              decoration: BoxDecoration(
                color: _heatColor(maxVal * i / 4, maxVal),
                borderRadius: BorderRadius.circular(2),
              ),
            )),
            const SizedBox(width: 4),
            const Text('多', style: TextStyle(fontSize: 9, color: Color(0xFF94A3B8))),
          ],
        ),
      ],
    );
  }

  Color _heatColor(double val, double maxVal) {
    if (maxVal == 0) return const Color(0xFFDBEAFE);
    final ratio = (val / maxVal).clamp(0.0, 1.0);
    // 浅蓝 → 深蓝渐变
    final colors = [
      const Color(0xFFDBEAFE),
      const Color(0xFF93C5FD),
      const Color(0xFF3B82F6),
      const Color(0xFF1D4ED8),
      const Color(0xFF1E3A8A),
    ];
    final idx = (ratio * (colors.length - 1)).floor().clamp(0, colors.length - 2);
    final t = (ratio * (colors.length - 1)) - idx;
    return Color.lerp(colors[idx], colors[idx + 1], t)!;
  }
}
