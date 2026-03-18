import OpenAI from "openai";

// 从环境变量读取配置，如果不存在则使用默认值（开发阶段可能需要手动配置）
const API_KEY = process.env.VOLC_API_KEY || "";
const BASE_URL = process.env.VOLC_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
// 请确保在 .env 中配置了正确的 Model ID (接入点 ID)
const MODEL_ID = process.env.VOLC_MODEL_ID || "doubao-1-5-vision-v2"; 

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

export type ReceiptData = {
  amount: number;
  currency: string;
  merchant: string;
  date: string;
  category: string;
  description: string;
};

export async function scanReceipt(imageBase64: string): Promise<ReceiptData> {
  if (!API_KEY) {
    throw new Error("Missing VOLC_API_KEY environment variable");
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL_ID,
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
      // 部分模型可能不支持 response_format: { type: "json_object" }，这里暂不强制，通过 Prompt 约束
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
