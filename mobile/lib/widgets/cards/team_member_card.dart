import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../models/dashboard_model.dart';

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

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.brandPrimary.withAlpha(40),
                    child: Text(
                      member.employeeName.isNotEmpty ? member.employeeName[0] : 'U',
                      style: const TextStyle(
                        color: AppColors.brandPrimary,
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
                            fontWeight: FontWeight.w600,
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
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.statusOverdueBg,
                        borderRadius: BorderRadius.circular(6),
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
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: loadPercentage,
                  backgroundColor: AppColors.bgSurfaceHover,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    isOverloaded ? AppColors.statusOverdue : AppColors.brandPrimary,
                  ),
                  minHeight: 6,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
