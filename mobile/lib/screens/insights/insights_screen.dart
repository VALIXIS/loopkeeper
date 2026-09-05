import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/meeting_model.dart';
import '../../providers/app_state_provider.dart';

class InsightsScreen extends StatefulWidget {
  const InsightsScreen({super.key});

  @override
  State<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends State<InsightsScreen> {
  double _minConfidenceFilter = 0.80;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final items = provider.actionItems;
    final meetings = provider.meetings;

    final filteredItems = items.where((i) => i.confidence >= _minConfidenceFilter).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Accountability Insights'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Graph Concept Description Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgSurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.timeline_rounded, color: AppColors.brandPrimary, size: 22),
                      SizedBox(width: 8),
                      Text(
                        'Accountability Graph DAG',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Meeting  →  Commitment  →  Owner  →  Deadline  →  Outcome',
                    style: TextStyle(
                      color: AppColors.brandAccent,
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Tracks how tasks mutate in wording, get matched via vector similarity, and transition across meetings over time.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Confidence Filter Slider
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'AI Match Confidence Threshold',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          DateFormatter.formatConfidence(_minConfidenceFilter),
                          style: const TextStyle(
                            color: AppColors.brandAccent,
                            fontSize: 13,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _minConfidenceFilter,
                      min: 0.50,
                      max: 1.00,
                      divisions: 10,
                      activeColor: AppColors.brandPrimary,
                      inactiveColor: AppColors.bgSurfaceHover,
                      onChanged: (val) {
                        setState(() => _minConfidenceFilter = val);
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Vertical Commitment Flow Timeline',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            if (filteredItems.isEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.bgSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: const Center(
                  child: Text(
                    'No graph nodes match the selected confidence threshold.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ),
              )
            else
              ...filteredItems.map(
                (item) {
                  final originMeeting = meetings.firstWhere(
                    (m) => m.id == item.meetingId,
                    orElse: () => meetings.isNotEmpty ? meetings.first : MeetingModel(
                      id: item.meetingId,
                      title: 'Sprint Planning',
                      meetingDate: DateTime.now(),
                      createdAt: DateTime.now(),
                      updatedAt: DateTime.now(),
                    ),
                  );

                  return _GraphNodeCard(item: item, meeting: originMeeting);
                },
              ),
          ],
        ),
      ),
    );
  }
}

class _GraphNodeCard extends StatelessWidget {
  final dynamic item;
  final MeetingModel meeting;

  const _GraphNodeCard({required this.item, required this.meeting});

  @override
  Widget build(BuildContext context) {
    final postponements = item.postponementCount;
    final isHighRisk = postponements >= 2 || item.isOverdue;

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Meeting Origin Node
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary.withAlpha(25),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.groups_rounded, size: 14, color: AppColors.brandPrimary),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    meeting.title,
                    style: const TextStyle(
                      color: AppColors.textTertiary,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  DateFormatter.formatShortDate(meeting.meetingDate),
                  style: const TextStyle(color: AppColors.textTertiary, fontSize: 11),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Flow Connector Arrow
            Row(
              children: [
                const SizedBox(width: 12),
                Container(width: 2, height: 16, color: AppColors.brandPrimary.withAlpha(80)),
                const SizedBox(width: 8),
                Text(
                  'Extracted Task (Confidence: ${DateFormatter.formatConfidence(item.confidence)})',
                  style: const TextStyle(color: AppColors.brandAccent, fontSize: 10, fontFamily: 'monospace'),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Commitment Node
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isHighRisk ? AppColors.statusOverdueBg : AppColors.bgApp,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isHighRisk ? AppColors.statusOverdueBorder : AppColors.borderSubtle,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (postponements > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.statusOverdueBg,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            '${postponements}x Postponed',
                            style: const TextStyle(
                              color: AppColors.statusOverdue,
                              fontSize: 10,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.person_outline_rounded, size: 12, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            item.ownerName,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          const Icon(Icons.flag_rounded, size: 12, color: AppColors.brandPrimary),
                          const SizedBox(width: 4),
                          Text(
                            item.status.toUpperCase(),
                            style: TextStyle(
                              color: item.isOverdue ? AppColors.statusOverdue : AppColors.brandPrimary,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
