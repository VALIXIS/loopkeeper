import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/meeting_model.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/task_card.dart';
import '../../widgets/feedback/empty_state.dart';
import '../../widgets/feedback/loading_shimmer.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/staggered_entrance.dart';
import '../../widgets/motion/page_transitions.dart';
import '../action_items/action_item_detail_screen.dart';

class MeetingDetailScreen extends StatefulWidget {
  final String meetingId;

  const MeetingDetailScreen({
    super.key,
    required this.meetingId,
  });

  @override
  State<MeetingDetailScreen> createState() => _MeetingDetailScreenState();
}

class _MeetingDetailScreenState extends State<MeetingDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final meeting = provider.meetings.firstWhere(
      (m) => m.id == widget.meetingId,
      orElse: () => MeetingModel(
        id: widget.meetingId,
        title: 'Meeting Details',
        meetingDate: DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    );

    final commitments = meeting.actionItems;
    final transcript = meeting.transcript;

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: Text(meeting.title),
        elevation: 0,
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome_rounded, color: AppColors.brandAccent),
            tooltip: 'Run AI Processing',
            onPressed: () async {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Triggering AI extraction pipeline...')),
              );
              await provider.processMeeting(meeting.id);
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.brandPrimary,
          indicatorWeight: 3,
          labelColor: AppColors.brandAccent,
          unselectedLabelColor: AppColors.textTertiary,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.task_alt_rounded, size: 16),
                  const SizedBox(width: 6),
                  Text('Commitments (${commitments.length})'),
                ],
              ),
            ),
            const Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notes_rounded, size: 16),
                  SizedBox(width: 6),
                  Text('Transcript'),
                ],
              ),
            ),
          ],
        ),
      ),
      body: AmbientBackground(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: GlassContainer(
                borderRadius: 12,
                blur: 10,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.event_outlined, size: 14, color: AppColors.textTertiary),
                        const SizedBox(width: 6),
                        Text(
                          DateFormatter.formatDateTime(meeting.meetingDate),
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.brandAccent.withAlpha(20),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.brandAccent.withAlpha(80)),
                      ),
                      child: Text(
                        'SOURCE: ${meeting.source.toUpperCase()}',
                        style: const TextStyle(
                          color: AppColors.brandAccent,
                          fontSize: 10,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: AI Commitments
                  provider.isLoading
                      ? const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: LoadingShimmer(count: 3),
                        )
                      : commitments.isEmpty
                          ? EmptyStateWidget(
                              icon: Icons.psychology_alt_outlined,
                              title: 'No Commitments Extracted Yet',
                              message: 'Tap the AI icon in the top right to process the transcript and extract commitments.',
                              buttonText: 'Process Transcript',
                              onAction: () async {
                                await provider.processMeeting(meeting.id);
                              },
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 8.0, bottom: 40.0),
                              itemCount: commitments.length,
                              itemBuilder: (context, index) {
                                final item = commitments[index];
                                return FadeInEntrance(
                                  index: index,
                                  child: TaskCard(
                                    item: item,
                                    onTap: () {
                                      Navigator.of(context).push(
                                        FadeSlidePageRoute(
                                          page: ActionItemDetailScreen(itemId: item.id),
                                        ),
                                      );
                                    },
                                  ),
                                );
                              },
                            ),

                  // Tab 2: Transcript View
                  transcript == null || transcript.content.isEmpty
                      ? EmptyStateWidget(
                          icon: Icons.description_outlined,
                          title: 'No Transcript Attached',
                          message: 'Attach a meeting transcript (VTT or plain text) to extract tasks.',
                        )
                      : SingleChildScrollView(
                          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 8.0, bottom: 40.0),
                          child: GlassContainer(
                            borderRadius: 16,
                            blur: 14,
                            padding: const EdgeInsets.all(18),
                            child: SelectableText(
                              transcript.content,
                              style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontSize: 13,
                                height: 1.6,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
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
