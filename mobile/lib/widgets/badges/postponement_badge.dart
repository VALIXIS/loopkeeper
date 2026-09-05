import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class PostponementBadge extends StatelessWidget {
  final int count;

  const PostponementBadge({
    super.key,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();

    final isHighRisk = count >= 2;
    final color = isHighRisk ? AppColors.statusOverdue : AppColors.statusPending;
    final bg = color.withAlpha(30);
    final border = color.withAlpha(100);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
        boxShadow: isHighRisk
            ? [
                BoxShadow(
                  color: AppColors.warningRoseGlow.withAlpha(40),
                  blurRadius: 6,
                  spreadRadius: 1,
                )
              ]
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.warning_amber_rounded,
            size: 12,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            '${count}x Postponed',
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
