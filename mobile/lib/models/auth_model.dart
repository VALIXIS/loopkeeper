class UserProfile {
  final String id;
  final String name;
  final String email;
  final String role; // Manager or Employee
  final String department;
  final String avatarUrl;
  final int age;
  final String contactNumber;
  final String address;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.department,
    required this.avatarUrl,
    this.age = 20,
    this.contactNumber = '9494462124',
    this.address = 'Plot 42, Hitech City, Madhapur, Hyderabad, Telangana 500081',
  });

  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? department,
    String? avatarUrl,
    int? age,
    String? contactNumber,
    String? address,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      department: department ?? this.department,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      age: age ?? this.age,
      contactNumber: contactNumber ?? this.contactNumber,
      address: address ?? this.address,
    );
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Hasitha',
      email: json['email'] ?? 'hasitha@2006',
      role: json['role'] ?? 'Mobile Application Lead',
      department: json['department'] ?? 'Mobile Engineering',
      avatarUrl: json['avatar_url'] ?? '',
      age: json['age'] ?? 20,
      contactNumber: json['contact_number'] ?? '9494462124',
      address: json['address'] ?? 'Plot 42, Hitech City, Madhapur, Hyderabad, Telangana 500081',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'department': department,
    'avatar_url': avatarUrl,
    'age': age,
    'contact_number': contactNumber,
    'address': address,
  };
}

