import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

const _tagColors = {
  '高频': Color(0xFF1d4ed8),
  '中频': Color(0xFF16a34a),
  '低频': Color(0xFF94A3B8),
};

class RecurringMerchantsCard extends StatelessWidget {
  final List<RecurringMerchant> merchants;

  const RecurringMerchantsCard({super.key, required this.merchants});

  @override
  Widget build(BuildContext context) {
    if (merchants.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Text('暂无周期性消费数据',
            style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      );
    }
    return Column(
      children: merchants.map((m) => _MerchantRow(merchant: m)).toList(),
    );
  }
}

class _MerchantRow extends StatelessWidget {
  final RecurringMerchant merchant;
  const _MerchantRow({required this.merchant});

  @override
  Widget build(BuildContext context) {
    final tagColor = _tagColors[merchant.tag] ?? const Color(0xFF94A3B8);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          // 图标
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.store_rounded,
                size: 16, color: Color(0xFF1d4ed8)),
          ),
          const SizedBox(width: 10),
          // 商家名 + 频率
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(merchant.merchant,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B))),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: tagColor.withAlpha(20),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(merchant.tag,
                          style: TextStyle(
                              fontSize: 9,
                              color: tagColor,
                              fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(width: 5),
                    Text(merchant.cadenceLabel,
                        style: const TextStyle(
                            fontSize: 10, color: Color(0xFF94A3B8))),
                    const SizedBox(width: 5),
                    Text('${merchant.count} 笔',
                        style: const TextStyle(
                            fontSize: 10, color: Color(0xFF94A3B8))),
                  ],
                ),
              ],
            ),
          ),
          // 总额
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('¥${merchant.total.toStringAsFixed(0)}',
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1d4ed8))),
              Text(merchant.category,
                  style: const TextStyle(
                      fontSize: 10, color: Color(0xFF94A3B8))),
            ],
          ),
        ],
      ),
    );
  }
}
