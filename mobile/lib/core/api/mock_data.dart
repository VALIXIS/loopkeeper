import '../../models/meeting_model.dart';
import '../../models/action_item_model.dart';
import '../../models/dashboard_model.dart';
import '../../models/ai_model.dart';

class MockData {
  static const String currentUserId = '11111111-1111-1111-1111-111111111111';
  static const String vigneshId = '22222222-2222-2222-2222-222222222222';
  static const String aliceId = '33333333-3333-3333-3333-333333333333';
  static const String bobId = '44444444-4444-4444-4444-444433333333';

  static List<ActionItemModel> getMockActionItems() {
    final now = DateTime.now();
    return [
      ActionItemModel(
        id: 'item-101',
        meetingId: 'meet-001',
        title: 'Fix authentication screen login bug',
        description: 'Resolve OAuth token refresh failure on Android mobile devices.',
        ownerEmployeeId: vigneshId,
        ownerName: 'Vignesh Kumar',
        deadline: now.subtract(const Duration(days: 1)), // Overdue
        status: 'overdue',
        confidence: 0.94,
        sourceText: 'Vignesh: "I will fix the authentication screen login bug by Friday."',
        firstSeenAt: now.subtract(const Duration(days: 7)),
        lastSeenAt: now.subtract(const Duration(days: 2)),
        createdAt: now.subtract(const Duration(days: 7)),
        updatedAt: now.subtract(const Duration(days: 1)),
        similarityScore: 0.887,
        matchReason: 'Matched with "finish authentication screen" from Sprint Sync 1 via vector similarity.',
        history: [
          ActionItemHistory(
            id: 'h-1',
            actionItemId: 'item-101',
            meetingId: 'meet-001',
            eventType: 'created',
            newValue: 'pending',
            evidenceText: 'Extracted from Sprint Planning transcript.',
            createdAt: now.subtract(const Duration(days: 7)),
          ),
          ActionItemHistory(
            id: 'h-2',
            actionItemId: 'item-101',
            meetingId: 'meet-002',
            eventType: 'postponed',
            previousValue: '2026-09-03T18:00:00Z',
            newValue: '2026-09-04T18:00:00Z',
            evidenceText: 'Meeting 2: "Can we get login work completed by Friday instead?"',
            createdAt: now.subtract(const Duration(days: 4)),
          ),
          ActionItemHistory(
            id: 'h-3',
            actionItemId: 'item-101',
            meetingId: 'meet-003',
            eventType: 'deadline_updated',
            previousValue: '2026-09-04T18:00:00Z',
            newValue: '2026-09-05T18:00:00Z',
            evidenceText: 'Meeting 3: "Auth work needs another day for regression testing."',
            createdAt: now.subtract(const Duration(days: 2)),
          ),
        ],
      ),
      ActionItemModel(
        id: 'item-102',
        meetingId: 'meet-001',
        title: 'Implement Dark Mode design system tokens',
        description: 'Ensure hex colors #090D16 and #0F172A are used across all screens.',
        ownerEmployeeId: currentUserId,
        ownerName: 'Hasitha (Mobile Lead)',
        deadline: now.add(const Duration(days: 2)),
        status: 'pending',
        confidence: 0.98,
        sourceText: 'Hasitha: "I will implement the Flutter dark mode theme tokens by tomorrow."',
        firstSeenAt: now.subtract(const Duration(days: 3)),
        lastSeenAt: now.subtract(const Duration(days: 1)),
        createdAt: now.subtract(const Duration(days: 3)),
        updatedAt: now.subtract(const Duration(days: 1)),
        history: [
          ActionItemHistory(
            id: 'h-4',
            actionItemId: 'item-102',
            meetingId: 'meet-001',
            eventType: 'created',
            newValue: 'pending',
            evidenceText: 'Extracted commitment from Architecture Sync.',
            createdAt: now.subtract(const Duration(days: 3)),
          ),
        ],
      ),
      ActionItemModel(
        id: 'item-103',
        meetingId: 'meet-002',
        title: 'Deploy FastAPI backend to staging cluster',
        description: 'Verify PostgreSQL pgvector extension and API endpoints on staging environment.',
        ownerEmployeeId: aliceId,
        ownerName: 'Alice Vance',
        deadline: now.add(const Duration(days: 4)),
        status: 'pending',
        confidence: 0.91,
        sourceText: 'Alice: "I will deploy the backend API updates to staging before the demo."',
        firstSeenAt: now.subtract(const Duration(days: 2)),
        lastSeenAt: now.subtract(const Duration(days: 1)),
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now.subtract(const Duration(days: 1)),
        history: [],
      ),
      ActionItemModel(
        id: 'item-104',
        meetingId: 'meet-002',
        title: 'Set up VALIXIS integration API endpoints',
        description: 'Build robust REST endpoints for audit synchronization.',
        ownerEmployeeId: bobId,
        ownerName: 'Bob Smith',
        deadline: now.add(const Duration(days: 1)),
        status: 'pending',
        confidence: 0.85,
        sourceText: 'Bob: "I will complete the VALIXIS audit API integration specs."',
        firstSeenAt: now.subtract(const Duration(days: 4)),
        lastSeenAt: now.subtract(const Duration(days: 1)),
        createdAt: now.subtract(const Duration(days: 4)),
        updatedAt: now.subtract(const Duration(days: 1)),
        history: [],
      ),
      ActionItemModel(
        id: 'item-105',
        meetingId: 'meet-003',
        title: 'Audit database indexes for pgvector similarity search',
        description: 'Create IVFFlat index on embedding vectors for faster semantic match queries.',
        ownerEmployeeId: aliceId,
        ownerName: 'Alice Vance',
        deadline: now.subtract(const Duration(days: 5)),
        status: 'done',
        confidence: 0.99,
        sourceText: 'Alice: "Database vector indexing is completed and verified in production."',
        firstSeenAt: now.subtract(const Duration(days: 8)),
        lastSeenAt: now.subtract(const Duration(days: 5)),
        completedAt: now.subtract(const Duration(days: 5)),
        createdAt: now.subtract(const Duration(days: 8)),
        updatedAt: now.subtract(const Duration(days: 5)),
        history: [
          ActionItemHistory(
            id: 'h-5',
            actionItemId: 'item-105',
            meetingId: 'meet-003',
            eventType: 'status_changed',
            previousValue: 'pending',
            newValue: 'done',
            evidenceText: 'Marked as completed after database benchmarking.',
            createdAt: now.subtract(const Duration(days: 5)),
          )
        ],
      ),
    ];
  }

  static List<MeetingModel> getMockMeetings() {
    final now = DateTime.now();
    final items = getMockActionItems();
    return [
      MeetingModel(
        id: 'meet-001',
        title: 'Sprint Planning & Architecture Sync',
        meetingDate: now.subtract(const Duration(days: 3)),
        source: 'transcript',
        externalSourceId: 'meet-12345',
        createdBy: currentUserId,
        createdAt: now.subtract(const Duration(days: 3)),
        updatedAt: now.subtract(const Duration(days: 3)),
        transcript: TranscriptModel(
          id: 'tr-001',
          meetingId: 'meet-001',
          content: '''Hasitha: Welcome team to the LoopKeeper sprint sync.
Vignesh: I will fix the authentication screen login bug by Friday.
Hasitha: Great, I will implement the Flutter dark mode theme tokens by tomorrow so the design matches Jyothsna's specs.
Alice: Sounds good. Let's make sure uncertainty is flagged clearly when confidence scores are below 0.85.''',
          sourceFileName: 'sprint_planning.vtt',
          transcriptFormat: 'vtt',
          createdAt: now.subtract(const Duration(days: 3)),
        ),
        actionItems: [items[0], items[1]],
        participantIds: [currentUserId, vigneshId, aliceId],
      ),
      MeetingModel(
        id: 'meet-002',
        title: 'Backend API & SLM Pipeline Review',
        meetingDate: now.subtract(const Duration(days: 2)),
        source: 'transcript',
        externalSourceId: 'meet-67890',
        createdBy: aliceId,
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now.subtract(const Duration(days: 2)),
        transcript: TranscriptModel(
          id: 'tr-002',
          meetingId: 'meet-002',
          content: '''Alice: Updating everyone on the AI pipeline. The SLM inference runs locally under 150ms.
Vignesh: Can we get login work completed by Friday instead?
Alice: Yes, I will deploy the backend API updates to staging before the demo.
Bob: I will complete the VALIXIS audit API integration specs.''',
          sourceFileName: 'backend_review.txt',
          transcriptFormat: 'txt',
          createdAt: now.subtract(const Duration(days: 2)),
        ),
        actionItems: [items[2], items[3]],
        participantIds: [aliceId, vigneshId, bobId],
      ),
      MeetingModel(
        id: 'meet-003',
        title: 'Database Indexing & Performance Benchmark',
        meetingDate: now.subtract(const Duration(days: 6)),
        source: 'transcript',
        externalSourceId: 'meet-11223',
        createdBy: aliceId,
        createdAt: now.subtract(const Duration(days: 6)),
        updatedAt: now.subtract(const Duration(days: 6)),
        transcript: TranscriptModel(
          id: 'tr-003',
          meetingId: 'meet-003',
          content: '''Alice: Database vector indexing is completed and verified in production.
Bob: Checked latency on vector query embeddings; response time is under 15ms.''',
          sourceFileName: 'db_benchmark.vtt',
          transcriptFormat: 'vtt',
          createdAt: now.subtract(const Duration(days: 6)),
        ),
        actionItems: [items[4]],
        participantIds: [aliceId, bobId],
      ),
    ];
  }

  static DashboardOverviewModel getMockDashboard() {
    return DashboardOverviewModel(
      totalOpenTasks: 4,
      overdueTasks: 1,
      completedTasks: 12,
      repeatedlyPostponedTasks: 1,
      overloadedMembers: [
        OverloadedMemberModel(
          employeeId: vigneshId,
          employeeName: 'Vignesh Kumar',
          openTaskCount: 4,
          overdueTaskCount: 1,
        ),
        OverloadedMemberModel(
          employeeId: aliceId,
          employeeName: 'Alice Vance',
          openTaskCount: 3,
          overdueTaskCount: 0,
        ),
      ],
      upcomingDeadlines: getMockActionItems().where((item) => item.status == 'pending').toList(),
    );
  }

  static AiHealthModel getMockAiHealth() {
    return AiHealthModel(
      status: 'ok',
      service: 'LoopKeeper Backend API',
      aiPipeline: 'ready',
      accuracyRate: 0.984,
      averageLatencyMs: 142,
    );
  }
}
