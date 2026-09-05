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

  void _showEditProfileModal(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context, listen: false);
    final user = provider.currentUser;

    final nameCtrl = TextEditingController(text: user.name);
    final ageCtrl = TextEditingController(text: '${user.age}');
    final emailCtrl = TextEditingController(text: user.email);
    final contactCtrl = TextEditingController(text: user.contactNumber);
    final addressCtrl = TextEditingController(text: user.address);
    final roleCtrl = TextEditingController(text: user.role);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return GlassContainer(
          borderRadius: 24,
          blur: 20,
          backgroundColor: AppColors.bgSurface.withAlpha(245),
          borderColor: AppColors.brandPrimary.withAlpha(90),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Edit User Profile Details',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: AppColors.textTertiary),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                _buildFieldLabel('Full Name'),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.person_rounded, size: 20)),
                ),
                const SizedBox(height: 12),
                _buildFieldLabel('Age'),
                TextField(
                  controller: ageCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.cake_rounded, size: 20)),
                ),
                const SizedBox(height: 12),
                _buildFieldLabel('Email Address'),
                TextField(
                  controller: emailCtrl,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.email_rounded, size: 20)),
                ),
                const SizedBox(height: 12),
                _buildFieldLabel('Contact Phone Number'),
                TextField(
                  controller: contactCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.phone_rounded, size: 20)),
                ),
                const SizedBox(height: 12),
                _buildFieldLabel('Address Location'),
                TextField(
                  controller: addressCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.location_on_rounded, size: 20)),
                ),
                const SizedBox(height: 12),
                _buildFieldLabel('Designation / Role'),
                TextField(
                  controller: roleCtrl,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.badge_rounded, size: 20)),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      final newAge = int.tryParse(ageCtrl.text.trim()) ?? user.age;
                      provider.updateUserProfile(
                        name: nameCtrl.text.trim(),
                        age: newAge,
                        email: emailCtrl.text.trim(),
                        contactNumber: contactCtrl.text.trim(),
                        address: addressCtrl.text.trim(),
                        role: roleCtrl.text.trim(),
                      );
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Profile updated successfully!')),
                      );
                    },
                    child: const Text('Save Profile Changes', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Text(
        label,
        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final user = provider.currentUser;

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('User Profile & Settings'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0, bottom: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Profile Primary Card
              GlassContainer(
                borderRadius: 20,
                blur: 16,
                borderColor: AppColors.brandPrimary.withAlpha(90),
                backgroundColor: AppColors.bgSurface.withAlpha(220),
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.brandPrimary, AppColors.brandAccent],
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.brandPrimary.withAlpha(90),
                                blurRadius: 12,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            user.name.isNotEmpty ? user.name[0].toUpperCase() : 'H',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 24,
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
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.brandPrimary.withAlpha(35),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  user.role,
                                  style: const TextStyle(
                                    color: AppColors.brandAccent,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton.filledTonal(
                          onPressed: () => _showEditProfileModal(context),
                          icon: const Icon(Icons.edit_rounded, size: 20),
                          tooltip: 'Edit Profile Details',
                        ),
                      ],
                    ),
                    const Divider(height: 24, color: Color(0x1FFFFFFF)),
                    // Detailed Profile Properties Grid
                    _ProfileInfoRow(icon: Icons.cake_rounded, label: 'Age', value: '${user.age} years old'),
                    const SizedBox(height: 10),
                    _ProfileInfoRow(icon: Icons.email_rounded, label: 'Email', value: user.email),
                    const SizedBox(height: 10),
                    _ProfileInfoRow(icon: Icons.phone_rounded, label: 'Contact', value: user.contactNumber),
                    const SizedBox(height: 10),
                    _ProfileInfoRow(icon: Icons.location_on_rounded, label: 'Address', value: user.address),
                    const Divider(height: 24, color: Color(0x1FFFFFFF)),
                    // Integrated Theme Switcher Inside Profile Card
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
                              size: 22,
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  provider.themeMode == ThemeMode.dark
                                      ? 'Futuristic Dark Theme'
                                      : 'Enterprise Light Theme',
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const Text(
                                  'Applies theme across all views',
                                  style: TextStyle(color: AppColors.textTertiary, fontSize: 11),
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

              const SizedBox(height: 24),

              const Text(
                'Backend & Network Settings',
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
                      child: OutlinedButton(
                        onPressed: () async {
                          await provider.setBaseUrl(_baseUrlController.text.trim());
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Base URL saved!')),
                            );
                          }
                        },
                        child: const Text('Save Base URL', style: TextStyle(color: AppColors.brandAccent, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const Divider(height: 24, color: Color(0x1FFFFFFF)),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Demo Fixture Mode [OFFLINE]', style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Isolates local mock fixtures for offline testing.', style: TextStyle(color: AppColors.textTertiary, fontSize: 12)),
                      value: provider.isOffline,
                      activeTrackColor: AppColors.brandPrimary,
                      onChanged: (val) {
                        provider.toggleOfflineMode(val);
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

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
                  'LoopKeeper Mobile v1.0.0 (Build 2)\nBuilt with Flutter & Dart',
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

class _ProfileInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ProfileInfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.brandPrimary),
        const SizedBox(width: 10),
        SizedBox(
          width: 70,
          child: Text(
            label,
            style: const TextStyle(color: AppColors.textTertiary, fontSize: 12),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w500),
          ),
        ),
      ],
    );
  }
}
