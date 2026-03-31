import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'token_store_stub.dart' if (dart.library.html) 'token_store_web.dart' as impl;

abstract class TokenStore {
  Future<String?> readToken();

  Future<void> writeToken(String token);

  Future<void> clearToken();
}

final tokenStoreProvider = Provider<TokenStore>((ref) => impl.createTokenStore());

final sessionTokenProvider =
    NotifierProvider<SessionTokenController, String?>(SessionTokenController.new);

class SessionTokenController extends Notifier<String?> {
  @override
  String? build() => null;

  void setToken(String? token) {
    state = token;
  }

  void clear() {
    state = null;
  }
}
