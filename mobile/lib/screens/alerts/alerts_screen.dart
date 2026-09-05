import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/staggered_entrance.dart';
import '../../widgets/motion/page_transitions.dart';
import '../action_items/action_item_detail_screen.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final overdue = provider.overdueTasks;

    final List<Map<String, String?>> alerts = [
      if (overdue.isNotEmpty)
        {
          'type': 'critical',
          'title': '${overdue.length} Action Item Overdue',
          'message': '"${overdue.first.title}" passed deadline without completion.',
          'time': '10 mins ago',
          'itemId': overdue.first.id,
        },
      {
        'type': 'warning',
        'title': 'Repeated Task Postponement Flagged',
        'message': '"Payment API Integration" postponed 2x across 3 meetings.',
        'time': '1 hr ago',
        'itemId': 'item-101',
      },
      {
        'type': 'warning',
        'title': 'Team Member Workload Warning',
        'message': 'Priya Sharma has active commitments with a high-risk postponement warning.',
        'time': '3 hrs ago',
        'itemId': null,
      },
      {
        'type': 'info',
        'title': 'AI Pipeline Extraction Complete',
        'message': '2 commitments extracted from "Sprint Sync Meeting" with 98.4% accuracy.',
        'time': '5 hrs ago',
        'itemId': null,
      },
    ];

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('Notifications & Risk Alerts'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.done_all_rounded, size: 16, color: AppColors.brandAccent),
            label: const Text('Mark Read', style: TextStyle(color: AppColors.brandAccent)),
            onPressed: () {
              provider.markAlertsAsRead();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All alerts marked as read.')),
              );
            },
          ),
        ],
      ),
      body: AmbientBackground(
        child: ListView.builder(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0, bottom: 90.0),
          itemCount: alerts.length,
          itemBuilder: (context, index) {
            final alert = alerts[index];
            final type = alert['type'] ?? 'info';
            Color color;
            IconData icon;

            if (type == 'critical') {
              color = AppColors.statusOverdue;
              icon = Icons.error_outline_rounded;
            } else if (type == 'warning') {
              color = AppColors.statusPending;
              icon = Icons.warning_amber_rounded;
            } else {
              color = AppColors.brandAccent;
              icon = Icons.info_outline_rounded;
            }

            return FadeInEntrance(
              index: index,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: GlassContainer(
                  borderRadius: 16,
                  blur: 12,
                  borderColor: color.withAlpha(80),
                  backgroundColor: AppColors.bgSurface.withAlpha(200),
                  onTap: () {
                    final itemId = alert['itemId'];
                    if (itemId != null) {
                      Navigator.of(context).push(
                        FadeSlidePageRoute(
                          page: ActionItemDetailScreen(itemId: itemId),
                        ),
                      );
                    }
                  },
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: color.withAlpha(30),
                          shape: BoxShape.circle,
                          border: Border.all(color: color.withAlpha(80)),
                        ),
                        child: Icon(icon, color: color, size: 20),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    alert['title'] ?? '',
                                    style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Text(
                                  alert['time'] ?? '',
                                  style: const TextStyle(
                                    color: AppColors.textTertiary,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              alert['message'] ?? '',
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 13,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
