import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/task_card.dart';
import '../../widgets/feedback/empty_state.dart';
import '../../widgets/feedback/loading_shimmer.dart';
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
      appBar: AppBar(
        title: const Text('Action Items'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textTertiary),
                hintText: 'Search action items by title or owner...',
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

          // Filter Segment Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Row(
              children: ['All', 'Pending', 'Overdue', 'Completed'].map((filter) {
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    selectedColor: AppColors.brandPrimary.withAlpha(50),
                    backgroundColor: AppColors.bgSurface,
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.brandPrimary : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                    side: BorderSide(
                      color: isSelected ? AppColors.brandPrimary : AppColors.borderSubtle,
                    ),
                    onSelected: (selected) {
                      setState(() => _selectedFilter = filter);
                    },
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
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          itemCount: items.length,
                          itemBuilder: (context, index) {
                            final item = items[index];
                            return TaskCard(
                              item: item,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => ActionItemDetailScreen(itemId: item.id),
                                  ),
                                );
                              },
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
