const CATEGORY_RULES = [
    { keywords: ["餐饮", "美食", "外卖", "快餐", "火锅", "烧烤", "奶茶", "咖啡", "星巴克", "麦当劳", "肯德基", "必胜客", "瑞幸", "美团外卖", "饿了么", "海底捞"], category: "餐饮", priority: 100 },
    { keywords: ["超市", "便利店", "商场", "购物", "京东", "淘宝", "天猫", "拼多多", "超市", "沃尔玛", "家乐福", "永辉", "711", "全家", "罗森"], category: "购物", priority: 90 },
    { keywords: ["滴滴", "打车", "出租车", "地铁", "公交", "出行", "加油", "停车", "高速", "火车", "机票", "航班", "携程", "去哪儿", "飞猪", "高德", "神州"], category: "交通", priority: 90 },
    { keywords: ["电影", "游戏", "娱乐", "KTV", "网吧", "视频", "音乐", "会员", "爱奇艺", "腾讯视频", "优酷", "B站", "哔哩哔哩", "网易云音乐", "QQ音乐", "Steam"], category: "娱乐", priority: 85 },
    { keywords: ["医院", "药店", "药品", "医疗", "体检", "挂号", "健康", "诊所", "牙科", "眼科"], category: "医疗", priority: 95 },
    { keywords: ["教育", "培训", "课程", "学习", "书店", "考试", "学费", "网课", "英语", "编程"], category: "教育", priority: 85 },
    { keywords: ["房租", "水电", "物业", "燃气", "宽带", "话费", "充值", "移动", "联通", "电信"], category: "居住", priority: 80 },
    { keywords: ["转账", "红包", "还款", "借款", "提现", "充值", "退款"], category: "转账", priority: 70 },
    { keywords: ["理财", "基金", "股票", "投资", "存款", "储蓄"], category: "理财", priority: 75 },
    { keywords: ["工资", "奖金", "报销", "收入", "退款"], category: "收入", priority: 60 },
];
const MERCHANT_RULES = [
    { patterns: ["星巴克", "STARBUCKS"], category: "餐饮", aliases: ["星爸爸"] },
    { patterns: ["麦当劳", "MCDONALD"], category: "餐饮", aliases: ["金拱门", "M记"] },
    { patterns: ["肯德基", "KFC"], category: "餐饮", aliases: ["开封菜"] },
    { patterns: ["瑞幸咖啡", "LUCKIN"], category: "餐饮", aliases: ["小蓝杯"] },
    { patterns: ["必胜客", "PIZZA HUT"], category: "餐饮" },
    { patterns: ["海底捞"], category: "餐饮" },
    { patterns: ["美团外卖", "美团"], category: "餐饮" },
    { patterns: ["饿了么"], category: "餐饮" },
    { patterns: ["滴滴出行", "滴滴", "DIDI"], category: "交通" },
    { patterns: ["高德地图", "高德"], category: "交通" },
    { patterns: ["神州专车"], category: "交通" },
    { patterns: ["京东", "JD", "京东商城"], category: "购物" },
    { patterns: ["淘宝", "TAOBAO"], category: "购物" },
    { patterns: ["天猫"], category: "购物" },
    { patterns: ["拼多多"], category: "购物" },
    { patterns: ["爱奇艺"], category: "娱乐" },
    { patterns: ["腾讯视频"], category: "娱乐" },
    { patterns: ["哔哩哔哩", "B站", "BILIBILI"], category: "娱乐" },
    { patterns: ["网易云音乐"], category: "娱乐" },
    { patterns: ["中国移动", "10086"], category: "居住" },
    { patterns: ["中国联通", "10010"], category: "居住" },
    { patterns: ["中国电信", "10000"], category: "居住" },
];
function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, "").replace(/[^\u4e00-\u9fa5a-z0-9]/gi, "");
}
function matchKeywords(text, keywords) {
    const normalized = normalizeText(text);
    return keywords.some((kw) => normalized.includes(normalizeText(kw)));
}
function matchMerchant(merchant, patterns, aliases) {
    const normalized = normalizeText(merchant);
    const allPatterns = [...patterns, ...(aliases || [])];
    return allPatterns.some((p) => normalized.includes(normalizeText(p)));
}
export function classifyTransaction(merchant, description, originalCategory) {
    const searchText = [merchant, description, originalCategory].filter(Boolean).join(" ");
    if (!searchText.trim()) {
        return "其他";
    }
    for (const rule of MERCHANT_RULES) {
        if (merchant && matchMerchant(merchant, rule.patterns, rule.aliases)) {
            return rule.category;
        }
    }
    const sortedRules = [...CATEGORY_RULES].sort((a, b) => b.priority - a.priority);
    for (const rule of sortedRules) {
        if (matchKeywords(searchText, rule.keywords)) {
            return rule.category;
        }
    }
    if (originalCategory && originalCategory !== "其他" && originalCategory.trim()) {
        return originalCategory;
    }
    return "其他";
}
export function classifyBatch(transactions) {
    return transactions.map((t) => classifyTransaction(t.merchant, t.description, t.originalCategory));
}
export function suggestCategory(input) {
    return classifyTransaction(input, null, null);
}
