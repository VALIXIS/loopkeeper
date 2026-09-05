import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/meeting_model.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/task_card.dart';
import '../../widgets/feedback/empty_state.dart';
import '../../widgets/feedback/loading_shimmer.dart';
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
      appBar: AppBar(
        title: Text(meeting.title),
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
          labelColor: AppColors.brandPrimary,
          unselectedLabelColor: AppColors.textTertiary,
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
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.bgSurface,
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
                    color: AppColors.bgSurfaceHover,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Text(
                    'Source: ${meeting.source.toUpperCase()}',
                    style: const TextStyle(
                      color: AppColors.brandAccent,
                      fontSize: 10,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
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
                            padding: const EdgeInsets.all(16.0),
                            itemCount: commitments.length,
                            itemBuilder: (context, index) {
                              final item = commitments[index];
                              return TaskCard(
                                item: item,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => ActionItemDetailScreen(itemId: item.id),
                                    ),
                                  );
                                },
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
                        padding: const EdgeInsets.all(16.0),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.bgSurface,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.borderSubtle),
                          ),
                          child: SelectableText(
                            transcript.content,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 14,
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
    );
  }
}
