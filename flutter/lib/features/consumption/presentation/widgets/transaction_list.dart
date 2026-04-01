import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

const _platformColors = {
  'wechat': Color(0xFF16a34a),
  'alipay': Color(0xFF1d4ed8),
  'cloudpay': Color(0xFFef4444),
  'unionpay': Color(0xFFef4444),
};

const _platformLabels = {
  'wechat': '微信',
  'alipay': '支付宝',
  'cloudpay': '云闪付',
  'unionpay': '云闪付',
  'cash': '现金',
  'bankcard': '银行卡',
};

const _categoryIcons = {
  '餐饮': Icons.restaurant_rounded,
  '购物': Icons.shopping_bag_rounded,
  '交通': Icons.directions_car_rounded,
  '娱乐': Icons.sports_esports_rounded,
  '医疗': Icons.local_hospital_rounded,
  '工资': Icons.work_rounded,
  '住房': Icons.home_rounded,
  '教育': Icons.school_rounded,
  '旅行': Icons.flight_rounded,
};

class TransactionList extends StatelessWidget {
  final List<Transaction> transactions;
  final bool loading;
  final void Function(Transaction)? onDelete;

  const TransactionList({
    super.key,
    required this.transactions,
    this.loading = false,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Column(
        children: List.generate(
          5,
          (_) => const _SkeletonRow(),
        ),
      );
    }

    if (transactions.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 32),
          child: Column(
            children: [
              Icon(Icons.receipt_long_rounded, size: 40, color: Color(0xFFCBD5E1)),
              SizedBox(height: 8),
              Text('暂无交易记录',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: transactions.length,
      separatorBuilder: (_, __) =>
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
      itemBuilder: (_, i) => _TransactionRow(
        tx: transactions[i],
        onDelete: onDelete != null ? () => onDelete!(transactions[i]) : null,
      ),
    );
  }
}

class _TransactionRow extends StatelessWidget {
  final Transaction tx;
  final VoidCallback? onDelete;

  const _TransactionRow({required this.tx, this.onDelete});

  @override
  Widget build(BuildContext context) {
    final isExpense = tx.type == 'EXPENSE';
    final amountColor =
        isExpense ? const Color(0xFF1d4ed8) : const Color(0xFF16a34a);
    final amountPrefix = isExpense ? '-' : '+';
    final platformColor =
        _platformColors[tx.platform] ?? const Color(0xFF94A3B8);
    final platformLabel = _platformLabels[tx.platform] ?? tx.platform;
    final categoryIcon =
        _categoryIcons[tx.category] ?? Icons.attach_money_rounded;

    final dt = DateTime.tryParse(tx.date);
    final dateLabel = dt != null
        ? '${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} '
            '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}'
        : tx.date;

    return Dismissible(
      key: Key(tx.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        color: const Color(0xFFef4444),
        child: const Icon(Icons.delete_rounded, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        if (onDelete == null) return false;
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('删除确认'),
            content: Text('确定删除「${tx.merchant}」的交易记录吗？'),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(ctx, false),
                  child: const Text('取消')),
              TextButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('删除',
                      style: TextStyle(color: Color(0xFFef4444)))),
            ],
          ),
        );
      },
      onDismissed: (_) => onDelete?.call(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
        child: Row(
          children: [
            // 分类图标
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: amountColor.withAlpha(20),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(categoryIcon, size: 18, color: amountColor),
            ),
            const SizedBox(width: 10),
            // 商家 + 日期
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tx.merchant,
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
                          color: platformColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(platformLabel,
                            style: TextStyle(
                                fontSize: 9,
                                color: platformColor,
                                fontWeight: FontWeight.w600)),
                      ),
                      const SizedBox(width: 5),
                      Text(tx.category,
                          style: const TextStyle(
                              fontSize: 10, color: Color(0xFF94A3B8))),
                      const SizedBox(width: 5),
                      Text(dateLabel,
                          style: const TextStyle(
                              fontSize: 10, color: Color(0xFFCBD5E1))),
                    ],
                  ),
                ],
              ),
            ),
            // 金额
            Text(
              '$amountPrefix¥${tx.amount.toStringAsFixed(2)}',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: amountColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SkeletonRow extends StatelessWidget {
  const _SkeletonRow();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                    height: 13,
                    width: 120,
                    decoration: BoxDecoration(
                        color: const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(4))),
                const SizedBox(height: 5),
                Container(
                    height: 10,
                    width: 80,
                    decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(4))),
              ],
            ),
          ),
          Container(
              height: 14,
              width: 60,
              decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(4))),
        ],
      ),
    );
  }
}
