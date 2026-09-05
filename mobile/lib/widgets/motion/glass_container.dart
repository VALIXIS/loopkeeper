import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class GlassContainer extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Color? borderColor;
  final double borderWidth;
  final double blur;
  final VoidCallback? onTap;
  final List<BoxShadow>? boxShadow;
  final Gradient? gradient;

  const GlassContainer({
    super.key,
    required this.child,
    this.borderRadius = 16.0,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.blur = 12.0,
    this.onTap,
    this.boxShadow,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final defaultBg = isDark
        ? AppColors.bgSurface.withAlpha(210)
        : AppColors.bgSurfaceLight.withAlpha(245);
    final defaultBorder = isDark
        ? const Color(0x1FFFFFFF)
        : AppColors.borderSubtleLight;

    Color? resolvedBg = backgroundColor;
    if (!isDark && resolvedBg != null) {
      final val = resolvedBg.value;
      if (val == AppColors.bgSurface.value ||
          val == AppColors.bgSurface.withAlpha(245).value ||
          val == AppColors.bgSurface.withAlpha(235).value ||
          val == AppColors.bgSurface.withAlpha(225).value ||
          val == AppColors.bgSurface.withAlpha(220).value ||
          val == AppColors.bgSurface.withAlpha(210).value ||
          val == AppColors.bgSurface.withAlpha(200).value ||
          val == AppColors.bgSurface.withAlpha(190).value) {
        final alpha = resolvedBg.alpha;
        resolvedBg = AppColors.bgSurfaceLight.withAlpha(alpha);
      } else if (val == AppColors.bgApp.value ||
          val == AppColors.bgApp.withAlpha(200).value) {
        final alpha = resolvedBg.alpha;
        resolvedBg = AppColors.bgAppLight.withAlpha(alpha);
      }
    }

    Color? resolvedBorder = borderColor;
    if (!isDark && resolvedBorder != null) {
      if (resolvedBorder == const Color(0x1FFFFFFF) || resolvedBorder == AppColors.borderSubtle) {
        resolvedBorder = AppColors.borderSubtleLight;
      }
    }

    final effectiveBg = resolvedBg ?? defaultBg;
    final effectiveBorder = resolvedBorder ?? defaultBorder;


    Widget content = ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: effectiveBg,
            gradient: gradient,
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: effectiveBorder,
              width: borderWidth,
            ),
          ),
          child: child,
        ),
      ),
    );

    if (boxShadow != null && boxShadow!.isNotEmpty) {
      content = Container(
        margin: margin,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(borderRadius),
          boxShadow: boxShadow,
        ),
        child: content,
      );
    } else if (margin != null) {
      content = Padding(
        padding: margin!,
        child: content,
      );
    }

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(borderRadius),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(borderRadius),
          splashColor: AppColors.brandPrimary.withAlpha(30),
          highlightColor: AppColors.brandPrimary.withAlpha(15),
          child: content,
        ),
      );
    }

    return content;
  }
}
