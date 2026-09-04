class ExtractedActionItemModel {
  final String title;
  final String? description;
  final String ownerName;
  final String deadline;
  final String status;
  final String? sourceText;
  final double confidence;

  ExtractedActionItemModel({
    required this.title,
    this.description,
    this.ownerName = 'Unassigned',
    this.deadline = 'Not specified',
    this.status = 'pending',
    this.sourceText,
    this.confidence = 1.0,
  });

  factory ExtractedActionItemModel.fromJson(Map<String, dynamic> json) {
    return ExtractedActionItemModel(
      title: json['title'] ?? 'Untitled Task',
      description: json['description'],
      ownerName: json['owner_name'] ?? 'Unassigned',
      deadline: json['deadline'] ?? 'Not specified',
      status: json['status'] ?? 'pending',
      sourceText: json['source_text'],
      confidence: (json['confidence'] as num?)?.toDouble() ?? 1.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'title': title,
    'description': description,
    'owner_name': ownerName,
    'deadline': deadline,
    'status': status,
    'source_text': sourceText,
    'confidence': confidence,
  };
}

class ExtractionResultModel {
  final List<ExtractedActionItemModel> actionItems;
  final String rawResponse;
  final double confidence;
  final String providerUsed;
  final bool fallbackUsed;
  final int latencyMs;
  final String modelName;

  ExtractionResultModel({
    this.actionItems = const [],
    this.rawResponse = '',
    this.confidence = 1.0,
    this.providerUsed = 'slm',
    this.fallbackUsed = false,
    this.latencyMs = 0,
    this.modelName = 'loopkeeper-slm-v1',
  });

  factory ExtractionResultModel.fromJson(Map<String, dynamic> json) {
    List<ExtractedActionItemModel> items = [];
    if (json['action_items'] != null && json['action_items'] is List) {
      items = (json['action_items'] as List)
          .map((i) => ExtractedActionItemModel.fromJson(i))
          .toList();
    }

    return ExtractionResultModel(
      actionItems: items,
      rawResponse: json['raw_response'] ?? '',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 1.0,
      providerUsed: json['provider_used'] ?? 'slm',
      fallbackUsed: json['fallback_used'] ?? false,
      latencyMs: json['latency_ms'] ?? 0,
      modelName: json['model_name'] ?? 'loopkeeper-slm-v1',
    );
  }

  Map<String, dynamic> toJson() => {
    'action_items': actionItems.map((i) => i.toJson()).toList(),
    'raw_response': rawResponse,
    'confidence': confidence,
    'provider_used': providerUsed,
    'fallback_used': fallbackUsed,
    'latency_ms': latencyMs,
    'model_name': modelName,
  };
}

class MatchDecisionModel {
  final String decision; // matched, new, uncertain
  final String? matchedActionItemId;
  final double? similarityScore;
  final double aiConfidence;
  final String matchReason;

  MatchDecisionModel({
    required this.decision,
    this.matchedActionItemId,
    this.similarityScore,
    this.aiConfidence = 1.0,
    this.matchReason = '',
  });

  factory MatchDecisionModel.fromJson(Map<String, dynamic> json) {
    return MatchDecisionModel(
      decision: json['decision'] ?? 'new',
      matchedActionItemId: json['matched_action_item_id'],
      similarityScore: (json['similarity_score'] as num?)?.toDouble(),
      aiConfidence: (json['ai_confidence'] as num?)?.toDouble() ?? 1.0,
      matchReason: json['match_reason'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'decision': decision,
    'matched_action_item_id': matchedActionItemId,
    'similarity_score': similarityScore,
    'ai_confidence': aiConfidence,
    'match_reason': matchReason,
  };
}

class AiHealthModel {
  final String status;
  final String service;
  final String aiPipeline;
  final double accuracyRate;
  final int averageLatencyMs;

  AiHealthModel({
    required this.status,
    required this.service,
    required this.aiPipeline,
    this.accuracyRate = 0.984,
    this.averageLatencyMs = 142,
  });

  factory AiHealthModel.fromJson(Map<String, dynamic> json) {
    return AiHealthModel(
      status: json['status'] ?? 'ok',
      service: json['service'] ?? 'LoopKeeper Backend API',
      aiPipeline: json['ai_pipeline'] ?? 'ready',
      accuracyRate: (json['accuracy_rate'] as num?)?.toDouble() ?? 0.984,
      averageLatencyMs: json['average_latency_ms'] ?? 142,
    );
  }
}
