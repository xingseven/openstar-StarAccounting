import 'package:flutter/foundation.dart';

class AppEnv {
  const AppEnv({
    required this.apiBaseUrl,
  });

  final String apiBaseUrl;

  static AppEnv fromRuntime() {
    const apiBaseUrl = String.fromEnvironment('API_BASE_URL');
    if (apiBaseUrl.isNotEmpty) {
      return const AppEnv(apiBaseUrl: apiBaseUrl);
    }

    if (kIsWeb) {
      final base = Uri.base;
      final host = base.host.isEmpty ? 'localhost' : base.host;
      return AppEnv(apiBaseUrl: '${base.scheme}://$host:3006');
    }

    return const AppEnv(apiBaseUrl: 'http://127.0.0.1:3006');
  }
}
