import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app_flutter/features/shared/presentation/placeholder_feature_page.dart';

void main() {
  testWidgets('placeholder feature page renders title and description',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: PlaceholderFeaturePage(
          title: '待迁移模块',
          description: '这里会继续补真实能力。',
        ),
      ),
    );

    expect(find.text('待迁移模块'), findsOneWidget);
    expect(find.text('这里会继续补真实能力。'), findsOneWidget);
  });
}
