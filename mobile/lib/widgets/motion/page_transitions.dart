import 'package:flutter/material.dart';

class FadeSlidePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;

  FadeSlidePageRoute({required this.page})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: const Duration(milliseconds: 350),
          reverseTransitionDuration: const Duration(milliseconds: 280),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final curve = CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
              reverseCurve: Curves.easeInCubic,
            );

            final slideTween = Tween<Offset>(
              begin: const Offset(0.0, 0.08),
              end: Offset.zero,
            );

            final scaleTween = Tween<double>(
              begin: 0.96,
              end: 1.0,
            );

            final fadeTween = Tween<double>(
              begin: 0.0,
              end: 1.0,
            );

            return FadeTransition(
              opacity: fadeTween.animate(curve),
              child: ScaleTransition(
                scale: scaleTween.animate(curve),
                child: SlideTransition(
                  position: slideTween.animate(curve),
                  child: child,
                ),
              ),
            );
          },
        );
}
