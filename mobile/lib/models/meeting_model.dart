import 'action_item_model.dart';

class TranscriptModel {
  final String id;
  final String meetingId;
  final String content;
  final String? sourceFileName;
  final String? transcriptFormat;
  final DateTime createdAt;

  TranscriptModel({
    required this.id,
    required this.meetingId,
    required this.content,
    this.sourceFileName,
    this.transcriptFormat,
    required this.createdAt,
  });

  factory TranscriptModel.fromJson(Map<String, dynamic> json) {
    return TranscriptModel(
      id: json['id'] ?? '',
      meetingId: json['meeting_id'] ?? '',
      content: json['content'] ?? '',
      sourceFileName: json['source_file_name'],
      transcriptFormat: json['transcript_format'],
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'meeting_id': meetingId,
    'content': content,
    'source_file_name': sourceFileName,
    'transcript_format': transcriptFormat,
    'created_at': createdAt.toIso8601String(),
  };
}

class MeetingModel {
  final String id;
  final String title;
  final DateTime meetingDate;
  final String source;
  final String? externalSourceId;
  final String? createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final TranscriptModel? transcript;
  final List<ActionItemModel> actionItems;
  final List<String> participantIds;

  MeetingModel({
    required this.id,
    required this.title,
    required this.meetingDate,
    this.source = 'transcript',
    this.externalSourceId,
    this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.transcript,
    this.actionItems = const [],
    this.participantIds = const [],
  });

  factory MeetingModel.fromJson(Map<String, dynamic> json) {
    List<ActionItemModel> items = [];
    if (json['action_items'] != null && json['action_items'] is List) {
      items = (json['action_items'] as List)
          .map((item) => ActionItemModel.fromJson(item))
          .toList();
    }

    List<String> participants = [];
    if (json['participant_ids'] != null && json['participant_ids'] is List) {
      participants = (json['participant_ids'] as List)
          .map((p) => p.toString())
          .toList();
    }

    TranscriptModel? parsedTranscript;
    if (json['transcript'] != null) {
      parsedTranscript = TranscriptModel.fromJson(json['transcript']);
    }

    return MeetingModel(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Untitled Meeting',
      meetingDate: json['meeting_date'] != null
          ? DateTime.parse(json['meeting_date'])
          : DateTime.now(),
      source: json['source'] ?? 'transcript',
      externalSourceId: json['external_source_id'],
      createdBy: json['created_by'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      transcript: parsedTranscript,
      actionItems: items,
      participantIds: participants,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'meeting_date': meetingDate.toIso8601String(),
    'source': source,
    'external_source_id': externalSourceId,
    'created_by': createdBy,
    'created_at': createdAt.toIso8601String(),
    'updated_at': updatedAt.toIso8601String(),
    'transcript': transcript?.toJson(),
    'action_items': actionItems.map((a) => a.toJson()).toList(),
    'participant_ids': participantIds,
  };
}
