import 'package:flutter/material.dart';
import '../../data/dashboard_model.dart';
import '../dashboard_utils.dart';

class BudgetAlertsCard extends StatelessWidget {
  final List<BudgetAlert> alerts;

  const BudgetAlertsCard({super.key, required this.alerts});

  @override
  Widget build(BuildContext context) {
    final critical = alerts.where((a) => a.status != 'normal').toList();
    if (critical.isEmpty) return const SizedBox.shrink();

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
                    Text('预算预警',
                        style: TextStyle(
                            fontSize: 12, color: Color(0xFF64748B))),
                    SizedBox(height: 2),
                    Text('需要注意的预算项目',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1E293B))),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Text(
                  '${critical.length} 项',
                  style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF991B1B)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...critical.map((alert) => _AlertRow(alert: alert)),
        ],
      ),
    );
  }
}

class _AlertRow extends StatelessWidget {
  final BudgetAlert alert;
  const _AlertRow({required this.alert});

  @override
  Widget build(BuildContext context) {
    final style = _styleFor(alert.status);
    final scopeLabel =
        alert.category == 'ALL' ? '总预算' : alert.category;
    final platformSuffix = alert.scopeType == 'PLATFORM' &&
            alert.platform != null
        ? ' · ${alert.platform}'
        : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: style.bg,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: style.badgeBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(style.icon, size: 14, color: style.fg),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$scopeLabel$platformSuffix',
                      style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1E293B)),
                    ),
                    Text(
                      '${alert.period == 'MONTHLY' ? '月度预算' : '年度预算'} · 已用 ${formatCurrency(alert.used)} / ${formatCurrency(alert.amount)}',
                      style: const TextStyle(
                          fontSize: 10, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: style.badgeBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(style.label,
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: style.fg)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('使用进度',
                  style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
              Text(
                '${alert.percent.toStringAsFixed(0)}%',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: style.fg),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (alert.percent / 100).clamp(0, 1),
              backgroundColor: const Color(0xFFE2E8F0),
              color: style.progressColor,
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  _AlertStyle _styleFor(String status) {
    switch (status) {
      case 'overdue':
        return _AlertStyle(
          bg: const Color(0xFFFEF2F2),
          badgeBg: const Color(0xFFFEE2E2),
          fg: const Color(0xFFDC2626),
          icon: Icons.shield_outlined,
          label: '超支',
          progressColor: const Color(0xFFEF4444),
        );
      case 'warning':
        return _AlertStyle(
          bg: const Color(0xFFFFFBEB),
          badgeBg: const Color(0xFFFEF3C7),
          fg: const Color(0xFFD97706),
          icon: Icons.warning_amber_rounded,
          label: '预警',
          progressColor: const Color(0xFFF59E0B),
        );
      default:
        return _AlertStyle(
          bg: const Color(0xFFF8FAFC),
          badgeBg: const Color(0xFFE2E8F0),
          fg: const Color(0xFF64748B),
          icon: Icons.info_outline_rounded,
          label: '正常',
          progressColor: const Color(0xFF94A3B8),
        );
    }
  }
}

class _AlertStyle {
  final Color bg, badgeBg, fg, progressColor;
  final IconData icon;
  final String label;
  const _AlertStyle({
    required this.bg,
    required this.badgeBg,
    required this.fg,
    required this.icon,
    required this.label,
    required this.progressColor,
  });
}
