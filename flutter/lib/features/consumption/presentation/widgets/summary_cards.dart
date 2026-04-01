import 'package:flutter/material.dart';
import '../../data/consumption_model.dart';

const _blueDeep = Color(0xFF1d4ed8);
const _blue = Color(0xFF3b82f6);
const _green = Color(0xFF16a34a);
const _red = Color(0xFFef4444);
const _surface = Color(0xFFF8FAFC);

class SummaryCards extends StatelessWidget {
  final ConsumptionSummary summary;
  final bool loading;

  const SummaryCards({super.key, required this.summary, this.loading = false});

  @override
  Widget build(BuildContext context) {
    final balance = summary.balance;
    return Column(
      children: [
        // 主卡片行：支出 / 收入 / 结余
        Row(
          children: [
            _MainCard(
              label: '总支出',
              amount: summary.totalExpense,
              color: _blueDeep,
              icon: Icons.arrow_downward_rounded,
              rate: summary.comparison.totalExpenseRate,
              loading: loading,
            ),
            const SizedBox(width: 10),
            _MainCard(
              label: '总收入',
              amount: summary.totalIncome,
              color: _green,
              icon: Icons.arrow_upward_rounded,
              rate: summary.comparison.totalIncomeRate,
              loading: loading,
            ),
            const SizedBox(width: 10),
            _MainCard(
              label: '结余',
              amount: balance,
              color: balance >= 0 ? _blue : _red,
              icon: Icons.account_balance_wallet_rounded,
              loading: loading,
            ),
          ],
        ),
        const SizedBox(height: 10),
        // 次卡片行：次均消费 / 微信 / 支付宝
        Row(
          children: [
            _SubCard(
              label: '次均消费',
              amount: summary.avgPerTransaction,
              sub: '共 ${summary.expenseCount} 笔',
              color: _blue,
              loading: loading,
            ),
            const SizedBox(width: 10),
            _SubCard(
              label: '微信支付',
              amount: summary.wechat.expense,
              sub: '支出',
              color: _green,
              rate: summary.comparison.wechatExpenseRate,
              loading: loading,
            ),
            const SizedBox(width: 10),
            _SubCard(
              label: '支付宝',
              amount: summary.alipay.expense,
              sub: '支出',
              color: _blueDeep,
              rate: summary.comparison.alipayExpenseRate,
              loading: loading,
            ),
          ],
        ),
      ],
    );
  }
}

class _MainCard extends StatelessWidget {
  final String label;
  final double amount;
  final Color color;
  final IconData icon;
  final double? rate;
  final bool loading;

  const _MainCard({
    required this.label,
    required this.amount,
    required this.color,
    required this.icon,
    this.rate,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: loading
            ? _Skeleton(height: 60)
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(icon, size: 14, color: color),
                      const SizedBox(width: 4),
                      Text(label,
                          style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey[500],
                              fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _fmt(amount),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: color,
                      letterSpacing: -0.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (rate != null) ...[
                    const SizedBox(height: 4),
                    _RateChip(rate: rate!),
                  ],
                ],
              ),
      ),
    );
  }
}

class _SubCard extends StatelessWidget {
  final String label;
  final double amount;
  final String sub;
  final Color color;
  final double? rate;
  final bool loading;

  const _SubCard({
    required this.label,
    required this.amount,
    required this.sub,
    required this.color,
    this.rate,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: _surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: loading
            ? _Skeleton(height: 44)
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey[500],
                          fontWeight: FontWeight.w500)),
                  const SizedBox(height: 4),
                  Text(
                    _fmt(amount),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Row(
                    children: [
                      Text(sub,
                          style: TextStyle(
                              fontSize: 10, color: Colors.grey[400])),
                      if (rate != null) ...[
                        const SizedBox(width: 4),
                        _RateChip(rate: rate!, small: true),
                      ],
                    ],
                  ),
                ],
              ),
      ),
    );
  }
}

class _RateChip extends StatelessWidget {
  final double rate;
  final bool small;
  const _RateChip({required this.rate, this.small = false});

  @override
  Widget build(BuildContext context) {
    final up = rate > 0;
    final color = up ? _red : _green;
    final icon = up ? Icons.arrow_drop_up : Icons.arrow_drop_down;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: small ? 12 : 14, color: color),
        Text(
          '${rate.abs().toStringAsFixed(1)}%',
          style: TextStyle(
              fontSize: small ? 9 : 10,
              color: color,
              fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _Skeleton extends StatelessWidget {
  final double height;
  const _Skeleton({required this.height});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(6),
      ),
    );
  }
}

String _fmt(double v) {
  if (v.abs() >= 10000) {
    return '¥${(v / 10000).toStringAsFixed(2)}万';
  }
  return '¥${v.toStringAsFixed(2)}';
}
