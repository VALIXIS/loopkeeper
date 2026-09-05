import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/meetings/meetings_screen.dart';
import '../../screens/action_items/my_action_items_screen.dart';
import '../../screens/team/team_overview_screen.dart';
import '../motion/glass_container.dart';
import '../../screens/settings/settings_screen.dart';



class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    MeetingsScreen(),
    MyActionItemsScreen(),
    TeamOverviewScreen(),
    SettingsScreen(),
  ];

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.grid_view_rounded, activeIcon: Icons.grid_view_rounded, label: 'Home'),
    _NavItem(icon: Icons.video_call_outlined, activeIcon: Icons.video_call_rounded, label: 'Meetings'),
    _NavItem(icon: Icons.task_alt_outlined, activeIcon: Icons.task_alt_rounded, label: 'My Tasks'),
    _NavItem(icon: Icons.groups_outlined, activeIcon: Icons.groups_rounded, label: 'Team'),
    _NavItem(icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded, label: 'Profile'),
  ];


  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return PopScope(

      canPop: _currentIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _currentIndex != 0) {
          setState(() {
            _currentIndex = 0;
          });
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.bgAppOf(context),
        body: Stack(
          children: [
            IndexedStack(
              index: _currentIndex,
              children: _screens,
            ),
            Positioned(
              left: 12,
              right: 12,
              bottom: 16,
              child: GlassContainer(
                borderRadius: 24,
                blur: 16,
                backgroundColor: AppColors.bgSurfaceOf(context).withAlpha(235),
                borderColor: const Color(0x336366F1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(isDark ? 90 : 25),
                    blurRadius: 20,
                    spreadRadius: 2,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: AppColors.brandPrimary.withAlpha(25),
                    blurRadius: 15,
                    spreadRadius: 0,
                  ),
                ],
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: List.generate(_navItems.length, (index) {
                    final item = _navItems[index];
                    final isSelected = index == _currentIndex;

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _currentIndex = index;
                        });
                      },
                      behavior: HitTestBehavior.opaque,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        curve: Curves.easeOutCubic,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.brandPrimaryOf(context).withAlpha(45)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                          border: isSelected
                              ? Border.all(color: AppColors.brandPrimaryOf(context).withAlpha(120), width: 1)
                              : Border.all(color: Colors.transparent),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Stack(
                              clipBehavior: Clip.none,
                              children: [
                                AnimatedScale(
                                  scale: isSelected ? 1.1 : 1.0,
                                  duration: const Duration(milliseconds: 200),
                                  child: Icon(
                                    isSelected ? item.activeIcon : item.icon,
                                    size: 20,
                                    color: isSelected
                                        ? AppColors.brandPrimaryOf(context)
                                        : AppColors.textTertiaryOf(context),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 3),
                            Text(
                              item.label,
                              style: TextStyle(
                                color: isSelected
                                    ? AppColors.textPrimaryOf(context)
                                    : AppColors.textTertiaryOf(context),
                                fontSize: 11,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

