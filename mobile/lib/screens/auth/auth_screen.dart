import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/navigation/main_navigation_wrapper.dart';

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
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.brandPrimary.withAlpha(30),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.sync_alt_rounded,
                      size: 36,
                      color: AppColors.brandPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'LoopKeeper Mobile',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
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
                  const SizedBox(height: 32),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Select User Profile',
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 10),
                          DropdownButtonFormField<String>(
                            initialValue: _selectedUser,
                            decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.person_outline_rounded, color: AppColors.textSecondary),
                            ),
                            items: _users.map((u) {
                              return DropdownMenuItem<String>(
                                value: u['name'],
                                child: Text('${u['name']} (${u['role']})'),
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
                          const SizedBox(height: 20),
                          const Text(
                            'Backend API Base URL',
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 10),
                          TextField(
                            controller: _baseUrlController,
                            decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.link_rounded, color: AppColors.textSecondary),
                              hintText: 'http://10.0.2.2:8000/api/v1',
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Resilient Offline Mode',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
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
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () async {
                                await provider.setBaseUrl(_baseUrlController.text.trim());
                                await provider.switchUser(_selectedRole, _selectedUser, _selectedUserId);
                                if (context.mounted) {
                                  Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(builder: (_) => const MainNavigationWrapper()),
                                  );
                                }
                              },
                              child: const Text('Sign In & Connect'),
                            ),
                          ),
                        ],
                      ),
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
