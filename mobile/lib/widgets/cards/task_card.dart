import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/action_item_model.dart';
import '../badges/status_pill.dart';
import '../badges/confidence_badge.dart';
import '../badges/postponement_badge.dart';

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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      item.title,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  StatusPill(status: item.status, compact: true),
                ],
              ),
              if (item.description != null && item.description!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  item.description!,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 10),
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
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.brandPrimary.withAlpha(20),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Sim: ${item.similarityScore!.toStringAsFixed(3)}',
                        style: const TextStyle(
                          color: AppColors.brandPrimary,
                          fontSize: 10,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                ],
              ),
              const Divider(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 10,
                        backgroundColor: AppColors.bgSurfaceHover,
                        child: Icon(Icons.person, size: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        item.ownerName,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_rounded,
                        size: 12,
                        color: item.isOverdue ? AppColors.statusOverdue : AppColors.textTertiary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        DateFormatter.formatRelativeDate(item.deadline),
                        style: TextStyle(
                          color: item.isOverdue ? AppColors.statusOverdue : AppColors.textTertiary,
                          fontSize: 12,
                          fontWeight: item.isOverdue ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
