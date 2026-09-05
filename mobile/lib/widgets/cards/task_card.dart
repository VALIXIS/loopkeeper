import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/action_item_model.dart';
import '../badges/status_pill.dart';
import '../badges/confidence_badge.dart';
import '../badges/postponement_badge.dart';
import '../motion/glass_container.dart';

class TaskCard extends StatelessWidget {
  final ActionItemModel item;
  final VoidCallback onTap;
  final Function(String newStatus)? onStatusChanged;

  const TaskCard({
    super.key,
    required this.item,
    required this.onTap,
    this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    final postponements = item.postponementCount;
    final isHighRisk = item.isRepeatedlyPostponed || item.isOverdue;

    final borderColor = isHighRisk
        ? AppColors.statusOverdue.withAlpha(120)
        : AppColors.borderSubtleOf(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: GlassContainer(
        borderRadius: 16,
        blur: 12,
        onTap: onTap,
        borderColor: borderColor,
        backgroundColor: isHighRisk
            ? AppColors.bgSurfaceOf(context).withAlpha(225)
            : AppColors.bgSurfaceOf(context).withAlpha(190),
        boxShadow: isHighRisk
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    item.title,
                    style: TextStyle(
                      color: AppColors.textPrimaryOf(context),
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 10),
                StatusPill(status: item.status, compact: true),
              ],
            ),
            if (item.description != null && item.description!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                item.description!,
                style: TextStyle(
                  color: AppColors.textSecondaryOf(context),
                  fontSize: 13,
                  height: 1.3,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                ConfidenceBadge(confidence: item.confidence),
                if (postponements > 0)
                  PostponementBadge(count: postponements),
                if (item.similarityScore != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.brandPrimary.withAlpha(25),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.brandPrimary.withAlpha(60)),
                    ),
                    child: Text(
                      'Sim: ${(item.similarityScore! * 100).toStringAsFixed(1)}%',
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
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Divider(height: 1, color: AppColors.dividerColorOf(context)),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.brandPrimary.withAlpha(150),
                            AppColors.brandAccent.withAlpha(150),
                          ],
                        ),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        item.ownerName.isNotEmpty ? item.ownerName[0].toUpperCase() : '?',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      item.ownerName,
                      style: TextStyle(
                        color: AppColors.textSecondaryOf(context),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Icon(
                      Icons.schedule_rounded,
                      size: 13,
                      color: item.isOverdue ? AppColors.statusOverdue : AppColors.textTertiaryOf(context),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      DateFormatter.formatRelativeDate(item.deadline),
                      style: TextStyle(
                        color: item.isOverdue ? AppColors.statusOverdue : AppColors.textTertiaryOf(context),
                        fontSize: 12,
                        fontWeight: item.isOverdue ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
