import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/navigation/main_navigation_wrapper.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/page_transitions.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _baseUrlController = TextEditingController();
  String _selectedRole = 'Manager';
  String _selectedUser = 'Hasitha (Mobile Lead)';
  String _selectedUserId = '11111111-1111-1111-1111-111111111111';

  final List<Map<String, String>> _users = [
    {'name': 'Hasitha (Mobile Lead)', 'role': 'Manager', 'id': '11111111-1111-1111-1111-111111111111'},
    {'name': 'Priya Sharma', 'role': 'Employee', 'id': '44444444-4444-4444-4444-444444444444'},
    {'name': 'Vignesh Kumar', 'role': 'Employee', 'id': '22222222-2222-2222-2222-222222222222'},
    {'name': 'Alice Vance', 'role': 'Employee', 'id': '33333333-3333-3333-3333-333333333333'},
  ];

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<AppStateProvider>(context, listen: false);
    _baseUrlController.text = provider.baseUrl;
  }

  @override
  void dispose() {
    _baseUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      body: AmbientBackground(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.brandPrimary, AppColors.brandAccent],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.brandPrimary.withAlpha(100),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.sync_alt_rounded,
                        size: 40,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'LoopKeeper Mobile',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'From Meeting Promises to Completed Work.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 36),
                  GlassContainer(
                    borderRadius: 20,
                    blur: 16,
                    borderColor: AppColors.brandPrimary.withAlpha(80),
                    backgroundColor: AppColors.bgSurface.withAlpha(220),
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Select User Profile',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.bgApp.withAlpha(200),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.borderSubtle),
                          ),
                          child: DropdownButtonFormField<String>(
                            initialValue: _selectedUser,
                            decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.person_outline_rounded, color: AppColors.brandAccent),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                            ),
                            dropdownColor: AppColors.bgSurface,
                            items: _users.map((u) {
                              return DropdownMenuItem<String>(
                                value: u['name'],
                                child: Text(
                                  '${u['name']} (${u['role']})',
                                  style: const TextStyle(color: AppColors.textPrimary),
                                ),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                final selected = _users.firstWhere((u) => u['name'] == val);
                                setState(() {
                                  _selectedUser = val;
                                  _selectedRole = selected['role']!;
                                  _selectedUserId = selected['id']!;
                                });
                              }
                            },
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Backend API Base URL',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.bgApp.withAlpha(200),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.borderSubtle),
                          ),
                          child: TextField(
                            controller: _baseUrlController,
                            decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.link_rounded, color: AppColors.textSecondary),
                              hintText: 'http://127.0.0.1:8001/api/v1',
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 14),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Resilient Offline Mode',
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                            Switch(
                              value: provider.isOffline,
                              activeTrackColor: AppColors.brandPrimary,
                              onChanged: (val) {
                                provider.toggleOfflineMode(val);
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        GlassContainer(
                          borderRadius: 14,
                          padding: EdgeInsets.zero,
                          backgroundColor: AppColors.brandPrimary,
                          borderColor: AppColors.brandAccent.withAlpha(100),
                          child: InkWell(
                            onTap: () async {
                              await provider.setBaseUrl(_baseUrlController.text.trim());
                              await provider.switchUser(_selectedRole, _selectedUser, _selectedUserId);
                              if (context.mounted) {
                                Navigator.of(context).pushReplacement(
                                  FadeSlidePageRoute(page: const MainNavigationWrapper()),
                                );
                              }
                            },
                            borderRadius: BorderRadius.circular(14),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(vertical: 16),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.login_rounded, color: Colors.white, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Sign In & Connect',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
