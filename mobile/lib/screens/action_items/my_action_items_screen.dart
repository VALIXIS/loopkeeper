import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/task_card.dart';
import '../../widgets/feedback/empty_state.dart';
import '../../widgets/feedback/loading_shimmer.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';
import '../../widgets/motion/staggered_entrance.dart';
import '../../widgets/motion/page_transitions.dart';
import 'action_item_detail_screen.dart';

class MyActionItemsScreen extends StatefulWidget {
  const MyActionItemsScreen({super.key});

  @override
  State<MyActionItemsScreen> createState() => _MyActionItemsScreenState();
}

class _MyActionItemsScreenState extends State<MyActionItemsScreen> {
  String _selectedFilter = 'All';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    var items = provider.actionItems;

    if (_selectedFilter == 'Pending') {
      items = items.where((i) => i.status == 'pending' && !i.isOverdue).toList();
    } else if (_selectedFilter == 'Overdue') {
      items = items.where((i) => i.isOverdue).toList();
    } else if (_selectedFilter == 'Completed') {
      items = items.where((i) => i.status == 'done').toList();
    }

    if (_searchQuery.isNotEmpty) {
      items = items.where((i) =>
        i.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
        i.ownerName.toLowerCase().contains(_searchQuery.toLowerCase())
      ).toList();
    }

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('Action Items'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: AmbientBackground(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: GlassContainer(
                borderRadius: 14,
                padding: EdgeInsets.zero,
                backgroundColor: AppColors.bgSurface.withAlpha(200),
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textTertiary),
                    hintText: 'Search action items by title or owner...',
                    border: InputBorder.none,
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, color: AppColors.textTertiary),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                  ),
                ),
              ),
            ),

            // Filter Segment Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
              child: Row(
                children: ['All', 'Pending', 'Overdue', 'Completed'].map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedFilter = filter);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.brandPrimary.withAlpha(50)
                              : AppColors.bgSurface.withAlpha(180),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? AppColors.brandPrimary : const Color(0x1FFFFFFF),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          filter,
                          style: TextStyle(
                            color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 8),

            Expanded(
              child: RefreshIndicator(
                onRefresh: () => provider.refreshAll(),
                color: AppColors.brandPrimary,
                backgroundColor: AppColors.bgSurface,
                child: provider.isLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.0),
                        child: LoadingShimmer(count: 4),
                      )
                    : items.isEmpty
                        ? const EmptyStateWidget(
                            icon: Icons.check_box_outlined,
                            title: 'No Action Items',
                            message: 'No action items match the selected filter criteria.',
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 100.0),
                            itemCount: items.length,
                            itemBuilder: (context, index) {
                              final item = items[index];
                              return FadeInEntrance(
                                index: index,
                                child: TaskCard(
                                  item: item,
                                  onTap: () {
                                    Navigator.of(context).push(
                                      FadeSlidePageRoute(
                                        page: ActionItemDetailScreen(itemId: item.id),
                                      ),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
