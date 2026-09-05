class ApiEndpoints {
  static const String health = '/health';
  static const String meetings = '/meetings';
  static String meetingDetail(String id) => '/meetings/$id';
  static String meetingTranscript(String id) => '/meetings/$id/transcript';
  static String processMeeting(String id) => '/meetings/$id/process';

  static const String actionItems = '/action-items';
  static String actionItemDetail(String id) => '/action-items/$id';

  static const String dashboardOverview = '/dashboard/overview';
}
