import 'action_item_model.dart';

class OverloadedMemberModel {
  final String employeeId;
  final String employeeName;
  final int openTaskCount;
  final int overdueTaskCount;

  OverloadedMemberModel({
    required this.employeeId,
    required this.employeeName,
    required this.openTaskCount,
    required this.overdueTaskCount,
  });

  factory OverloadedMemberModel.fromJson(Map<String, dynamic> json) {
    return OverloadedMemberModel(
      employeeId: json['employee_id'] ?? '',
      employeeName: json['employee_name'] ?? 'Unknown Employee',
      openTaskCount: json['open_task_count'] ?? 0,
      overdueTaskCount: json['overdue_task_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'employee_id': employeeId,
    'employee_name': employeeName,
    'open_task_count': openTaskCount,
    'overdue_task_count': overdueTaskCount,
  };
}

class DashboardOverviewModel {
  final int totalOpenTasks;
  final int overdueTasks;
  final int completedTasks;
  final int repeatedlyPostponedTasks;
  final List<OverloadedMemberModel> overloadedMembers;
  final List<ActionItemModel> upcomingDeadlines;

  DashboardOverviewModel({
    required this.totalOpenTasks,
    required this.overdueTasks,
    required this.completedTasks,
    required this.repeatedlyPostponedTasks,
    this.overloadedMembers = const [],
    this.upcomingDeadlines = const [],
  });

  factory DashboardOverviewModel.fromJson(Map<String, dynamic> json) {
    List<OverloadedMemberModel> members = [];
    if (json['overloaded_members'] != null && json['overloaded_members'] is List) {
      members = (json['overloaded_members'] as List)
          .map((m) => OverloadedMemberModel.fromJson(m))
          .toList();
    }

    List<ActionItemModel> deadlines = [];
    if (json['upcoming_deadlines'] != null && json['upcoming_deadlines'] is List) {
      deadlines = (json['upcoming_deadlines'] as List)
          .map((d) => ActionItemModel.fromJson(d))
          .toList();
    }

    return DashboardOverviewModel(
      totalOpenTasks: json['total_open_tasks'] ?? 0,
      overdueTasks: json['overdue_tasks'] ?? 0,
      completedTasks: json['completed_tasks'] ?? 0,
      repeatedlyPostponedTasks: json['repeatedly_postponed_tasks'] ?? 0,
      overloadedMembers: members,
      upcomingDeadlines: deadlines,
    );
  }

  Map<String, dynamic> toJson() => {
    'total_open_tasks': totalOpenTasks,
    'overdue_tasks': overdueTasks,
    'completed_tasks': completedTasks,
    'repeatedly_postponed_tasks': repeatedlyPostponedTasks,
    'overloaded_members': overloadedMembers.map((m) => m.toJson()).toList(),
    'upcoming_deadlines': upcomingDeadlines.map((d) => d.toJson()).toList(),
  };
}
