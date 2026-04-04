import OpenAI from "openai";
// 从环境变量读取配置，作为默认值
const DEFAULT_API_KEY = process.env.VOLC_API_KEY || "";
const DEFAULT_BASE_URL = process.env.VOLC_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const DEFAULT_MODEL_ID = process.env.VOLC_MODEL_ID || "doubao-1-5-vision-v2";
const DEFAULT_ANALYSIS_MODEL = process.env.VOLC_ANALYSIS_MODEL || "doubao-seed-2-0-mini-260215";
// 不同平台的 Prompt 模板
function getPromptForPlatform(platform) {
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
export async function scanReceipt(imageBase64, config, platform = "alipay") {
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
    }
    catch (error) {
        console.error("AI Scan Receipt Error:", error);
        throw new Error("Failed to analyze receipt image");
    }
}
/**
 * 分析消费数据
 * @param transactions 交易记录列表
 * @param budgets 预算列表
 * @param config 可选的大模型配置
 */
export async function analyzeConsumption(transactions, budgets, config) {
    const apiKey = config?.apiKey || DEFAULT_API_KEY;
    const baseURL = config?.endpoint || DEFAULT_BASE_URL;
    const modelId = config?.modelId || DEFAULT_ANALYSIS_MODEL;
    if (!apiKey) {
        throw new Error("Missing API Key. Please configure a model in the AI settings page.");
    }
    // 计算基本统计
    const totalExpense = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgDaily = transactions.length > 0
        ? totalExpense / Math.max(1, new Set(transactions.map(t => t.date.split('T')[0])).size)
        : 0;
    // 分类统计
    const categoryStats = transactions.reduce((acc, t) => {
        const cat = t.category || "其他";
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
    }, {});
    const topCategory = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "无";
    const topCategoryPercent = totalExpense > 0
        ? Math.round((categoryStats[topCategory] || 0) / totalExpense * 100)
        : 0;
    // 平台统计
    const platformStats = transactions.reduce((acc, t) => {
        const platform = t.platform || "未知";
        acc[platform] = (acc[platform] || 0) + t.amount;
        return acc;
    }, {});
    // 生成交易列表摘要
    const transactionsList = transactions.slice(0, 20).map(t => `- ${t.date.split('T')[0]} | ${t.category} | ¥${Math.abs(t.amount).toFixed(2)} | ${t.merchant || t.description || ""}`).join("\n");
    // 预算状态
    const budgetStatus = budgets.map(b => `- ${b.category}: 已 ¥${b.spent.toFixed(2)} / 预算 ¥${b.limit.toFixed(2)}`).join("\n");
    // 构建 Prompt
    const prompt = `你是一位专业的个人财务顾问。请分析以下消费数据，生成简洁、有用的分析报告。

【消费概况】
- 总消费：¥${totalExpense.toFixed(2)}
- 总收入：¥${totalIncome.toFixed(2)}
- 日均消费：¥${avgDaily.toFixed(2)}
- 消费笔数：${transactions.length}
- 主要消费类别：${topCategory} (占比 ${topCategoryPercent}%)

【平台分布】
${Object.entries(platformStats).map(([p, v]) => `- ${p}: ¥${v.toFixed(2)}`).join("\n")}

【近期交易】(最多显示20笔)
${transactionsList || "暂无交易记录"}

【预算状态】
${budgetStatus || "暂无预算设置"}

请以严格的 JSON 格式返回分析报告，不要包含 markdown 代码块标记：
{
  "summary": "50字以内的月度消费总结",
  "insights": [
    {"type": "info/warning/success", "title": "洞察标题", "description": "详细描述"}
  ],
  "suggestions": [
    {"title": "建议标题", "description": "具体可执行的建议", "priority": "high/medium/low"}
  ]
}`;
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
                    content: "你是一个专业的个人财务顾问，擅长分析消费数据并提供优化建议。回答应该简洁、实用、有数据支撑。"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
        });
        const content = response.choices[0].message.content || "{}";
        // 清理可能存在的 Markdown 标记
        const cleanContent = content.replace(/```json\n|\n```|```/g, "").trim();
        const data = JSON.parse(cleanContent);
        return {
            summary: data.summary || "暂无数据",
            insights: Array.isArray(data.insights) ? data.insights : [],
            suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
            stats: {
                totalExpense,
                totalIncome,
                avgDaily,
                transactionCount: transactions.length,
                topCategory,
                topCategoryPercent,
                expenseChangePercent: 0, // 简化计算
            }
        };
    }
    catch (error) {
        console.error("AI Analyze Consumption Error:", error);
        throw new Error("Failed to analyze consumption data");
    }
}
