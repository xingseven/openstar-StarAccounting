import OpenAI from "openai";

// 从环境变量读取配置，作为默认值
const DEFAULT_API_KEY = process.env.VOLC_API_KEY || "";
const DEFAULT_BASE_URL = process.env.VOLC_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const DEFAULT_MODEL_ID = process.env.VOLC_MODEL_ID || "doubao-1-5-vision-v2";

// 平台类型
export type PlatformType = "alipay" | "wechat" | "unionpay";

// 通用返回类型
export type ReceiptData = {
  amount: number;
  currency: string;
  merchant: string;
  date: string;
  category: string;
  description: string;
  platform: PlatformType;
  // 各平台特有字段
  tradeName?: string;      // 云闪付：消费名称
  cardNo?: string;          // 云闪付：卡号
  tradeTime?: string;       // 云闪付：交易时间
  tradeCategory?: string;   // 云闪付：交易类别
  // 微信特有
  product?: string;         // 微信：商品
  payeeFullName?: string;   // 微信：商户全称
  // 支付宝特有
  billCategory?: string;    // 支付宝：账单分类
  paymentMethod?: string;   // 支付宝：付款方式
  paymentTime?: string;     // 支付宝：支付时间
  remark?: string;         // 备注
};

export type AIModelConfig = {
  apiKey?: string;
  endpoint?: string;
  modelId?: string;
  provider?: string;
};

// 不同平台的 Prompt 模板
function getPromptForPlatform(platform: PlatformType): string {
  const commonFields = `
- amount (number): 总金额，纯数字。如果图片显示为负数（如 -15.00），请提取其绝对值（如 15.00）。
- currency (string): 币种，如 "CNY"。
- category (string): 消费分类，请从以下列表中选择最匹配的一个：[餐饮, 购物, 交通, 娱乐, 生活, 医疗, 教育, 其他]。
`;

  if (platform === "unionpay") {
    // 云闪付：消费名称、金额、卡号、交易时间、交易类别、分类
    return `你是一个专业的财务助手。请分析图片中的云闪付账单，提取以下关键信息并以严格的 JSON 格式返回：

需要提取的字段：
${commonFields}
- tradeName (string): 消费名称，如 "消费" 。
- cardNo (string): 卡号，如 "****1234"，提取尾号即可。
- tradeTime (string): 交易时间，格式为 "YYYY-MM-DD HH:mm:ss"。
- tradeCategory (string): 交易类别，如 "消费" 。

请直接返回 JSON 对象，不要包含 markdown 代码块标记（如 \`\`\`json），也不要包含任何解释性文字。`;
  }

  if (platform === "wechat") {
    // 微信：名称、金额、支付时间、商品、商户全称
    return `你是一个专业的财务助手。请分析图片中的微信支付账单，提取以下关键信息并以严格的 JSON 格式返回：

需要提取的字段：
${commonFields}
- merchant (string): 商户名称，如 "星巴克"。
- tradeTime (string): 支付时间，格式为 "YYYY-MM-DD HH:mm:ss"。
- product (string): 商品描述，如 "拿铁咖啡"。
- payeeFullName (string): 商户全称，如 "星巴克咖啡专营店"。

请直接返回 JSON 对象，不要包含 markdown 代码块标记（如 \`\`\`json），也不要包含任何解释性文字。`;
  }

  // 支付宝（默认）
  return `你是一个专业的财务助手。请分析图片中的支付宝账单或小票，提取以下关键信息并以严格的 JSON 格式返回：

需要提取的字段：
${commonFields}
- merchant (string): 商户名称，如 "万林车行", "星巴克"。
- date (string): 消费日期，格式为 YYYY-MM-DD。如果年份不明确，默认使用当前年份。优先从"支付时间"或"交易时间"中提取日期部分。
- description (string): 简短的消费描述，如 "收钱码收款"、"拿铁咖啡"。
- billCategory (string): 账单分类，如图片中有明确的"账单分类"字段（如 "爱车养车"），请提取。若无则为空字符串。
- paymentMethod (string): 付款方式，如 "中信银行储蓄卡(8155)"、"零钱" 等。若无则为空字符串。
- paymentTime (string): 完整的支付时间或交易时间，如 "2026-03-18 19:32:00"。若无则为空字符串。
- remark (string): 备注信息，如图片中有"备注"字段，请提取。若无则为空字符串。

请直接返回 JSON 对象，不要包含 markdown 代码块标记（如 \`\`\`json），也不要包含任何解释性文字。`;
}

/**
 * 扫描小票
 * @param imageBase64 图片 Base64 编码
 * @param config 可选的大模型配置，如果不传则使用环境变量
 * @param platform 平台类型：alipay | wechat | unionpay
 */
export async function scanReceipt(
  imageBase64: string,
  config?: AIModelConfig,
  platform: PlatformType = "alipay"
): Promise<ReceiptData> {
  // 使用传入的配置或环境变量
  const apiKey = config?.apiKey || DEFAULT_API_KEY;
  const baseURL = config?.endpoint || DEFAULT_BASE_URL;
  const modelId = config?.modelId || DEFAULT_MODEL_ID;

  if (!apiKey) {
    throw new Error("Missing API Key. Please configure a model in the AI settings page.");
  }

  // 根据不同的提供商创建不同的客户端
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  try {
    const prompt = getPromptForPlatform(platform);

    const response = await client.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
    });

    const content = response.choices[0].message.content || "{}";

    // 清理可能存在的 Markdown 标记
    const cleanContent = content.replace(/```json\n|\n```/g, "").trim();

    const data = JSON.parse(cleanContent);

    // 根据不同平台构建返回数据
    const baseResult = {
      amount: Math.abs(Number(data.amount) || 0),
      currency: data.currency || "CNY",
      merchant: data.merchant || data.payeeFullName || "未知商户",
      date: data.date || data.tradeTime?.split(' ')[0] || new Date().toISOString().split('T')[0],
      category: data.category || "其他",
      description: data.description || data.product || "扫码消费",
      platform,
    };

    if (platform === "unionpay") {
      return {
        ...baseResult,
        tradeName: data.tradeName || "",
        cardNo: data.cardNo || "",
        tradeTime: data.tradeTime || "",
        tradeCategory: data.tradeCategory || "",
      };
    }

    if (platform === "wechat") {
      return {
        ...baseResult,
        tradeTime: data.tradeTime || "",
        product: data.product || "",
        payeeFullName: data.payeeFullName || "",
      };
    }

    // 支付宝
    return {
      ...baseResult,
      billCategory: data.billCategory || "",
      paymentMethod: data.paymentMethod || "",
      paymentTime: data.paymentTime || "",
      payeeFullName: data.payeeFullName || "",
      remark: data.remark || "",
    };

  } catch (error) {
    console.error("AI Scan Receipt Error:", error);
    throw new Error("Failed to analyze receipt image");
  }
}
