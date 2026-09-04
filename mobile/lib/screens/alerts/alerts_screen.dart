import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
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
        'message': '"Fix authentication screen login bug" postponed 2x across 3 meetings.',
        'time': '1 hr ago',
        'itemId': 'item-101',
      },
      {
        'type': 'warning',
        'title': 'Team Member Workload Warning',
        'message': 'Vignesh Kumar has 4 active commitments and 1 overdue task.',
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
      appBar: AppBar(
        title: const Text('Notifications & Risk Alerts'),
        actions: [
          TextButton(
            onPressed: () {
              provider.markAlertsAsRead();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All alerts marked as read.')),
              );
            },
            child: const Text('Mark All Read'),
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
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

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () {
                final itemId = alert['itemId'];
                if (itemId != null) {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ActionItemDetailScreen(itemId: itemId),
                    ),
                  );
                }
              },
              borderRadius: BorderRadius.circular(10),
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: color.withAlpha(25),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(icon, color: color, size: 20),
                    ),
                    const SizedBox(width: 12),
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
                          const SizedBox(height: 4),
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
    );
  }
}
