import '../../../core/api_client.dart';
import 'consumption_model.dart';

class ConsumptionRepository {
  final ApiClient _client;
  ConsumptionRepository({ApiClient? client}) : _client = client ?? ApiClient();

  /// 拉取看板全量数据
  Future<ConsumptionData> fetchDashboard({
    String dateFilter = 'month', // month | all | custom
    String? year,
    String? month,
    String? platform, // wechat | alipay | cloudpay | ''
  }) async {
    try {
      final params = <String, dynamic>{'dateFilter': dateFilter};
      if (year != null) params['year'] = year;
      if (month != null) params['month'] = month;
      if (platform != null && platform.isNotEmpty) params['platform'] = platform;

      final resp = await _client.get('/api/consumption/dashboard', params: params);
      return ConsumptionData.fromJson(resp.data as Map<String, dynamic>);
    } catch (_) {
      // API 不通时降级到 mock
      return ConsumptionData.mock;
    }
  }

  /// 新增一条交易记录
  Future<void> addTransaction(Transaction tx) async {
    await _client.post('/api/transactions', data: tx.toJson());
  }

  /// 删除一条交易记录
  Future<void> deleteTransaction(String id) async {
    await _client.delete('/api/transactions/$id');
  }
}
