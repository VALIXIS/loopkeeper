import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:loopkeeper_mobile/providers/app_state_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('AppStateProvider Tests', () {
    test('AppStateProvider initializes correctly', () async {
      final provider = AppStateProvider();
      await provider.init();

      expect(provider.actionItems.isNotEmpty, isTrue);
      expect(provider.meetings.isNotEmpty, isTrue);
      expect(provider.currentUser.name, contains('Hasitha'));
    });

    test('updateItemStatus updates task status', () async {
      final provider = AppStateProvider();
      await provider.init();

      final firstItem = provider.actionItems.first;
      final originalStatus = firstItem.status;
      final newStatus = originalStatus == 'done' ? 'pending' : 'done';

      await provider.updateItemStatus(firstItem.id, newStatus);
      final updatedItem = provider.actionItems.firstWhere((i) => i.id == firstItem.id);
      expect(updatedItem.status, newStatus);
    });

    test('toggleOfflineMode switches network resilience mode', () async {
      final provider = AppStateProvider();
      await provider.init();

      await provider.toggleOfflineMode(true);
      expect(provider.isOffline, isTrue);

      await provider.toggleOfflineMode(false);
      expect(provider.isOffline, isFalse);
    });
  });
}
