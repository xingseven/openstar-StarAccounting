import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../data/consumption_model.dart';

const _categories = [
  '餐饮', '购物', '交通', '娱乐', '医疗', '住房',
  '教育', '旅行', '工资', '其他',
];

const _platforms = ['alipay', 'wechat', 'cloudpay'];
const _platformLabels = {'alipay': '支付宝', 'wechat': '微信支付', 'cloudpay': '云闪付'};

class AddTransactionSheet extends StatefulWidget {
  final void Function(Transaction) onSubmit;

  const AddTransactionSheet({super.key, required this.onSubmit});

  @override
  State<AddTransactionSheet> createState() => _AddTransactionSheetState();
}

class _AddTransactionSheetState extends State<AddTransactionSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amountCtrl = TextEditingController();
  final _merchantCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  String _type = 'EXPENSE';
  String _category = '餐饮';
  String _platform = 'alipay';
  DateTime _date = DateTime.now();

  @override
  void dispose() {
    _amountCtrl.dispose();
    _merchantCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) setState(() => _date = picked);
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final tx = Transaction(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      merchant: _merchantCtrl.text.trim(),
      date: _date.toIso8601String(),
      category: _category,
      platform: _platform,
      type: _type,
      amount: double.parse(_amountCtrl.text),
      description: _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
    );
    widget.onSubmit(tx);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 拖动条
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('添加交易',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B))),
            const SizedBox(height: 16),

            // 收入 / 支出 切换
            Row(
              children: ['EXPENSE', 'INCOME'].map((t) {
                final selected = _type == t;
                final label = t == 'EXPENSE' ? '支出' : '收入';
                final color = t == 'EXPENSE'
                    ? const Color(0xFF1d4ed8)
                    : const Color(0xFF16a34a);
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _type = t),
                    child: Container(
                      margin: EdgeInsets.only(right: t == 'EXPENSE' ? 6 : 0),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? color : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected ? color : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Text(
                        label,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: selected ? Colors.white : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 14),

            // 金额
            TextFormField(
              controller: _amountCtrl,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))
              ],
              decoration: _inputDeco('金额', prefixText: '¥ '),
              validator: (v) {
                if (v == null || v.isEmpty) return '请输入金额';
                if (double.tryParse(v) == null) return '金额格式错误';
                return null;
              },
            ),
            const SizedBox(height: 10),

            // 商家
            TextFormField(
              controller: _merchantCtrl,
              decoration: _inputDeco('商家名称'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? '请输入商家名称' : null,
            ),
            const SizedBox(height: 10),

            // 分类 + 平台（并排）
            Row(
              children: [
                Expanded(
                  child: _DropdownField<String>(
                    label: '分类',
                    value: _category,
                    items: _categories,
                    labelOf: (v) => v,
                    onChanged: (v) => setState(() => _category = v!),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _DropdownField<String>(
                    label: '平台',
                    value: _platform,
                    items: _platforms,
                    labelOf: (v) => _platformLabels[v] ?? v,
                    onChanged: (v) => setState(() => _platform = v!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // 日期
            GestureDetector(
              onTap: _pickDate,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_rounded,
                        size: 14, color: Color(0xFF94A3B8)),
                    const SizedBox(width: 8),
                    Text(
                      '${_date.year}-${_date.month.toString().padLeft(2, '0')}-${_date.day.toString().padLeft(2, '0')}',
                      style: const TextStyle(
                          fontSize: 13, color: Color(0xFF475569)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),

            // 备注（可选）
            TextFormField(
              controller: _descCtrl,
              decoration: _inputDeco('备注（可选）'),
              maxLines: 2,
            ),
            const SizedBox(height: 18),

            // 提交按钮
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1d4ed8),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('保存',
                    style: TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDeco(String hint, {String? prefixText}) =>
      InputDecoration(
        hintText: hint,
        prefixText: prefixText,
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF3b82f6), width: 1.5),
        ),
        hintStyle:
            const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13),
      );
}

class _DropdownField<T> extends StatelessWidget {
  final String label;
  final T value;
  final List<T> items;
  final String Function(T) labelOf;
  final void Function(T?) onChanged;

  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.labelOf,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      items: items
          .map((e) => DropdownMenuItem<T>(value: e, child: Text(labelOf(e))))
          .toList(),
      onChanged: onChanged,
      style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
    );
  }
}
