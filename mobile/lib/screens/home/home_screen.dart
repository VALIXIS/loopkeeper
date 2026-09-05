import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/metric_card.dart';
import '../../widgets/cards/task_card.dart';
import '../../widgets/cards/meeting_card.dart';
import '../../widgets/feedback/loading_shimmer.dart';
import '../../widgets/feedback/error_banner.dart';
import '../action_items/action_item_detail_screen.dart';
import '../meetings/meeting_detail_screen.dart';
import '../ai_status/ai_status_screen.dart';
import '../insights/insights_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final dashboard = provider.dashboard;
    final myOpen = provider.myOpenTasks;
    final overdue = provider.overdueTasks;
    final completed = provider.completedTasks;
    final meetings = provider.meetings;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${provider.currentUser.name}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              '${provider.currentUser.role} • ${provider.currentUser.department}',
              style: const TextStyle(fontSize: 11, color: AppColors.textTertiary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome_rounded, color: AppColors.brandAccent),
            tooltip: 'AI Engine Telemetry',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AiStatusScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.timeline_rounded, color: AppColors.brandPrimary),
            tooltip: 'Accountability Graph',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const InsightsScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.refreshAll(),
        color: AppColors.brandPrimary,
        backgroundColor: AppColors.bgSurface,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (provider.errorMessage != null)
                ErrorBanner(
                  message: provider.errorMessage!,
                  onRetry: () => provider.refreshAll(),
                ),

              // AI Status Quick Badge
              GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AiStatusScreen()),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.brandPrimary.withAlpha(60)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.psychology_rounded, size: 18, color: AppColors.brandAccent),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'SLM Pipeline Active • 98.4% Match Accuracy',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.textTertiary),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Metric Overview Grid
              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                shrinkWrap: true,
                childAspectRatio: 1.45,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  MetricCard(
                    title: 'My Open Tasks',
                    value: '${myOpen.length}',
                    subtitle: 'Requires action',
                    icon: Icons.assignment_late_outlined,
                    accentColor: AppColors.brandPrimary,
                  ),
                  MetricCard(
                    title: 'Overdue Tasks',
                    value: '${overdue.length}',
                    subtitle: overdue.isNotEmpty ? 'Immediate attention' : 'All clear',
                    icon: Icons.error_outline_rounded,
                    accentColor: overdue.isNotEmpty ? AppColors.statusOverdue : AppColors.statusDone,
                  ),
                  MetricCard(
                    title: 'Upcoming Deadlines',
                    value: '${dashboard?.upcomingDeadlines.length ?? 0}',
                    subtitle: 'Next 7 days',
                    icon: Icons.event_rounded,
                    accentColor: AppColors.statusPending,
                  ),
                  MetricCard(
                    title: 'Completed Tasks',
                    value: '${completed.length}',
                    subtitle: 'Archived',
                    icon: Icons.check_circle_outline_rounded,
                    accentColor: AppColors.statusDone,
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Overdue & High Risk Section
              if (overdue.isNotEmpty) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.statusOverdue),
                        SizedBox(width: 6),
                        Text(
                          'Overdue Tasks',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      '${overdue.length} items',
                      style: const TextStyle(color: AppColors.statusOverdue, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                ...overdue.map(
                  (item) => TaskCard(
                    item: item,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ActionItemDetailScreen(itemId: item.id),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // My Open Commitments Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'My Open Commitments',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (provider.isLoading)
                const LoadingShimmer(count: 2)
              else if (myOpen.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: const Center(
                    child: Text(
                      'No pending open commitments assigned to you.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ),
                )
              else
                ...myOpen.take(3).map(
                  (item) => TaskCard(
                    item: item,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ActionItemDetailScreen(itemId: item.id),
                        ),
                      );
                    },
                  ),
                ),

              const SizedBox(height: 24),

              // Recent Meetings Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Recent Meetings',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (meetings.isEmpty)
                const Text('No recent meetings recorded.')
              else
                ...meetings.take(3).map(
                  (m) => MeetingCard(
                    meeting: m,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => MeetingDetailScreen(meetingId: m.id),
                        ),
                      );
                    },
                  ),
                ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
