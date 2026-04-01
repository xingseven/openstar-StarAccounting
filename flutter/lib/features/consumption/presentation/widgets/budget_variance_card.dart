import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

class BudgetVarianceCard extends StatelessWidget {
  final List<BudgetVarianceItem> items;

  const BudgetVarianceCard({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const _EmptyHint(text: '暂无预算数据，请先在设置中配置预算');
    }
    return Column(
      children: items.map((item) => _BudgetRow(item: item)).toList(),
    );
  }
}

class _BudgetRow extends StatelessWidget {
  final BudgetVarianceItem item;
  const _BudgetRow({required this.item});

  Color get _statusColor {
    switch (item.status) {
      case 'over':
        return const Color(0xFFef4444);
      case 'warning':
        return const Color(0xFFf59e0b);
      default:
        return const Color(0xFF16a34a);
    }
  }

  Color get _barBg => const Color(0xFFF1F5F9);

  @override
  Widget build(BuildContext context) {
    final pct = item.percent.clamp(0, 120).toDouble();
    final isOver = item.status == 'over';
    final color = _statusColor;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(item.name,
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E293B))),
              const Spacer(),
              Text(
                '¥${item.spent.toStringAsFixed(0)} / ¥${item.budget.toStringAsFixed(0)}',
                style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isOver ? '超预算 ${(pct - 100).toStringAsFixed(0)}%' : '${pct.toStringAsFixed(0)}%',
                  style: TextStyle(fontSize: 9, color: color, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Stack(
            children: [
              // 背景
              Container(
                height: 6,
                decoration: BoxDecoration(
                  color: _barBg,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              // 进度
              FractionallySizedBox(
                widthFactor: (pct / 120).clamp(0, 1),
                child: Container(
                  height: 6,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              // 100% 基准线
              FractionallySizedBox(
                widthFactor: 100 / 120,
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    width: 1.5,
                    height: 10,
                    color: const Color(0xFF94A3B8),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyHint extends StatelessWidget {
  final String text;
  const _EmptyHint({required this.text});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Text(text,
            style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      );
}
