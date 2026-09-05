import 'dart:convert';
import 'package:http/http.dart' as http;
import '../storage/session_storage.dart';
import 'api_endpoints.dart';
import 'mock_data.dart';
import '../../models/meeting_model.dart';
import '../../models/action_item_model.dart';
import '../../models/dashboard_model.dart';
import '../../models/ai_model.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  final http.Client _httpClient = http.Client();

  Future<Map<String, String>> _getHeaders() async {
    final token = await SessionStorage.getUserToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<Uri> _buildUri(String path, [Map<String, String>? queryParams]) async {
    final baseUrl = await SessionStorage.getBaseUrl();
    final cleanBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$cleanBase$cleanPath').replace(queryParameters: queryParams);
  }

  // Check backend operational status
  Future<AiHealthModel> checkHealth() async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (isOffline) return MockData.getMockAiHealth();

    try {
      final uri = await _buildUri(ApiEndpoints.health);
      final headers = await _getHeaders();
      final response = await _httpClient.get(uri, headers: headers).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return AiHealthModel.fromJson(data);
      }
    } catch (_) {}
    return MockData.getMockAiHealth();
  }

  // Get list of meetings
  Future<List<MeetingModel>> getMeetings() async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (isOffline) return MockData.getMockMeetings();

    try {
      final uri = await _buildUri(ApiEndpoints.meetings);
      final headers = await _getHeaders();
      final response = await _httpClient.get(uri, headers: headers).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((json) => MeetingModel.fromJson(json)).toList();
      }
    } catch (_) {}
    return MockData.getMockMeetings();
  }

  // Get meeting detail
  Future<MeetingModel> getMeetingDetail(String meetingId) async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (isOffline) {
      return MockData.getMockMeetings().firstWhere(
        (m) => m.id == meetingId,
        orElse: () => MockData.getMockMeetings().first,
      );
    }

    try {
      final uri = await _buildUri(ApiEndpoints.meetingDetail(meetingId));
      final headers = await _getHeaders();
      final response = await _httpClient.get(uri, headers: headers).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        return MeetingModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}
    
    return MockData.getMockMeetings().firstWhere(
      (m) => m.id == meetingId,
      orElse: () => MockData.getMockMeetings().first,
    );
  }

  // Create new meeting
  Future<MeetingModel> createMeeting({
    required String title,
    DateTime? meetingDate,
    String source = 'transcript',
    String? externalSourceId,
  }) async {
    final isOffline = await SessionStorage.isOfflineMode();
    final body = {
      'title': title,
      'meeting_date': (meetingDate ?? DateTime.now()).toIso8601String(),
      'source': source,
      'external_source_id': externalSourceId,
    };

    if (isOffline) {
      final newMeeting = MeetingModel(
        id: 'meet-${DateTime.now().millisecondsSinceEpoch}',
        title: title,
        meetingDate: meetingDate ?? DateTime.now(),
        source: source,
        externalSourceId: externalSourceId,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      return newMeeting;
    }

    try {
      final uri = await _buildUri(ApiEndpoints.meetings);
      final headers = await _getHeaders();
      final response = await _httpClient.post(uri, headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 5));

      if (response.statusCode == 201 || response.statusCode == 200) {
        return MeetingModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return MeetingModel(
      id: 'meet-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      meetingDate: meetingDate ?? DateTime.now(),
      source: source,
      externalSourceId: externalSourceId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  // Attach transcript to meeting
  Future<bool> attachTranscript({
    required String meetingId,
    required String content,
    String? sourceFileName,
    String? transcriptFormat = 'vtt',
  }) async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (isOffline) return true;

    try {
      final uri = await _buildUri(ApiEndpoints.meetingTranscript(meetingId));
      final headers = await _getHeaders();
      final body = {
        'content': content,
        'source_file_name': sourceFileName,
        'transcript_format': transcriptFormat,
      };
      final response = await _httpClient.post(uri, headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 5));
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (_) {}
    return true;
  }

  // Trigger AI processing on meeting transcript
  Future<List<ActionItemModel>> processMeeting(String meetingId) async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (isOffline) return MockData.getMockActionItems().take(2).toList();

    try {
      final uri = await _buildUri(ApiEndpoints.processMeeting(meetingId));
      final headers = await _getHeaders();
      final response = await _httpClient.post(uri, headers: headers).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((j) => ActionItemModel.fromJson(j)).toList();
      }
    } catch (_) {}

    return MockData.getMockActionItems().take(2).toList();
  }

  // Get action items with filters
  Future<List<ActionItemModel>> getActionItems({
    String? meetingId,
    String? ownerEmployeeId,
    String? status,
  }) async {
    final isOffline = await SessionStorage.isOfflineMode();
    final queryParams = <String, String>{};
    if (meetingId != null) queryParams['meeting_id'] = meetingId;
    if (ownerEmployeeId != null) queryParams['owner_employee_id'] = ownerEmployeeId;
    if (status != null) queryParams['status'] = status;

    if (isOffline) {
      var items = MockData.getMockActionItems();
      if (meetingId != null) items = items.where((i) => i.meetingId == meetingId).toList();
      if (ownerEmployeeId != null) items = items.where((i) => i.ownerEmployeeId == ownerEmployeeId).toList();
      if (status != null) items = items.where((i) => i.status == status).toList();
      return items;
    }

    try {
      final uri = await _buildUri(ApiEndpoints.actionItems, queryParams.isEmpty ? null : queryParams);
      final headers = await _getHeaders();
      final response = await _httpClient.get(uri, headers: headers).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((json) => ActionItemModel.fromJson(json)).toList();
      }
    } catch (_) {}

    var items = MockData.getMockActionItems();
    if (meetingId != null) items = items.where((i) => i.meetingId == meetingId).toList();
    if (ownerEmployeeId != null) items = items.where((i) => i.ownerEmployeeId == ownerEmployeeId).toList();
    if (status != null) items = items.where((i) => i.status == status).toList();
    return items;
  }

  // Get action item detail with history
  Future<ActionItemModel> getActionItemDetail(String id) async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (isOffline) {
      return MockData.getMockActionItems().firstWhere(
        (item) => item.id == id,
        orElse: () => MockData.getMockActionItems().first,
      );
    }

    try {
      final uri = await _buildUri(ApiEndpoints.actionItemDetail(id));
      final headers = await _getHeaders();
      final response = await _httpClient.get(uri, headers: headers).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        return ActionItemModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return MockData.getMockActionItems().firstWhere(
      (item) => item.id == id,
      orElse: () => MockData.getMockActionItems().first,
    );
  }

  // Patch action item (status, deadline, title, description, owner)
  Future<ActionItemModel> updateActionItem(String id, Map<String, dynamic> updateData) async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (!isOffline) {
      try {
        final uri = await _buildUri(ApiEndpoints.actionItemDetail(id));
        final headers = await _getHeaders();
        final response = await _httpClient.patch(uri, headers: headers, body: jsonEncode(updateData)).timeout(const Duration(seconds: 5));

        if (response.statusCode == 200) {
          return ActionItemModel.fromJson(jsonDecode(response.body));
        }
      } catch (_) {}
    }

    final item = MockData.getMockActionItems().firstWhere(
      (i) => i.id == id,
      orElse: () => MockData.getMockActionItems().first,
    );
    final newStatus = updateData['status'] ?? item.status;
    final newDeadline = updateData['deadline'] != null ? DateTime.tryParse(updateData['deadline']) : item.deadline;
    return ActionItemModel(
      id: item.id,
      meetingId: item.meetingId,
      title: updateData['title'] ?? item.title,
      description: updateData['description'] ?? item.description,
      ownerEmployeeId: item.ownerEmployeeId,
      ownerName: item.ownerName,
      deadline: newDeadline,
      status: newStatus,
      confidence: item.confidence,
      sourceText: item.sourceText,
      firstSeenAt: item.firstSeenAt,
      lastSeenAt: DateTime.now(),
      completedAt: newStatus == 'done' ? DateTime.now() : item.completedAt,
      createdAt: item.createdAt,
      updatedAt: DateTime.now(),
      history: item.history,
      similarityScore: item.similarityScore,
      matchReason: item.matchReason,
    );
  }

  // Get dashboard overview
  Future<DashboardOverviewModel> getDashboardOverview() async {
    final isOffline = await SessionStorage.isOfflineMode();
    if (isOffline) return MockData.getMockDashboard();

    try {
      final uri = await _buildUri(ApiEndpoints.dashboardOverview);
      final headers = await _getHeaders();
      final response = await _httpClient.get(uri, headers: headers).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        return DashboardOverviewModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return MockData.getMockDashboard();
  }
}
