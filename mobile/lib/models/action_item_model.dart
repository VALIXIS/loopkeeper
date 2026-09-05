class ActionItemHistory {
  final String id;
  final String actionItemId;
  final String meetingId;
  final String eventType;
  final dynamic previousValue;
  final dynamic newValue;
  final String? evidenceText;
  final DateTime createdAt;

  ActionItemHistory({
    required this.id,
    required this.actionItemId,
    required this.meetingId,
    required this.eventType,
    this.previousValue,
    this.newValue,
    this.evidenceText,
    required this.createdAt,
  });

  factory ActionItemHistory.fromJson(Map<String, dynamic> json) {
    return ActionItemHistory(
      id: json['id'] ?? '',
      actionItemId: json['action_item_id'] ?? '',
      meetingId: json['meeting_id'] ?? '',
      eventType: json['event_type'] ?? 'updated',
      previousValue: json['previous_value'],
      newValue: json['new_value'],
      evidenceText: json['evidence_text'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'action_item_id': actionItemId,
    'meeting_id': meetingId,
    'event_type': eventType,
    'previous_value': previousValue,
    'new_value': newValue,
    'evidence_text': evidenceText,
    'created_at': createdAt.toIso8601String(),
  };
}

class ActionItemModel {
  final String id;
  final String meetingId;
  final String title;
  final String? description;
  final String? ownerEmployeeId;
  final String ownerName;
  final DateTime? deadline;
  final String status; // pending, done, overdue, cancelled
  final double confidence;
  final String? sourceText;
  final DateTime firstSeenAt;
  final DateTime lastSeenAt;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ActionItemHistory> history;
  final double? similarityScore;
  final String? matchReason;

  ActionItemModel({
    required this.id,
    required this.meetingId,
    required this.title,
    this.description,
    this.ownerEmployeeId,
    this.ownerName = 'Unassigned',
    this.deadline,
    required this.status,
    this.confidence = 1.0,
    this.sourceText,
    required this.firstSeenAt,
    required this.lastSeenAt,
    this.completedAt,
    required this.createdAt,
    required this.updatedAt,
    this.history = const [],
    this.similarityScore,
    this.matchReason,
  });

  bool get isOverdue {
    if (status == 'done' || status == 'cancelled') return false;
    if (status == 'overdue') return true;
    if (deadline == null) return false;
    return deadline!.isBefore(DateTime.now());
  }

  int get postponementCount {
    return history.where((h) =>
      h.eventType == 'deadline_updated' ||
      h.eventType == 'postponed' ||
      h.eventType == 'matched_extension'
    ).length;
  }

  bool get isRepeatedlyPostponed => postponementCount >= 2;

  factory ActionItemModel.fromJson(Map<String, dynamic> json) {
    List<ActionItemHistory> parsedHistory = [];
    if (json['history'] != null && json['history'] is List) {
      parsedHistory = (json['history'] as List)
          .map((item) => ActionItemHistory.fromJson(item))
          .toList();
    }

    return ActionItemModel(
      id: json['id'] ?? '',
      meetingId: json['meeting_id'] ?? '',
      title: json['title'] ?? 'Untitled Action Item',
      description: json['description'],
      ownerEmployeeId: json['owner_employee_id'],
      ownerName: json['owner_name'] ?? 'Unassigned',
      deadline: json['deadline'] != null ? DateTime.tryParse(json['deadline']) : null,
      status: json['status'] ?? 'pending',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 1.0,
      sourceText: json['source_text'],
      firstSeenAt: json['first_seen_at'] != null ? DateTime.parse(json['first_seen_at']) : DateTime.now(),
      lastSeenAt: json['last_seen_at'] != null ? DateTime.parse(json['last_seen_at']) : DateTime.now(),
      completedAt: json['completed_at'] != null ? DateTime.tryParse(json['completed_at']) : null,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : DateTime.now(),
      history: parsedHistory,
      similarityScore: (json['similarity_score'] as num?)?.toDouble(),
      matchReason: json['match_reason'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'meeting_id': meetingId,
    'title': title,
    'description': description,
    'owner_employee_id': ownerEmployeeId,
    'owner_name': ownerName,
    'deadline': deadline?.toIso8601String(),
    'status': status,
    'confidence': confidence,
    'source_text': sourceText,
    'first_seen_at': firstSeenAt.toIso8601String(),
    'last_seen_at': lastSeenAt.toIso8601String(),
    'completed_at': completedAt?.toIso8601String(),
    'created_at': createdAt.toIso8601String(),
    'updated_at': updatedAt.toIso8601String(),
    'history': history.map((h) => h.toJson()).toList(),
    'similarity_score': similarityScore,
    'match_reason': matchReason,
  };
}
