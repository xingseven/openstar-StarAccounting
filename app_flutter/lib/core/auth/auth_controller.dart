import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import 'token_store.dart';

enum AuthStatus {
  initializing,
  unauthenticated,
  authenticating,
  authenticated,
}

class AppUser {
  const AppUser({
    required this.id,
    required this.email,
    required this.name,
    this.defaultAccountId,
  });

  final String id;
  final String email;
  final String name;
  final String? defaultAccountId;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      defaultAccountId: json['defaultAccountId'] as String?,
    );
  }
}

class AuthState {
  const AuthState({
    required this.status,
    this.user,
    this.accessToken,
    this.errorMessage,
    this.hasInitialized = false,
  });

  const AuthState.initial()
      : status = AuthStatus.initializing,
        user = null,
        accessToken = null,
        errorMessage = null,
        hasInitialized = false;

  final AuthStatus status;
  final AppUser? user;
  final String? accessToken;
  final String? errorMessage;
  final bool hasInitialized;

  bool get isAuthenticated =>
      status == AuthStatus.authenticated && accessToken != null && user != null;

  AuthState copyWith({
    AuthStatus? status,
    AppUser? user,
    String? accessToken,
    String? errorMessage,
    bool clearError = false,
    bool? hasInitialized,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
      hasInitialized: hasInitialized ?? this.hasInitialized,
    );
  }
}

final authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState.initial();

  Future<void> initialize() async {
    if (state.hasInitialized) {
      return;
    }

    final tokenStore = ref.read(tokenStoreProvider);
    final token = await tokenStore.readToken();
    if (token == null || token.isEmpty) {
      ref.read(sessionTokenProvider.notifier).clear();
      state = const AuthState(
        status: AuthStatus.unauthenticated,
        hasInitialized: true,
      );
      return;
    }

    ref.read(sessionTokenProvider.notifier).setToken(token);
    try {
      final user = await _fetchCurrentUser();
      state = AuthState(
        status: AuthStatus.authenticated,
        user: user,
        accessToken: token,
        hasInitialized: true,
      );
    } catch (_) {
      await tokenStore.clearToken();
      ref.read(sessionTokenProvider.notifier).clear();
      state = const AuthState(
        status: AuthStatus.unauthenticated,
        hasInitialized: true,
      );
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(
      status: AuthStatus.authenticating,
      clearError: true,
    );

    try {
      final result = await ref.read(apiClientProvider).post<_LoginPayload>(
            '/api/auth/login',
            body: {
              'email': email,
              'password': password,
            },
            parser: (data) =>
                _LoginPayload.fromJson(data as Map<String, dynamic>),
          );

      await ref.read(tokenStoreProvider).writeToken(result.accessToken);
      ref.read(sessionTokenProvider.notifier).setToken(result.accessToken);
      state = AuthState(
        status: AuthStatus.authenticated,
        user: result.user,
        accessToken: result.accessToken,
        hasInitialized: true,
      );
      return true;
    } catch (error) {
      ref.read(sessionTokenProvider.notifier).clear();
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: '$error',
        hasInitialized: true,
      );
      return false;
    }
  }

  Future<void> logout() async {
    await ref.read(tokenStoreProvider).clearToken();
    ref.read(sessionTokenProvider.notifier).clear();
    state = const AuthState(
      status: AuthStatus.unauthenticated,
      hasInitialized: true,
    );
  }

  Future<AppUser> _fetchCurrentUser() {
    return ref.read(apiClientProvider).get<AppUser>(
          '/api/auth/me',
          parser: (data) {
            final map = data as Map<String, dynamic>;
            final userMap = map['user'] as Map<String, dynamic>? ??
                const <String, dynamic>{};
            return AppUser.fromJson(userMap);
          },
        );
  }
}

class _LoginPayload {
  const _LoginPayload({
    required this.accessToken,
    required this.user,
  });

  final String accessToken;
  final AppUser user;

  factory _LoginPayload.fromJson(Map<String, dynamic> json) {
    return _LoginPayload(
      accessToken: json['accessToken'] as String? ?? '',
      user: AppUser.fromJson(
        json['user'] as Map<String, dynamic>? ?? const <String, dynamic>{},
      ),
    );
  }
}
