import 'package:flutter/material.dart';
import '../../data/dashboard_model.dart';
import '../dashboard_utils.dart';

class RecentTransactionsCard extends StatelessWidget {
  final List<DashboardTransaction> transactions;
  final VoidCallback? onViewAll;
  final double? minHeight;

  const RecentTransactionsCard({
    super.key,
    required this.transactions,
    this.onViewAll,
    this.minHeight,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(minHeight: minHeight ?? 0),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
      decoration: dashboardSurfaceDecoration(),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final visibleTransactions = transactions
              .take(constraints.maxWidth < 360 ? 3 : 5)
              .toList();

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '最近交易',
                          style: TextStyle(
                            fontSize: 12,
                            color: dashboardMutedText,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          '最近录入的流水',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: dashboardBodyText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (onViewAll != null)
                    FilledButton(
                      onPressed: onViewAll,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                        elevation: 0,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('查看全部'),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_rounded, size: 15),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              if (transactions.isEmpty)
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(minHeight: 180),
                  decoration: dashboardSoftPanelDecoration(radius: 22),
                  child: const Center(child: _EmptyTransactionsState()),
                )
              else
                for (var i = 0; i < visibleTransactions.length; i++)
                  _TransactionRow(
                    tx: visibleTransactions[i],
                    isLast: i == visibleTransactions.length - 1,
                  ),
            ],
          );
        },
      ),
    );
  }
}

class _EmptyTransactionsState extends StatelessWidget {
  const _EmptyTransactionsState();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.calendar_today_rounded,
            size: 18,
            color: dashboardMutedText,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          '还没有最近交易',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: dashboardLabelText,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          '录入一笔账单后，这里会自动出现最新动态。',
          style: TextStyle(fontSize: 12, color: dashboardMutedText),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _TransactionRow extends StatelessWidget {
  final DashboardTransaction tx;
  final bool isLast;

  const _TransactionRow({required this.tx, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final isIncome = tx.type == 'INCOME';
    final subtitle = (tx.merchant != null && tx.merchant!.isNotEmpty)
        ? tx.merchant!
        : tx.platform;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        border: Border(
          bottom: isLast
              ? BorderSide.none
              : const BorderSide(color: dashboardSurfaceBorder),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: isIncome
                  ? const Color(0xFFEFF6FF)
                  : const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              isIncome ? Icons.south_west_rounded : Icons.north_east_rounded,
              size: 15,
              color: isIncome ? const Color(0xFF1D4ED8) : Colors.white,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.category.isNotEmpty ? tx.category : '未分类',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: dashboardBodyText,
                  ),
                ),
                const SizedBox(height: 2),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 11,
                        color: dashboardMutedText,
                      ),
                    ),
                    Text(
                      formatCompactTransactionDateTime(tx.date),
                      style: const TextStyle(
                        fontSize: 10,
                        color: Color(0xFFCBD5E1),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          RichText(
            textAlign: TextAlign.right,
            text: TextSpan(
              style: const TextStyle(
                fontFamily: 'NotoSansSC',
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: dashboardBodyText,
              ),
              children: [
                TextSpan(
                  text: '${isIncome ? '收入' : '支出'} ',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: dashboardMutedText,
                  ),
                ),
                TextSpan(
                  text:
                      '${isIncome ? '+' : '-'}${formatCurrency(tx.amount, withSymbol: false, decimals: 2)}',
                  style: TextStyle(
                    color: isIncome
                        ? const Color(0xFF1D4ED8)
                        : dashboardBodyText,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
