class UserProfile {
  final String id;
  final String name;
  final String email;
  final String role; // Manager or Employee
  final String department;
  final String avatarUrl;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.department,
    required this.avatarUrl,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? 'User',
      email: json['email'] ?? '',
      role: json['role'] ?? 'Employee',
      department: json['department'] ?? 'Engineering',
      avatarUrl: json['avatar_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'department': department,
    'avatar_url': avatarUrl,
  };
}
