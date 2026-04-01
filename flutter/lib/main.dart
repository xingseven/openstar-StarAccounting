import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'features/consumption/presentation/consumption_page.dart';
import 'features/dashboard/presentation/dashboard_page.dart';

void main() {
  runApp(const ProviderScope(child: StarAccountingApp()));
}

final _router = GoRouter(
  initialLocation: '/dashboard',
  routes: [
    ShellRoute(
      builder: (context, state, child) => _AppShell(child: child),
      routes: [
        GoRoute(path: '/dashboard', builder: (_, __) => const DashboardPage()),
        GoRoute(
          path: '/consumption',
          builder: (_, __) => const ConsumptionPage(),
        ),
        GoRoute(
          path: '/savings',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u50a8\u84c4\u76ee\u6807'),
        ),
        GoRoute(
          path: '/assets',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u8d44\u4ea7\u7ba1\u7406'),
        ),
        GoRoute(
          path: '/loans',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u8d37\u6b3e\u7ba1\u7406'),
        ),
        GoRoute(
          path: '/budgets',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u9884\u7b97\u7ba1\u7406'),
        ),
        GoRoute(
          path: '/connections',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u8bbe\u5907\u8fde\u63a5'),
        ),
        GoRoute(
          path: '/ai',
          builder: (_, __) =>
              const _PlaceholderPage(title: 'AI \u6a21\u578b\u914d\u7f6e'),
        ),
        GoRoute(
          path: '/data',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u6570\u636e\u7ba1\u7406'),
        ),
        GoRoute(
          path: '/themes',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u4e3b\u9898\u8bbe\u7f6e'),
        ),
        GoRoute(
          path: '/settings',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u7cfb\u7edf\u8bbe\u7f6e'),
        ),
        GoRoute(
          path: '/about',
          builder: (_, __) =>
              const _PlaceholderPage(title: '\u5173\u4e8e\u9879\u76ee'),
        ),
      ],
    ),
  ],
);

class StarAccountingApp extends StatelessWidget {
  const StarAccountingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: '\u661f\u4f1a\u8ba1',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1d4ed8),
          brightness: Brightness.light,
        ),
        fontFamily: 'NotoSansSC',
        textTheme: const TextTheme(
          bodyMedium: TextStyle(fontWeight: FontWeight.w500),
          bodySmall: TextStyle(fontWeight: FontWeight.w400),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF1E293B),
          elevation: 0,
          surfaceTintColor: Colors.transparent,
        ),
      ),
    );
  }
}

// ─── App Shell ───────────────────────────────────────────────
class _AppShell extends StatelessWidget {
  final Widget child;
  const _AppShell({required this.child});

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 720;
    if (isWide) return _DesktopLayout(child: child);
    return _MobileLayout(child: child);
  }
}

// ─── Desktop ─────────────────────────────────────────────────
class _DesktopLayout extends StatelessWidget {
  final Widget child;
  const _DesktopLayout({required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const RepaintBoundary(child: AppSidebar()),
            const SizedBox(width: 12),
            Expanded(
              child: RepaintBoundary(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: ColoredBox(
                    color: const Color(0xFFF8FAFC),
                    child: child,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Mobile ──────────────────────────────────────────────────
class _MobileLayout extends StatelessWidget {
  final Widget child;
  const _MobileLayout({required this.child});

  static const _tabs = [
    _NavItem(
      icon: Icons.dashboard_rounded,
      label: '\u603b\u89c8',
      path: '/dashboard',
    ),
    _NavItem(
      icon: Icons.receipt_long_rounded,
      label: '\u6d88\u8d39',
      path: '/consumption',
    ),
    _NavItem(
      icon: Icons.savings_rounded,
      label: '\u50a8\u84c4',
      path: '/savings',
    ),
    _NavItem(
      icon: Icons.account_balance_rounded,
      label: '\u8d44\u4ea7',
      path: '/assets',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final loc = GoRouterState.of(context).uri.path;
    final idx = _tabs
        .indexWhere((t) => t.path == loc)
        .clamp(0, _tabs.length - 1);

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: idx,
        onTap: (i) => context.go(_tabs[i].path),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF1d4ed8),
        unselectedItemColor: const Color(0xFF94A3B8),
        selectedFontSize: 11,
        unselectedFontSize: 11,
        backgroundColor: Colors.white,
        elevation: 8,
        items: _tabs
            .map(
              (t) =>
                  BottomNavigationBarItem(icon: Icon(t.icon), label: t.label),
            )
            .toList(),
      ),
    );
  }
}

// ─── Placeholder ─────────────────────────────────────────────
class _PlaceholderPage extends StatelessWidget {
  final String title;
  const _PlaceholderPage({required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Text(
          '$title\n\u5373\u5c06\u4e0a\u7ebf',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 18, color: Color(0xFF94A3B8)),
        ),
      ),
    );
  }
}

// ─── NavItem ─────────────────────────────────────────────────
class _NavItem {
  final IconData icon;
  final String label;
  final String path;
  const _NavItem({required this.icon, required this.label, required this.path});
}

// ─── AppSidebar (exported) ────────────────────────────────────
class AppSidebar extends StatelessWidget {
  const AppSidebar({super.key});

  static const _items = [
    _SidebarNavItem(
      icon: Icons.dashboard_rounded,
      label: '\u603b\u89c8',
      caption: '\u67e5\u770b\u5168\u5c40\u8d22\u52a1\u6982\u51b5',
      path: '/dashboard',
    ),
    _SidebarNavItem(
      icon: Icons.account_balance_wallet_rounded,
      label: '\u8d44\u4ea7',
      caption: '\u8d26\u6237\u4f59\u989d\u4e0e\u8d44\u4ea7\u5206\u5e03',
      path: '/assets',
    ),
    _SidebarNavItem(
      icon: Icons.credit_card_rounded,
      label: '\u6d88\u8d39',
      caption: '\u6d41\u6c34\u3001\u5206\u7c7b\u4e0e\u8d8b\u52bf',
      path: '/consumption',
    ),
    _SidebarNavItem(
      icon: Icons.savings_rounded,
      label: '\u50a8\u84c4',
      caption: '\u76ee\u6807\u8fdb\u5ea6\u4e0e\u8ba1\u5212\u8282\u594f',
      path: '/savings',
    ),
    _SidebarNavItem(
      icon: Icons.account_balance_rounded,
      label: '\u8d37\u6b3e',
      caption: '\u8fd8\u6b3e\u72b6\u6001\u4e0e\u8d1f\u503a\u7ba1\u7406',
      path: '/loans',
    ),
    _SidebarNavItem(
      icon: Icons.link_rounded,
      label: '\u8fde\u63a5',
      caption: '\u8bbe\u5907\u7ed1\u5b9a\u4e0e\u5916\u90e8\u63a5\u5165',
      path: '/connections',
    ),
    _SidebarNavItem(
      icon: Icons.auto_awesome_rounded,
      label: 'AI',
      caption: '\u667a\u80fd\u5206\u6790\u4e0e\u8f85\u52a9\u8bb0\u8d26',
      path: '/ai',
    ),
    _SidebarNavItem(
      icon: Icons.storage_rounded,
      label: '\u6570\u636e',
      caption: '\u5bfc\u5165\u5bfc\u51fa\u4e0e\u6570\u636e\u7ef4\u62a4',
      path: '/data',
    ),
    _SidebarNavItem(
      icon: Icons.palette_rounded,
      label: '\u4e3b\u9898',
      caption: '\u5207\u6362\u754c\u9762\u89c6\u89c9\u98ce\u683c',
      path: '/themes',
    ),
    _SidebarNavItem(
      icon: Icons.settings_rounded,
      label: '\u8bbe\u7f6e',
      caption: '\u8d26\u6237\u4e0e\u7cfb\u7edf\u914d\u7f6e',
      path: '/settings',
    ),
    _SidebarNavItem(
      icon: Icons.info_outline_rounded,
      label: '\u5173\u4e8e',
      caption: '\u9879\u76ee\u8bf4\u660e\u4e0e\u7248\u672c\u4fe1\u606f',
      path: '/about',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 272,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0F172A),
            blurRadius: 24,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Brand
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1d4ed8),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'OS',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Star Accounting',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B),
                        letterSpacing: -0.3,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      '\u5206\u6790\u8fc7\u53bb\uff0c\u89c4\u5212\u672a\u6765',
                      style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Nav section label
          const Padding(
            padding: EdgeInsets.fromLTRB(18, 4, 18, 10),
            child: Text(
              'NAVIGATION',
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFF94A3B8),
                letterSpacing: 1.8,
              ),
            ),
          ),

          // Nav items
          Expanded(
            child: Builder(
              builder: (context) {
                final loc = GoRouterState.of(context).uri.path;
                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                  itemCount: _items.length,
                  itemBuilder: (context, index) {
                    final item = _items[index];
                    return _SidebarItemTile(
                      item: item,
                      isActive: loc == item.path,
                      onTap: () => context.go(item.path),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SidebarNavItem {
  final IconData icon;
  final String label;
  final String caption;
  final String path;
  const _SidebarNavItem({
    required this.icon,
    required this.label,
    required this.caption,
    required this.path,
  });
}

class _SidebarItemTile extends StatefulWidget {
  final _SidebarNavItem item;
  final bool isActive;
  final VoidCallback onTap;

  const _SidebarItemTile({
    required this.item,
    required this.isActive,
    required this.onTap,
  });

  @override
  State<_SidebarItemTile> createState() => _SidebarItemTileState();
}

class _SidebarItemTileState extends State<_SidebarItemTile> {
  // ValueNotifier 在 State 里创建，生命周期与 element 一致，不受父级重建影响
  final _hovered = ValueNotifier<bool>(false);

  @override
  void dispose() {
    _hovered.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: _hovered,
      builder: (_, isHovered, __) {
        final isActive = widget.isActive;
        Color bgColor, iconBg, iconColor, labelColor, captionColor;

        if (isActive) {
          bgColor = const Color(0xFFEFF6FF);
          iconBg = const Color(0xFF1d4ed8);
          iconColor = Colors.white;
          labelColor = const Color(0xFF1d4ed8);
          captionColor = const Color(0xFF3B82F6);
        } else if (isHovered) {
          bgColor = const Color(0xFFE0E7FF);
          iconBg = const Color(0xFF6366F1);
          iconColor = Colors.white;
          labelColor = const Color(0xFF4338CA);
          captionColor = const Color(0xFF6366F1);
        } else {
          bgColor = Colors.transparent;
          iconBg = const Color(0xFFF1F5F9);
          iconColor = const Color(0xFF64748B);
          labelColor = const Color(0xFF475569);
          captionColor = const Color(0xFF94A3B8);
        }

        return MouseRegion(
          onEnter: (_) => _hovered.value = true,
          onExit: (_) => _hovered.value = false,
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: widget.onTap,
            child: Container(
              margin: const EdgeInsets.only(bottom: 4),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: iconBg,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(widget.item.icon, size: 18, color: iconColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.item.label,
                          style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: isActive
                                ? FontWeight.w600
                                : FontWeight.w500,
                            color: labelColor,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          widget.item.caption,
                          style: TextStyle(fontSize: 11, color: captionColor),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
