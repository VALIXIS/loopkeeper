import 'package:intl/intl.dart';

class DateFormatter {
  static String formatShortDate(DateTime? dateTime) {
    if (dateTime == null) return 'No deadline';
    return DateFormat('MMM d, yyyy').format(dateTime);
  }

  static String formatDateTime(DateTime? dateTime) {
    if (dateTime == null) return 'N/A';
    return DateFormat('MMM d, yyyy • h:mm a').format(dateTime);
  }

  static String formatTimeOnly(DateTime? dateTime) {
    if (dateTime == null) return 'N/A';
    return DateFormat('h:mm a').format(dateTime);
  }

  static String formatRelativeDate(DateTime? dateTime) {
    if (dateTime == null) return 'No deadline';
    final now = DateTime.now();
    final difference = dateTime.difference(now);

    if (difference.isNegative) {
      final days = difference.inDays.abs();
      if (days == 0) return 'Overdue today';
      if (days == 1) return 'Overdue by 1 day';
      return 'Overdue by $days days';
    } else {
      final days = difference.inDays;
      if (days == 0) return 'Due today';
      if (days == 1) return 'Due tomorrow';
      if (days < 7) return 'Due in $days days';
      return DateFormat('MMM d').format(dateTime);
    }
  }

  static String formatConfidence(double confidence) {
    final pct = (confidence * 100).toStringAsFixed(1);
    return '$pct%';
  }

  static String truncateUuid(String? uuid) {
    if (uuid == null || uuid.length < 8) return uuid ?? 'N/A';
    return '${uuid.substring(0, 8)}...${uuid.substring(uuid.length - 4)}';
  }
}
