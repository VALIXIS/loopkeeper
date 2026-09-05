import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/meeting_card.dart';
import '../../widgets/feedback/empty_state.dart';
import '../../widgets/feedback/loading_shimmer.dart';
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
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
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
                  hintText: 'Paste meeting transcript here (e.g. Hasitha: I will fix widget tests by tomorrow)...',
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.auto_awesome_rounded),
                  label: const Text('Save & Run AI Pipeline'),
                  onPressed: () async {
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
                        MaterialPageRoute(
                          builder: (_) => MeetingDetailScreen(meetingId: meeting.id),
                        ),
                      );
                    }
                  },
                ),
              ),
              const SizedBox(height: 20),
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
      appBar: AppBar(
        title: const Text('Meetings'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.brandPrimary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Meeting'),
        onPressed: () => _showCreateMeetingModal(context),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textTertiary),
                hintText: 'Search meetings or transcripts...',
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
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          itemCount: meetings.length,
                          itemBuilder: (context, index) {
                            final meeting = meetings[index];
                            return MeetingCard(
                              meeting: meeting,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => MeetingDetailScreen(meetingId: meeting.id),
                                  ),
                                );
                              },
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
