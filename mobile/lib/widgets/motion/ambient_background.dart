import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AmbientBackground extends StatelessWidget {
  final Widget child;

  const AmbientBackground({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.bgApp,
      child: Stack(
        children: [
          // Top-right subtle glowing orb
          Positioned(
            top: -80,
            right: -60,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.brandPrimary.withAlpha(35),
                    AppColors.brandPrimary.withAlpha(0),
                  ],
                ),
              ),
            ),
          ),
          // Bottom-left subtle cyan orb
          Positioned(
            bottom: 60,
            left: -80,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.brandAccent.withAlpha(25),
                    AppColors.brandAccent.withAlpha(0),
                  ],
                ),
              ),
            ),
          ),
          // Subtle blur filter layer
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
              child: Container(color: Colors.transparent),
            ),
          ),
          // Screen Content
          SafeArea(child: child),
        ],
      ),
    );
  }
}
