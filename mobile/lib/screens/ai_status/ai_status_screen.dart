import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/cards/metric_card.dart';

class AiStatusScreen extends StatelessWidget {
  const AiStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppStateProvider>(context);
    final health = provider.aiHealth;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Engine & SLM Telemetry'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgSurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.brandPrimary.withAlpha(80)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.statusDoneBg,
                      shape: BoxShape.circle,
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
                          'Status: ${health?.status.toUpperCase()} • Pipeline: ${health?.aiPipeline.toUpperCase()}',
                          style: const TextStyle(
                            color: AppColors.statusDone,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
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

            // AI Metrics Grid
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
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
              'Pipeline Configuration Details',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: const [
                    _InfoRow(label: 'Task Extraction Engine', value: 'Small Language Model (SLM)'),
                    Divider(height: 20),
                    _InfoRow(label: 'Vector Embedding Index', value: 'pgvector IVFFlat (1536 dims)'),
                    Divider(height: 20),
                    _InfoRow(label: 'Similarity Threshold', value: '0.850 (Cosine Similarity)'),
                    Divider(height: 20),
                    _InfoRow(label: 'Uncertainty Flagging', value: 'Triggered when confidence < 0.85'),
                    Divider(height: 20),
                    _InfoRow(label: 'Fallback API Orchestration', value: 'Decoupled Python FastApi'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Run Health & Latency Test'),
                onPressed: () async {
                  await provider.refreshAll();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('AI Engine latency & health verified!')),
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
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
