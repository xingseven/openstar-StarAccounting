import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/api_client.dart';
import '../../data/consumption_model.dart';

// ─── 数据模型 ──────────────────────────────────────────────────
class _AiInsight {
  final String type; // info | warning | success
  final String title;
  final String description;
  const _AiInsight({required this.type, required this.title, required this.description});

  factory _AiInsight.fromJson(Map<String, dynamic> j) => _AiInsight(
        type: j['type'] as String,
        title: j['title'] as String,
        description: j['description'] as String,
      );
}

class _AiSuggestion {
  final String title;
  final String description;
  final String priority; // high | medium | low
  const _AiSuggestion({required this.title, required this.description, required this.priority});

  factory _AiSuggestion.fromJson(Map<String, dynamic> j) => _AiSuggestion(
        title: j['title'] as String,
        description: j['description'] as String,
        priority: j['priority'] as String,
      );
}

class _AiStats {
  final double totalExpense;
  final double totalIncome;
  final double avgDaily;
  final int transactionCount;
  final String topCategory;
  final double topCategoryPercent;
  final double expenseChangePercent;

  const _AiStats({
    required this.totalExpense,
    required this.totalIncome,
    required this.avgDaily,
    required this.transactionCount,
    required this.topCategory,
    required this.topCategoryPercent,
    required this.expenseChangePercent,
  });

  factory _AiStats.fromJson(Map<String, dynamic> j) => _AiStats(
        totalExpense: (j['totalExpense'] as num?)?.toDouble() ?? 0,
        totalIncome: (j['totalIncome'] as num?)?.toDouble() ?? 0,
        avgDaily: (j['avgDaily'] as num?)?.toDouble() ?? 0,
        transactionCount: (j['transactionCount'] as num?)?.toInt() ?? 0,
        topCategory: (j['topCategory'] ?? '') as String,
        topCategoryPercent: (j['topCategoryPercent'] as num?)?.toDouble() ?? 0,
        expenseChangePercent: (j['expenseChangePercent'] as num?)?.toDouble() ?? 0,
      );
}

class _AnalysisResult {
  final String summary;
  final List<_AiInsight> insights;
  final List<_AiSuggestion> suggestions;
  final _AiStats stats;

  const _AnalysisResult({
    required this.summary,
    required this.insights,
    required this.suggestions,
    required this.stats,
  });

  factory _AnalysisResult.fromJson(Map<String, dynamic> j) => _AnalysisResult(
        summary: j['summary'] as String,
        insights: (j['insights'] as List? ?? [])
            .map((e) => _AiInsight.fromJson(e as Map<String, dynamic>))
            .toList(),
        suggestions: (j['suggestions'] as List? ?? [])
            .map((e) => _AiSuggestion.fromJson(e as Map<String, dynamic>))
            .toList(),
        stats: _AiStats.fromJson((j['stats'] as Map<String, dynamic>?) ?? {}),
      );
}

// ─── 打字机效果 ────────────────────────────────────────────────
class _TypingText extends StatefulWidget {
  final String text;
  final TextStyle style;
  static const int speed = 18; // ms per char

  const _TypingText({required this.text, required this.style});

  @override
  State<_TypingText> createState() => _TypingTextState();
}

class _TypingTextState extends State<_TypingText> {
  String _displayed = '';
  Timer? _timer;
  int _index = 0;

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void didUpdateWidget(_TypingText old) {
    super.didUpdateWidget(old);
    if (old.text != widget.text) {
      _timer?.cancel();
      _displayed = '';
      _index = 0;
      _start();
    }
  }

  void _start() {
    _timer = Timer.periodic(Duration(milliseconds: _TypingText.speed), (_) {
      if (_index <= widget.text.length) {
        setState(() => _displayed = widget.text.substring(0, _index++));
      } else {
        _timer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      Text(_displayed, style: widget.style);
}

// ─── AI 分析卡片（按钮 + 对话框）─────────────────────────────
class AiAnalysisCard extends StatefulWidget {
  final List<Transaction> transactions;

  const AiAnalysisCard({super.key, required this.transactions});

  @override
  State<AiAnalysisCard> createState() => _AiAnalysisCardState();
}

class _AiAnalysisCardState extends State<AiAnalysisCard> {
  bool _loading = false;
  _AnalysisResult? _result;
  String? _error;

  Future<void> _analyze() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final payload = {
        'transactions': widget.transactions.map((t) => {
          'id': t.id,
          'amount': t.amount,
          'category': t.category,
          'platform': t.platform,
          'date': t.date,
          'merchant': t.merchant,
          'description': t.description ?? '',
        }).toList(),
      };
      final resp = await ApiClient().post('/api/ai/analysis', data: payload);
      final result = _AnalysisResult.fromJson(resp.data as Map<String, dynamic>);
      if (mounted) setState(() => _result = result);
    } catch (e) {
      if (mounted) setState(() => _error = 'AI 分析失败，请稍后重试');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showDialog(BuildContext context) {
    if (_result == null && !_loading) _analyze();
    showDialog(
      context: context,
      builder: (_) => _AiDialog(
        loading: _loading,
        result: _result,
        error: _error,
        onRetry: () {
          Navigator.pop(context);
          _analyze();
          Future.delayed(const Duration(milliseconds: 100), () {
            if (!mounted) return;
            // ignore: use_build_context_synchronously
            _showDialog(context);
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: widget.transactions.isEmpty
            ? null
            : () => _showDialog(context),
        icon: _loading
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.auto_awesome_rounded, size: 16),
        label: const Text('AI 智能分析',
            style: TextStyle(fontWeight: FontWeight.w600)),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1d4ed8),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
      ),
    );
  }
}

// ─── 分析结果对话框 ────────────────────────────────────────────
class _AiDialog extends StatelessWidget {
  final bool loading;
  final _AnalysisResult? result;
  final String? error;
  final VoidCallback onRetry;

  const _AiDialog({
    required this.loading,
    required this.result,
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 600),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(30),
              blurRadius: 40,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 标题栏
            Container(
              padding: const EdgeInsets.fromLTRB(20, 18, 16, 14),
              decoration: const BoxDecoration(
                color: Color(0xFF1d4ed8),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.auto_awesome_rounded,
                      color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text('AI 智能分析',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w700)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded,
                        color: Colors.white70, size: 20),
                    onPressed: () => Navigator.pop(context),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),
            // 内容区
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: _buildContent(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (loading) return _loadingSkeleton();
    if (error != null) return _errorView();
    if (result == null) return _loadingSkeleton();
    return _analysisView(result!);
  }

  Widget _loadingSkeleton() => Column(
        children: List.generate(
          4,
          (i) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            height: i == 0 ? 80 : 50,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      );

  Widget _errorView() => Center(
        child: Column(
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 40, color: Color(0xFFef4444)),
            const SizedBox(height: 10),
            Text(error ?? '分析失败',
                style: const TextStyle(
                    fontSize: 13, color: Color(0xFF64748B))),
            const SizedBox(height: 14),
            ElevatedButton(
              onPressed: onRetry,
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1d4ed8),
                  foregroundColor: Colors.white),
              child: const Text('重试'),
            ),
          ],
        ),
      );

  Widget _analysisView(_AnalysisResult r) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 统计摘要行
          _StatsRow(stats: r.stats),
          const SizedBox(height: 16),
          // 打字机摘要
          const Text('分析摘要',
              style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1E293B))),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: _TypingText(
              text: r.summary,
              style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF1E3A8A),
                  height: 1.6),
            ),
          ),
          const SizedBox(height: 16),
          // Insights
          if (r.insights.isNotEmpty) ...[
            const Text('关键洞察',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B))),
            const SizedBox(height: 8),
            ...r.insights.map((i) => _InsightRow(insight: i)),
            const SizedBox(height: 12),
          ],
          // Suggestions
          if (r.suggestions.isNotEmpty) ...[
            const Text('优化建议',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B))),
            const SizedBox(height: 8),
            ...r.suggestions.map((s) => _SuggestionRow(suggestion: s)),
          ],
        ],
      );
}

class _StatsRow extends StatelessWidget {
  final _AiStats stats;
  const _StatsRow({required this.stats});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatChip(label: '日均支出', value: '¥${stats.avgDaily.toStringAsFixed(0)}'),
        const SizedBox(width: 8),
        _StatChip(label: '主要分类', value: stats.topCategory),
        const SizedBox(width: 8),
        _StatChip(
          label: '环比',
          value: '${stats.expenseChangePercent >= 0 ? '+' : ''}${stats.expenseChangePercent.toStringAsFixed(1)}%',
          valueColor: stats.expenseChangePercent > 0
              ? const Color(0xFFef4444)
              : const Color(0xFF16a34a),
        ),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  const _StatChip({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(
                    fontSize: 9, color: Color(0xFF94A3B8))),
            const SizedBox(height: 2),
            Text(value,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: valueColor ?? const Color(0xFF1E293B)),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

class _InsightRow extends StatelessWidget {
  final _AiInsight insight;
  const _InsightRow({required this.insight});

  Color get _bgColor {
    switch (insight.type) {
      case 'warning':
        return const Color(0xFFFFF7ED);
      case 'success':
        return const Color(0xFFF0FDF4);
      default:
        return const Color(0xFFEFF6FF);
    }
  }

  Color get _iconColor {
    switch (insight.type) {
      case 'warning':
        return const Color(0xFFF97316);
      case 'success':
        return const Color(0xFF16a34a);
      default:
        return const Color(0xFF1d4ed8);
    }
  }

  IconData get _icon {
    switch (insight.type) {
      case 'warning':
        return Icons.warning_amber_rounded;
      case 'success':
        return Icons.check_circle_rounded;
      default:
        return Icons.info_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: _bgColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(_icon, size: 16, color: _iconColor),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(insight.title,
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _iconColor)),
                const SizedBox(height: 2),
                Text(insight.description,
                    style: const TextStyle(
                        fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SuggestionRow extends StatelessWidget {
  final _AiSuggestion suggestion;
  const _SuggestionRow({required this.suggestion});

  Color get _priorityColor {
    switch (suggestion.priority) {
      case 'high':
        return const Color(0xFFef4444);
      case 'medium':
        return const Color(0xFFF59E0B);
      default:
        return const Color(0xFF94A3B8);
    }
  }

  String get _priorityLabel {
    switch (suggestion.priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      default:
        return '低';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
            decoration: BoxDecoration(
              color: _priorityColor.withAlpha(20),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(_priorityLabel,
                style: TextStyle(
                    fontSize: 9,
                    color: _priorityColor,
                    fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(suggestion.title,
                    style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B))),
                const SizedBox(height: 2),
                Text(suggestion.description,
                    style: const TextStyle(
                        fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
