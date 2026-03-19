import OpenAI from "openai";

// 从环境变量读取配置，作为默认值
const DEFAULT_API_KEY = process.env.VOLC_API_KEY || "";
const DEFAULT_BASE_URL = process.env.VOLC_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const DEFAULT_MODEL_ID = process.env.VOLC_MODEL_ID || "doubao-1-5-vision-v2";

export type ReceiptData = {
  amount: number;
  currency: string;
  merchant: string;
  date: string;
  category: string;
  description: string;
  billCategory?: string; // 账单分类 (如: 爱车养车)
  paymentMethod?: string; // 付款方式 (如: 中信银行储蓄卡(8155))
  paymentTime?: string; // 支付时间 (如: 2026-03-18 19:32:00)
  payeeFullName?: string; // 收款方全称
  remark?: string; // 备注
};

export type AIModelConfig = {
  apiKey?: string;
  endpoint?: string;
  modelId?: string;
  provider?: string;
};

/**
 * 扫描小票
 * @param imageBase64 图片 Base64 编码
 * @param config 可选的大模型配置，如果不传则使用环境变量
 */
export async function scanReceipt(imageBase64: string, config?: AIModelConfig): Promise<ReceiptData> {
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
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content: `你是一个专业的财务助手。请分析图片中的账单或小票，提取以下关键信息并以严格的 JSON 格式返回：

          需要提取的字段：
          - amount (number): 总金额，纯数字。如果图片显示为负数（如 -15.00），请提取其绝对值（如 15.00）。
          - currency (string): 币种，如 "CNY"。
          - merchant (string): 商户名称或交易对象，如 "万林车行", "星巴克"。如果页面顶部有明显的大字商户名，优先提取。
          - date (string): 消费日期，格式为 YYYY-MM-DD。如果年份不明确，默认使用当前年份。优先从“支付时间”或“交易时间”中提取日期部分。
          - category (string): 消费分类，请从以下列表中选择最匹配的一个：[餐饮, 购物, 交通, 娱乐, 生活, 医疗, 教育, 其他]。
          - description (string): 简短的消费描述，如 "商品说明" 中的内容，例如 "收钱码收款"、"拿铁咖啡"。
          - billCategory (string): 账单分类，如图片中有明确的“账单分类”字段（如 "爱车养车"），请提取。若无则为空字符串。
          - paymentMethod (string): 付款方式，如 "中信银行储蓄卡(8155)"、"零钱" 等。若无则为空字符串。
          - paymentTime (string): 完整的支付时间或交易时间，如 "2026-03-18 19:32:00"。若无则为空字符串。
          - payeeFullName (string): 收款方全称，如 "**秋(个人)"。若无则为空字符串。
          - remark (string): 备注信息，如图片中有“备注”字段，请提取。若无则为空字符串。

          请直接返回 JSON 对象，不要包含 markdown 代码块标记（如 \`\`\`json），也不要包含任何解释性文字。`
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

    // 简单的数据清洗与回退
    return {
      amount: Math.abs(Number(data.amount) || 0), // 确保金额是正数
      currency: data.currency || "CNY",
      merchant: data.merchant || "未知商户",
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || "其他",
      description: data.description || "扫码消费",
      billCategory: data.billCategory || "",
      paymentMethod: data.paymentMethod || "",
      paymentTime: data.paymentTime || "",
      payeeFullName: data.payeeFullName || "",
      remark: data.remark || ""
    };

  } catch (error) {
    console.error("AI Scan Receipt Error:", error);
    throw new Error("Failed to analyze receipt image");
  }
}
