import 'token_store.dart';

String? _memoryToken;

class MemoryTokenStore implements TokenStore {
  @override
  Future<void> clearToken() async {
    _memoryToken = null;
  }

  @override
  Future<String?> readToken() async => _memoryToken;

  @override
  Future<void> writeToken(String token) async {
    _memoryToken = token;
  }
}

TokenStore createTokenStore() => MemoryTokenStore();
