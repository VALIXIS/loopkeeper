import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';

class ConfidenceBadge extends StatelessWidget {
  final double confidence;
  final bool showSparkle;

  const ConfidenceBadge({
    super.key,
    required this.confidence,
    this.showSparkle = true,
  });

  @override
  Widget build(BuildContext context) {
    final isLowConfidence = confidence < 0.85;
    final color = isLowConfidence ? AppColors.statusPending : AppColors.brandAccent;
    final bg = color.withAlpha(25);
    final border = color.withAlpha(80);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showSparkle) ...[
            Icon(
              isLowConfidence ? Icons.help_outline_rounded : Icons.auto_awesome_rounded,
              size: 12,
              color: color,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            DateFormatter.formatConfidence(confidence),
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: FontWeight.w600,
            ),
          ),
          if (isLowConfidence) ...[
            const SizedBox(width: 4),
            const Text(
              'Uncertain',
              style: TextStyle(
                color: AppColors.statusPending,
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
