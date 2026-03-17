# Changelog

## 1.8.28 - 2026-03-17

### Fixes
- **消费页图表主题色修复**:
  - 修复了将 Recharts 替换为 ECharts 后导致的图表主题色丢失问题。
  - 将所有图表的颜色统一为日历图的蓝色色阶（`#1d4ed8`, `#3b82f6`, `#60a5fa`, `#93c5fd`, `#dbeafe`）。
  - 更新了 `mockData.ts` 中的硬编码 CSS 变量为对应的 Hex 颜色值。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 更新堆叠柱状图、散点图等图表的硬编码颜色。
2. `web/src/features/consumption/mockData.ts`
   - 将 `var(--color-chart-X)` 替换为蓝色色阶。

## 1.8.27 - 2026-03-17

### Features
- **消费页图表引擎全面升级**:
  - 将消费页面 (`ConsumptionDefaultTheme.tsx`) 中的所有 Recharts 图表（Pie, Bar, Line, Scatter, Composed）全部替换为 ECharts (Canvas 渲染)。
  - 解决了由于 Recharts (SVG) 节点过多导致的页面滚动严重卡顿问题，实现了丝滑的滚动体验。
  - 为所有 ECharts 图表实现了统一的防抖 (200ms) resize 监听，禁用了默认的 `autoResize`，进一步优化了窗口拖拽时的性能。
  - 优化了滚动事件监听器，使用 `requestAnimationFrame` 进行节流处理，减少主线程占用。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 移除 Recharts 相关依赖。
   - 使用 `ReactECharts` 替换所有图表组件。
   - 实现了统一的 `chartsRef` 管理和 resize 逻辑。
   - 优化 `handleScroll` 为 RAF 节流模式。

## 1.8.26 - 2026-03-17

### Features
- **消费页面性能优化**:
  - 修复了拖拽调整窗口大小时页面严重卡顿的问题。
  - 为所有 Recharts 图表容器 (`ChartContainer`) 添加了默认的防抖 (debounce) 处理 (200ms)，避免频繁重绘。
  - 为 ECharts 图表添加了手动防抖 resize 监听，并禁用了自动 resize，显著降低了 resize 时的计算负载。
  - 优化了移动端检测 (`isMobile`) 的 resize 监听器，添加了防抖处理。

### Modified Files
1. `web/src/components/ui/chart.tsx`
   - `ChartContainer` 新增 `debounce` 属性，默认值为 200ms。
   - 将 `debounce` 属性传递给 `RechartsPrimitive.ResponsiveContainer`。
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 优化 `checkMobile` 函数，添加 resize 防抖。
   - 优化 ECharts 桑基图，禁用 `autoResize`，使用自定义的防抖 resize 逻辑。

## 1.8.25 - 2026-03-17

### Features
- **新增关于页面**:
  - 侧边栏新增"关于"入口
  - 项目介绍模块：展示项目名称、版本、技术栈和主要功能
  - 版本更新记录模块：可展开/收起的版本历史列表，支持全部展开/收起
  - 更新版本模块：显示当前版本信息，提供 GitHub Releases 下载链接
  - 贡献者模块：展示核心开发团队和社区贡献者
  - 网站模块：提供 GitHub 仓库、问题反馈、功能建议等链接

### Modified Files
1. `web/src/app/(dashboard)/about/page.tsx` (新建)
   - 创建关于页面组件
   - 实现五个功能模块
2. `web/src/components/shared/Sidebar.tsx`
   - 添加 Info 图标导入
   - 在导航菜单中添加"关于"入口

## 1.8.24 - 2026-03-14

### Features
- **桑基图升级为 ECharts**:
  - 从 Recharts 替换为 ECharts 桑基图组件
  - 支持 4 级分支数据流展示
  - 添加第 4 级节点：餐饮（星巴克、麦当劳、瑞幸咖啡、美团外卖）、购物（京东商城、淘宝、拼多多）、交通（滴滴出行、地铁、公交）、娱乐（爱奇艺、腾讯视频）、生活（话费充值、水电费）
  - 节点颜色统一为绿色系 + 深蓝色，简洁美观
  - 连接线使用渐变色，交互更流畅
- **消费页布局优化**:
  - 桑基图容器高度调整（300px → 500px）
  - 移动端桑基图支持横向滚动查看
- **修复 hydration 警告问题**:
  - 在 layout.tsx 添加 suppressHydrationWarning 属性
- **桑基图布局修复**:
  - 将 ECharts 桑基图 `layout` 从 `none` 调整为 `sankey`，恢复自动布局算法
  - 修复图形仅占顶部区域的问题，使节点与连线按容器高度正常分布
  - 修复 `DelayedRender` 过渡层未设置 `h-full w-full` 导致子图表 `height: 100%` 失效
- **储蓄弹窗交互修复**:
  - 修复移动端“确认关闭”在取消后再次反复弹出的问题
  - 修复 BottomSheet 底部滑出/收回动画不连贯（闪烁）的问题，统一动画曲线与执行方式
  - 为关闭确认流程增加一次性放行标记，避免 `onOpenChange(false)` 二次触发时重复进入未保存确认
  - 增加关闭确认状态锁与取消后一次性忽略机制，消除事件连发导致的再次弹窗
- **页面切换性能优化**:
  - 对总览、资产、消费、储蓄、贷款页面的核心图表视图（如 `ConsumptionDefaultTheme`）应用了 `next/dynamic` 异步加载 (ssr: false)。
  - 彻底解决了通过侧边栏切换页面时（尤其是切换到消费页面时）由于同步加载大量图表组件（ECharts/Recharts）导致的主线程阻塞和页面卡顿问题。
  - 实现了页面切换的瞬间响应，提升了全站导航的流畅度。

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 桑基图替换为 ECharts 实现
   - 浮窗筛选按钮修复按钮嵌套问题
2. `web/src/features/consumption/mockData.ts`
   - 桑基图数据扩展为 4 级分支
3. `web/src/app/layout.tsx`
   - 添加 suppressHydrationWarning 属性

### Dependencies
- 新增：echarts
- 新增：echarts-for-react

## 1.8.23 - 2026-03-14

### Features
- **消费页移动端图表优化**:
  - 支出趋势图表：移动端可见区域显示 8 个数据点，支持横向滑动查看完整数据
  - 消费分类堆积图表：移动端可见区域显示 6 根柱子，支持横向滑动查看完整数据
  - 桑基图：PC 端占满容器宽度，移动端支持横向滚动，右边距调整 (80 → 120)

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 支出趋势图表宽度调整 (w-[2000px] → w-[1200px])
   - 消费分类堆积图表宽度调整 (w-[1500px] → w-[750px])
   - 桑基图 PC 端宽度修复和右边距调整

## 1.8.22 - 2026-03-14

### Features
- **消费页移动端优化**:
  - 调整支付平台分布和收支分析图表尺寸 (160px → 100px)
  - 优化图表内部间距，减少 padding 和 margin
  - 圆环图线宽响应式调整 (PC: 4px, 移动端：12px)
  - 图表居中对齐优化
- **图表横向滚动支持**:
  - 支出趋势图表支持横向滑动，移动端固定 500px 宽度
  - 消费分类堆积图表支持横向滑动，最多显示 10 根柱子
  - PC 端自动占满容器宽度，移动端保留滚动功能
- **图表布局优化**:
  - 帕累托分析图表减少左右边距，柱子宽度增加 (30 → 60)
  - 热门商家图表移除右侧边距，条形图紧贴边缘
  - 桑基图右边距优化 (150 → 80)
- **每日平均消费图表增强**:
  - 新增周数选择按钮 (第 1 周 - 第 5 周)
  - X 轴显示周几和具体日期 (如：周一 3 月 2 日)
  - 根据真实日历计算日期，支持显示上个月/下个月日期
  - 第一周从 3 月 1 号 (周日) 开始，周一到六显示 2 月日期

### Modified Files
1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 移动端图表尺寸和间距优化
   - 响应式圆环图线宽
   - 图表横向滚动功能
   - 周数选择和日期显示
   - 日历计算逻辑

## 1.8.21 - 2026-03-14

### Bug Fixes
- **数据库 transaction 表结构修复**:
  - 修复 `createdAt` 和 `updatedAt` 字段缺少默认值的问题
  - 添加 `DEFAULT CURRENT_TIMESTAMP(3)` 默认值
  - 添加 `ON UPDATE CURRENT_TIMESTAMP(3)` 自动更新
  - 解决后端创建交易时报错 "Field doesn't have a default value"

### 问题根源
1. 后端缺少 POST `/api/transactions` 接口（已在 v1.8.20 修复）
2. 数据库 `transaction` 表的 `createdAt` 和 `updatedAt` 字段没有默认值
3. 导致 Prisma 创建交易记录时失败

### Modified Files
1. 数据库修复
   - `ALTER TABLE transaction MODIFY COLUMN updatedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`
   - `ALTER TABLE transaction MODIFY COLUMN createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)`

## 1.8.20 - 2026-03-14

### Features
- **后端交易创建接口**:
  - 新增 POST `/api/transactions` 接口
  - 支持创建单条交易记录（取款、打卡等）
  - 必填字段：amount, type, category, platform, date
  - 可选字段：merchant, description
  - 自动关联当前登录用户的 userId

### Bug Fixes
- **取款和打卡记录不显示问题**:
  - 之前只有导入接口，没有单条创建接口
  - 导致取款和打卡时创建交易失败
  - 现在可以正常创建并显示交易记录

### Modified Files
1. `src/server/src/main.ts`
   - 添加 POST /api/transactions 路由
   - 实现单条交易创建逻辑
   - 验证必填字段
   - 自动注入 userId

## 1.8.19 - 2026-03-14

### Features
- **存取记录列表显示优化**:
  - 打卡存款时自动创建交易记录（类别：储蓄存款）
  - 优化存取记录过滤逻辑，同时检查 category 和 description 字段
  - 确保打卡和取款记录都能在存取记录列表中显示
  - 支持关键词：储蓄、存款、理财、基金、股票、定投等

### Modified Files
1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 在 `handleUpdatePlan` 函数中添加交易创建逻辑
   - 当打卡状态变为 COMPLETED 时创建 INCOME 类型交易
   - 交易描述包含月份信息

2. `web/src/app/(dashboard)/savings/page.tsx`
   - 优化过滤逻辑，同时检查 category 和 description
   - 扩大匹配范围，确保所有储蓄相关交易都能显示

## 1.8.18 - 2026-03-14

### Features
- **打卡和取款日期显示**:
  - 在储蓄打卡弹窗中显示打卡日期时间
  - 已完成的打卡记录显示 "打卡：YYYY-MM-DD HH:mm"
  - 取款交易自动记录当前时间
  - 存取记录列表显示交易日期

### Modified Files
1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 添加 `createdAt` 和 `updatedAt` 字段到类型定义
   - 在打卡状态按钮下方显示打卡时间
   - 仅对已完成状态显示打卡日期

## 1.8.17 - 2026-03-14

### Features
- **Savings 页面取款功能**:
  - 新增取款弹窗组件 `SavingsWithdrawalDialog`
  - 在目标列表中添加"取款"按钮，支持从储蓄目标取款
  - 自动创建取款交易记录（分类：储蓄取款）
  - 实时更新储蓄目标的当前存款金额
  - 取款金额验证：不能超过当前存款
  - 支持备注说明，记录取款用途

### Modified Files
1. `web/src/features/savings/components/SavingsWithdrawalDialog.tsx` (新建)
   - 创建取款弹窗组件
   - 实现取款表单和验证逻辑
   - 调用 API 创建交易记录和更新储蓄目标

2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 添加 `onOpenWithdrawal` 回调函数
   - 在目标列表操作栏添加"取款"按钮
   - 按钮在存款为 0 时禁用

3. `web/src/app/(dashboard)/savings/page.tsx`
   - 导入 `SavingsWithdrawalDialog` 组件
   - 添加取款状态管理
   - 实现 `openWithdrawal` 函数
   - 传递回调到 `SavingsDefaultTheme`

## 1.8.16 - 2026-03-14

### Features
- **Dashboard 页面集成储蓄数据**:
  - Dashboard 的总资产现在包含储蓄目标的当前存款
  - 从 `/api/savings` 获取储蓄目标数据
  - 总资产 = 常规资产 + 储蓄目标存款总和

### Bug Fixes
- **Savings 页面布局偏移问题**:
  - 修复了刷新页面时骨架屏高度随机导致的布局跳动
  - 移除了随机高度计算，使用固定的 Tailwind CSS 高度类

### Improvements
- **Savings 页面骨架屏加载体验**:
  - 新增专用骨架屏组件：
    - `StatsCardSkeleton()` - 统计卡片骨架屏
    - `DistributionChartSkeleton()` - 分布图表骨架屏
    - `GoalsTableSkeleton()` - 目标列表表格骨架屏
    - `TransactionsSkeleton()` - 交易记录骨架屏
  - 所有骨架屏使用固定尺寸，确保加载时布局稳定
  - 添加 `loading` 参数支持，根据加载状态显示骨架屏或真实数据
  - 平滑的加载动画，提升用户体验

### Modified Files
1. `web/src/app/(dashboard)/page.tsx`
   - 添加储蓄目标 API 调用
   - 修改总资产计算逻辑，包含储蓄存款

2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 创建 4 个专用骨架屏组件
   - 更新 `DelayedRender` 组件支持自定义骨架屏
   - 添加 `loading` 参数到组件 props
   - 为所有区域添加骨架屏支持

3. `web/src/app/(dashboard)/savings/page.tsx`
   - 传递 `loading` 参数到 `SavingsDefaultTheme` 组件

## 1.8.15 - 2026-03-14

### Features
- **移动端适配**:
  - 新增移动端导航菜单 (Hamburger Menu)，位于 Header 左侧。
  - 集成侧滑抽屉 (Side Drawer)，在移动端提供完整的侧边栏导航功能。
  - 优化 Header 布局，在移动端自动适配标题与菜单按钮。
- **仪表盘体验优化**:
  - 移动端首页布局重构：采用更紧凑的网格布局 (Grid Layout)。
  - 缩小移动端卡片尺寸与内边距，提升屏幕空间利用率。
  - 优化字体大小与图标尺寸，适配小屏设备阅读体验。
  - **字体调整**:
    - 增大“净资产”数值字体 (text-3xl -> text-4xl)。
    - 增大“总资产/负债”辅助信息字体 (text-[10px] -> text-xs/sm)，提升可读性。
  - **组件响应式优化**:
    - “最近交易”列表项增加弹性布局与文本截断，防止长文本破坏布局。
    - “快捷入口”组件在移动端缩小图标与内边距，适配小屏点击区域。
  - **布局溢出修复**:
    - 全局容器增加 `overflow-x-hidden`，防止水平滚动。
    - 仪表盘 Grid 子项增加 `min-w-0`，防止图表等宽内容撑开网格。
    - 修复“帮助”卡片装饰圆圈的绝对定位溢出问题。
  - **视觉优化**:
    - 全局加深卡片边框颜色 (border-gray-100 -> border-gray-200)，解决在部分屏幕上边框不可见的问题。
  - **统一边距**:
    - 移除资产、消费、储蓄、贷款页面的额外内边距 (`p-6`)，统一使用全局 Layout 提供的标准边距，解决移动端“边框过厚”问题。

## 1.8.14 - 2026-03-14

### Features
- **消费页体验优化**:
  - 新增底部悬浮筛选按钮 (Floating Filter Button)，下滑滚动时自动显现。
  - 支持快捷筛选面板 (Popover)，集成搜索、平台过滤与月份切换功能，与顶部筛选栏实时同步。
  - 优化滚动监听逻辑，修复 `h-screen` 布局下 `window.scrollY` 失效问题，改为监听 `main` 容器滚动。

## 1.8.13 - 2026-03-14

### Features
- **储蓄打卡流程统一**:
  - 统一“新建目标/每月打卡/指定计划”到同一弹窗与同一计划表界面。
  - 目标列表入口可直接进入计划表步骤，减少跨弹窗切换。
- **打卡识别与提醒增强**:
  - 打卡表仅展示“计划存款 > 0”的应存款月份，并同步高亮当前月份。
  - 新增右下角提醒：若上一个应存款月未打卡则提示；月底最后一天若本月未打卡则提示。
- **打卡凭证支持**:
  - 每月打卡新增图片上传与预览能力（本地持久化）。

### Fixed
- **储蓄计划接口调用修复**:
  - 修复打卡弹窗请求落到前端端口导致的 404 与 JSON 解析失败问题，统一改为 API 基础封装调用。
- **可访问性修复**:
  - 为储蓄相关弹窗补齐 `DialogDescription`，消除 `DialogContent` 描述缺失告警。
- **消费页构建错误修复**:
  - 移除消费主题组件中的冗余闭合标签，修复 JSX 解析失败导致的构建报错。

## 1.8.12 - 2026-03-14

### Features
- **消费页深度分析图表上线**:
  - 新增 **资金流向桑基图** (Sankey Diagram)：直观展示“收入来源 ➔ 支付账户 ➔ 支出去向”的资金流动全景。
  - 新增 **消费时段散点图** (Scatter Plot)：24小时气泡分布图，可视化分析消费习惯（如午餐/深夜时段）。
  - 新增 **单笔金额直方图** (Histogram)：统计消费金额区间分布，勾勒“细水长流”或“大额低频”消费画像。

### Fixed
- **图表标签渲染修复**:
  - 重写桑基图节点渲染逻辑，自定义 Label 组件，修复节点名称不显示的问题。
  - 优化桑基图右侧布局间距，防止长文本标签（如“餐饮美食”）被容器截断。

## 1.8.11 - 2026-03-14

### Performance
- **消费页图表方向性动效重做**:
  - 移除图表容器的位移过渡，仅保留透明度渐显，修复“整体偏移”观感。
  - 柱状图统一启用纵向生长动画参数，折线图启用左到右绘制动画参数。
  - 消费日历改为按日期单元格依次显现，恢复“一个个方块加载”的动态效果。
  - 保留分批懒加载策略，兼顾加载丝滑度与主线程压力控制。

## 1.8.10 - 2026-03-14

### Performance
- **消费页加载动效与懒加载修复**:
  - 移除生硬的全局步进串行方案，恢复按区块分批懒加载策略。
  - 图表卡片改为平滑过渡（透明度 + 轻微位移动画），提升加载丝滑感。
  - 重新校准首屏与滚动区延迟节奏，保留动态加载观感并降低并发渲染压力。

## 1.8.9 - 2026-03-14

### Performance
- **消费页图表串行加载**:
  - 新增渲染步进控制，图表按步骤逐个加载，避免同屏并发渲染导致卡顿。
  - `DelayedRender` 新增 `enabled` 开关，仅在命中当前步骤时启动渲染调度。
  - 首屏图表改为严格串行触发，滚动区图表保持懒加载前提下按步骤依次解锁。

## 1.8.8 - 2026-03-14

### Performance
- **消费页刷新卡顿优化**:
  - 优化 `DelayedRender` 调度策略：懒加载场景加入 `requestIdleCallback`，并完善定时器/空闲回调清理。
  - 分散图表挂载延迟，避免刷新后多个图表同一时刻集中渲染造成主线程尖峰。
  - 对图表配置与筛选数据做记忆化，减少交互期重复渲染与重复计算。
  - 热力图查值由循环内 `.find` 改为 `Map` 预索引，降低表格渲染开销。
  - 交易明细改为渲染筛选结果，移除无效过滤计算。

## 1.8.7 - 2026-03-14

### Fixed
- **消费页品牌图标修正**:
  - 微信与支付宝卡片图标改为基于 `simple-icons` 的官方品牌矢量路径。
  - 统一品牌底色与白色主标，修复“图标不像官方”的识别偏差。

## 1.8.6 - 2026-03-14

### Fixed
- **消费页图表刷新位移修复**:
  - 重构 `DelayedRender` 渲染结构，加载前后统一使用同一外层容器，避免布局重排。
  - 移除图表载入时的纵向位移动画，仅保留淡入效果，消除“上下跳动”观感。
  - 饼图模块容器固定为 `200x200`，骨架与真实图表尺寸完全一致，刷新时位置保持不变。

## 1.8.5 - 2026-03-14

### UI/UX Improvements
- **消费页体验优化**:
  - 重构图表加载状态，移除整体占位符，改为卡片内骨架屏 (Skeleton) 加载。
  - 修复图表加载时的高度跳变问题，确保加载前后布局稳定。
  - 为不同类型的图表（饼图、列表、文本）定制了专属的骨架屏样式。

## 1.8.4 - 2026-03-14

### UI/UX Improvements
- **消费页图表与布局细化**:
  - 修复第 4 行网格等高拉伸导致的帕累托卡片底部空白（`items-start`）。
  - 优化帕累托图内边距与坐标轴线，进一步压缩无效留白。
  - 消费日历改为扁平化全展示布局，移除滚动并调整方块长宽比。
  - 顶部四张概览卡片图标放大，并统一微信/支付宝官方配色与边框样式。

## 1.8.3 - 2026-03-14

### UI/UX Improvements
- **储蓄页增强**:
  - 新增 "指定计划" 功能，支持为每个目标设定分月存款计划。
  - 增加 "隔月存" 模式的悬浮说明卡片 (Tooltip)。
  - 优化目标卡片操作栏，增加快捷计划入口。
  - 新增目标类型：每月存、隔月存(单/双)。
  - 新增存款类型：现金、死期、他人帮存。
  - 优化新建/编辑表单，支持更多配置项。
  - **弹窗重构**:
    - "新建/编辑目标" 弹窗采用 Shadcn UI 组件重构，界面更加现代化。
    - 优化表单布局，增加图标辅助，提升输入体验。
- **储蓄页重构**: 
  - 对齐消费页 (Consumption) 主题风格，采用统一的卡片设计与配色。
  - 新增 "储蓄分布" 饼图 (按类型统计)。
  - 优化 "总存款/目标总额/总体进度" 概览卡片样式。
  - 引入 `DelayedRender` 实现交错动画与懒加载。
  - 新增储蓄目标搜索功能。

## 1.8.2 - 2026-03-13

### UI/UX Improvements
- **侧边栏优化**: 修复侧边栏跟随滚动问题，调整为固定布局 (`h-screen`)，并新增 `Theme` (主题) 页面入口。
- **消费页重构**:
  - 新增骨架屏加载动画 (Skeleton Loading)
  - 顶部卡片新增图标 (Icons)
  - 饼图标签优化 (移至底部右侧)
  - 日历组件样式优化 (字体与格子大小调整)
  - 新增过滤器：全局搜索 (关键词)、平台筛选、日期筛选
  - 优化 "工作日 vs 周末" 图表为按周 (周一至周日) 每日平均消费统计
- **全站风格统一**: 重构资产 (Assets)、储蓄 (Savings)、贷款 (Loans) 页面，应用统一的卡片设计、图标体系与配色方案。

## 1.8.1 - 2026-03-13

### Performance
- **消费页性能优化**: 
  - 引入 `IntersectionObserver` 实现图表懒加载，仅在滚动可见时渲染。
  - 优化首屏加载策略，分批次渲染首屏图表，彻底解决多图表并发渲染导致的页面卡顿问题。

## 1.8.0 - 2026-03-13

### Architecture
- **前端架构重构**: 迁移至 Feature-based 架构 (`src/features/*`)，分离 UI/Theme 与数据逻辑。
- **模块化**: 拆分 `dashboard`, `assets`, `consumption`, `savings`, `loans` 为独立特性模块。

### UI/UX
- **组件库升级**: 集成 `shadcn/ui` 与 `recharts`。
- **图表增强**: 
  - 消费页：新增平台分布饼图、收支环形图、商家排行柱状图、热力图等。
  - 资产页：新增资产估值卡片。
  - 贷款页：新增还款计划表与进度图。
  - 储蓄页：新增目标进度可视化。
- **主题支持**: 实现了基于组件的主题切换架构。

### Changed
- **端口变更**: 后端 API 端口调整为 `3006`。

## 1.7.0 - 2026-03-13

### Added

- 预算管理模块上线：
  - 后端新增预算 CRUD 接口，支持按月/年设定分类或总预算，并自动统计进度
  - 前端新增预算管理页，支持展示进度条（颜色区分预警状态）与增删改操作

## 1.6.0 - 2026-03-13

### Added

- 交易管理增强：
  - 后端新增交易编辑与删除接口（`PUT/DELETE`）
  - 前端消费流水列表支持悬停显示操作按钮，可编辑金额/分类/商家/时间或删除记录

## 1.5.0 - 2026-03-13

### Added

- 消费分析增强：
  - 趋势图支持“按日/按月”时间粒度切换
  - 分类排行支持“Top 5/10/20”筛选
  - 后端接口增强 `groupBy` 与 `limit` 参数支持

## 1.4.0 - 2026-03-13

### Added

- 设置模块上线：
  - 后端新增用户信息修改与密码重置接口
  - 前端新增设置页，支持修改昵称与重置密码
- 基础设施优化：
  - 根目录 `npm run dev` 可一键同时启动前后端（Concurrently）

## 1.3.0 - 2026-03-13

### Added

- 仪表盘首页（Dashboard Home）上线：
  - 聚合展示净资产、总资产、总负债
  - 展示本月支出、收入与结余
  - 展示最近 5 笔交易记录与快捷功能入口

## 1.2.0 - 2026-03-13

### Added

- 后端新增资产（Asset）模块，支持记录现金/银行卡/支付宝/微信/投资等资产（CRUD）
- 前端新增资产管理页，支持展示总资产估值、资产卡片与增删改操作

## 1.1.0 - 2026-03-13

### Added

- 前端贷款页新增“还款计划”功能（基于剩余金额与月供自动推算）
- 前端消费页新增交易记录 CSV 导出功能（支持当前筛选条件）

## 1.0.0 - 2026-03-13

### Added

- 后端新增贷款（Loan）模块，支持记录贷款总额、还款期数与剩余金额（CRUD）
- 前端新增贷款管理页，支持展示还款进度条、每月还款信息与增删改操作

## 0.9.0 - 2026-03-13

### Added

- 后端新增储蓄目标（SavingsGoal）模块，支持 CRUD 接口（内存/Prisma 双模式）
- 前端新增储蓄目标管理页，支持展示目标卡片、进度条与增删改操作

## 0.8.0 - 2026-03-13

### Added

- 消费页新增日期范围筛选（快捷按钮/自定义）与收支类型切换
- 后端消费聚合接口支持按收支类型（EXPENSE/INCOME）与平台筛选

## 0.7.0 - 2026-03-13

### Added

- 前端新增注册页，完善登录/退出流程与 Header 用户展示
- 鉴权守卫升级为校验 /api/auth/me，Token 无效自动清除并跳转登录

## 0.6.0 - 2026-03-13

### Added

- 消费页新增按日趋势折线图与分类 Top10 分布展示

## 0.5.0 - 2026-03-13

### Added

- 后端新增 JWT 登录/注册与鉴权中间逻辑，并将核心数据接口纳入鉴权保护
- 前端接入登录页与 Token 存储，Dashboard 路由组增加未登录跳转
- 前端请求改为统一封装，自动携带 Authorization Bearer Token

## 0.4.0 - 2026-03-13

### Added

- 新增 PostgreSQL + Prisma 数据库配置文档，并补齐后端 Prisma Studio 脚本
- 后端新增消费分析聚合指标接口（汇总/按平台/按分类/按日趋势）
- 前端消费页新增汇总卡片与按平台分布展示，并支持导入后自动刷新

## 0.3.0 - 2026-03-13

### Added

- 后端新增交易导入与查询接口（支持微信/支付宝 CSV 解析、去重与统计）
- 前端消费页新增账单导入与支出流水列表（分页展示）

## 0.2.0 - 2026-03-13

### Added

- 后端接入 Prisma，新增核心数据模型与示例环境变量
- 连接域增强：OTP 生成/校验/撤销支持数据库模式，并提供设备列表接口
- 前端连接管理页：生成连接码与倒计时、设备列表与撤销授权

## 0.1.0 - 2026-03-13

### Added

- 初始化前端 Next.js 工程（web/），建立 Dashboard 路由组与基础布局
- 增加 TanStack Query Provider 作为前端数据请求基础设施
- 初始化后端 Express 工程（src/server），提供健康检查与连接码 API 骨架
