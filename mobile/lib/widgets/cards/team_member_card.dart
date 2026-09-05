import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../models/dashboard_model.dart';
import '../motion/glass_container.dart';

class TeamMemberCard extends StatelessWidget {
  final OverloadedMemberModel member;
  final VoidCallback? onTap;

  const TeamMemberCard({
    super.key,
    required this.member,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isOverloaded = member.openTaskCount >= 4 || member.overdueTaskCount > 0;
    final total = member.openTaskCount;
    final overdue = member.overdueTaskCount;
    final loadPercentage = (total / 5.0).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: GlassContainer(
        borderRadius: 16,
        blur: 12,
        onTap: onTap,
        borderColor: isOverloaded ? AppColors.statusOverdue.withAlpha(120) : AppColors.borderSubtle,
        backgroundColor: AppColors.bgSurface.withAlpha(200),
        boxShadow: isOverloaded
            ? [
                BoxShadow(
                  color: AppColors.statusOverdue.withAlpha(20),
                  blurRadius: 12,
                  spreadRadius: 0,
                )
              ]
            : null,
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isOverloaded
                          ? [AppColors.statusOverdue, AppColors.warningRoseGlow]
                          : [AppColors.brandPrimary, AppColors.brandAccent],
                    ),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    member.employeeName.isNotEmpty ? member.employeeName[0].toUpperCase() : 'U',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        member.employeeName,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$total active tasks • $overdue overdue',
                        style: const TextStyle(
                          color: AppColors.textTertiary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isOverloaded)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.statusOverdueBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.statusOverdueBorder),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, size: 12, color: AppColors.statusOverdue),
                        SizedBox(width: 4),
                        Text(
                          'Overloaded',
                          style: TextStyle(
                            color: AppColors.statusOverdue,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Workload Capacity',
                  style: TextStyle(color: AppColors.textTertiary, fontSize: 11),
                ),
                Text(
                  '${(loadPercentage * 100).toInt()}%',
                  style: TextStyle(
                    color: isOverloaded ? AppColors.statusOverdue : AppColors.brandAccent,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: loadPercentage,
                backgroundColor: AppColors.bgSurfaceHover,
                valueColor: AlwaysStoppedAnimation<Color>(
                  isOverloaded ? AppColors.statusOverdue : AppColors.brandPrimary,
                ),
                minHeight: 8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
