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
          - amount (number): 总金额，纯数字。
          - currency (string): 币种，如 "CNY"。
          - merchant (string): 商户名称，如 "星巴克", "7-Eleven"。
          - date (string): 消费日期，格式为 YYYY-MM-DD。如果年份不明确，默认使用当前年份。
          - category (string): 消费分类，请从以下列表中选择最匹配的一个：[餐饮, 购物, 交通, 娱乐, 生活, 医疗, 教育, 其他]。
          - description (string): 简短的消费描述，如 "拿铁咖啡", "打车费"。

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
      amount: Number(data.amount) || 0,
      currency: data.currency || "CNY",
      merchant: data.merchant || "未知商户",
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || "其他",
      description: data.description || "扫码消费"
    };

  } catch (error) {
    console.error("AI Scan Receipt Error:", error);
    throw new Error("Failed to analyze receipt image");
  }
}
