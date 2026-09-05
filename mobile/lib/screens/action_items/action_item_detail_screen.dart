import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/action_item_model.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/badges/confidence_badge.dart';
import '../../widgets/badges/status_pill.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/page_transitions.dart';
import '../meetings/meeting_detail_screen.dart';
import '../task_history/task_history_screen.dart';

class ActionItemDetailScreen extends StatelessWidget {
  final String itemId;

  const ActionItemDetailScreen({
    super.key,
    required this.itemId,
  });

  void _showDeadlinePicker(BuildContext context, ActionItemModel item, AppStateProvider provider) async {
    final initialDate = item.deadline ?? DateTime.now().add(const Duration(days: 2));
    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 180)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.brandPrimary,
              surface: AppColors.bgSurface,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      await provider.updateItemDeadline(item.id, picked);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Deadline updated to ${DateFormatter.formatShortDate(picked)}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final item = provider.actionItems.firstWhere(
      (i) => i.id == itemId,
      orElse: () => ActionItemModel(
        id: itemId,
        meetingId: 'meet-001',
        title: 'Action Item Details',
        status: 'pending',
        firstSeenAt: DateTime.now(),
        lastSeenAt: DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    );

    final postponements = item.postponementCount;
    final isHighRisk = item.isRepeatedlyPostponed || item.isOverdue;

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('Commitment & Accountability'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: AppColors.brandPrimary),
            tooltip: 'View Task History',
            onPressed: () {
              Navigator.of(context).push(
                FadeSlidePageRoute(
                  page: TaskHistoryScreen(item: item),
                ),
              );
            },
          ),
        ],
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0, bottom: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title & Status Header Card
              GlassContainer(
                borderRadius: 20,
                blur: 16,
                borderColor: isHighRisk
                    ? AppColors.statusOverdue.withAlpha(120)
                    : AppColors.brandPrimary.withAlpha(70),
                backgroundColor: AppColors.bgSurface.withAlpha(220),
                boxShadow: isHighRisk
                    ? [
                        BoxShadow(
                          color: AppColors.statusOverdue.withAlpha(25),
                          blurRadius: 15,
                          spreadRadius: 0,
                        )
                      ]
                    : null,
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        StatusPill(status: item.status),
                        ConfidenceBadge(confidence: item.confidence),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        height: 1.3,
                      ),
                    ),
                    if (item.description != null && item.description!.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Text(
                        item.description!,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Postponement Warning Banner
              if (postponements >= 1) ...[
                GlassContainer(
                  borderRadius: 14,
                  blur: 12,
                  borderColor: AppColors.statusOverdueBorder,
                  backgroundColor: AppColors.statusOverdueBg,
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.statusOverdue.withAlpha(40),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.warning_amber_rounded, color: AppColors.statusOverdue, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Repeated Postponement Alert (${postponements}x)',
                              style: const TextStyle(
                                color: AppColors.statusOverdue,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 3),
                            const Text(
                              'This commitment deadline has been modified across multiple meetings.',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Metadata Card
              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    _DetailRow(
                      icon: Icons.person_rounded,
                      label: 'Assigned Owner',
                      value: item.ownerName,
                    ),
                    const Divider(height: 24, color: Color(0x1FFFFFFF)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _DetailRow(
                          icon: Icons.calendar_today_rounded,
                          label: 'Target Deadline',
                          value: DateFormatter.formatShortDate(item.deadline),
                          textColor: item.isOverdue ? AppColors.statusOverdue : AppColors.textPrimary,
                        ),
                        GlassContainer(
                          borderRadius: 10,
                          padding: EdgeInsets.zero,
                          backgroundColor: AppColors.brandPrimary.withAlpha(30),
                          borderColor: AppColors.brandPrimary.withAlpha(80),
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              side: BorderSide.none,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            icon: const Icon(Icons.edit_calendar_rounded, size: 14, color: AppColors.brandAccent),
                            label: const Text('Change', style: TextStyle(color: AppColors.brandAccent, fontSize: 12)),
                            onPressed: () => _showDeadlinePicker(context, item, provider),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24, color: Color(0x1FFFFFFF)),
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          FadeSlidePageRoute(
                            page: MeetingDetailScreen(meetingId: item.meetingId),
                          ),
                        );
                      },
                        child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.brandPrimary.withAlpha(30),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.groups_rounded, size: 18, color: AppColors.brandPrimary),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Originating Meeting', style: TextStyle(color: AppColors.textTertiary, fontSize: 11)),
                                SizedBox(height: 2),
                                Text(
                                  'Tap to view meeting transcript & evidence',
                                  style: TextStyle(color: AppColors.brandAccent, fontSize: 13, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Cross-Meeting Accountability Flow Diagram
              const Text(
                'Cross-Meeting Accountability Timeline',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    if (item.history.isEmpty) ...[
                      const _TimelineNodeItem(
                        stageTitle: 'Meeting 1: Initial Commitment',
                        subtitle: 'Extracted commitment from transcript.',
                        badgeText: 'Created',
                        badgeColor: AppColors.statusDone,
                        isLast: false,
                      ),
                      const _TimelineNodeItem(
                        stageTitle: 'Meeting 2: Progress Check',
                        subtitle: 'Extracted status update.',
                        badgeText: 'Tracking',
                        badgeColor: AppColors.brandAccent,
                        isLast: false,
                      ),
                      const _TimelineNodeItem(
                        stageTitle: 'Meeting 3: Current State',
                        subtitle: 'Monitored by LoopKeeper state engine.',
                        badgeText: 'Active',
                        badgeColor: AppColors.brandPrimary,
                        isLast: true,
                      ),
                    ] else
                      ...item.history.asMap().entries.map((entry) {
                        final index = entry.key;
                        final historyItem = entry.value;
                        final isLast = index == item.history.length - 1;
                        final isPostponed = historyItem.eventType == 'postponed' || historyItem.eventType == 'deadline_updated';

                        return _TimelineNodeItem(
                          stageTitle: 'Meeting ${index + 1}: ${historyItem.eventType.replaceAll('_', ' ').toUpperCase()}',
                          subtitle: historyItem.evidenceText ?? 'Recorded status transition event',
                          badgeText: historyItem.newValue ?? 'Updated',
                          badgeColor: isPostponed ? AppColors.statusOverdue : AppColors.brandAccent,
                          isLast: isLast,
                        );
                      }),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // AI Vector Matching Explanation Card
              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.psychology_rounded, size: 18, color: AppColors.brandAccent),
                        SizedBox(width: 8),
                        Text(
                          'AI Vector Match & Evidence',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (item.sourceText != null) ...[
                      const Text('Transcript Excerpt Evidence:', style: TextStyle(color: AppColors.textTertiary, fontSize: 12)),
                      const SizedBox(height: 6),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.bgApp.withAlpha(200),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.borderSubtle),
                        ),
                        child: Text(
                          '"${item.sourceText}"',
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                            fontStyle: FontStyle.italic,
                            fontFamily: 'monospace',
                            height: 1.4,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (item.matchReason != null && item.matchReason!.isNotEmpty)
                      Text(
                        item.matchReason!,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4),
                      )
                    else
                      const Text(
                        'Extracted by LoopKeeper SLM engine with vector embedding continuity check.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: GlassContainer(
                      borderRadius: 14,
                      padding: EdgeInsets.zero,
                      backgroundColor: item.status == 'done'
                          ? AppColors.bgSurfaceHover
                          : AppColors.statusDone,
                      borderColor: item.status == 'done'
                          ? AppColors.borderSubtle
                          : AppColors.statusDone,
                      child: InkWell(
                        onTap: () async {
                          final newStatus = item.status == 'done' ? 'pending' : 'done';
                          await provider.updateItemStatus(item.id, newStatus);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Status updated to $newStatus')),
                            );
                          }
                        },
                        borderRadius: BorderRadius.circular(14),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                item.status == 'done' ? Icons.undo_rounded : Icons.check_circle_rounded,
                                color: item.status == 'done' ? AppColors.textPrimary : Colors.black,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                item.status == 'done' ? 'Reopen Task' : 'Mark as Done',
                                style: TextStyle(
                                  color: item.status == 'done' ? AppColors.textPrimary : Colors.black,
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TimelineNodeItem extends StatelessWidget {
  final String stageTitle;
  final String subtitle;
  final String badgeText;
  final Color badgeColor;
  final bool isLast;

  const _TimelineNodeItem({
    required this.stageTitle,
    required this.subtitle,
    required this.badgeText,
    required this.badgeColor,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: badgeColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: badgeColor.withAlpha(100),
                      blurRadius: 6,
                      spreadRadius: 1,
                    ),
                  ],
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppColors.borderDefault,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          stageTitle,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: badgeColor.withAlpha(30),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: badgeColor.withAlpha(90)),
                        ),
                        child: Text(
                          badgeText,
                          style: TextStyle(
                            color: badgeColor,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color textColor;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.textColor = AppColors.textPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textTertiary),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.textTertiary, fontSize: 11)),
            Text(
              value,
              style: TextStyle(
                color: textColor,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
