import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';

class IntegrationsScreen extends StatefulWidget {
  const IntegrationsScreen({super.key});

  @override
  State<IntegrationsScreen> createState() => _IntegrationsScreenState();
}

class _IntegrationsScreenState extends State<IntegrationsScreen> {
  final List<Map<String, dynamic>> _integrations = [
    {
      'id': 'gdrive',
      'name': 'Google Drive / Meet',
      'category': 'Meeting Ingestion',
      'icon': Icons.folder_shared_rounded,
      'color': const Color(0xFF4285F4),
      'status': 'Connected',
      'lastSync': '10 mins ago',
      'detail': 'Automatically ingests VTT/TXT meeting transcripts from Google Drive workspace folder.',
    },
    {
      'id': 'teams',
      'name': 'Microsoft Teams',
      'category': 'Meeting Ingestion',
      'icon': Icons.groups_rounded,
      'color': const Color(0xFF6264A7),
      'status': 'Not connected',
      'lastSync': 'Never',
      'detail': 'Connect MS Teams bot to parse meeting recordings and auto-extract action items.',
    },
    {
      'id': 'zoom',
      'name': 'Zoom Cloud Recording',
      'category': 'Meeting Ingestion',
      'icon': Icons.video_camera_front_rounded,
      'color': const Color(0xFF2D8CFF),
      'status': 'Needs authorization',
      'lastSync': '1 day ago',
      'detail': 'OAuth token expired. Re-authorize to sync Cloud Transcripts.',
    },
    {
      'id': 'jira',
      'name': 'Atlassian Jira',
      'category': 'Execution Sync',
      'icon': Icons.account_tree_rounded,
      'color': const Color(0xFF0052CC),
      'status': 'Connected',
      'lastSync': '5 mins ago',
      'detail': 'Detects execution drift between meeting commitments and Jira issue statuses.',
    },
  ];

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Connected':
        return AppColors.statusDone;
      case 'Syncing':
        return AppColors.brandAccent;
      case 'Needs authorization':
        return AppColors.statusPending;
      case 'Error':
        return AppColors.statusOverdue;
      case 'Not connected':
      default:
        return AppColors.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('External Integrations'),
        elevation: 0,
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GlassContainer(
                borderRadius: 20,
                padding: const EdgeInsets.all(16),
                child: const Row(
                  children: [
                    Icon(Icons.hub_rounded, color: AppColors.brandPrimary, size: 28),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Integrations Engine',
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Connect meeting platforms and execution tools to track accountability drift.',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Connected & Available Platforms',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              ..._integrations.map((item) {
                final statusColor = _getStatusColor(item['status']);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: GlassContainer(
                    borderRadius: 18,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: (item['color'] as Color).withAlpha(35),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                item['icon'] as IconData,
                                color: item['color'] as Color,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['name'],
                                    style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    item['category'],
                                    style: const TextStyle(
                                      color: AppColors.textTertiary,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: statusColor.withAlpha(30),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: statusColor.withAlpha(100)),
                              ),
                              child: Text(
                                item['status'],
                                style: TextStyle(
                                  color: statusColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item['detail'],
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.3),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Last sync: ${item['lastSync']}',
                              style: const TextStyle(color: AppColors.textTertiary, fontSize: 11),
                            ),
                            TextButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Integration settings for ${item['name']}'),
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                              },
                              child: Text(item['status'] == 'Connected' ? 'Configure' : 'Connect'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
