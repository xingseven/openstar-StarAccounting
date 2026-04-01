import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:star_accounting/features/dashboard/data/dashboard_model.dart';
import 'package:star_accounting/features/dashboard/presentation/widgets/hero_section.dart';

void main() {
  testWidgets('dashboard hero shows legacy overview metrics', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: DashboardHeroSection(
            data: kMockDashboard,
            alertsDismissed: false,
            onDismissAlerts: () {},
          ),
        ),
      ),
    );

    expect(find.text('当前净资产'), findsOneWidget);
    expect(find.text('总资产'), findsOneWidget);
    expect(find.text('预算预警'), findsOneWidget);
  });
}
