import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/meetings/meetings_screen.dart';
import '../../screens/action_items/my_action_items_screen.dart';
import '../../screens/team/team_overview_screen.dart';
import '../../screens/alerts/alerts_screen.dart';

class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const MeetingsScreen(),
    const MyActionItemsScreen(),
    const TeamOverviewScreen(),
    const AlertsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final unreadAlerts = provider.unreadAlertsCount;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.groups_rounded),
            label: 'Meetings',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.check_box_rounded),
            label: 'My Tasks',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.badge_rounded),
            label: 'Team',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: unreadAlerts > 0,
              label: Text('$unreadAlerts'),
              backgroundColor: AppColors.statusOverdue,
              child: const Icon(Icons.notifications_rounded),
            ),
            label: 'Alerts',
          ),
        ],
      ),
    );
  }
}
