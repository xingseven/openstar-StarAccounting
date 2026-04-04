# Nova 主题开发文档

## 一、目标

创建一个名为 **Nova** 的全新主题，与现有五个主题（default / graphite / spruce / terracotta / midnight）的核心区别是：

- **现有主题**：只换配色，所有主题共用同一套 UI 模块（`theme-primitives.tsx`），卡片形状、布局、交互方式完全一样。
- **Nova 主题**：拥有独立的 UI 模块组件，视觉语言完全不同——深色宇宙感背景、毛玻璃浮层卡片、大号数字排版、发光 accent、无边框设计。

---

## 二、视觉设计规范

### 2.1 整体风格关键词
`深色沉浸` · `毛玻璃` · `发光 accent` · `无边框` · `大数字` · `极简导航`

参考产品：Raycast、Linear、Vercel Dashboard、Apple Notes（暗色）

### 2.2 配色系统

| Token | 值 | 用途 |
|---|---|---|
| `theme-app-bg` | `radial-gradient(ellipse at 20% 50%, #0d1b3e 0%, #050b1a 60%, #000000 100%)` | 全局背景（深宇宙蓝） |
| `theme-shell-bg` | `rgba(255,255,255,0.03)` | 最外层 shell |
| `theme-header-bg` | `rgba(5,11,26,0.72)` | 顶栏（毛玻璃） |
| `theme-sidebar-bg` | `rgba(5,11,26,0.85)` | 侧栏（毛玻璃） |
| `theme-surface-bg` | `rgba(255,255,255,0.05)` | 卡片容器（毛玻璃） |
| `theme-hero-bg` | `rgba(255,255,255,0.06)` | Hero 区（毛玻璃稍亮） |
| `theme-dark-panel-bg` | `rgba(0,0,0,0.4)` | 深色面板 |
| `theme-metric-bg` | `rgba(255,255,255,0.07)` | 数据卡片 |
| `theme-body-text` | `#f0f4ff` | 主文字（冷白） |
| `theme-label-text` | `#a8b8d8` | 标签文字 |
| `theme-muted-text` | `#4a5f80` | 次级说明 |
| `theme-hint-text` | `#354560` | 提示文字 |
| `theme-input-bg` | `rgba(255,255,255,0.06)` | 输入框背景 |
| `theme-input-border` | `rgba(255,255,255,0.1)` | 输入框边框 |
| `theme-dialog-section-bg` | `rgba(255,255,255,0.04)` | 弹窗分区背景 |
| `theme-empty-icon-bg` | `rgba(99,179,255,0.1)` | 空状态图标背景 |
| `theme-empty-icon-text` | `#63b3ff` | 空状态图标色 |
| **Accent（核心发光色）** | `#63b3ff`（亮蓝） | 高亮、激活、发光 |

### 2.3 圆角规范

| 层级 | 值 |
|---|---|
| 全局容器（layout shell） | `28px` |
| Hero / 大卡片 | `24px` |
| Surface / 普通卡片 | `20px` |
| Metric 卡片 | `18px` |
| 输入框 / 按钮 | `14px` |
| 标签 / 胶囊 | `999px`（full） |

### 2.4 阴影系统（发光阴影，不用黑色）

```css
/* Surface 卡片 */
box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4);

/* Hero 区 */
box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.5);

/* Metric 卡片（hover 时发蓝光） */
box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3);
hover: box-shadow: 0 0 24px rgba(99,179,255,0.15), 0 8px 32px rgba(0,0,0,0.4);

/* Accent 按钮发光 */
box-shadow: 0 0 20px rgba(99,179,255,0.4), 0 4px 12px rgba(0,0,0,0.3);
```

---

## 三、架构设计

### 3.1 现有主题系统结构

```
themes/registry.ts          ← 主题 ID 类型 + 所有主题的 CSS 变量定义
components/shared/
  theme-provider.tsx        ← Context + localStorage + CSS 变量注入
  theme-primitives.tsx      ← 全局通用 UI 组件（所有主题共用）
app/(dashboard)/
  layout.tsx                ← 顶层布局（Sidebar + Header + main）
  themes/page.tsx           ← 主题选择页
```

### 3.2 Nova 主题扩展方案

Nova 主题不改动任何现有文件的 UI 逻辑，通过以下两个机制实现独立视觉：

#### 机制 A：CSS 变量驱动（自动生效）
`registry.ts` 中 Nova 的 `vars` 定义完整的颜色 token，`theme-provider.tsx` 切换时自动注入到 `:root`，所有已经使用 CSS 变量的组件（Sidebar、Header、Surface等）自动变色。

#### 机制 B：`data-theme="nova"` 选择器（组件覆盖）
全局 `<html>` 元素会被注入 `data-theme="nova"`，可以在 `globals.css` 中写：
```css
[data-theme="nova"] .sidebar { ... }
[data-theme="nova"] .header { ... }
```
用于覆盖**形状、模糊度、边框**等无法通过 CSS 变量控制的样式。

#### 机制 C：Nova 专属 UI 组件（按需引入）
对于 Metric 卡片、Hero 等需要完全重构的组件，提供 Nova 版本，各业务页面通过 `useTheme()` 判断当前主题后渲染对应版本。

```tsx
// 示例：条件渲染 Nova 版 MetricCard
const { themeId } = useTheme();
if (themeId === "nova") return <NovaMetricCard ... />;
return <ThemeMetricCard ... />;
```

### 3.3 新增文件清单

```
themes/
  registry.ts               ← [修改] 新增 "nova" ThemeId + ThemeDefinition

components/shared/
  theme-primitives.tsx      ← [修改] Sidebar/Header 的 backdrop-blur 强度通过变量控制

themes/nova/
  nova-primitives.tsx       ← [新建] Nova 专属 UI 组件
    NovaMetricCard
    NovaSurface
    NovaHero
    NovaDarkPanel
    NovaSectionHeader

app/(dashboard)/
  layout.tsx                ← [修改] 根据 data-theme 注入 nova 专属 class

globals.css                 ← [修改] 新增 [data-theme="nova"] 选择器覆盖
```

---

## 四、开发步骤（按顺序执行）

### Step 1：注册 Nova 主题 ID 和 CSS 变量

**文件**：`web/src/themes/registry.ts`

1. 在 `ThemeId` 类型中新增 `"nova"`
2. 在 `THEMES` 对象中新增 `nova` 条目，包含：
   - `preview`：主题卡片预览用的颜色（accent、shell、surface、darkPanel）
   - `vars`：完整的 CSS 变量 map（参见 §2.2 配色系统）

**验收**：`THEME_LIST` 长度变为 6，主题页面出现 Nova 卡片。

---

### Step 2：全局 CSS 注入 Nova 专属样式

**文件**：`web/src/app/globals.css`

添加 `[data-theme="nova"]` 选择器，覆盖以下无法通过 CSS 变量控制的样式：

```css
/* Sidebar 毛玻璃强化 */
[data-theme="nova"] aside > div {
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}

/* Header 毛玻璃强化 */
[data-theme="nova"] header {
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
}

/* Surface 卡片去边框，改为内发光 */
[data-theme="nova"] .nova-surface {
  border: none !important;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.45);
}

/* 滚动条暗色适配 */
[data-theme="nova"] * {
  scrollbar-color: rgba(99,179,255,0.2) transparent;
}
```

**验收**：切换到 Nova 主题后，Sidebar 和 Header 背景变为深色毛玻璃效果。

---

### Step 3：新建 Nova 专属 UI 组件库

**文件**：`web/src/themes/nova/nova-primitives.tsx`

实现以下组件（全部 `"use client"`）：

#### `NovaSurface`
- 背景：`rgba(255,255,255,0.05)` + `backdrop-blur-xl`
- 边框：无，改为 `box-shadow: 0 0 0 1px rgba(255,255,255,0.07)`
- 圆角：`20px`

#### `NovaHero`
- 背景：`rgba(255,255,255,0.06)` + `backdrop-blur-2xl`
- 内部可选：左侧竖向 accent 渐变条（`w-1 h-full bg-gradient-to-b from-[#63b3ff] to-transparent`）
- 圆角：`24px`

#### `NovaMetricCard`
Props 与 `ThemeMetricCard` 相同（label、value、icon、detail）
- 背景：`rgba(255,255,255,0.07)` + `backdrop-blur-md`
- 数字字体：`text-3xl font-black tracking-tighter`（比现有大一档）
- 左侧 accent 竖线：`w-[3px] h-8 rounded-full bg-[#63b3ff]`
- hover 发蓝光：`transition-shadow hover:shadow-[0_0_24px_rgba(99,179,255,0.15)]`
- 去掉图标区域，改为左侧竖线 + 右侧大数字的横向布局

#### `NovaSectionHeader`
- 去掉 eyebrow 标签
- 标题：`text-2xl font-black tracking-tighter text-[#f0f4ff]`
- 描述：`text-[#4a5f80]`
- 右侧 action 区带微光分隔线

#### `NovaDarkPanel`
- 背景：`rgba(0,0,0,0.5)` + `backdrop-blur-xl`
- 内边框：`box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05)`

**验收**：组件文件无 TypeScript 报错，可被其他文件正常 import。

---

### Step 4：更新主题页面展示 Nova 卡片

**文件**：`web/src/app/(dashboard)/themes/page.tsx`

Nova 主题卡片的预览区需要特殊渲染（深色，不能用浅色主题的预览逻辑）：

- 预览区背景：`radial-gradient(ellipse at 30% 40%, #0d1b3e, #050b1a)`
- 侧栏色：`rgba(5,11,26,0.85)`
- 图表柱子：accent `#63b3ff`，带 `box-shadow: 0 0 8px #63b3ff80`（发光效果）
- Metric 预览：左侧竖线（`#63b3ff`）+ 大数字线段

**验收**：主题页面中 Nova 卡片视觉与其他主题明显不同，可点击切换。

---

### Step 5：业务页面条件渲染（以仪表盘为例）

**文件**：`web/src/features/dashboard/components/themes/DefaultDashboard.tsx`

在关键组件上增加 Nova 条件分支：

```tsx
import { useTheme } from "@/components/shared/theme-provider";
import { NovaMetricCard, NovaHero, NovaSurface } from "@/themes/nova/nova-primitives";

const { themeId } = useTheme();
const isNova = themeId === "nova";

// Hero 区
{isNova ? <NovaHero>...</NovaHero> : <ThemeHero>...</ThemeHero>}

// Metric 卡片
{isNova
  ? <NovaMetricCard label="总资产" value="¥128,430" />
  : <ThemeMetricCard label="总资产" value="¥128,430" tone="blue" />
}
```

**验收**：切换到 Nova 主题后，仪表盘页面的 Hero 和 MetricCard 使用 Nova 版组件，其他页面回退到通用组件（不崩溃）。

---

### Step 6：TypeScript 检查 & 全量验收

```bash
cd web && npx tsc --noEmit
```

验收清单：
- [ ] `npx tsc --noEmit` 输出为空（0 error）
- [ ] 主题页面 Nova 卡片正常渲染，视觉与其他主题明显不同
- [ ] 切换到 Nova 主题后，全局背景、侧栏、顶栏变为深色毛玻璃风格
- [ ] 切换回其他主题后，Nova 样式完全消失，不影响其他主题
- [ ] 仪表盘页面 Nova 版 Hero 和 MetricCard 正常渲染
- [ ] 移动端底导航在 Nova 主题下颜色正常（不发白）

---

## 五、各步骤改动文件速查

| Step | 文件 | 改动类型 |
|---|---|---|
| 1 | `themes/registry.ts` | 新增 nova ThemeId + vars |
| 2 | `app/globals.css` | 新增 `[data-theme="nova"]` 选择器 |
| 3 | `themes/nova/nova-primitives.tsx` | 新建 Nova UI 组件库 |
| 4 | `app/(dashboard)/themes/page.tsx` | 更新 Nova 卡片预览渲染 |
| 5 | `features/dashboard/components/themes/DefaultDashboard.tsx` | 条件渲染 Nova 组件 |
| 6 | 全局 | `tsc --noEmit` 验收 |

---

## 六、注意事项

1. **不要改动现有主题的任何变量**，Nova 完全是新增，不影响存量功能。
2. `ThemeId` 是字面量联合类型，新增 `"nova"` 后所有 `switch(themeId)` 的地方需要检查是否需要 `case "nova"` 分支。
3. Nova 的 CSS 变量中 `theme-surface-bg` 是 `rgba(255,255,255,0.05)`，这是半透明值，要确保父容器有实色背景，否则毛玻璃效果不生效。
4. `backdrop-filter` 在 Safari 上需要 `-webkit-backdrop-filter` 前缀，全部写双份。
5. 业务页面的 Nova 条件渲染（Step 5）优先做仪表盘，其他页面（消费、资产等）在 Nova 稳定后再逐步接入，不做强依赖。
