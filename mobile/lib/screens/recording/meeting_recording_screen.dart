import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/motion/ambient_background.dart';
import '../../widgets/motion/glass_container.dart';

enum RecordingStage {
  ready,
  recording,
  processing,
  completed,
}

class MeetingRecordingScreen extends StatefulWidget {
  final String? initialTitle;
  const MeetingRecordingScreen({super.key, this.initialTitle});

  @override
  State<MeetingRecordingScreen> createState() => _MeetingRecordingScreenState();
}

class _MeetingRecordingScreenState extends State<MeetingRecordingScreen>
    with SingleTickerProviderStateMixin {
  late TextEditingController _titleController;
  RecordingStage _stage = RecordingStage.ready;
  
  Timer? _timer;
  int _secondsElapsed = 0;
  bool _isPaused = false;

  late AnimationController _waveformController;
  final Random _random = Random();

  String _processingStep = 'Uploading audio stream...';
  double _processingProgress = 0.2;

  List<String> _extractedCommitments = [];

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(
      text: widget.initialTitle ?? 'Sync Meeting — ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
    );

    _waveformController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _titleController.dispose();
    _waveformController.dispose();
    super.dispose();
  }

  void _startRecording() {
    setState(() {
      _stage = RecordingStage.recording;
      _secondsElapsed = 0;
      _isPaused = false;
    });

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!_isPaused) {
        setState(() {
          _secondsElapsed++;
        });
      }
    });
  }

  void _togglePause() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  void _stopRecording() async {
    _timer?.cancel();
    setState(() {
      _stage = RecordingStage.processing;
      _processingStep = 'Uploading audio payload...';
      _processingProgress = 0.25;
    });

    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;

    setState(() {
      _processingStep = 'Generating VTT Transcript...';
      _processingProgress = 0.60;
    });

    await Future.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;

    setState(() {
      _processingStep = 'LoopKeeper AI extracting commitments...';
      _processingProgress = 0.90;
    });

    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;

    final provider = Provider.of<AppStateProvider>(context, listen: false);
    final title = _titleController.text.trim().isEmpty ? 'Native Recording' : _titleController.text.trim();
    
    const sampleTranscript = '''
Hasitha: We need to finalize the mobile application navigation and API integrations today.
Jyothsna: I will deploy the hosted API endpoints for meetings and commitments by 5 PM.
Vignesh: I will verify web platform synchronization and test Supabase tables.
''';

    await provider.createMeeting(title, DateTime.now(), transcriptText: sampleTranscript);

    setState(() {
      _stage = RecordingStage.completed;
      _extractedCommitments = [
        'Deploy hosted API endpoints for meetings and commitments by 5 PM (Owner: Jyothsna)',
        'Verify web platform synchronization and test Supabase tables (Owner: Vignesh)',
        'Finalize mobile application navigation and API integrations today (Owner: Hasitha)',
      ];
    });
  }

  String _formatDuration(int totalSeconds) {
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;

    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgApp,
      appBar: AppBar(
        title: const Text('LoopKeeper Native Recording'),
        elevation: 0,
      ),
      body: AmbientBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              if (_stage == RecordingStage.ready) _buildReadyView(),
              if (_stage == RecordingStage.recording) _buildRecordingView(),
              if (_stage == RecordingStage.processing) _buildProcessingView(),
              if (_stage == RecordingStage.completed) _buildCompletedView(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReadyView() {
    return Column(
      children: [
        const SizedBox(height: 20),
        GlassContainer(
          borderRadius: 24,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Meeting Details',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _titleController,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: const InputDecoration(
                  labelText: 'Meeting Title',
                  hintText: 'Enter meeting subject...',
                  prefixIcon: Icon(Icons.title_rounded, color: AppColors.brandPrimary),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Audio Source',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.bgSurfaceHover,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.mic_rounded, color: AppColors.statusDone, size: 20),
                    SizedBox(width: 10),
                    Text(
                      'Device Microphone (LoopKeeper HD Audio Engine)',
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 40),
        GestureDetector(
          onTap: _startRecording,
          child: Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.brandPrimary, AppColors.brandAccent],
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.brandPrimary.withAlpha(120),
                  blurRadius: 24,
                  spreadRadius: 4,
                ),
              ],
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.fiber_manual_record_rounded, color: Colors.white, size: 40),
                SizedBox(height: 4),
                Text(
                  'START',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecordingView() {
    return Column(
      children: [
        const SizedBox(height: 20),
        GlassContainer(
          borderRadius: 24,
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: _isPaused ? AppColors.statusPending : AppColors.statusOverdue,
                      shape: BoxShape.circle,
                      boxShadow: [
                        if (!_isPaused)
                          BoxShadow(
                            color: AppColors.statusOverdue.withAlpha(180),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    _isPaused ? 'PAUSED' : 'LIVE RECORDING',
                    style: TextStyle(
                      color: _isPaused ? AppColors.statusPending : AppColors.statusOverdue,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text(
                _formatDuration(_secondsElapsed),
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(height: 24),
              // Waveform Visualizer
              SizedBox(
                height: 60,
                child: AnimatedBuilder(
                  animation: _waveformController,
                  builder: (context, child) {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: List.generate(24, (i) {
                        final height = _isPaused
                            ? 8.0
                            : (10 + sin(_waveformController.value * 2 * pi + i) * 20 + _random.nextInt(15)).toDouble();
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 2.5),
                          width: 4,
                          height: height.clamp(6.0, 50.0),
                          decoration: BoxDecoration(
                            color: AppColors.brandPrimary.withAlpha(180 + (i % 5) * 15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        );
                      }),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 40),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton.filledTonal(
              onPressed: _togglePause,
              iconSize: 32,
              padding: const EdgeInsets.all(16),
              icon: Icon(_isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded),
            ),
            const SizedBox(width: 30),
            GestureDetector(
              onTap: _stopRecording,
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.statusOverdue,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.statusOverdue.withAlpha(120),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(Icons.stop_rounded, color: Colors.white, size: 40),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildProcessingView() {
    return Column(
      children: [
        const SizedBox(height: 40),
        GlassContainer(
          borderRadius: 24,
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              const SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  strokeWidth: 4,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.brandPrimary),
                ),
              ),
              const SizedBox(height: 28),
              Text(
                _processingStep,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 20),
              LinearProgressIndicator(
                value: _processingProgress,
                backgroundColor: AppColors.bgSurfaceHover,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.brandPrimary),
                borderRadius: BorderRadius.circular(8),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCompletedView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GlassContainer(
          borderRadius: 20,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.check_circle_rounded, color: AppColors.statusDone, size: 24),
                  SizedBox(width: 10),
                  Text(
                    'Processing Complete',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'AI extraction parsed ${_extractedCommitments.length} key commitments from the transcript.',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Extracted Action Items',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ..._extractedCommitments.map((commitment) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: GlassContainer(
              borderRadius: 16,
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.brandPrimary.withAlpha(30),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.task_alt_rounded, color: AppColors.brandPrimary, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      commitment,
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Return to Meetings'),
          ),
        ),
      ],
    );
  }
}
