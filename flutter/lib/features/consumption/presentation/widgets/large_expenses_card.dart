import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

class LargeExpensesCard extends StatelessWidget {
  final List<LargeExpense> items;

  const LargeExpensesCard({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Text('本期无大额支出',
            style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      );
    }
    return Column(
      children: items.map((item) => _LargeRow(item: item)).toList(),
    );
  }
}

class _LargeRow extends StatelessWidget {
  final LargeExpense item;
  const _LargeRow({required this.item});

  @override
  Widget build(BuildContext context) {
    final dt = DateTime.tryParse(item.date);
    final dateLabel = dt != null
        ? '${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}'
        : item.date;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 5),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFFFB923C).withAlpha(30),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.warning_amber_rounded,
                size: 18, color: Color(0xFFF97316)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.merchant,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B))),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text(item.category,
                        style: const TextStyle(
                            fontSize: 10, color: Color(0xFF94A3B8))),
                    const SizedBox(width: 6),
                    Text(dateLabel,
                        style: const TextStyle(
                            fontSize: 10, color: Color(0xFF94A3B8))),
                    if (item.reason.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      Text('· ${item.reason}',
                          style: const TextStyle(
                              fontSize: 10, color: Color(0xFF94A3B8))),
                    ],
                  ],
                ),
              ],
            ),
          ),
          Text(
            '¥${item.amount.toStringAsFixed(0)}',
            style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFFF97316)),
          ),
        ],
      ),
    );
  }
}
