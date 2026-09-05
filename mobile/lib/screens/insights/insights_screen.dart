import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/meeting_model.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/staggered_entrance.dart';

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
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('Accountability Insights & DAG'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0, bottom: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Graph Concept Description Header
              GlassContainer(
                borderRadius: 16,
                blur: 16,
                borderColor: AppColors.brandPrimary.withAlpha(80),
                backgroundColor: AppColors.bgSurface.withAlpha(220),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.timeline_rounded, color: AppColors.brandAccent, size: 24),
                        SizedBox(width: 10),
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
                    const SizedBox(height: 8),
                    const Text(
                      'Meeting  ➔  Commitment  ➔  Owner  ➔  Deadline  ➔  Outcome',
                      style: TextStyle(
                        color: AppColors.brandAccent,
                        fontSize: 12,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Tracks how tasks mutate in wording, get matched via vector similarity, and transition across meetings over time.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Confidence Filter Slider
              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.all(16.0),
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

              const SizedBox(height: 20),

              const Text(
                'Vertical Commitment Flow Network',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              if (filteredItems.isEmpty)
                GlassContainer(
                  padding: const EdgeInsets.all(20),
                  child: const Center(
                    child: Text(
                      'No graph nodes match the selected confidence threshold.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ),
                )
              else
                ...filteredItems.asMap().entries.map(
                  (entry) {
                    final index = entry.key;
                    final item = entry.value;
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

                    return FadeInEntrance(
                      index: index,
                      child: _GraphNodeCard(item: item, meeting: originMeeting),
                    );
                  },
                ),
            ],
          ),
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

    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
      child: GlassContainer(
        borderRadius: 16,
        blur: 12,
        borderColor: isHighRisk ? AppColors.statusOverdue.withAlpha(100) : AppColors.borderSubtle,
        backgroundColor: AppColors.bgSurface.withAlpha(200),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Meeting Origin Node
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary.withAlpha(30),
                    borderRadius: BorderRadius.circular(8),
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
                Container(width: 2, height: 16, color: AppColors.brandPrimary.withAlpha(120)),
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
                color: isHighRisk ? AppColors.statusOverdueBg : AppColors.bgApp.withAlpha(200),
                borderRadius: BorderRadius.circular(10),
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
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.statusOverdueBg,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.statusOverdueBorder),
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
                          const Icon(Icons.person_rounded, size: 12, color: AppColors.textSecondary),
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
