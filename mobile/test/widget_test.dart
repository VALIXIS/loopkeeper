import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:loopkeeper_mobile/core/theme/app_theme.dart';
import 'package:loopkeeper_mobile/providers/app_state_provider.dart';
import 'package:loopkeeper_mobile/widgets/navigation/main_navigation_wrapper.dart';
import 'package:loopkeeper_mobile/widgets/badges/status_pill.dart';
import 'package:loopkeeper_mobile/widgets/badges/confidence_badge.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget createWidgetUnderTest() {
    return ChangeNotifierProvider(
      create: (_) => AppStateProvider()..init(),
      child: MaterialApp(
        theme: AppTheme.darkTheme,
        home: const MainNavigationWrapper(),
      ),
    );
  }

  testWidgets('App renders Home Screen with bottom navigation bar', (WidgetTester tester) async {
    await tester.pumpWidget(createWidgetUnderTest());
    await tester.pumpAndSettle();

    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Meetings'), findsOneWidget);
    expect(find.text('My Tasks'), findsOneWidget);
    expect(find.text('Team'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });

  testWidgets('StatusPill renders status correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: StatusPill(status: 'pending'),
        ),
      ),
    );

    expect(find.text('Pending'), findsOneWidget);
  });

  testWidgets('ConfidenceBadge renders score correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: ConfidenceBadge(confidence: 0.94),
        ),
      ),
    );

    expect(find.text('94.0%'), findsOneWidget);
  });

  testWidgets('Bottom Navigation switches tabs successfully', (WidgetTester tester) async {
    await tester.pumpWidget(createWidgetUnderTest());
    await tester.pumpAndSettle();

    // Tap Meetings tab
    await tester.tap(find.text('Meetings'));
    await tester.pumpAndSettle();
    expect(find.text('Search meetings or transcripts...'), findsOneWidget);

    // Tap My Tasks tab
    await tester.tap(find.text('My Tasks'));
    await tester.pumpAndSettle();
    expect(find.text('All'), findsOneWidget);
  });
}
