import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/metric_card.dart';
import '../../widgets/cards/task_card.dart';
import '../../widgets/cards/meeting_card.dart';
import '../../widgets/feedback/loading_shimmer.dart';
import '../../widgets/feedback/error_banner.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/custom_progress_ring.dart';
import '../../widgets/motion/staggered_entrance.dart';
import '../../widgets/motion/animated_counter.dart';
import '../../widgets/motion/page_transitions.dart';
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

    final totalTasks = myOpen.length + completed.length + overdue.length;
    final healthScore = totalTasks > 0
        ? ((completed.length / totalTasks) * 100.0).clamp(0.0, 100.0)
        : 88.5;

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      body: AmbientBackground(
        child: RefreshIndicator(
          onRefresh: () => provider.refreshAll(),
          color: AppColors.brandPrimary,
          backgroundColor: AppColors.bgSurface,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 12.0, bottom: 90.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top App Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.brandPrimary, AppColors.brandAccent],
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.brandPrimary.withAlpha(80),
                                blurRadius: 10,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            provider.currentUser.name.isNotEmpty
                                ? provider.currentUser.name[0].toUpperCase()
                                : 'H',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              provider.currentUser.name,
                              style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: AppColors.statusDone,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${provider.currentUser.role} • ${provider.currentUser.department}',
                                  style: const TextStyle(
                                    color: AppColors.textTertiary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        _HeaderIconButton(
                          icon: Icons.auto_awesome_rounded,
                          color: AppColors.brandAccent,
                          tooltip: 'AI Engine Telemetry',
                          onPressed: () {
                            Navigator.of(context).push(
                              FadeSlidePageRoute(page: const AiStatusScreen()),
                            );
                          },
                        ),
                        const SizedBox(width: 8),
                        _HeaderIconButton(
                          icon: Icons.insights_rounded,
                          color: AppColors.brandPrimary,
                          tooltip: 'Accountability Insights',
                          onPressed: () {
                            Navigator.of(context).push(
                              FadeSlidePageRoute(page: const InsightsScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                if (provider.errorMessage != null)
                  ErrorBanner(
                    message: provider.errorMessage!,
                    onRetry: () => provider.refreshAll(),
                  ),

                // Hero Accountability Gauge Card
                GlassContainer(
                  borderRadius: 20,
                  blur: 16,
                  borderColor: AppColors.brandPrimary.withAlpha(70),
                  backgroundColor: AppColors.bgSurface.withAlpha(220),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.brandPrimary.withAlpha(20),
                      blurRadius: 20,
                      spreadRadius: -2,
                    ),
                  ],
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          CustomProgressRing(
                            percentage: healthScore,
                            size: 100,
                            strokeWidth: 9,
                            primaryColor: AppColors.brandPrimary,
                            secondaryColor: AppColors.brandAccent,
                            centerChild: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                AnimatedCounter(
                                  value: healthScore,
                                  suffix: '%',
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const Text(
                                  'Health',
                                  style: TextStyle(
                                    color: AppColors.textTertiary,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Accountability Index',
                                  style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Real-time meeting commitment tracking engine',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    _MiniStatPill(
                                      label: 'Open',
                                      value: '${myOpen.length}',
                                      color: AppColors.statusPending,
                                    ),
                                    const SizedBox(width: 8),
                                    _MiniStatPill(
                                      label: 'Overdue',
                                      value: '${overdue.length}',
                                      color: overdue.isNotEmpty ? AppColors.statusOverdue : AppColors.statusDone,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      GestureDetector(
                        onTap: () {
                          Navigator.of(context).push(
                            FadeSlidePageRoute(page: const AiStatusScreen()),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.brandPrimary.withAlpha(25),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.brandPrimary.withAlpha(70)),
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.psychology_rounded, size: 16, color: AppColors.brandAccent),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'SLM Pipeline Active • 98.4% Match Accuracy',
                                  style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.textTertiary),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Metrics Grid
                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
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
                      icon: Icons.warning_amber_rounded,
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
                      subtitle: 'Verified done',
                      icon: Icons.check_circle_outline_rounded,
                      accentColor: AppColors.statusDone,
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // Overdue High Risk Section
                if (overdue.isNotEmpty) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.statusOverdue),
                          SizedBox(width: 6),
                          Text(
                            'High Risk & Overdue',
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.statusOverdueBg,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.statusOverdueBorder),
                        ),
                        child: Text(
                          '${overdue.length} Action Needed',
                          style: const TextStyle(
                            color: AppColors.statusOverdue,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...overdue.asMap().entries.map(
                    (entry) => FadeInEntrance(
                      index: entry.key,
                      child: TaskCard(
                        item: entry.value,
                        onTap: () {
                          Navigator.of(context).push(
                            FadeSlidePageRoute(
                              page: ActionItemDetailScreen(itemId: entry.value.id),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // My Open Commitments Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text(
                      'Priority Action Items',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (provider.isLoading)
                  const LoadingShimmer(count: 2)
                else if (myOpen.isEmpty)
                  GlassContainer(
                    padding: const EdgeInsets.all(20),
                    child: const Center(
                      child: Text(
                        'No pending open commitments assigned to you.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                    ),
                  )
                else
                  ...myOpen.take(3).toList().asMap().entries.map(
                    (entry) => FadeInEntrance(
                      index: entry.key,
                      child: TaskCard(
                        item: entry.value,
                        onTap: () {
                          Navigator.of(context).push(
                            FadeSlidePageRoute(
                              page: ActionItemDetailScreen(itemId: entry.value.id),
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                const SizedBox(height: 28),

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
                const SizedBox(height: 12),
                if (meetings.isEmpty)
                  const Text('No recent meetings recorded.')
                else
                  ...meetings.take(3).toList().asMap().entries.map(
                    (entry) => FadeInEntrance(
                      index: entry.key,
                      child: MeetingCard(
                        meeting: entry.value,
                        onTap: () {
                          Navigator.of(context).push(
                            FadeSlidePageRoute(
                              page: MeetingDetailScreen(meetingId: entry.value.id),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback onPressed;

  const _HeaderIconButton({
    required this.icon,
    required this.color,
    required this.tooltip,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      borderRadius: 12,
      blur: 8,
      padding: EdgeInsets.zero,
      backgroundColor: AppColors.bgSurface.withAlpha(200),
      borderColor: color.withAlpha(60),
      child: IconButton(
        icon: Icon(icon, size: 20, color: color),
        tooltip: tooltip,
        onPressed: onPressed,
      ),
    );
  }
}

class _MiniStatPill extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MiniStatPill({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(70)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$label: ',
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }
}
