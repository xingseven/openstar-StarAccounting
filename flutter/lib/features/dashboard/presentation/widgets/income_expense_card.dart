import 'package:flutter/material.dart';
import '../dashboard_utils.dart';

class IncomeExpenseCard extends StatelessWidget {
  final double income;
  final double expense;
  final double lastMonthIncome;
  final double lastMonthExpense;

  const IncomeExpenseCard({
    super.key,
    required this.income,
    required this.expense,
    required this.lastMonthIncome,
    required this.lastMonthExpense,
  });

  @override
  Widget build(BuildContext context) {
    final balance = income - expense;
    final incomeChange = _momMeta(income, lastMonthIncome, true);
    final expenseChange = _momMeta(expense, lastMonthExpense, false);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('本月收支',
                        style: TextStyle(
                            fontSize: 12, color: Color(0xFF64748B))),
                    SizedBox(height: 2),
                    Text('收入与支出概览',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1E293B))),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: balance >= 0
                      ? const Color(0xFFECFDF5)
                      : const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: balance >= 0
                          ? const Color(0xFFBBF7D0)
                          : const Color(0xFFFECACA)),
                ),
                child: Text(
                  '结余 ${formatCurrency(balance)}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: balance >= 0
                        ? const Color(0xFF065F46)
                        : const Color(0xFF991B1B),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _FlowBox(
                  label: '本月支出',
                  value: expense,
                  isExpense: true,
                  momLabel: expenseChange.label,
                  momPrev: expenseChange.prevLabel,
                  favorable: expenseChange.favorable,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _FlowBox(
                  label: '本月收入',
                  value: income,
                  isExpense: false,
                  momLabel: incomeChange.label,
                  momPrev: incomeChange.prevLabel,
                  favorable: incomeChange.favorable,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  _MomMeta _momMeta(double current, double previous, bool favorableWhenUp) {
    if (previous <= 0) {
      return _MomMeta(
        label: current == 0 ? '环比 0%' : '环比 新增',
        prevLabel: '上月无记录',
        favorable: true,
      );
    }
    final delta = (current - previous) / previous * 100;
    if (delta.abs() < 0.1) {
      return _MomMeta(
        label: '环比 0%',
        prevLabel: '上月 ${formatCurrency(previous)}',
        favorable: true,
      );
    }
    final rising = delta > 0;
    final favorable = favorableWhenUp ? rising : !rising;
    final sign = delta > 0 ? '+' : '';
    final pct = delta.abs() >= 10
        ? delta.toStringAsFixed(0)
        : delta.toStringAsFixed(1);
    return _MomMeta(
      label: '环比 $sign$pct%',
      prevLabel: '上月 ${formatCurrency(previous)}',
      favorable: favorable,
    );
  }
}

class _MomMeta {
  final String label;
  final String prevLabel;
  final bool favorable;
  _MomMeta(
      {required this.label, required this.prevLabel, required this.favorable});
}

class _FlowBox extends StatelessWidget {
  final String label;
  final double value;
  final bool isExpense;
  final String momLabel;
  final String momPrev;
  final bool favorable;

  const _FlowBox({
    required this.label,
    required this.value,
    required this.isExpense,
    required this.momLabel,
    required this.momPrev,
    required this.favorable,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor =
        isExpense ? const Color(0xFFFEF2F2) : const Color(0xFFEFF6FF);
    final borderColor =
        isExpense ? const Color(0xFFFECACA) : const Color(0xFFBFDBFE);
    final accentColor =
        isExpense ? const Color(0xFFDC2626) : const Color(0xFF1d4ed8);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isExpense
                    ? Icons.arrow_downward_rounded
                    : Icons.arrow_upward_rounded,
                size: 14,
                color: accentColor,
              ),
              const SizedBox(width: 4),
              Text(label,
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: accentColor)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            formatCurrency(value),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            isExpense ? '本月消费总额' : '已记录入账',
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: favorable
                      ? const Color(0xFFDCFCE7)
                      : const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  momLabel,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: favorable
                        ? const Color(0xFF166534)
                        : const Color(0xFF991B1B),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  momPrev,
                  style: const TextStyle(
                      fontSize: 10, color: Color(0xFF94A3B8)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
