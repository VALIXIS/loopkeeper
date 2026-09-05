import 'package:flutter/material.dart';
import '../core/api/api_client.dart';
import '../core/storage/session_storage.dart';
import '../models/action_item_model.dart';
import '../models/ai_model.dart';
import '../models/dashboard_model.dart';
import '../models/meeting_model.dart';
import '../models/auth_model.dart';

class AppStateProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool _isOffline = false;
  bool get isOffline => _isOffline;

  String _baseUrl = SessionStorage.defaultBaseUrl;
  String get baseUrl => _baseUrl;

  UserProfile _currentUser = UserProfile(
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Hasitha',
    email: 'hasitha@2006',
    role: 'Mobile Application Lead',
    department: 'Mobile Engineering',
    avatarUrl: '',
    age: 20,
    contactNumber: '9494462124',
    address: 'Plot 42, Hitech City, Madhapur, Hyderabad, Telangana 500081',
  );
  UserProfile get currentUser => _currentUser;

  DashboardOverviewModel? _dashboard;
  DashboardOverviewModel? get dashboard => _dashboard;

  List<MeetingModel> _meetings = [];
  List<MeetingModel> get meetings => _meetings;

  List<ActionItemModel> _actionItems = [];
  List<ActionItemModel> get actionItems => _actionItems;

  AiHealthModel? _aiHealth;
  AiHealthModel? get aiHealth => _aiHealth;

  int _unreadAlertsCount = 3;
  int get unreadAlertsCount => _unreadAlertsCount;

  ThemeMode _themeMode = ThemeMode.dark;
  ThemeMode get themeMode => _themeMode;

  List<Map<String, dynamic>> _employees = [];
  List<Map<String, dynamic>> get employees => _employees;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    _baseUrl = await SessionStorage.getBaseUrl();
    _isOffline = await SessionStorage.isOfflineMode();
    final storedTheme = await SessionStorage.getThemeMode();
    _themeMode = storedTheme == 'light' ? ThemeMode.light : ThemeMode.dark;

    final session = await SessionStorage.getUserSession();
    
    _currentUser = UserProfile(
      id: session['userId']!,
      name: session['name'] ?? 'Hasitha',
      email: session['email'] ?? 'hasitha@2006',
      role: session['role'] ?? 'Mobile Application Lead',
      department: 'Engineering',
      avatarUrl: '',
      age: 20,
      contactNumber: '9494462124',
      address: 'Plot 42, Hitech City, Madhapur, Hyderabad, Telangana 500081',
    );

    await refreshAll();
  }

  void updateUserProfile({
    String? name,
    int? age,
    String? email,
    String? contactNumber,
    String? address,
    String? role,
  }) {
    _currentUser = _currentUser.copyWith(
      name: name,
      age: age,
      email: email,
      contactNumber: contactNumber,
      address: address,
      role: role,
    );
    notifyListeners();
  }


  Future<void> refreshAll() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _aiHealth = await _apiClient.checkHealth();
      _dashboard = await _apiClient.getDashboardOverview();
      _meetings = await _apiClient.getMeetings();
      _actionItems = await _apiClient.getActionItems();
      _employees = await _apiClient.getEmployees();
    } catch (e) {
      if (_isOffline) {
        _errorMessage = 'Operating in Demo Fixture Mode.';
      } else {
        _errorMessage = 'Backend connection error to $_baseUrl';
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    await SessionStorage.setThemeMode(mode == ThemeMode.light ? 'light' : 'dark');
    notifyListeners();
  }

  Future<void> setBaseUrl(String url) async {
    _baseUrl = url;
    await SessionStorage.setBaseUrl(url);
    await refreshAll();
  }

  Future<void> toggleOfflineMode(bool offline) async {
    _isOffline = offline;
    await SessionStorage.setOfflineMode(offline);
    await refreshAll();
  }


  Future<void> switchUser(String role, String name, String id) async {
    await SessionStorage.saveUserSession(
      token: 'mock-token',
      userId: id,
      name: name,
      role: role,
    );
    _currentUser = UserProfile(
      id: id,
      name: name,
      email: '${name.toLowerCase().replaceAll(' ', '.')}@loopkeeper.ai',
      role: role,
      department: 'Engineering',
      avatarUrl: '',
    );
    await refreshAll();
  }

  Future<void> updateItemStatus(String id, String newStatus) async {
    try {
      final updated = await _apiClient.updateActionItem(id, {'status': newStatus});
      final index = _actionItems.indexWhere((item) => item.id == id);
      if (index != -1) {
        _actionItems[index] = updated;
      }
      await refreshDashboard();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Could not update item status.';
      notifyListeners();
    }
  }

  Future<void> updateItemDeadline(String id, DateTime newDeadline) async {
    try {
      final updated = await _apiClient.updateActionItem(id, {'deadline': newDeadline.toIso8601String()});
      final index = _actionItems.indexWhere((item) => item.id == id);
      if (index != -1) {
        _actionItems[index] = updated;
      }
      await refreshDashboard();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Could not update deadline.';
      notifyListeners();
    }
  }

  Future<void> processMeeting(String meetingId) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _apiClient.processMeeting(meetingId);
      await refreshAll();
    } catch (e) {
      _errorMessage = 'Processing completed with fallback results.';
      await refreshAll();
    }
  }

  Future<MeetingModel?> createMeeting(String title, DateTime date, {String? transcriptText}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final meeting = await _apiClient.createMeeting(title: title, meetingDate: date);
      
      TranscriptModel? transcriptObj;
      if (transcriptText != null && transcriptText.trim().isNotEmpty) {
        await _apiClient.attachTranscript(meetingId: meeting.id, content: transcriptText);
        transcriptObj = TranscriptModel(
          id: 'trans-${DateTime.now().millisecondsSinceEpoch}',
          meetingId: meeting.id,
          content: transcriptText,
          createdAt: DateTime.now(),
        );
        try {
          await _apiClient.processMeeting(meeting.id);
        } catch (_) {}
      }

      final completeMeeting = MeetingModel(
        id: meeting.id,
        title: meeting.title,
        meetingDate: meeting.meetingDate,
        source: meeting.source,
        externalSourceId: meeting.externalSourceId,
        createdAt: meeting.createdAt,
        updatedAt: meeting.updatedAt,
        status: 'extracted',
        transcript: transcriptObj,
      );


      // Prepend to local meeting database list so it persists in UI instantly
      _meetings.insert(0, completeMeeting);
      notifyListeners();
      return completeMeeting;
    } catch (e) {
      _errorMessage = 'Failed to create meeting.';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }


  Future<void> refreshDashboard() async {
    _dashboard = await _apiClient.getDashboardOverview();
    notifyListeners();
  }

  void markAlertsAsRead() {
    _unreadAlertsCount = 0;
    notifyListeners();
  }

  // Filtered helper getters
  List<ActionItemModel> get myOpenTasks {
    return _actionItems.where((i) =>
      i.ownerEmployeeId == _currentUser.id &&
      i.status != 'done' &&
      i.status != 'cancelled'
    ).toList();
  }

  List<ActionItemModel> get overdueTasks {
    return _actionItems.where((i) => i.isOverdue).toList();
  }

  List<ActionItemModel> get completedTasks {
    return _actionItems.where((i) => i.status == 'done').toList();
  }
}
