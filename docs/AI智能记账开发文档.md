# AI 智能视觉记账功能开发文档 (V1.1) - 豆包版

## 1. 功能概述
通过集成字节跳动 **豆包 (Doubao)** 视觉大模型（火山引擎），实现“拍照即记账”的功能。用户上传账单照片（小票、电子账单截图等），系统自动提取消费关键信息，经用户确认后一键存入数据库。

## 2. 业务流程 (Workflow)
1. **上传层 (Frontend)**: 用户在“消费”页面点击“AI 记账”按钮，选择或拍摄照片。
2. **处理层 (Backend)**: 后端接收图片流，调用火山引擎豆包 API，发送图像和结构化提示词。
3. **识别层 (AI Model)**: 豆包视觉模型识别内容，返回结构化 JSON。
4. **交互层 (Frontend)**: 展示识别出的金额、商户、日期等，用户微调分类。
5. **持久层 (Database)**: 用户确认，保存至 `transaction` 表。

## 3. 技术栈选型
- **AI 模型**: `Doubao-vision-pro` (火山引擎版)。
- **后端 SDK**: `openai` (豆包 API 完全兼容 OpenAI 格式) 或 `volcengine-sdk`。
- **存储方案**: 临时存储图片 Base64，不占用永久磁盘空间。
- **前端组件**: `shadcn/ui` + `Lucide Icons`。

## 4. 核心接口定义 (API Design)

### POST `/api/ai/scan-receipt`
- **输入**: `multipart/form-data` (包含 `image` 文件)。
- **后端配置**:
  - **Endpoint**: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`
  - **API Key**: 从火山引擎控制台获取。
  - **Model ID**: 部署好的豆包视觉模型接入点 ID。
- **System Prompt**:
  > "你是一个财务专家。请分析图片中的账单，提取以下信息并以 JSON 格式返回：amount (数值), merchant (商户名), date (格式 YYYY-MM-DD), category (从'餐饮', '交通', '购物', '娱乐', '生活'中选一个), description (简短描述)。严禁返回任何解释文字，只返回 JSON。"
- **输出**: 
  ```json
  {
    "code": 200,
    "data": {
      "amount": 45.00,
      "merchant": "瑞幸咖啡 (静安寺店)",
      "date": "2026-03-18",
      "category": "餐饮",
      "description": "冰吸生椰拿铁"
    }
  }
  ```

## 5. 开发阶段划分

### 第一阶段：火山引擎准备
- 注册[火山引擎](https://www.volcengine.com/)账号。
- 开通 **Ark 方舟平台**，创建豆包视觉模型的“接入点 (Endpoint)”。
- 后端安装依赖：`npm install openai`。
- 在 `.env` 配置 `VOLC_API_KEY` 和 `VOLC_MODEL_ENDPOINT`。

### 第二阶段：后端视觉解析服务
- 创建 `src/server/src/services/doubaoAi.ts`。
- 实现图片转 Base64 逻辑。
- 编写调用豆包接口的代码，处理 API 响应。

### 第三阶段：前端 UI 适配
- 消费页增加 AI 扫码按钮。
- 开发识别后的“结果确认弹窗”。

## 6. 豆包视觉模型的优势
- **中文 OCR 增强**: 对手写票据、模糊文字的识别能力极强。
- **低成本**: 相比 GPT-4o 或 Gemini，API 费用极低。
- **极速响应**: 毫秒级返回结果。
