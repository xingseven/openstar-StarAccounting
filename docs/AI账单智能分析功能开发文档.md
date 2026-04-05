# AI 账单智能分析功能开发文档

> 创建日期：2026-03-20
> 版本：V2.2.0

## 1. 需求概述

在消费页面顶部新增 AI 智能分析模块，自动分析用户账单数据并提供个性化消费建议、异常检测和优化方案。

### 1.1 核心功能

- **消费概览分析**：基于近期消费数据，AI 自动生成文字总结
- **消费习惯洞察**：分析用户的消费模式（频率、时间、类别偏好）
- **异常消费检测**：识别异常大额或高频消费
- **优化建议**：提供具体的节省建议和预算优化方案

## 2. 技术方案

### 2.1 前端架构

```
消费页面 (consumption/page.tsx)
├── ConsumptionDefaultTheme
│   ├── 顶部筛选栏 (FixedStickyHeader)
│   └── AI 智能分析卡片 (新增)
│       ├── 分析状态展示 (loading/success/error)
│       ├── AI 总结文本
│       ├── 关键洞察列表
│       └── 优化建议卡片
```

### 2.2 后端 API

新增 `POST /api/ai/analyze-consumption` 接口：

**请求体**：

```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-03-20",
  "transactions": [
    {
      "id": "1",
      "amount": 45.00,
      "category": "餐饮美食",
      "platform": "微信",
      "date": "2026-03-15",
      "merchant": "星巴克"
    }
  ],
  "budgets": [
    {
      "category": "餐饮美食",
      "limit": 2000,
      "spent": 1500
    }
  ]
}
```

**响应体**：

```json
{
  "summary": "本月消费结构以餐饮为主，占比 35%，相比上月下降 10%...",
  "insights": [
    {
      "type": "warning",
      "title": "餐饮消费偏高",
      "description": "本周餐饮消费 ¥850，超出周均水平 45%"
    },
    {
      "type": "info",
      "title": "周末消费集中",
      "description": "72% 的消费发生在周末，建议平日提前规划"
    }
  ],
  "suggestions": [
    {
      "title": "本周餐饮预算超支预警",
      "description": "当前已消费 ¥850，剩余预算 ¥150，建议工作日自己做饭",
      "priority": "high"
    }
  ],
  "stats": {
    "totalExpense": 5000,
    "avgDaily": 250,
    "topCategory": "餐饮美食",
    "topCategoryPercent": 35
  }
}
```

### 2.3 AI Prompt 设计

```typescript
const ANALYZE_PROMPT = `你是一位专业的个人财务顾问。请分析以下消费数据，生成简洁、有用的分析报告。

本月消费概况：
- 总消费：¥{totalExpense}
- 日均消费：¥{avgDaily}
- 消费笔数：{transactionCount}
- 主要消费类别：{topCategories}

近期交易：
{transactionsList}

当前预算状态：
{budgetsStatus}

请生成 JSON 格式的分析报告，包含：
1. summary：100字以内的月度消费总结
2. insights：2-4条关键洞察（每条包含 type: info/warning，title，description）
3. suggestions：2-3条具体可执行的优化建议（每条包含 title，description，priority: high/medium/low）
4. stats：关键统计数据

只返回 JSON，不要有其他文字。`;
```

## 3. 页面布局

### 3.1 移动端布局

```
┌────────────────────────────────┐
│ 🔍 搜索...    平台 ▼  日期范围  │  ← 筛选栏 (sticky)
├────────────────────────────────┤
│ 🤖 AI 智能分析                   │  ← 新增 AI 分析卡片
│ ┌────────────────────────────┐ │
│ │ 📊 本月消费 ¥5,230          │ │
│ │ 日均 ¥262，较上月 +5%      │ │
│ │                            │ │
│ │ 💡 洞察                    │ │
│ │ • 餐饮消费占比最高 (35%)   │ │
│ │ • 周末消费占比 72%         │ │
│ │                            │ │
│ │ 📝 建议                    │ │
│ │ • 工作日自己做饭可省 ¥200  │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ 📈 支出趋势          ¥3,520    │  ← 统计卡片
│ 📊 分类分布                      │
│ ...                              │
```

### 3.2 AI 分析卡片样式

- 卡片高度：自适应内容
- 移动端左右边距：`p-3`
- PC 端左右边距：`p-4`
- 背景：渐变浅色背景或白色带阴影
- 交互：可展开/收起详细信息

## 4. 数据获取

### 4.1 消费数据获取

复用现有的 `/api/transactions` 接口，获取最近 30 天的交易数据。

```typescript
// 获取分析数据
async function fetchAnalysisData() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const [transactions, budgets] = await Promise.all([
    apiFetch<{ items: Transaction[] }>(
      `/api/transactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    ),
    apiFetch<{ items: Budget[] }>('/api/budgets')
  ]);

  return { transactions: transactions.items, budgets: budgets.items };
}
```

## 5. 实现步骤

### Phase 1: 后端 API ✅

- [x] 创建 `/api/ai/analyze-consumption` 接口
- [x] 实现 AI Prompt 构造与调用
- [x] 定义响应类型

### Phase 2: 前端组件 ✅

- [x] 创建 `AIAnalysisCard` 组件
- [x] 实现数据获取与状态管理
- [x] 设计移动端适配布局
- [x] 集成到消费页面

### Phase 3: 交互优化 ✅

- [x] 添加 loading 状态骨架屏
- [x] 实现展开/收起功能
- [x] 添加错误处理与重试
- [x] 打字机效果与逐条弹出动画
- [x] 修复打字阶段转换 bug

## 6. 注意事项

1. **性能**：使用 React Query 缓存分析结果，避免每次进入页面都调用 AI
2. **成本**：限制分析的时间范围（默认 30 天），避免单次请求数据量过大
3. **容错**：AI 服务不可用时显示友好的错误提示，不阻塞页面加载
4. **移动端**：确保卡片在小屏幕下布局合理，文字不溢出

## 7. 文件清单

### 新增文件

- `web/src/features/consumption/components/AIAnalysisCard.tsx` - AI 分析卡片组件
- `server/src/services/aiAnalyzer.ts` - AI 分析服务（可选）

### 修改文件

- `web/src/app/(dashboard)/consumption/page.tsx` - 集成 AI 分析卡片
- `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` - 调整顶部布局
- `server/src/main.ts` - 新增 API 路由

## 8. 预计工作量

- 后端 API：0.5 天
- 前端组件：1 天
- 调试优化：0.5 天
- **总计：约 2 天**
