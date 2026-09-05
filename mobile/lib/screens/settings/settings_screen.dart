import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../auth/auth_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _baseUrlController;

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<AppStateProvider>(context, listen: false);
    _baseUrlController = TextEditingController(text: provider.baseUrl);
  }

  @override
  void dispose() {
    _baseUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final user = provider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('App Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Profile Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.brandPrimary.withAlpha(30),
                      child: Text(
                        user.name.isNotEmpty ? user.name[0] : 'U',
                        style: const TextStyle(
                          color: AppColors.brandPrimary,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${user.role} • ${user.department}',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            user.email,
                            style: const TextStyle(
                              color: AppColors.textTertiary,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Backend API & Network Configuration',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('FastAPI Endpoint Base URL', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _baseUrlController,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.dns_rounded, color: AppColors.textTertiary),
                        hintText: 'http://10.0.2.2:8000/api/v1',
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () async {
                          await provider.setBaseUrl(_baseUrlController.text.trim());
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Base URL saved successfully!')),
                            );
                          }
                        },
                        child: const Text('Save Base URL'),
                      ),
                    ),
                    const Divider(height: 24),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Resilient Offline Mode', style: TextStyle(color: AppColors.textPrimary, fontSize: 14)),
                      subtitle: const Text('Forces fallback to mock dataset when backend API is unreachable.', style: TextStyle(color: AppColors.textTertiary, fontSize: 12)),
                      value: provider.isOffline,
                      activeTrackColor: AppColors.brandPrimary,
                      onChanged: (val) {
                        provider.toggleOfflineMode(val);
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Data & Diagnostics',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.refresh_rounded, color: AppColors.brandPrimary),
                    title: const Text('Refresh All Application State', style: TextStyle(fontSize: 14)),
                    subtitle: const Text('Sync meetings, action items, and telemetry', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                    onTap: () async {
                      await provider.refreshAll();
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('State refreshed!')),
                        );
                      }
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.swap_horiz_rounded, color: AppColors.brandAccent),
                    title: const Text('Switch User Profile / Log Out', style: TextStyle(fontSize: 14)),
                    subtitle: const Text('Change active persona (Manager vs Employee)', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                    onTap: () {
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(builder: (_) => const AuthScreen()),
                        (route) => false,
                      );
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),
            const Center(
              child: Text(
                'LoopKeeper Mobile v1.0.0 (Build 1)\nBuilt with Flutter & Dart',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
