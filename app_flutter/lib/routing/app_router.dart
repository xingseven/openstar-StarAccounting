import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/auth/auth_controller.dart';
import '../features/auth/presentation/login_page.dart';
import '../features/dashboard/presentation/dashboard_page.dart';
import '../features/shared/presentation/placeholder_feature_page.dart';
import '../shared/layout/app_shell.dart';
import '../shared/widgets/state_views.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isLogin = location == '/login';
      final isSplash = location == '/splash';

      if (!authState.hasInitialized ||
          authState.status == AuthStatus.initializing) {
        return isSplash ? null : '/splash';
      }

      if (!authState.isAuthenticated) {
        return isLogin ? null : '/login';
      }

      if (isLogin || isSplash) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const Scaffold(
          body: AppLoadingView(message: '正在初始化 Flutter 前端...'),
        ),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => AppShell(
          location: state.uri.path,
          child: child,
        ),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: '/assets',
            builder: (context, state) => const PlaceholderFeaturePage(
              title: '资产页待迁移',
              description: '总览页打通后，下一优先级会继续接入资产页真实列表和编辑能力。',
            ),
          ),
          GoRoute(
            path: '/data',
            builder: (context, state) => const PlaceholderFeaturePage(
              title: '数据页待迁移',
              description: '后续这里会承接账单导入、手动补录、批量操作和规则管理。',
            ),
          ),
        ],
      ),
    ],
  );
});
