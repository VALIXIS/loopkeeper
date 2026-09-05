import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/action_item_model.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/staggered_entrance.dart';

class TaskHistoryScreen extends StatelessWidget {
  final ActionItemModel item;

  const TaskHistoryScreen({
    super.key,
    required this.item,
  });

  @override
  Widget build(BuildContext context) {
    final history = item.history;

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('Task State & Audit History'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0, bottom: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Task Summary Banner
              GlassContainer(
                borderRadius: 16,
                blur: 16,
                borderColor: AppColors.brandPrimary.withAlpha(70),
                backgroundColor: AppColors.bgSurface.withAlpha(220),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Assigned to ${item.ownerName} • Created ${DateFormatter.formatShortDate(item.createdAt)}',
                      style: const TextStyle(
                        color: AppColors.textTertiary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              const Text(
                'Chronological Event Audit Trail',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 14),

              if (history.isEmpty)
                GlassContainer(
                  borderRadius: 14,
                  padding: const EdgeInsets.all(20),
                  child: const Center(
                    child: Text(
                      'Initial creation event recorded. No deadline postponements detected.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: history.length,
                  itemBuilder: (context, index) {
                    final event = history[index];
                    final isLast = index == history.length - 1;
                    return FadeInEntrance(
                      index: index,
                      child: _TimelineStep(
                        event: event,
                        isLast: isLast,
                      ),
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

class _TimelineStep extends StatelessWidget {
  final ActionItemHistory event;
  final bool isLast;

  const _TimelineStep({
    required this.event,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    IconData icon;
    Color iconColor;
    String title;

    switch (event.eventType) {
      case 'created':
        icon = Icons.add_circle_outline_rounded;
        iconColor = AppColors.statusDone;
        title = 'Commitment Extracted';
        break;
      case 'postponed':
      case 'deadline_updated':
        icon = Icons.warning_amber_rounded;
        iconColor = AppColors.statusOverdue;
        title = 'Deadline Postponed';
        break;
      case 'status_changed':
        icon = Icons.sync_alt_rounded;
        iconColor = AppColors.brandAccent;
        title = 'Status Modified';
        break;
      default:
        icon = Icons.edit_note_rounded;
        iconColor = AppColors.textSecondary;
        title = 'Task Updated';
        break;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withAlpha(30),
                  shape: BoxShape.circle,
                  border: Border.all(color: iconColor.withAlpha(90)),
                ),
                child: Icon(icon, size: 16, color: iconColor),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppColors.borderSubtle,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20.0),
              child: GlassContainer(
                borderRadius: 14,
                blur: 12,
                borderColor: iconColor.withAlpha(50),
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          DateFormatter.formatDateTime(event.createdAt),
                          style: const TextStyle(
                            color: AppColors.textTertiary,
                            fontSize: 11,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                    if (event.previousValue != null || event.newValue != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          if (event.previousValue != null)
                            Text(
                              '${event.previousValue}',
                              style: const TextStyle(
                                color: AppColors.textTertiary,
                                fontSize: 12,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          if (event.previousValue != null && event.newValue != null)
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6.0),
                              child: Icon(Icons.arrow_forward_rounded, size: 12, color: AppColors.textTertiary),
                            ),
                          if (event.newValue != null)
                            Text(
                              '${event.newValue}',
                              style: TextStyle(
                                color: iconColor,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                        ],
                      ),
                    ],
                    if (event.evidenceText != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.bgApp.withAlpha(200),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.borderSubtle),
                        ),
                        child: Text(
                          'Evidence: "${event.evidenceText}"',
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
