import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/token_store.dart';
import '../config/app_env.dart';
import 'api_exception.dart';

typedef JsonMap = Map<String, dynamic>;
typedef DataParser<T> = T Function(dynamic data);

final appEnvProvider = Provider<AppEnv>((ref) => AppEnv.fromRuntime());

final apiClientProvider = Provider<ApiClient>((ref) {
  final env = ref.watch(appEnvProvider);
  return ApiClient(ref, env);
});

class ApiClient {
  ApiClient(this.ref, this.env)
      : _dio = Dio(
          BaseOptions(
            baseUrl: env.apiBaseUrl,
            connectTimeout: const Duration(seconds: 12),
            receiveTimeout: const Duration(seconds: 12),
            responseType: ResponseType.json,
            headers: const {
              'content-type': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = ref.read(sessionTokenProvider);
          if (token != null && token.isNotEmpty) {
            options.headers['authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final Ref ref;
  final AppEnv env;
  final Dio _dio;

  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    required DataParser<T> parser,
  }) async {
    try {
      final response = await _dio.get<dynamic>(
        path,
        queryParameters: queryParameters,
      );
      return parser(_extractData(response.data));
    } on DioException catch (error) {
      throw _mapDioException(error);
    }
  }

  Future<T> post<T>(
    String path, {
    dynamic body,
    required DataParser<T> parser,
  }) async {
    try {
      final response = await _dio.post<dynamic>(path, data: body);
      return parser(_extractData(response.data));
    } on DioException catch (error) {
      throw _mapDioException(error);
    }
  }

  dynamic _extractData(dynamic responseData) {
    if (responseData is JsonMap && responseData.containsKey('data')) {
      return responseData['data'];
    }
    throw ApiException(message: '接口返回格式异常');
  }

  ApiException _mapDioException(DioException error) {
    final data = error.response?.data;
    if (data is JsonMap) {
      final detail = data['detail'];
      final message = detail is String && detail.isNotEmpty
          ? detail
          : (data['message'] is String && (data['message'] as String).isNotEmpty
              ? data['message'] as String
              : '请求失败');
      return ApiException(
        message: message,
        statusCode: error.response?.statusCode,
        code: data['code'] is int ? data['code'] as int : null,
      );
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return ApiException(
        message: '请求超时，请检查后端服务是否已启动',
        statusCode: error.response?.statusCode,
      );
    }

    return ApiException(
      message: error.message ?? '请求失败',
      statusCode: error.response?.statusCode,
    );
  }
}
