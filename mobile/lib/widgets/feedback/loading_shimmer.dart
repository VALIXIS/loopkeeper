import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class LoadingShimmer extends StatefulWidget {
  final int count;
  final double height;

  const LoadingShimmer({
    super.key,
    this.count = 3,
    this.height = 90,
  });

  @override
  State<LoadingShimmer> createState() => _LoadingShimmerState();
}

class _LoadingShimmerState extends State<LoadingShimmer> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.3, end: 0.8).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Column(
          children: List.generate(
            widget.count,
            (index) => Container(
              height: widget.height,
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: AppColors.bgSurfaceHover.withAlpha((_animation.value * 255).toInt()),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderSubtle),
              ),
            ),
          ),
        );
      },
    );
  }
}
