// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use

import 'dart:html' as html;

import 'token_store.dart';

const _tokenStorageKey = 'openstar_access_token';

class WebTokenStore implements TokenStore {
  @override
  Future<void> clearToken() async {
    html.window.localStorage.remove(_tokenStorageKey);
  }

  @override
  Future<String?> readToken() async {
    return html.window.localStorage[_tokenStorageKey];
  }

  @override
  Future<void> writeToken(String token) async {
    html.window.localStorage[_tokenStorageKey] = token;
  }
}

TokenStore createTokenStore() => WebTokenStore();
