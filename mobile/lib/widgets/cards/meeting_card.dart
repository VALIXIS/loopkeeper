import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/meeting_model.dart';
import '../motion/glass_container.dart';

class MeetingCard extends StatelessWidget {
  final MeetingModel meeting;
  final VoidCallback onTap;

  const MeetingCard({
    super.key,
    required this.meeting,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final commitmentCount = meeting.actionItems.length;
    final isProcessing = meeting.status == 'processing';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: GlassContainer(
        borderRadius: 16,
        blur: 12,
        onTap: onTap,
        borderColor: isProcessing ? AppColors.brandAccent.withAlpha(120) : AppColors.borderSubtle,
        backgroundColor: AppColors.bgSurface.withAlpha(200),
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.brandPrimary.withAlpha(50),
                    AppColors.brandAccent.withAlpha(30),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.brandPrimary.withAlpha(80)),
              ),
              child: const Icon(
                Icons.video_camera_front_rounded,
                color: AppColors.brandAccent,
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          meeting.title,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (isProcessing) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.brandAccent.withAlpha(30),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.brandAccent.withAlpha(100)),
                          ),
                          child: const Row(
                            children: [
                              SizedBox(
                                width: 8,
                                height: 8,
                                child: CircularProgressIndicator(
                                  strokeWidth: 1.5,
                                  color: AppColors.brandAccent,
                                ),
                              ),
                              SizedBox(width: 4),
                              Text(
                                'AI Extraction',
                                style: TextStyle(
                                  color: AppColors.brandAccent,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.schedule_rounded, size: 12, color: AppColors.textTertiary),
                      const SizedBox(width: 4),
                      Text(
                        DateFormatter.formatDateTime(meeting.meetingDate),
                        style: const TextStyle(
                          color: AppColors.textTertiary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.bgSurfaceHover.withAlpha(200),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0x1FFFFFFF)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.task_alt_rounded, size: 13, color: AppColors.statusDone),
                  const SizedBox(width: 5),
                  Text(
                    '$commitmentCount',
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'monospace',
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
