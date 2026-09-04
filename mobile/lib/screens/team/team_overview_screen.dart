import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/team_member_card.dart';
import '../../widgets/feedback/empty_state.dart';
import '../../widgets/feedback/loading_shimmer.dart';
import '../action_items/my_action_items_screen.dart';

class TeamOverviewScreen extends StatelessWidget {
  const TeamOverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final dashboard = provider.dashboard;
    final overloadedMembers = dashboard?.overloadedMembers ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Team Workload & Capacity'),
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
              // Burnout & Risk Warning Banner
              if (overloadedMembers.isNotEmpty) ...[
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
                              '${overloadedMembers.length} Overloaded Team Members',
                              style: const TextStyle(
                                color: AppColors.statusOverdue,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'LoopKeeper has flagged members with high active commitments or overdue tasks.',
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
                const SizedBox(height: 20),
              ],

              const Text(
                'Team Member Task Distribution',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              provider.isLoading
                  ? const LoadingShimmer(count: 3)
                  : overloadedMembers.isEmpty
                      ? const EmptyStateWidget(
                          icon: Icons.people_outline_rounded,
                          title: 'All Clear',
                          message: 'No team members are currently overloaded or at risk.',
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: overloadedMembers.length,
                          itemBuilder: (context, index) {
                            final member = overloadedMembers[index];
                            return TeamMemberCard(
                              member: member,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const MyActionItemsScreen(),
                                  ),
                                );
                              },
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
