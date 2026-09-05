import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/action_item_model.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/badges/confidence_badge.dart';
import '../../widgets/badges/status_pill.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: AppColors.brandPrimary),
            tooltip: 'View Task History',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => TaskHistoryScreen(item: item),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title & Status Header Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
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
                    const SizedBox(height: 12),
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (item.description != null && item.description!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        item.description!,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Postponement High Risk Warning Box
            if (postponements >= 1) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.statusOverdueBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.statusOverdueBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: AppColors.statusOverdue, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Postponement Warning (${postponements}x)',
                            style: const TextStyle(
                              color: AppColors.statusOverdue,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
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

            // Assignment & Metadata Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _DetailRow(
                      icon: Icons.person_outline_rounded,
                      label: 'Owner',
                      value: item.ownerName,
                    ),
                    const Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _DetailRow(
                          icon: Icons.calendar_today_rounded,
                          label: 'Deadline',
                          value: DateFormatter.formatShortDate(item.deadline),
                          textColor: item.isOverdue ? AppColors.statusOverdue : AppColors.textPrimary,
                        ),
                        OutlinedButton.icon(
                          icon: const Icon(Icons.edit_calendar_rounded, size: 14),
                          label: const Text('Change'),
                          onPressed: () => _showDeadlinePicker(context, item, provider),
                        ),
                      ],
                    ),
                    const Divider(height: 20),
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => MeetingDetailScreen(meetingId: item.meetingId),
                          ),
                        );
                      },
                      child: Row(
                        children: [
                          const Icon(Icons.groups_rounded, size: 16, color: AppColors.brandPrimary),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Originating Meeting', style: TextStyle(color: AppColors.textTertiary, fontSize: 11)),
                                Text(
                                  'Tap to view originating meeting & transcript',
                                  style: TextStyle(color: AppColors.brandPrimary, fontSize: 13, fontWeight: FontWeight.w600),
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
            ),

            const SizedBox(height: 16),

            // AI Matching Explanation Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.psychology_rounded, size: 18, color: AppColors.brandAccent),
                        const SizedBox(width: 8),
                        const Text(
                          'AI Vector Matching Explanation',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    if (item.sourceText != null) ...[
                      const Text('Transcript Excerpt Evidence:', style: TextStyle(color: AppColors.textTertiary, fontSize: 12)),
                      const SizedBox(height: 4),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.bgApp,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.borderSubtle),
                        ),
                        child: Text(
                          '"${item.sourceText}"',
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                    if (item.matchReason != null && item.matchReason!.isNotEmpty) ...[
                      Text(
                        item.matchReason!,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
                      ),
                    ] else ...[
                      const Text(
                        'Extracted by LoopKeeper SLM engine with vector embedding continuity check.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Status Update Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: Icon(item.status == 'done' ? Icons.undo_rounded : Icons.check_circle_rounded),
                    label: Text(item.status == 'done' ? 'Reopen Task' : 'Mark as Done'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: item.status == 'done' ? AppColors.bgSurfaceHover : AppColors.statusDone,
                      foregroundColor: item.status == 'done' ? AppColors.textPrimary : Colors.black,
                    ),
                    onPressed: () async {
                      final newStatus = item.status == 'done' ? 'pending' : 'done';
                      await provider.updateItemStatus(item.id, newStatus);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Status updated to $newStatus')),
                        );
                      }
                    },
                  ),
                ),
                const SizedBox(width: 10),
                OutlinedButton.icon(
                  icon: const Icon(Icons.history_rounded),
                  label: const Text('History'),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => TaskHistoryScreen(item: item),
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
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
