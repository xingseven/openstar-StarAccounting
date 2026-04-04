# Frost 主题开发文档

> 版本：v1.0 | 状态：待实现

---

## 一、设计目标

### 1.1 核心定位

**Frost（霜玻璃）** 是一个白色系主题，与现有五个主题的本质区别不是"换配色"，而是**整套 UI 模块的视觉语言不同**。

| 维度 | 现有主题（default / graphite 等） | Frost |
|---|---|---|
| 卡片背景 | 实色白（`#ffffff`） | 半透明白（`rgba(255,255,255,0.72)`）+ 毛玻璃 |
| 卡片边框 | `1px solid #d9e2ec`（可见线条） | 无边框，靠阴影和透明度区分层次 |
| 背景 | 浅灰渐变（静态） | 蓝灰径向渐变（滚动时透过卡片流动） |
| Hero 区 | 白色盒子，有边框 | 无容器感，背景直接透出，靠大号数字和排版撑起 |
| Metric 卡片 | 图标 + 标签 + 数字（常规布局） | 大号数字优先，左侧 accent 色竖线，无图标框 |
| 导航侧栏 | 实色背景 | 半透明毛玻璃，能透出背景渐变色 |
| 底部导航（移动端） | `bg-white/84`（接近不透明） | `rgba(255,255,255,0.6)` + 强毛玻璃，像 iOS 底栏 |
| 整体感受 | 后台管理系统 | 现代 App（iOS 18 / macOS Sequoia 风格） |

### 1.2 视觉关键词

`霜玻璃` · `半透明层叠` · `无边框` · `大数字` · `冷蓝灰` · `轻盈浮动`

### 1.3 参考产品

- Apple 系统控制中心（毛玻璃层叠）
- Arc 浏览器侧栏（半透明，无边框）
- Vercel Dashboard（大号数字，简洁分区）
- iOS 18 小组件（模糊背景穿透）

---

## 二、视觉设计规范

### 2.1 全局背景

```
background: radial-gradient(ellipse at 30% 20%, #ddeeff 0%, #e8f0f8 40%, #f0f4f8 100%)
```

这是一个以左上角为中心的浅蓝灰径向渐变，不是纯色，给毛玻璃卡片提供"透过去有内容"的感觉。

---

### 2.2 完整 CSS 变量表

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `theme-app-bg` | `radial-gradient(ellipse at 30% 20%, #ddeeff 0%, #e8f0f8 40%, #f0f4f8 100%)` | 全局背景 |
| `theme-shell-bg` | `rgba(255,255,255,0.4)` | 最外层 shell |
| `theme-shell-border` | `rgba(255,255,255,0.6)` | shell 边框 |
| `theme-shell-shadow` | `0 8px 32px rgba(100,140,180,0.08)` | shell 阴影 |
| `theme-header-bg` | `rgba(255,255,255,0.65)` | 顶栏背景 |
| `theme-header-border` | `rgba(255,255,255,0.8)` | 顶栏下边框 |
| `theme-header-shadow` | `0 1px 0 rgba(100,140,180,0.1)` | 顶栏分隔线 |
| `theme-sidebar-bg` | `rgba(255,255,255,0.55)` | 侧栏背景 |
| `theme-sidebar-border` | `rgba(200,220,240,0.4)` | 侧栏边框 |
| `theme-sidebar-text` | `#3d5a7a` | 侧栏导航文字 |
| `theme-sidebar-muted` | `#7a9bb8` | 侧栏次级文字 |
| `theme-sidebar-hover-bg` | `rgba(255,255,255,0.7)` | 侧栏 hover 背景 |
| `theme-sidebar-hover-text` | `#1a3550` | 侧栏 hover 文字 |
| `theme-sidebar-active-bg` | `rgba(255,255,255,0.9)` | 侧栏激活背景 |
| `theme-sidebar-active-text` | `#1558a8` | 侧栏激活文字 |
| `theme-sidebar-icon-bg` | `rgba(200,220,240,0.5)` | 侧栏图标背景 |
| `theme-sidebar-icon-text` | `#5580a0` | 侧栏图标色 |
| `theme-sidebar-icon-active-bg` | `rgba(255,255,255,0.95)` | 侧栏激活图标背景 |
| `theme-sidebar-icon-active-text` | `#1d6fd4` | 侧栏激活图标色 |
| `theme-surface-bg` | `rgba(255,255,255,0.72)` | 卡片/容器背景 |
| `theme-surface-border` | `rgba(255,255,255,0.0)` | 卡片边框（透明，不用边框） |
| `theme-surface-shadow` | `0 4px 24px rgba(100,140,180,0.12), 0 1px 4px rgba(100,140,180,0.08)` | 卡片阴影 |
| `theme-hero-bg` | `rgba(255,255,255,0.0)` | Hero 区背景（透明，无容器） |
| `theme-hero-border` | `rgba(255,255,255,0.0)` | Hero 边框（透明） |
| `theme-hero-shadow` | `none` | Hero 阴影（无） |
| `theme-dark-panel-bg` | `rgba(20,50,90,0.85)` | 深色面板（图表区） |
| `theme-dark-panel-border` | `rgba(255,255,255,0.08)` | 深色面板边框 |
| `theme-dark-panel-shadow` | `0 12px 40px rgba(20,50,90,0.2)` | 深色面板阴影 |
| `theme-metric-bg` | `rgba(255,255,255,0.75)` | Metric 卡片背景 |
| `theme-metric-border` | `rgba(255,255,255,0.0)` | Metric 卡片边框（透明） |
| `theme-metric-shadow` | `0 2px 16px rgba(100,140,180,0.1), 0 1px 3px rgba(100,140,180,0.08)` | Metric 卡片阴影 |
| `theme-body-text` | `#1a3550` | 主文字（深蓝灰） |
| `theme-label-text` | `#2d4d6a` | 标签文字 |
| `theme-muted-text` | `#6a8faa` | 次级说明 |
| `theme-hint-text` | `#8aadc8` | 提示文字 |
| `theme-dialog-section-bg` | `rgba(240,246,252,0.8)` | 弹窗分区背景 |
| `theme-empty-icon-bg` | `rgba(200,220,240,0.5)` | 空状态图标背景 |
| `theme-empty-icon-text` | `#7aaac8` | 空状态图标色 |
| `theme-input-bg` | `rgba(255,255,255,0.8)` | 输入框背景 |
| `theme-input-border` | `rgba(180,210,235,0.6)` | 输入框边框 |

---

### 2.3 圆角规范

Frost 的圆角比现有主题**更大**，配合毛玻璃产生"气泡"感：

| 层级 | 值 | 对应组件 |
|---|---|---|
| 全局 Shell | `28px` | layout 最外层 |
| Hero / 大容器 | `0px`（无容器，透明背景） | `FrostHero` |
| Surface 卡片 | `24px` | `FrostSurface` |
| Metric 卡片 | `20px` | `FrostMetricCard` |
| 侧栏 | `24px` | Sidebar wrapper |
| 输入框 / 按钮 | `16px` | Input / Button |
| 标签 / 胶囊 | `999px` | Badge |

---

### 2.4 阴影规范

Frost **不用黑色阴影**，全部用蓝灰色调阴影，配合透明背景更自然：

```css
/* Surface 卡片 */
box-shadow: 0 4px 24px rgba(100,140,180,0.12), 0 1px 4px rgba(100,140,180,0.08);

/* Surface 卡片 hover */
box-shadow: 0 8px 40px rgba(100,140,180,0.18), 0 2px 8px rgba(100,140,180,0.1);
transform: translateY(-2px);

/* Metric 卡片 */
box-shadow: 0 2px 16px rgba(100,140,180,0.1), 0 1px 3px rgba(100,140,180,0.08);

/* Metric 卡片 hover */
box-shadow: 0 6px 28px rgba(100,140,180,0.16), 0 2px 6px rgba(100,140,180,0.1);
transform: translateY(-2px);

/* 深色面板 */
box-shadow: 0 12px 40px rgba(20,50,90,0.2);
```

---

### 2.5 毛玻璃规范

所有半透明组件必须同时写 WebKit 前缀：

```css
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
```

| 组件 | blur 强度 |
|---|---|
| Sidebar | `blur(24px) saturate(200%)` |
| Header | `blur(20px) saturate(180%)` |
| Surface 卡片 | `blur(16px) saturate(160%)` |
| Metric 卡片 | `blur(12px) saturate(150%)` |
| 移动端底导航 | `blur(28px) saturate(220%)` |
| Dialog / Sheet | `blur(32px) saturate(200%)` |

---

### 2.6 Frost 专属 Accent 色

Frost 使用**冰蓝**作为 accent，与背景的蓝灰渐变呼应：

```
accent:  #2d7dd2   （主操作色、激活态）
accent-light: #e8f2fc  （浅色背景填充）
accent-glow:  rgba(45,125,210,0.15)  （卡片 hover 光晕）
```

---

## 三、架构设计

### 3.1 实现机制

与 Nova 主题相同，Frost 通过三层机制实现独立视觉：

**机制 A — CSS 变量**（自动生效，覆盖颜色）
注册到 `registry.ts` 的 `vars`，`theme-provider` 切换时注入 `:root`。

**机制 B — `[data-theme="frost"]` CSS 选择器**（覆盖形状 / 模糊度）
写在 `globals.css`，覆盖 Sidebar、Header、底导航的 `backdrop-filter`、`border-radius` 等无法用变量控制的属性。

**机制 C — Frost 专属 UI 组件**（替换 Layout 差异最大的部件）
`FrostHero`（无容器透明 Hero）和 `FrostMetricCard`（大数字竖线布局）通过 `useTheme()` 条件渲染。

---

### 3.2 新增 / 修改文件清单

```
themes/
  registry.ts                          ← [修改] 新增 "frost" ThemeId + vars + preview

app/
  globals.css                          ← [修改] 新增 [data-theme="frost"] 选择器

themes/frost/
  frost-primitives.tsx                 ← [新建] Frost 专属 UI 组件

app/(dashboard)/
  themes/page.tsx                      ← [修改] Nova + Frost 卡片预览特殊渲染

features/dashboard/components/themes/
  DefaultDashboard.tsx                 ← [修改] Frost 条件渲染 Hero / MetricCard
```

---

## 四、开发步骤

### Step 1：注册 Frost 主题

**文件**：`web/src/themes/registry.ts`

**改动 1**：在 `ThemeId` 联合类型末尾追加 `"frost"`：
```ts
export type ThemeId = "default" | "graphite" | "spruce" | "terracotta" | "nova" | "midnight" | "frost";
```

**改动 2**：在 `THEMES` 对象末尾（`midnight` 之后）追加 frost 条目：
```ts
frost: {
  id: "frost",
  name: "霜玻璃",
  description: "半透明毛玻璃层叠，冰蓝灰色调，轻盈现代。",
  preview: {
    shell: "radial-gradient(ellipse at 30% 20%, #ddeeff 0%, #e8f0f8 40%, #f0f4f8 100%)",
    surface: "rgba(255,255,255,0.72)",
    accent: "#2d7dd2",
    darkPanel: "rgba(20,50,90,0.85)",
  },
  vars: {
    // 参照 §2.2 完整 CSS 变量表，逐条填入
    "theme-app-bg": "radial-gradient(ellipse at 30% 20%, #ddeeff 0%, #e8f0f8 40%, #f0f4f8 100%)",
    // ... 完整 vars 见 §2.2
  },
},
```

**验收**：`THEME_LIST.length === 7`，主题选择页出现 Frost 卡片（配色已生效，形状待后续步骤）。

---

### Step 2：全局 CSS — `[data-theme="frost"]` 选择器

**文件**：`web/src/app/globals.css`

在文件末尾追加：

```css
/* ── Frost 主题专属覆盖 ── */

/* Sidebar：强毛玻璃 */
[data-theme="frost"] aside > div {
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border-right: 1px solid rgba(255,255,255,0.5);
}

/* Header：毛玻璃 + 去掉 shadow，改为细白线 */
[data-theme="frost"] header {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.6);
  box-shadow: none;
}

/* 移动端底导航：强毛玻璃，接近 iOS 底栏 */
[data-theme="frost"] .mobile-bottom-nav-shell {
  background: rgba(240,246,252,0.65) !important;
  backdrop-filter: blur(28px) saturate(220%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(220%) !important;
  box-shadow: 0 -4px 24px rgba(100,140,180,0.12) !important;
}

/* 移动端底导航激活项：改为冰蓝，去掉深色 */
[data-theme="frost"] .mobile-bottom-nav-link[aria-current="page"] {
  background: rgba(45,125,210,0.15) !important;
  color: #1d6fd4 !important;
  box-shadow: none !important;
}

/* 移动端底导航非激活文字 */
[data-theme="frost"] .mobile-bottom-nav-link:not([aria-current="page"]) {
  color: #6a8faa !important;
}

/* 移动端底导航边缘渐变（配合新背景色） */
[data-theme="frost"] .mobile-bottom-nav-edge-left {
  background: linear-gradient(to right, rgba(240,246,252,0.9), transparent) !important;
}
[data-theme="frost"] .mobile-bottom-nav-edge-right {
  background: linear-gradient(to left, rgba(240,246,252,0.9), transparent) !important;
}

/* Surface 卡片：去除边框，改用阴影 */
[data-theme="frost"] .frost-surface {
  border: none;
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
}

/* 滚动条：配合蓝灰调 */
[data-theme="frost"] * {
  scrollbar-color: rgba(100,140,180,0.25) transparent;
}
```

**注意**：
- `mobile-bottom-nav-shell`、`mobile-bottom-nav-link`、`mobile-bottom-nav-edge-left/right` 这几个 class 已在 `MobileBottomNav.tsx` 中使用，直接通过 CSS 选择器覆盖即可，**不需要改 MobileBottomNav.tsx 的代码**。
- `!important` 只在需要覆盖内联 Tailwind 类时使用，尽量少用。

**验收**：切换到 Frost 主题，Sidebar 和 Header 变为毛玻璃，移动端底导航激活项变为冰蓝色。

---

### Step 3：新建 Frost 专属 UI 组件库

**文件**：`web/src/themes/frost/frost-primitives.tsx`

```ts
"use client";
```

#### 3.1 `FrostSurface`

与 `ThemeSurface` 接口相同，加强毛玻璃：

```tsx
export function FrostSurface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[24px]", className)}
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        boxShadow: "0 4px 24px rgba(100,140,180,0.12), 0 1px 4px rgba(100,140,180,0.08)",
      }}
    >
      {children}
    </div>
  );
}
```

#### 3.2 `FrostHero`

**核心改变**：无容器、无背景色、无边框。Hero 区直接铺在页面背景上，只靠大号排版和留白撑起结构感：

```tsx
export function FrostHero({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    // 透明背景，无 border，无 shadow，只保留 padding 和圆角
    <section className={cn("relative overflow-hidden rounded-none p-0", className)}>
      {children}
    </section>
  );
}
```

> **为什么去掉容器**：现有 `ThemeHero` 是一个白色盒子，给人"内容被装进一个框里"的感觉。Frost 的理念是内容直接浮在背景渐变上，页面层次靠透明度和阴影区分，而不是"套盒子"。

#### 3.3 `FrostMetricCard`

**核心改变**：大号数字优先，左侧 accent 竖线，去掉图标框，整体比例是宽矮型：

Props 与 `ThemeMetricCard` 保持兼容（label、value、mobileValue、detail）：

```tsx
export function FrostMetricCard({
  label,
  value,
  mobileValue,
  detail,
  accentColor = "#2d7dd2",
  className,
}: {
  label: string;
  value: string;
  mobileValue?: string;
  detail?: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[20px] p-4 transition-all duration-300",
        "hover:-translate-y-0.5",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        boxShadow: "0 2px 16px rgba(100,140,180,0.1), 0 1px 3px rgba(100,140,180,0.08)",
      }}
    >
      {/* 左侧 accent 竖线 */}
      <div
        className="absolute left-0 top-4 h-8 w-[3px] rounded-r-full"
        style={{ background: accentColor }}
      />

      <div className="pl-3">
        {/* 标签 */}
        <p className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--theme-muted-text)" }}>
          {label}
        </p>

        {/* 大号数字 */}
        <p className="mt-1.5 text-2xl font-black tracking-tight sm:hidden"
          style={{ color: "var(--theme-body-text)" }}>
          {mobileValue ?? value}
        </p>
        <p className="mt-1.5 hidden text-3xl font-black tracking-tight sm:block"
          style={{ color: "var(--theme-body-text)" }}>
          {value}
        </p>

        {/* 副文字 */}
        {detail && (
          <p className="mt-2 text-xs font-medium"
            style={{ color: "var(--theme-muted-text)" }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
```

#### 3.4 `FrostSectionHeader`

去掉 eyebrow 标签，标题比现有更大更重，用冰蓝下划线代替容器框：

```tsx
export function FrostSectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 border-b pb-4", className)}
      style={{ borderColor: "rgba(100,140,180,0.18)" }}>
      <div>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl"
          style={{ color: "var(--theme-body-text)" }}>
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
```

**验收**：组件文件 `npx tsc --noEmit` 0 error，可被 import。

---

### Step 4：更新主题选择页 Frost 卡片预览

**文件**：`web/src/app/(dashboard)/themes/page.tsx`

Frost 卡片预览区需要体现"毛玻璃在渐变背景上"的效果：

在现有卡片渲染逻辑中，对 `theme.id === "frost"` 做特殊处理：

- **外层卡片背景**：使用 Frost 的 `shell` 渐变作为背景
- **预览区内的容器**：用 `rgba(255,255,255,0.72)` 半透明白色，而不是纯白
- **预览区侧栏**：`rgba(255,255,255,0.55)`
- **图表柱子**：accent `#2d7dd2`，带轻微 `box-shadow: 0 0 6px rgba(45,125,210,0.4)`
- **Metric 预览**：左侧 3px 冰蓝竖线 + 粗数字线段

**验收**：主题页 Frost 卡片视觉上明显区别于其他主题，预览区能看出毛玻璃和竖线数字的特征。

---

### Step 5：仪表盘页面接入 Frost 组件

**文件**：`web/src/features/dashboard/components/themes/DefaultDashboard.tsx`

**改动 1**：顶部 import 追加：
```tsx
import { FrostHero, FrostMetricCard, FrostSurface } from "@/themes/frost/frost-primitives";
import { useTheme } from "@/components/shared/theme-provider";
```

**改动 2**：组件内获取主题状态：
```tsx
const { themeId } = useTheme();
const isFrost = themeId === "frost";
```

**改动 3**：Hero 区条件渲染：
```tsx
// 将原来的 <ThemeHero> 替换为：
{isFrost ? (
  <FrostHero>
    {/* 同样的子内容，但无容器感 */}
    ...
  </FrostHero>
) : (
  <ThemeHero>
    ...
  </ThemeHero>
)}
```

**改动 4**：MetricCard 条件渲染：
```tsx
// 将原来的 <ThemeMetricCard> 替换为：
{isFrost ? (
  <FrostMetricCard
    label="总资产"
    value={formattedValue}
    detail="较上月 +2.4%"
    accentColor="#2d7dd2"
  />
) : (
  <ThemeMetricCard
    label="总资产"
    value={formattedValue}
    tone="blue"
    icon={Wallet}
  />
)}
```

**改动 5**：Surface 容器条件渲染：
```tsx
{isFrost ? (
  <FrostSurface className="p-4 sm:p-5">...</FrostSurface>
) : (
  <ThemeSurface className="p-4 sm:p-5">...</ThemeSurface>
)}
```

**验收**：切换到 Frost 主题，仪表盘页面 Hero 区无容器感，MetricCard 显示大数字+竖线布局，Surface 卡片呈毛玻璃效果。

---

### Step 6：全量验收

#### 6.1 TypeScript 检查
```bash
cd web && npx tsc --noEmit
```
预期：无输出（0 error）。

#### 6.2 功能验收清单

- [ ] `tsc --noEmit` 0 error
- [ ] 主题选择页出现 Frost 卡片，可点击切换
- [ ] 切换到 Frost 后，全局背景变为蓝灰径向渐变
- [ ] Sidebar 呈半透明毛玻璃，能透出背景渐变色
- [ ] Header 呈毛玻璃，无硬阴影，底部细白线分隔
- [ ] 移动端底导航：毛玻璃加强，激活项变冰蓝（非深色）
- [ ] 仪表盘 Hero 区无白色盒子，内容直接浮于背景上
- [ ] 仪表盘 MetricCard 显示大数字 + 左侧冰蓝竖线
- [ ] 仪表盘 Surface 卡片呈毛玻璃，无可见边框线
- [ ] 切换回其他主题，Frost 样式完全消失，不影响其他主题
- [ ] 仪表盘以外的页面（消费、资产等）切换 Frost 后不崩溃（回退到通用组件）

---

## 五、各步骤改动文件速查

| Step | 文件 | 类型 | 核心改动 |
|---|---|---|---|
| 1 | `themes/registry.ts` | 修改 | 新增 `"frost"` ThemeId + 完整 vars |
| 2 | `app/globals.css` | 修改 | `[data-theme="frost"]` 选择器覆盖毛玻璃/底导航 |
| 3 | `themes/frost/frost-primitives.tsx` | 新建 | FrostSurface / FrostHero / FrostMetricCard / FrostSectionHeader |
| 4 | `app/(dashboard)/themes/page.tsx` | 修改 | Frost 卡片预览特殊渲染 |
| 5 | `features/dashboard/components/themes/DefaultDashboard.tsx` | 修改 | isFrost 条件渲染 |
| 6 | 全局 | 验收 | `tsc --noEmit` + 功能清单 |

---

## 六、注意事项

1. **`backdrop-filter` 依赖父容器不能是 `overflow: hidden` + `opacity < 1`**：否则毛玻璃效果会失效。Layout 的 `overflow-hidden` 容器需要注意层级。
2. **Frost `theme-hero-bg` 是 `rgba(255,255,255,0.0)`（完全透明）**：这是故意的，Hero 区靠排版和留白撑起，不是靠背景色。
3. **`ThemeId` 是字面量联合类型**：新增 `"frost"` 后，所有有 `switch (themeId)` 或 `themeId === "xxx"` 的地方都要检查是否需要加 frost 分支（特别是 `themes/page.tsx` 中的 `isDark` 判断逻辑）。
4. **不改动其他主题任何代码**：Frost 完全是新增，对现有主题零影响。
5. **Step 5 只接入仪表盘**：消费、资产、储蓄、贷款页面的 Frost 版本在主流程稳定后再逐步接入，避免工程量失控。
6. **`accentColor` prop**：`FrostMetricCard` 的竖线颜色通过 prop 传入，默认 `#2d7dd2`，各业务模块可以传自己的 accent 色（如消费传绿色、贷款传橙色），保持模块差异化。
