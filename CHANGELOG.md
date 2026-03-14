# 版本更新历史记录

## v1.2.0 - 2026-03-14

### 🎯 新增功能
- **Dashboard 页面集成储蓄数据**
  - Dashboard 的总资产现在包含储蓄目标的当前存款
  - 从 `/api/savings` 获取储蓄目标数据
  - 总资产 = 常规资产 + 储蓄目标存款总和

### 🐛 Bug 修复
- **Savings 页面布局偏移问题**
  - 修复了刷新页面时骨架屏高度随机导致的布局跳动
  - 移除了随机高度计算，使用固定的 Tailwind CSS 高度类

### ✨ 优化改进
- **Savings 页面骨架屏加载体验**
  - 新增专用骨架屏组件：
    - `StatsCardSkeleton()` - 统计卡片骨架屏
    - `DistributionChartSkeleton()` - 分布图表骨架屏
    - `GoalsTableSkeleton()` - 目标列表表格骨架屏
    - `TransactionsSkeleton()` - 交易记录骨架屏
  - 所有骨架屏使用固定尺寸，确保加载时布局稳定
  - 添加 `loading` 参数支持，根据加载状态显示骨架屏或真实数据
  - 平滑的加载动画，提升用户体验

### 📝 修改文件
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

### 🔄 技术改进
- 移除了随机数生成导致的布局不稳定
- 使用固定的 CSS 高度类确保骨架屏一致性
- 优化了组件的加载状态管理
- 提升了用户感知性能

---

## v1.1.0 - 2026-03-13

### 之前的版本记录...
