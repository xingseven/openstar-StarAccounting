import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'consumption_provider.dart';
import 'widgets/summary_cards.dart';
import 'widgets/trend_chart.dart';
import 'widgets/platform_pie_chart.dart';
import 'widgets/merchant_bar_chart.dart';
import 'widgets/transaction_list.dart';
import 'widgets/add_transaction_sheet.dart';
import 'widgets/pareto_chart.dart';
import 'widgets/stacked_bar_chart.dart';
import 'widgets/calendar_heatmap.dart';
import 'widgets/spending_style_card.dart';
import 'widgets/budget_variance_card.dart';
import 'widgets/recurring_merchants_card.dart';
import 'widgets/large_expenses_card.dart';
import 'widgets/ai_analysis_card.dart';

class ConsumptionPage extends ConsumerStatefulWidget {
  const ConsumptionPage({super.key});

  @override
  ConsumerState<ConsumptionPage> createState() => _ConsumptionPageState();
}

class _ConsumptionPageState extends ConsumerState<ConsumptionPage> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _showAddSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddTransactionSheet(
        onSubmit: (tx) =>
            ref.read(consumptionProvider.notifier).addTransaction(tx),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(consumptionProvider);
    final notifier = ref.read(consumptionProvider.notifier);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: notifier.refresh,
        color: const Color(0xFF1d4ed8),
        child: CustomScrollView(
          controller: _scrollCtrl,
          slivers: [
            // ── AppBar ────────────────────────────────────────
            SliverAppBar(
              floating: true,
              snap: true,
              backgroundColor: Colors.white,
              elevation: 0,
              titleSpacing: 16,
              title: const Text('消费看板',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1E293B))),
              actions: [
                if (state.usingMock)
                  const Padding(
                    padding: EdgeInsets.only(right: 8),
                    child: Chip(
                      label: Text('演示数据',
                          style:
                              TextStyle(fontSize: 10, color: Color(0xFF1d4ed8))),
                      backgroundColor: Color(0xFFEFF6FF),
                      padding: EdgeInsets.zero,
                      side: BorderSide.none,
                    ),
                  ),
                IconButton(
                  icon: const Icon(Icons.refresh_rounded,
                      color: Color(0xFF64748B)),
                  onPressed: notifier.refresh,
                ),
                const SizedBox(width: 4),
              ],
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(1),
                child: Container(height: 1, color: const Color(0xFFF1F5F9)),
              ),
            ),

            // ── 筛选栏 ────────────────────────────────────────
            SliverToBoxAdapter(
              child: _FilterBar(
                filter: state.filter,
                onDateFilterChange: notifier.setDateFilter,
                onPlatformChange: notifier.setPlatform,
                onSearchChange: notifier.setSearchTerm,
                onCustomPeriodChange: notifier.setCustomPeriod,
                searchCtrl: _searchCtrl,
                filteredCount: state.filteredTransactions.length,
              ),
            ),

            // ── 主内容 ────────────────────────────────────────
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 100),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 14),

                  // 汇总卡片
                  SummaryCards(
                      summary: state.data.summary, loading: state.loading),
                  const SizedBox(height: 16),

                  // AI 分析按钮
                  AiAnalysisCard(transactions: state.data.transactions),
                  const SizedBox(height: 12),

                  // 收支趋势
                  _ChartCard(
                    title: '收支趋势',
                    subtitle: '近30天',
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        _LegendDot(color: Color(0xFF1d4ed8), label: '支出'),
                        SizedBox(width: 10),
                        _LegendDot(color: Color(0xFF16a34a), label: '收入'),
                      ],
                    ),
                    child: state.loading
                        ? const _ChartSkeleton()
                        : TrendChart(trend: state.data.trend),
                  ),
                  const SizedBox(height: 12),

                  // 日历热力图
                  _ChartCard(
                    title: '消费热力图',
                    subtitle: '按日期',
                    child: state.loading
                        ? const _ChartSkeleton(height: 160)
                        : CalendarHeatmap(days: state.data.calendar),
                  ),
                  const SizedBox(height: 12),

                  // 平台分布 + 收支占比
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _ChartCard(
                          title: '平台分布',
                          child: state.loading
                              ? const _ChartSkeleton(height: 130)
                              : PlatformPieChart(
                                  items: state.data.platformDistribution),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _ChartCard(
                          title: '收支占比',
                          child: state.loading
                              ? const _ChartSkeleton(height: 130)
                              : PlatformPieChart(
                                  items: state.data.incomeExpense),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // 分类堆叠柱图
                  _ChartCard(
                    title: '分类趋势',
                    subtitle: '按日期堆叠',
                    child: state.loading
                        ? const _ChartSkeleton(height: 220)
                        : StackedBarChart(items: state.data.stackedBar),
                  ),
                  const SizedBox(height: 12),

                  // 商家排行
                  _ChartCard(
                    title: '商家排行',
                    subtitle: 'Top 8',
                    child: state.loading
                        ? const _ChartSkeleton(height: 220)
                        : MerchantBarChart(merchants: state.data.merchants),
                  ),
                  const SizedBox(height: 12),

                  // 帕累托图
                  _ChartCard(
                    title: '帕累托分析',
                    subtitle: '分类占比 80/20',
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        _LegendDot(color: Color(0xFF1d4ed8), label: '金额'),
                        SizedBox(width: 10),
                        _LegendDot(color: Color(0xFFF97316), label: '累计%'),
                      ],
                    ),
                    child: state.loading
                        ? const _ChartSkeleton(height: 210)
                        : ParetoChart(items: state.data.pareto),
                  ),
                  const SizedBox(height: 16),

                  // ── Insights 分析区 ────────────────────────
                  const _SectionTitle(title: '深度洞察', icon: Icons.insights_rounded),
                  const SizedBox(height: 10),

                  // 消费风格
                  _ChartCard(
                    title: '消费风格',
                    child: state.loading
                        ? const _ChartSkeleton(height: 200)
                        : SpendingStyleCard(
                            items: state.data.insights.spendingStyle,
                            necessitySplit: state.data.insights.necessitySplit,
                            transactionNature:
                                state.data.insights.transactionNature,
                          ),
                  ),
                  const SizedBox(height: 12),

                  // 预算对比
                  _ChartCard(
                    title: '预算对比',
                    subtitle: '基准线 = 100%',
                    child: state.loading
                        ? const _ChartSkeleton(height: 160)
                        : BudgetVarianceCard(
                            items: state.data.insights.budgetVariance),
                  ),
                  const SizedBox(height: 12),

                  // 周期性商家 + 大额支出（横排）
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _ChartCard(
                          title: '周期性消费',
                          child: state.loading
                              ? const _ChartSkeleton(height: 160)
                              : RecurringMerchantsCard(
                                  merchants:
                                      state.data.insights.recurringMerchants),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _ChartCard(
                          title: '大额支出',
                          child: state.loading
                              ? const _ChartSkeleton(height: 160)
                              : LargeExpensesCard(
                                  items: state.data.insights.largeExpenses),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // ── 交易流水 ───────────────────────────────
                  Row(
                    children: [
                      const Text('交易流水',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1E293B))),
                      const SizedBox(width: 6),
                      Text('${state.filteredTransactions.length} 笔',
                          style: const TextStyle(
                              fontSize: 12, color: Color(0xFF94A3B8))),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    child: TransactionList(
                      transactions: state.filteredTransactions,
                      loading: state.loading,
                      onDelete: (tx) => notifier.deleteTransaction(tx.id),
                    ),
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),

      // FAB
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddSheet,
        backgroundColor: const Color(0xFF1d4ed8),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('添加交易',
            style: TextStyle(fontWeight: FontWeight.w600)),
        elevation: 2,
      ),
    );
  }
}

// ─── 筛选栏 ────────────────────────────────────────────────────
class _FilterBar extends StatefulWidget {
  final ConsumptionFilter filter;
  final void Function(String) onDateFilterChange;
  final void Function(String) onPlatformChange;
  final void Function(String) onSearchChange;
  final void Function({required String year, required String month})
      onCustomPeriodChange;
  final TextEditingController searchCtrl;
  final int filteredCount;

  const _FilterBar({
    required this.filter,
    required this.onDateFilterChange,
    required this.onPlatformChange,
    required this.onSearchChange,
    required this.onCustomPeriodChange,
    required this.searchCtrl,
    required this.filteredCount,
  });

  @override
  State<_FilterBar> createState() => _FilterBarState();
}

class _FilterBarState extends State<_FilterBar> {
  bool _showCustom = false;
  String _customYear = DateTime.now().year.toString();
  String _customMonth = DateTime.now().month.toString().padLeft(2, '0');

  void _applyCustom() {
    widget.onCustomPeriodChange(year: _customYear, month: _customMonth);
    setState(() => _showCustom = false);
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final years =
        List.generate(5, (i) => (now.year - i).toString());
    final months =
        List.generate(12, (i) => (i + 1).toString().padLeft(2, '0'));

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 搜索框
          TextField(
            controller: widget.searchCtrl,
            onChanged: widget.onSearchChange,
            decoration: _searchDeco(),
          ),
          const SizedBox(height: 8),

          // 时间 + 平台
          Row(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _FilterChip(
                        label: '本月',
                        selected: widget.filter.dateFilter == 'month',
                        onTap: () {
                          widget.onDateFilterChange('month');
                          setState(() => _showCustom = false);
                        },
                      ),
                      const SizedBox(width: 6),
                      _FilterChip(
                        label: '全部',
                        selected: widget.filter.dateFilter == 'all',
                        onTap: () {
                          widget.onDateFilterChange('all');
                          setState(() => _showCustom = false);
                        },
                      ),
                      const SizedBox(width: 6),
                      _FilterChip(
                        label: '自定义',
                        selected: widget.filter.dateFilter == 'custom',
                        onTap: () => setState(() => _showCustom = !_showCustom),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _PlatformSelector(
                value: widget.filter.platform,
                onChanged: widget.onPlatformChange,
              ),
            ],
          ),

          // 自定义时间段展开面板
          if (_showCustom) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      // 年份
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _customYear,
                          decoration: _compactDeco('年份'),
                          items: years
                              .map((y) => DropdownMenuItem(
                                  value: y, child: Text(y)))
                              .toList(),
                          onChanged: (v) =>
                              setState(() => _customYear = v!),
                        ),
                      ),
                      const SizedBox(width: 10),
                      // 月份
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _customMonth,
                          decoration: _compactDeco('月份'),
                          items: months
                              .map((m) => DropdownMenuItem(
                                  value: m, child: Text('$m 月')))
                              .toList(),
                          onChanged: (v) =>
                              setState(() => _customMonth = v!),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: _applyCustom,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1d4ed8),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          elevation: 0,
                        ),
                        child: const Text('确认',
                            style: TextStyle(fontSize: 13)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  InputDecoration _searchDeco() => InputDecoration(
        hintText: '搜索商家或分类',
        hintStyle: const TextStyle(fontSize: 13, color: Color(0xFFCBD5E1)),
        prefixIcon: const Icon(Icons.search_rounded,
            size: 18, color: Color(0xFFCBD5E1)),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(vertical: 0),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide:
                const BorderSide(color: Color(0xFF3b82f6), width: 1.5)),
      );

  InputDecoration _compactDeco(String label) => InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      );
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip(
      {required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1d4ed8) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : const Color(0xFF64748B))),
      ),
    );
  }
}

class _PlatformSelector extends StatelessWidget {
  final String value;
  final void Function(String) onChanged;

  const _PlatformSelector({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return DropdownButton<String>(
      value: value.isEmpty ? '' : value,
      underline: const SizedBox(),
      isDense: true,
      style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
      items: const [
        DropdownMenuItem(value: '', child: Text('全部平台')),
        DropdownMenuItem(value: 'alipay', child: Text('支付宝')),
        DropdownMenuItem(value: 'wechat', child: Text('微信支付')),
        DropdownMenuItem(value: 'cloudpay', child: Text('云闪付')),
      ],
      onChanged: (v) => onChanged(v ?? ''),
    );
  }
}

// ─── 图表卡片容器 ───────────────────────────────────────────────
class _ChartCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final Widget child;

  const _ChartCard({
    required this.title,
    this.subtitle,
    this.trailing,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(title,
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1E293B))),
              if (subtitle != null) ...[
                const SizedBox(width: 6),
                Text(subtitle!,
                    style: const TextStyle(
                        fontSize: 11, color: Color(0xFF94A3B8))),
              ],
              const Spacer(),
              if (trailing != null) trailing!,
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _ChartSkeleton extends StatelessWidget {
  final double height;
  const _ChartSkeleton({this.height = 180});

  @override
  Widget build(BuildContext context) => Container(
        height: height,
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
        ),
      );
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 3),
        Text(label,
            style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final IconData icon;
  const _SectionTitle({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF1d4ed8)),
        const SizedBox(width: 6),
        Text(title,
            style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1E293B))),
      ],
    );
  }
}
