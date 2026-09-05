import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class StatusPill extends StatelessWidget {
  final String status;
  final bool compact;

  const StatusPill({
    super.key,
    required this.status,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final lower = status.toLowerCase();
    Color bg;
    Color border;
    Color text;
    String label;

    switch (lower) {
      case 'done':
      case 'completed':
        bg = AppColors.statusDoneBg;
        border = AppColors.statusDoneBorder;
        text = AppColors.statusDone;
        label = 'Done';
        break;
      case 'overdue':
        bg = AppColors.statusOverdueBg;
        border = AppColors.statusOverdueBorder;
        text = AppColors.statusOverdue;
        label = 'Overdue';
        break;
      case 'cancelled':
        bg = AppColors.bgSurfaceHover;
        border = AppColors.borderDefault;
        text = AppColors.textTertiary;
        label = 'Cancelled';
        break;
      case 'pending':
      default:
        bg = AppColors.statusPendingBg;
        border = AppColors.statusPendingBorder;
        text = AppColors.statusPending;
        label = 'Pending';
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: compact ? 5 : 6,
            height: compact ? 5 : 6,
            decoration: BoxDecoration(
              color: text,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: compact ? 11 : 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
