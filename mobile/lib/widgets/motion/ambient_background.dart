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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgApp = isDark ? AppColors.bgApp : AppColors.bgAppLight;
    final orb1Color = isDark ? AppColors.brandPrimary.withAlpha(35) : AppColors.brandPrimaryLight.withAlpha(20);
    final orb2Color = isDark ? AppColors.brandAccent.withAlpha(25) : AppColors.brandAccent.withAlpha(15);

    return Container(
      color: bgApp,
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
                    orb1Color,
                    orb1Color.withAlpha(0),
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
                    orb2Color,
                    orb2Color.withAlpha(0),
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
