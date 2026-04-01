# Flutter 总览页复刻开发文档

## 1. 目标

- 将旧版 `web/src/app/(dashboard)/page.tsx` 对应的总览页完整迁移到 `flutter/lib/features/dashboard/`。
- 迁移范围包含样式、布局、主要文案、数据展示方式和页面内交互。
- 本次只改新站 `flutter/lib/`，旧站 `web/src/` 保留为对照参考。

## 2. 旧版页面拆解

旧版总览页的核心结构分为 5 块：

1. Hero 仪表区
2. 本月收支概览卡
3. 本月现金流卡
4. 近期消费构成卡
5. 最近交易卡

其中 Hero 区还包含：

- 总览仪表盘与月份徽标
- 当前净资产主数值
- 本月结余胶囊
- 6 个概览指标卡
- 预算提醒横幅与“暂时收起”交互

## 3. Flutter 对应落位

- 页面入口：`flutter/lib/features/dashboard/presentation/dashboard_page.dart`
- Hero：`flutter/lib/features/dashboard/presentation/widgets/hero_section.dart`
- 现金流：`flutter/lib/features/dashboard/presentation/widgets/cashflow_chart_card.dart`
- 消费构成：`flutter/lib/features/dashboard/presentation/widgets/category_pie_card.dart`
- 最近交易：`flutter/lib/features/dashboard/presentation/widgets/recent_transactions_card.dart`
- 样式与格式化：`flutter/lib/features/dashboard/presentation/dashboard_utils.dart`

## 4. 实施步骤

1. 先保留旧版数据聚合方式，不改接口，只改呈现层。
2. 先复刻 Hero 区的视觉层级、指标矩阵和预算提醒交互。
3. 再调整页面排版为旧版对应的“宽屏异形布局 + 窄屏收束布局”。
4. 按旧版文案和信息密度重做现金流、消费构成、最近交易三张卡片。
5. 补齐 `查看预算` 跳转所需的 `/budgets` 路由占位，避免页面交互断路。
6. 最后跑 `flutter analyze`、`flutter test`、`flutter build web` 做验收。

## 5. 本次实现边界

- 本次复刻的是总览页内容区，不扩展资产页、储蓄页、贷款页等其它模块。
- `/budgets` 仅补占位路由，不在本轮同时迁预算页。
- 为保证 Flutter 小屏可用性，超窄屏下允许在不破坏信息层级的前提下做纵向收束。

## 6. 验收结果

- `flutter analyze`：通过
- `flutter build web`：通过
- `flutter test`：未通过

当前 `flutter test` 失败原因不是本轮页面代码本身，而是本机 `flutter_tester` 启动时仍报 `WebSocketException: Invalid WebSocket upgrade request`，需要后续单独排查测试环境。
