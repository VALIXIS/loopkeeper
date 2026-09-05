import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'providers/app_state_provider.dart';
import 'widgets/navigation/main_navigation_wrapper.dart';
import 'widgets/motion/page_transitions.dart';
import 'screens/recording/meeting_recording_screen.dart';
import 'screens/integrations/integrations_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'screens/auth/auth_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const LoopKeeperApp());
}

class LoopKeeperApp extends StatelessWidget {
  const LoopKeeperApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppStateProvider()..init(),
      child: Consumer<AppStateProvider>(
        builder: (context, provider, child) {
          return MaterialApp(
            title: 'LoopKeeper Mobile',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: provider.themeMode,
            home: const MainNavigationWrapper(),
            onGenerateRoute: (settings) {
              switch (settings.name) {
                case '/recording':
                  return FadeSlidePageRoute(page: const MeetingRecordingScreen());
                case '/integrations':
                  return FadeSlidePageRoute(page: const IntegrationsScreen());
                case '/settings':
                  return FadeSlidePageRoute(page: const SettingsScreen());
                case '/auth':
                  return FadeSlidePageRoute(page: const AuthScreen());
                default:
                  return null;
              }
            },
          );
        },
      ),
    );
  }
}

