import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

const dashboardPageBackground = Color(0xFFF8FAFC);
const dashboardSurfaceBorder = Color(0xFFE2E8F0);
const dashboardBodyText = Color(0xFF0F172A);
const dashboardLabelText = Color(0xFF475569);
const dashboardMutedText = Color(0xFF94A3B8);
const dashboardSoftSurface = Color(0xFFF8FAFC);

BoxDecoration dashboardSurfaceDecoration({
  Color color = Colors.white,
  double radius = 22,
}) {
  return BoxDecoration(
    color: color,
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: dashboardSurfaceBorder),
    boxShadow: const [
      BoxShadow(color: Color(0x080F172A), blurRadius: 12, offset: Offset(0, 4)),
    ],
  );
}

BoxDecoration dashboardSoftPanelDecoration({
  Color color = dashboardSoftSurface,
  double radius = 18,
}) {
  return BoxDecoration(
    color: color,
    borderRadius: BorderRadius.circular(radius),
  );
}

String formatCurrency(
  num value, {
  bool compact = false,
  bool withSymbol = true,
  int decimals = 0,
}) {
  final amount = value.toDouble();
  final prefix = withSymbol ? '¥' : '';

  if (compact) {
    final absValue = amount.abs();
    if (absValue >= 100000000) {
      final digits = absValue >= 1000000000 ? 0 : 1;
      return '$prefix${(amount / 100000000).toStringAsFixed(digits)}亿';
    }
    if (absValue >= 10000) {
      final digits = absValue >= 100000 ? 0 : 1;
      return '$prefix${(amount / 10000).toStringAsFixed(digits)}万';
    }
  }

  final decimalPattern = decimals > 0
      ? '.${List.filled(decimals, '0').join()}'
      : '';
  final formatter = NumberFormat('#,##0$decimalPattern', 'zh_CN');
  return '$prefix${formatter.format(amount)}';
}

String formatCompactTransactionDateTime(
  String value, {
  bool year = false,
  bool seconds = false,
}) {
  final parsed = DateTime.tryParse(value);
  if (parsed == null) {
    return value;
  }

  final local = parsed.toLocal();
  final pattern = year
      ? (seconds ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd HH:mm')
      : (seconds ? 'MM-dd HH:mm:ss' : 'MM-dd HH:mm');
  return DateFormat(pattern, 'zh_CN').format(local);
}
