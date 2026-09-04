import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:loopkeeper_mobile/core/api/api_client.dart';
import 'package:loopkeeper_mobile/core/storage/session_storage.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('ApiClient Tests', () {
    test('checkHealth returns operational status', () async {
      final client = ApiClient();
      final health = await client.checkHealth();
      expect(health.status, 'ok');
      expect(health.aiPipeline, 'ready');
    });

    test('getMeetings returns fallback list when offline', () async {
      await SessionStorage.setOfflineMode(true);
      final client = ApiClient();
      final meetings = await client.getMeetings();
      expect(meetings.isNotEmpty, isTrue);
      expect(meetings.first.title, contains('Sprint Planning'));
    });

    test('getActionItems returns fallback action items', () async {
      final client = ApiClient();
      final items = await client.getActionItems();
      expect(items.isNotEmpty, isTrue);
      expect(items.any((i) => i.ownerName.contains('Priya')), isTrue);
    });

    test('getDashboardOverview returns overloaded members and metrics', () async {
      final client = ApiClient();
      final dashboard = await client.getDashboardOverview();
      expect(dashboard.totalOpenTasks, greaterThan(0));
      expect(dashboard.overloadedMembers.isNotEmpty, isTrue);
    });
  });
}
