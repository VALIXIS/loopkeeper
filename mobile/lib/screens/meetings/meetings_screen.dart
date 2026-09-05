import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/meeting_card.dart';
import '../../widgets/feedback/empty_state.dart';
import '../../widgets/feedback/loading_shimmer.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/staggered_entrance.dart';
import '../../widgets/motion/page_transitions.dart';
import 'meeting_detail_screen.dart';

class MeetingsScreen extends StatefulWidget {
  const MeetingsScreen({super.key});

  @override
  State<MeetingsScreen> createState() => _MeetingsScreenState();
}

class _MeetingsScreenState extends State<MeetingsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showCreateMeetingModal(BuildContext context) {
    final titleController = TextEditingController();
    final transcriptController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return GlassContainer(
          borderRadius: 24,
          blur: 20,
          backgroundColor: AppColors.bgSurface.withAlpha(240),
          borderColor: AppColors.brandPrimary.withAlpha(90),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Record New Meeting',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.textTertiary),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text('Meeting Title', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  hintText: 'e.g., Mobile Team Architecture Sync',
                ),
              ),
              const SizedBox(height: 14),
              const Text('Meeting Transcript (Optional)', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: transcriptController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Paste transcript text here (e.g. Priya: I will complete Payment API by Friday)...',
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: GlassContainer(
                  borderRadius: 14,
                  padding: EdgeInsets.zero,
                  backgroundColor: AppColors.brandPrimary,
                  borderColor: AppColors.brandAccent.withAlpha(100),
                  child: InkWell(
                    onTap: () async {
                      if (titleController.text.trim().isEmpty) return;
                      final provider = Provider.of<AppStateProvider>(context, listen: false);
                      final meeting = await provider.createMeeting(
                        titleController.text.trim(),
                        DateTime.now(),
                        transcriptText: transcriptController.text.trim(),
                      );
                      if (ctx.mounted) Navigator.of(ctx).pop();
                      if (meeting != null && context.mounted) {
                        Navigator.of(context).push(
                          FadeSlidePageRoute(
                            page: MeetingDetailScreen(meetingId: meeting.id),
                          ),
                        );
                      }
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 14),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Save & Run AI Extraction',
                            style: TextStyle(
                              color: Colors.white,
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
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    var meetings = provider.meetings;

    if (_searchQuery.isNotEmpty) {
      meetings = meetings.where((m) =>
        m.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
        (m.transcript?.content.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false)
      ).toList();
    }

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('Meetings Workspace'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 80.0),
        child: FloatingActionButton.extended(
          backgroundColor: AppColors.brandPrimary,
          foregroundColor: Colors.white,
          elevation: 6,
          icon: const Icon(Icons.add_rounded),
          label: const Text('Add Meeting', style: TextStyle(fontWeight: FontWeight.bold)),
          onPressed: () => _showCreateMeetingModal(context),
        ),
      ),
      body: AmbientBackground(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: GlassContainer(
                borderRadius: 14,
                padding: EdgeInsets.zero,
                backgroundColor: AppColors.bgSurface.withAlpha(200),
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textTertiary),
                    hintText: 'Search meetings or transcripts...',
                    border: InputBorder.none,
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, color: AppColors.textTertiary),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                  ),
                ),
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => provider.refreshAll(),
                color: AppColors.brandPrimary,
                backgroundColor: AppColors.bgSurface,
                child: provider.isLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.0),
                        child: LoadingShimmer(count: 4, height: 80),
                      )
                    : meetings.isEmpty
                        ? EmptyStateWidget(
                            icon: Icons.groups_outlined,
                            title: 'No Meetings Found',
                            message: 'Record a meeting or attach a transcript to trigger AI commitment extraction.',
                            buttonText: 'Add First Meeting',
                            onAction: () => _showCreateMeetingModal(context),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 100.0),
                            itemCount: meetings.length,
                            itemBuilder: (context, index) {
                              final meeting = meetings[index];
                              return FadeInEntrance(
                                index: index,
                                child: MeetingCard(
                                  meeting: meeting,
                                  onTap: () {
                                    Navigator.of(context).push(
                                      FadeSlidePageRoute(
                                        page: MeetingDetailScreen(meetingId: meeting.id),
                                      ),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
