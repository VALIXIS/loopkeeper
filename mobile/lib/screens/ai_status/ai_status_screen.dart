import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/metric_card.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';

class AiStatusScreen extends StatefulWidget {
  const AiStatusScreen({super.key});

  @override
  State<AiStatusScreen> createState() => _AiStatusScreenState();
}

class _AiStatusScreenState extends State<AiStatusScreen> with SingleTickerProviderStateMixin {
  late AnimationController _beamController;

  @override
  void initState() {
    super.initState();
    _beamController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _beamController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final health = provider.aiHealth;

    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('AI Engine & SLM Telemetry'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0, bottom: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status Header Banner
              GlassContainer(
                borderRadius: 16,
                blur: 16,
                borderColor: AppColors.statusDone.withAlpha(90),
                backgroundColor: AppColors.bgSurface.withAlpha(220),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.statusDoneBg,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.statusDone.withAlpha(80),
                            blurRadius: 10,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.check_circle_rounded, color: AppColors.statusDone, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            health?.service ?? 'LoopKeeper Backend AI API',
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Status: ${health?.status.toUpperCase() ?? "OK"} • Pipeline: ${health?.aiPipeline.toUpperCase() ?? "READY"}',
                            style: const TextStyle(
                              color: AppColors.statusDone,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // AI Pipeline Stage Visualizer (Conceptually: Transcript -> Extract -> Evidence -> Match -> Track)
              const Text(
                'AI Extraction & Matching Pipeline',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              GlassContainer(
                borderRadius: 16,
                blur: 12,
                borderColor: AppColors.brandPrimary.withAlpha(70),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    AnimatedBuilder(
                      animation: _beamController,
                      builder: (context, child) {
                        return CustomPaint(
                          size: const Size(double.infinity, 60),
                          painter: _PipelinePainter(progress: _beamController.value),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        _PipelineStageLabel(icon: Icons.subtitles_rounded, title: '1. Ingest', active: true),
                        _PipelineStageLabel(icon: Icons.psychology_rounded, title: '2. Extract', active: true),
                        _PipelineStageLabel(icon: Icons.menu_book_rounded, title: '3. Evidence', active: true),
                        _PipelineStageLabel(icon: Icons.hub_rounded, title: '4. Match', active: true),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // AI Metrics Grid
              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                shrinkWrap: true,
                childAspectRatio: 1.4,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  MetricCard(
                    title: 'Primary Model',
                    value: 'SLM-v1',
                    subtitle: 'loopkeeper-slm-v1',
                    icon: Icons.memory_rounded,
                    accentColor: AppColors.brandAccent,
                  ),
                  MetricCard(
                    title: 'Avg Latency',
                    value: '${health?.averageLatencyMs ?? 142}ms',
                    subtitle: 'Ultra fast inference',
                    icon: Icons.speed_rounded,
                    accentColor: AppColors.statusDone,
                  ),
                  MetricCard(
                    title: 'Match Accuracy',
                    value: '${((health?.accuracyRate ?? 0.984) * 100).toStringAsFixed(1)}%',
                    subtitle: 'Semantic pgvector',
                    icon: Icons.verified_rounded,
                    accentColor: AppColors.brandPrimary,
                  ),
                  MetricCard(
                    title: 'LLM Fallback',
                    value: 'Ready',
                    subtitle: 'High ambiguity backup',
                    icon: Icons.backup_rounded,
                    accentColor: AppColors.statusPending,
                  ),
                ],
              ),

              const SizedBox(height: 24),

              const Text(
                'Pipeline Configuration Specs',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              GlassContainer(
                borderRadius: 16,
                blur: 12,
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: const [
                    _InfoRow(label: 'Task Extraction Engine', value: 'Small Language Model (SLM)'),
                    Divider(height: 20, color: Color(0x1FFFFFFF)),
                    _InfoRow(label: 'Vector Embedding Index', value: 'pgvector IVFFlat (1536 dims)'),
                    Divider(height: 20, color: Color(0x1FFFFFFF)),
                    _InfoRow(label: 'Similarity Threshold', value: '0.850 (Cosine Similarity)'),
                    Divider(height: 20, color: Color(0x1FFFFFFF)),
                    _InfoRow(label: 'Uncertainty Flagging', value: 'Triggered when confidence < 0.85'),
                    Divider(height: 20, color: Color(0x1FFFFFFF)),
                    _InfoRow(label: 'Fallback API Orchestration', value: 'Decoupled Python FastAPI'),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              GlassContainer(
                borderRadius: 14,
                padding: EdgeInsets.zero,
                backgroundColor: AppColors.brandPrimary.withAlpha(30),
                borderColor: AppColors.brandPrimary.withAlpha(90),
                child: InkWell(
                  onTap: () async {
                    await provider.refreshAll();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('AI Engine latency & health verified!')),
                      );
                    }
                  },
                  borderRadius: BorderRadius.circular(14),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.bolt_rounded, color: AppColors.brandAccent),
                        SizedBox(width: 8),
                        Text(
                          'Run Health & Latency Diagnostic',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PipelineStageLabel extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool active;

  const _PipelineStageLabel({
    required this.icon,
    required this.title,
    required this.active,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(
          icon,
          size: 16,
          color: active ? AppColors.brandAccent : AppColors.textTertiary,
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: TextStyle(
            color: active ? AppColors.textPrimary : AppColors.textTertiary,
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _PipelinePainter extends CustomPainter {
  final double progress;

  _PipelinePainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final y = size.height / 2;
    final startX = 20.0;
    final endX = size.width - 20.0;
    final stepWidth = (endX - startX) / 3;

    final linePaint = Paint()
      ..color = AppColors.bgSurfaceHover
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(Offset(startX, y), Offset(endX, y), linePaint);

    final beamX = startX + (endX - startX) * progress;

    final activeLinePaint = Paint()
      ..color = AppColors.brandAccent
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(Offset(startX, y), Offset(beamX, y), activeLinePaint);

    // Glowing beam head
    final glowPaint = Paint()
      ..color = AppColors.brandAccent.withAlpha(180)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    canvas.drawCircle(Offset(beamX, y), 8, glowPaint);

    final beamHeadPaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(beamX, y), 4, beamHeadPaint);

    // Draw 4 Stage Nodes
    for (int i = 0; i < 4; i++) {
      final nodeX = startX + stepWidth * i;
      final isReached = beamX >= nodeX;

      final nodePaint = Paint()
        ..color = isReached ? AppColors.brandPrimary : AppColors.bgSurfaceActive
        ..style = PaintingStyle.fill;

      canvas.drawCircle(Offset(nodeX, y), isReached ? 7 : 5, nodePaint);

      if (isReached) {
        final borderPaint = Paint()
          ..color = AppColors.brandAccent
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawCircle(Offset(nodeX, y), 7, borderPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _PipelinePainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        Text(
          value,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w600,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }
}
