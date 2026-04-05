# OpenStar Dashboard 拖拽布局开发文档

## 0. 文档版本

- 大版本：`v1.0`
- 小版本：`v1.0.0`
- 本次更新：新增 Dashboard 图表模块拖拽自定义布局的专项设计文档，明确本项目优先采用“栅格拖拽布局”而不是“自由画布背景”。

---

## 1. 背景

当前 Dashboard 已经完成主题、共享骨架、共享筛选器与底部弹层的收口，但模块顺序仍然是页面作者预先写死的。  
如果后续要支持“用户自己调整图表顺序、卡片宽高和模块组合”，就需要一套稳定的布局系统。

这项能力的关键不是“把背景做成画布”，而是：

1. 让每个模块具备稳定的 `widget id`。
2. 让页面能读取一份可持久化的布局配置。
3. 让拖拽、缩放、隐藏、恢复默认都落在统一布局层，而不是散落在每个主题文件里。

---

## 2. 目标

1. 支持桌面端 Dashboard 模块拖拽排序。
2. 支持模块宽高调整。
3. 支持按用户保存布局。
4. 支持恢复默认布局。
5. 保持现有主题系统、骨架系统和筛选系统可继续复用。

非目标：

1. 第一阶段不做 Figma 式自由画布。
2. 第一阶段不做模块重叠、任意旋转、无限画布、缩放视口。
3. 第一阶段不做移动端自由拖拽。

---

## 3. 核心结论

### 3.1 不建议做成“画布背景”

如果只是 Dashboard 图表卡片自定义布局，本项目不需要把背景层改成自由画布。

原因：

1. 当前 Dashboard 本质上还是卡片式工作台，不是白板编辑器。
2. 自由画布会把吸附、碰撞、滚动、缩放、层级、弹层定位、响应式全部复杂化。
3. 现有主题系统依赖普通 DOM 容器、主题 token 和卡片表面语义；一旦切到画布式绝对定位，很多已有样式和交互要重做。
4. 移动端适配成本会明显上升。

### 3.2 推荐方案：栅格拖拽布局

推荐采用“栅格布局引擎 + 普通主题卡片 DOM”的方案。

也就是：

1. 页面背景、Hero、筛选器、卡片表面仍然保持现有主题结构。
2. 只有主内容区的 `widgets` 进入可拖拽网格容器。
3. 每个模块由 `x / y / w / h` 控制位置和尺寸。
4. 用户看到的是“可调整的仪表盘”，而不是“自由画布”。

---

## 4. 推荐技术方案

### 4.1 前端布局引擎

优先推荐：

- `react-grid-layout`

原因：

1. 原生支持栅格拖拽 + 缩放。
2. 支持响应式断点布局。
3. 适合后台仪表盘场景，不需要我们自己从零处理碰撞算法。

备选：

- `dnd-kit`

说明：

- `dnd-kit` 更灵活，但如果要补齐“可缩放网格卡片布局”，需要自己再做很多布局算法和碰撞处理。
- 对当前项目来说，`react-grid-layout` 更符合“先稳定落地”的目标。

### 4.2 页面结构

建议新增一层布局容器，而不是直接把拖拽逻辑塞进 [DefaultDashboard.tsx](F:/1python/xiangmu/openstar-StarAccounting/web/src/features/dashboard/components/themes/DefaultDashboard.tsx)。

推荐目录：

```text
web/src/features/dashboard/layout/
├── dashboard-widget-registry.tsx
├── dashboard-default-layout.ts
├── useDashboardLayout.ts
├── DashboardGrid.tsx
├── DashboardWidgetFrame.tsx
└── DashboardLayoutToolbar.tsx
```

职责：

1. `dashboard-widget-registry.tsx`
   - 注册每个模块的 `widgetId`
   - 统一定义标题、默认尺寸、最小尺寸、是否允许隐藏

2. `dashboard-default-layout.ts`
   - 维护默认布局
   - 按断点提供 `lg / md / sm` 布局

3. `useDashboardLayout.ts`
   - 负责读取、修改、保存、恢复布局
   - 处理编辑模式和持久化

4. `DashboardGrid.tsx`
   - 真正承载 `react-grid-layout`

5. `DashboardWidgetFrame.tsx`
   - 负责每个 widget 的拖拽手柄、标题栏、隐藏按钮、锁定状态

6. `DashboardLayoutToolbar.tsx`
   - 负责“编辑布局 / 保存 / 取消 / 恢复默认”

---

## 5. 数据模型设计

### 5.1 Widget 注册表

```ts
type DashboardWidgetId =
  | "summary-expense"
  | "summary-income"
  | "quality-score"
  | "top-merchant"
  | "cashflow-trend"
  | "comparison"
  | "category-structure"
  | "daily-expense"
  | "platform-share"
  | "recent-transactions";

type DashboardWidgetMeta = {
  id: DashboardWidgetId;
  title: string;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
  hideable?: boolean;
};
```

### 5.2 布局项

```ts
type DashboardLayoutItem = {
  i: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
};
```

### 5.3 用户布局结构

```ts
type DashboardLayoutConfig = {
  version: 1;
  themeId: string;
  dashboardVariant: string;
  breakpointLayouts: {
    lg: DashboardLayoutItem[];
    md: DashboardLayoutItem[];
    sm: DashboardLayoutItem[];
  };
  hiddenWidgets: DashboardWidgetId[];
  updatedAt: string;
};
```

关键点：

1. 布局不能只按 `themeId` 存。
2. 更稳的维度是 `accountId + dashboardVariant + themeId + breakpoint`。
3. 如果未来多个主题共用同一个 `dashboardVariant`，可以选择“复用布局”或“每个主题单独布局”，这要在产品层提前定。

---

## 6. 持久化方案

### 6.1 第一阶段

先走本地持久化：

- `localStorage`

优点：

1. 落地快。
2. 不需要改数据库。
3. 便于先验证交互。

建议键名：

```ts
openstar.dashboard.layout.${accountId}.${dashboardVariant}
```

### 6.2 第二阶段

再补服务端持久化。

建议接口：

1. `GET /api/dashboard/layout`
2. `PUT /api/dashboard/layout`
3. `DELETE /api/dashboard/layout`

建议字段：

```ts
{
  themeId: string;
  dashboardVariant: string;
  layout: DashboardLayoutConfig;
}
```

建议数据库表：

- `dashboard_layout_preset`

字段示例：

1. `id`
2. `accountId`
3. `userId`
4. `themeId`
5. `dashboardVariant`
6. `layoutJson`
7. `createdAt`
8. `updatedAt`

---

## 7. 交互规则

### 7.1 编辑模式

平时保持只读展示，点击“编辑布局”后进入编辑模式。

编辑模式下：

1. widget 显示拖拽手柄。
2. widget 允许缩放。
3. 页面显示“保存 / 取消 / 恢复默认”工具栏。
4. 筛选器、统计卡点击事件应降级或锁定，避免拖拽时误触。

### 7.2 普通模式

普通模式下：

1. 不显示拖拽边框。
2. 不显示缩放手柄。
3. 所有卡片回归普通业务交互。

### 7.3 隐藏与恢复

建议支持：

1. 隐藏非核心分析模块。
2. 恢复默认布局。
3. 未来增加“添加模块”面板。

但第一阶段不建议允许隐藏核心模块：

- 筛选器入口
- 核心概览卡
- 最近流水

---

## 8. 主题系统接入原则

这部分必须和现有主题架构保持一致。

1. 拖拽布局层只负责“位置与尺寸”，不负责主题皮肤。
2. 卡片外观继续使用现有主题 token、共享主题原语和页面组件。
3. 不在布局引擎里写 `themeId === "xxx"`。
4. 如果不同主题只是换色，布局引擎仍然共用一套。
5. 如果不同 Dashboard 变体结构差异过大，再给不同 `dashboardVariant` 准备不同默认布局。

结论：

- 背景层继续保持现在的主题页面结构。
- 拖拽层只是挂在工作台内容区之上的“网格管理层”。
- 不把 Dashboard 整体做成白板画布。

---

## 9. 移动端策略

移动端不建议直接复用桌面拖拽体验。

推荐策略：

1. `lg / md` 支持真正拖拽布局。
2. `sm` 只做固定单列展示。
3. 移动端如需自定义，优先做“上下排序”而不是自由拖拽。

原因：

1. 手机端拖拽命中区域太小。
2. 图表卡片高度大、滚动长，容易和页面滚动冲突。
3. 维护单独移动排序规则，成本远低于维护完整移动网格。

---

## 10. 性能要求

拖拽布局最容易出问题的不是样式，而是重渲染。

必须遵守：

1. 拖拽状态不能直接挂在重型图表组件树上。
2. 每个 widget 应尽量保持稳定 `key`。
3. widget 内容区与外层拖拽壳分离。
4. 编辑模式切换时，尽量不要重新请求数据。
5. 布局变化只更新布局状态，不触发整页业务数据重算。

建议：

1. 图表内容继续走记忆化组件。
2. 拖拽层只接收“已准备好的 widget 列表”。
3. 保存时做节流或显式保存，不要每次移动都打接口。

---

## 11. 与现有文件的接线建议

### 11.1 第一阶段建议只接 DefaultDashboard

优先从 [DefaultDashboard.tsx](F:/1python/xiangmu/openstar-StarAccounting/web/src/features/dashboard/components/themes/DefaultDashboard.tsx) 开始。

原因：

1. 这是当前默认总览主题的主工作台。
2. 现有共享筛选器和主题卡片语言都已经稳定。
3. 先把默认主题跑通，再决定是否扩到其他 Dashboard 变体。

### 11.2 DashboardPageShell 负责数据，布局层只负责摆放

[DashboardPageShell.tsx](F:/1python/xiangmu/openstar-StarAccounting/web/src/features/dashboard/components/DashboardPageShell.tsx) 继续负责：

1. 数据查询
2. 筛选状态
3. 路由同步

布局层只处理：

1. widget 列表
2. 当前布局
3. 编辑模式
4. 保存与恢复

这样可以避免把布局系统和数据系统绑死在一起。

---

## 12. 分阶段实施计划

### 阶段 A：前端本地验证版

1. 引入 `react-grid-layout`
2. 完成 widget 注册表
3. 完成默认主题总览页拖拽布局
4. 布局保存到 `localStorage`
5. 支持恢复默认

验收标准：

1. 桌面端可拖拽
2. 可调整宽高
3. 刷新后布局保留
4. 不影响现有筛选和图表数据

### 阶段 B：服务端持久化版

1. 新增后端布局接口
2. 按账户或用户保存布局
3. 支持跨设备同步

### 阶段 C：多主题 / 多变体扩展版

1. 按 `dashboardVariant` 提供默认布局模板
2. 允许主题继承默认布局
3. 视情况支持“创建多个布局预设”

---

## 13. 风险点

1. 拖拽时图表频繁重渲染导致卡顿。
2. 编辑模式与卡片内部按钮点击冲突。
3. 不同主题下卡片高度差异导致布局错位。
4. 数据为空、骨架态、懒加载图表时，高度不稳定。
5. 移动端如果直接照搬桌面拖拽，体验会明显变差。

---

## 14. 最终建议

如果要做“支持拖拽图表模块自定义布局”，当前项目最合适的路线是：

`普通主题页面壳 + 栅格拖拽布局引擎 + widget 注册表 + 本地/服务端持久化`

而不是：

`整页改造成自由画布背景`

先把默认主题总览页做成“可编辑工作台”，再决定是否扩展到其他主题和其他业务页。这样风险最低，也最符合当前仓库的主题分层架构。
