import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/page_transitions.dart';
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
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('App Settings'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0, bottom: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Profile Section
              GlassContainer(
                borderRadius: 16,
                blur: 16,
                borderColor: AppColors.brandPrimary.withAlpha(70),
                backgroundColor: AppColors.bgSurface.withAlpha(220),
                padding: const EdgeInsets.all(18),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.brandPrimary, AppColors.brandAccent],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.brandPrimary.withAlpha(80),
                            blurRadius: 10,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                        style: const TextStyle(
                          color: Colors.white,
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

              const SizedBox(height: 20),

              const Text(
                'Appearance & Theme Mode',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),

              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              provider.themeMode == ThemeMode.dark
                                  ? Icons.dark_mode_rounded
                                  : Icons.light_mode_rounded,
                              color: AppColors.brandPrimary,
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  provider.themeMode == ThemeMode.dark
                                      ? 'Futuristic Dark Theme'
                                      : 'Enterprise Light Theme',
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  provider.themeMode == ThemeMode.dark
                                      ? 'Deep midnight palette with neon glows'
                                      : 'Clean slate palette with dark headers',
                                  style: const TextStyle(
                                    color: AppColors.textTertiary,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Switch(
                          value: provider.themeMode == ThemeMode.dark,
                          activeTrackColor: AppColors.brandPrimary,
                          onChanged: (isDark) {
                            provider.setThemeMode(isDark ? ThemeMode.dark : ThemeMode.light);
                          },
                        ),
                      ],
                    ),
                  ],
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

              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('FastAPI Endpoint Base URL', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.bgApp.withAlpha(200),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: TextField(
                        controller: _baseUrlController,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.dns_rounded, color: AppColors.textTertiary),
                          hintText: 'http://localhost:8000/api/v1',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 14, horizontal: 10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      child: GlassContainer(
                        borderRadius: 10,
                        padding: EdgeInsets.zero,
                        backgroundColor: AppColors.brandPrimary.withAlpha(30),
                        borderColor: AppColors.brandPrimary.withAlpha(80),
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: BorderSide.none,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: () async {
                            await provider.setBaseUrl(_baseUrlController.text.trim());
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Base URL saved successfully!')),
                              );
                            }
                          },
                          child: const Text('Save Base URL', style: TextStyle(color: AppColors.brandAccent, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                    const Divider(height: 24, color: Color(0x1FFFFFFF)),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Demo Fixture Mode [OFFLINE FIXTURES]', style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Explicitly isolate mock fixtures for offline testing. Disables real production backend calls.', style: TextStyle(color: AppColors.textTertiary, fontSize: 12)),
                      value: provider.isOffline,
                      activeTrackColor: AppColors.brandPrimary,
                      onChanged: (val) {
                        provider.toggleOfflineMode(val);
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              const Text(
                'Integrations & Diagnostics',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),

              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.hub_rounded, color: AppColors.brandAccent),
                      title: const Text('External Integrations', style: TextStyle(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Google Meet, MS Teams, Zoom, Jira status', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
                      onTap: () {
                        Navigator.pushNamed(context, '/integrations');
                      },
                    ),
                    const Divider(height: 1, color: Color(0x1FFFFFFF)),
                    ListTile(
                      leading: const Icon(Icons.refresh_rounded, color: AppColors.brandPrimary),
                      title: const Text('Refresh Application State', style: TextStyle(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
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
                    const Divider(height: 1, color: Color(0x1FFFFFFF)),
                    ListTile(
                      leading: const Icon(Icons.swap_horiz_rounded, color: AppColors.statusOverdue),
                      title: const Text('Switch User Profile / Log Out', style: TextStyle(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Change active persona (Manager vs Employee)', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      onTap: () {
                        Navigator.of(context).pushAndRemoveUntil(
                          FadeSlidePageRoute(page: const AuthScreen()),
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
      ),
    );
  }
}
