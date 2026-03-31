import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth/auth_controller.dart';

class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.location, required this.child});

  final String location;
  final Widget child;

  static const _items = <_NavItem>[
    _NavItem(
      label: '总览',
      caption: '查看全局财务概况',
      icon: Icons.dashboard_outlined,
      path: '/dashboard',
    ),
    _NavItem(
      label: '资产',
      caption: '账户余额与资产分布',
      icon: Icons.account_balance_wallet_outlined,
      path: '/assets',
    ),
    _NavItem(
      label: '数据',
      caption: '导入导出与数据维护',
      icon: Icons.table_chart_outlined,
      path: '/data',
    ),
  ];

  static const _sidebarBackground = Color(0xEDF7F9FC);
  static const _sidebarBorder = Color(0xFFD9E2EC);
  static const _sidebarText = Color(0xFF475569);
  static const _sidebarMuted = Color(0xFF94A3B8);
  static const _sidebarHoverBackground = Color(0xFFEEF4FB);
  static const _sidebarHoverText = Color(0xFF0F172A);
  static const _sidebarActiveBackground = Color(0xFFDBEAFE);
  static const _sidebarActiveText = Color(0xFF1D4ED8);
  static const _sidebarIconBackground = Color(0xFFEAF0F6);
  static const _sidebarIconText = Color(0xFF64748B);
  static const _sidebarIconActiveText = Color(0xFF2563EB);
  static const _contentBackground = Color(0xFFF4F7FB);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final wide = MediaQuery.of(context).size.width >= 980;
    final selectedIndex = _items.indexWhere(
      (item) => location.startsWith(item.path),
    );
    final safeIndex = selectedIndex < 0 ? 0 : selectedIndex;
    Future<void> logout() async {
      await ref.read(authControllerProvider.notifier).logout();
    }

    if (wide) {
      return Scaffold(
        backgroundColor: Colors.transparent,
        body: _ShellBackdrop(
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
              child: Row(
                children: [
                  SizedBox(
                    width: 288,
                    child: _SidebarShell(
                      user: user,
                      selectedIndex: safeIndex,
                      onNavigate: (path) => context.go(path),
                      onLogout: logout,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: child,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return _ShellBackdrop(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        drawer: Drawer(
          width: 332,
          backgroundColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 64, 12),
              child: _SidebarShell(
                user: user,
                selectedIndex: safeIndex,
                onNavigate: (path) {
                  Navigator.of(context).pop();
                  if (location != path) {
                    context.go(path);
                  }
                },
                onLogout: logout,
              ),
            ),
          ),
        ),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          foregroundColor: const Color(0xFF334155),
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          titleSpacing: 4,
          title: Text(
            _items[safeIndex].label,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: const Color(0xFF0F172A),
              fontWeight: FontWeight.w700,
            ),
          ),
          leading: Builder(
            builder: (context) => Padding(
              padding: const EdgeInsets.only(left: 8),
              child: IconButton(
                tooltip: '打开导航',
                onPressed: () => Scaffold.of(context).openDrawer(),
                icon: const Icon(Icons.menu_rounded),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: 0.88),
                  foregroundColor: const Color(0xFF334155),
                ),
              ),
            ),
          ),
        ),
        body: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: child,
          ),
        ),
        bottomNavigationBar: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AppShell._sidebarBackground,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppShell._sidebarBorder),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x1426558F),
                        blurRadius: 28,
                        offset: Offset(0, 14),
                      ),
                    ],
                  ),
                  child: NavigationBar(
                    backgroundColor: Colors.transparent,
                    surfaceTintColor: Colors.transparent,
                    indicatorColor: AppShell._sidebarActiveBackground,
                    selectedIndex: safeIndex,
                    destinations: _items
                        .map(
                          (item) => NavigationDestination(
                            icon: Icon(item.icon),
                            selectedIcon: Icon(
                              item.icon,
                              color: AppShell._sidebarActiveText,
                            ),
                            label: item.label,
                          ),
                        )
                        .toList(),
                    onDestinationSelected: (index) =>
                        context.go(_items[index].path),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ShellBackdrop extends StatelessWidget {
  const _ShellBackdrop({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppShell._contentBackground, Color(0xFFEEF4FB)],
        ),
      ),
      child: Stack(
        children: [
          const Positioned(
            top: -120,
            right: -60,
            child: _BackdropGlow(
              size: 280,
              colors: [Color(0x3363B3FF), Color(0x1163B3FF)],
            ),
          ),
          const Positioned(
            left: -90,
            bottom: -150,
            child: _BackdropGlow(
              size: 320,
              colors: [Color(0x22A5D8FF), Color(0x08FFFFFF)],
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class _BackdropGlow extends StatelessWidget {
  const _BackdropGlow({required this.size, required this.colors});

  final double size;
  final List<Color> colors;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(colors: colors),
        ),
      ),
    );
  }
}

class _SidebarShell extends StatelessWidget {
  const _SidebarShell({
    required this.user,
    required this.selectedIndex,
    required this.onNavigate,
    required this.onLogout,
  });

  final AppUser? user;
  final int selectedIndex;
  final ValueChanged<String> onNavigate;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1626558F),
            blurRadius: 34,
            offset: Offset(0, 18),
          ),
          BoxShadow(
            color: Color(0x0D0F172A),
            blurRadius: 6,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: AppShell._sidebarBackground,
              border: Border.all(color: AppShell._sidebarBorder),
            ),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _SidebarHeader(),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView(
                      padding: EdgeInsets.zero,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(8, 8, 8, 10),
                          child: Text(
                            'Navigation',
                            style: Theme.of(context).textTheme.labelSmall
                                ?.copyWith(
                                  color: AppShell._sidebarMuted,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 2,
                                ),
                          ),
                        ),
                        ...List.generate(AppShell._items.length, (index) {
                          final item = AppShell._items[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: _ShellNavButton(
                              item: item,
                              selected: index == selectedIndex,
                              onTap: () => onNavigate(item.path),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  if (user != null) ...[
                    const SizedBox(height: 12),
                    _SidebarAccountCard(user: user!),
                  ],
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => onLogout(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF334155),
                        backgroundColor: Colors.white.withValues(alpha: 0.78),
                        side: const BorderSide(color: AppShell._sidebarBorder),
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      icon: const Icon(Icons.logout_rounded, size: 18),
                      label: const Text('退出登录'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SidebarHeader extends StatelessWidget {
  const _SidebarHeader();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 0),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF63B3FF), Color(0xFF2D5BFF)],
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x4763B3FF),
                  blurRadius: 24,
                  offset: Offset(0, 10),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: Text(
              'OS',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.2,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Star Accounting',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: const Color(0xFF0F172A),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '分析过去，规划未来',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppShell._sidebarMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SidebarAccountCard extends StatelessWidget {
  const _SidebarAccountCard({required this.user});

  final AppUser user;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.72),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppShell._sidebarBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFFEEF4FB),
                borderRadius: BorderRadius.circular(16),
              ),
              alignment: Alignment.center,
              child: Text(
                user.name.trim().isNotEmpty
                    ? user.name.trim().substring(0, 1).toUpperCase()
                    : 'U',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppShell._sidebarActiveText,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: const Color(0xFF0F172A),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    user.email,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppShell._sidebarMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShellNavButton extends StatefulWidget {
  const _ShellNavButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  State<_ShellNavButton> createState() => _ShellNavButtonState();
}

class _ShellNavButtonState extends State<_ShellNavButton> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final foreground = widget.selected
        ? AppShell._sidebarActiveText
        : _hovered
        ? AppShell._sidebarHoverText
        : AppShell._sidebarText;
    final background = widget.selected
        ? AppShell._sidebarActiveBackground
        : _hovered
        ? AppShell._sidebarHoverBackground
        : Colors.transparent;
    final iconBackground = widget.selected
        ? Colors.white
        : _hovered
        ? Colors.white.withValues(alpha: 0.92)
        : AppShell._sidebarIconBackground;
    final iconColor = widget.selected
        ? AppShell._sidebarIconActiveText
        : _hovered
        ? AppShell._sidebarHoverText
        : AppShell._sidebarIconText;
    final captionColor = widget.selected
        ? const Color(0xCC1D4ED8)
        : _hovered
        ? const Color(0xFF64748B)
        : AppShell._sidebarMuted;

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: background,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.easeOutCubic,
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: iconBackground,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  alignment: Alignment.center,
                  child: Icon(widget.item.icon, color: iconColor, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.item.label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: foreground,
                          fontWeight: widget.selected
                              ? FontWeight.w700
                              : FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.item.caption,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall?.copyWith(color: captionColor),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({
    required this.label,
    required this.caption,
    required this.icon,
    required this.path,
  });

  final String label;
  final String caption;
  final IconData icon;
  final String path;
}
