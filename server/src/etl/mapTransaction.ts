type Source = "wechat" | "alipay";

export type MappedTransaction = {
  orderId: string | null;
  date: Date;
  type: "INCOME" | "EXPENSE" | "TRANSFER" | "REPAYMENT";
  amount: string;
  category: string;
  platform: string;
  merchant: string | null;
  description: string | null;
  paymentMethod: string | null;
  status: string | null;
};

// 统一分类映射
const UNIFIED_CATEGORIES = [
  "餐饮美食",
  "生活服务",
  "转账红包",
  "信用卡还款",
  "商业服务",
  "退款",
  "医疗健康",
  "交通出行",
  "充值缴费",
  "日用百货",
  "服饰装扮",
  "数码电器",
  "爱车养车",
  "家居家装",
  "账户存取",
  "投资理财",
  "信用借还",
  "其他",
] as const;

// 微信交易类型 → 统一分类 映射
const WECHAT_TYPE_MAP: Record<string, string> = {
  "商户消费": "日用百货",
  "扫二维码": "日用百货",
  "转账": "转账红包",
  "红包": "转账红包",
  "信用卡还款": "信用卡还款",
  "其他": "其他",
  "退款": "退款",
  "投资理财": "投资理财",
  "城市服务": "生活服务",
  "生活缴费": "充值缴费",
  "医疗健康": "医疗健康",
  "交通出行": "交通出行",
  "信用借还": "信用借还",
  "商业服务": "商业服务",
  "服饰装扮": "服饰装扮",
  "数码电器": "数码电器",
  "爱车养车": "爱车养车",
  "家居家装": "家居家装",
  "话费和流量": "充值缴费",
  "公益": "其他",
  "电影票": "其他",
  "机票火车票": "交通出行",
  "酒店": "其他",
  "旅游": "其他",
  "签证": "其他",
};

// 统一状态
export type UnifiedStatus = "SUCCESS" | "FAILED" | "REFUND";

// 微信状态 → 统一状态
const WECHAT_STATUS_MAP: Record<string, UnifiedStatus> = {
  "支付成功": "SUCCESS",
  "对方已收钱": "SUCCESS",
  "已到账": "SUCCESS",
  "已转账": "SUCCESS",
  "转账失败": "FAILED",
  "已关闭": "FAILED",
  "退款成功": "REFUND",
};

// 支付宝状态 → 统一状态
const ALIPAY_STATUS_MAP: Record<string, UnifiedStatus> = {
  "交易成功": "SUCCESS",
  "还款成功": "SUCCESS",
  "解冻成功": "SUCCESS",
  "转账成功": "SUCCESS",
  "支付成功": "SUCCESS",
  "转账失败": "FAILED",
  "交易关闭": "FAILED",
  "退款成功": "REFUND",
};

// 平台映射
const PLATFORM_MAP: Record<Source, string> = {
  wechat: "微信支付",
  alipay: "支付宝",
};

function getValue(row: Record<string, string>, ...keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function parseDate(dateRaw: string): Date | null {
  if (!dateRaw) return null;

  // 尝试标准格式 2026-03-22 10:38
  let d = new Date(dateRaw);
  if (!isNaN(d.getTime())) return d;

  // 支付宝格式: 3/20/26 10:38 (M/D/YY H:mm)
  const match = dateRaw.match(/^(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)/);
  if (match) {
    const [, month, day, year, hour, minute] = match;
    const fullYear = parseInt(year) + (parseInt(year) > 50 ? 1900 : 2000);
    d = new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function parseAmount(raw: string) {
  const s = raw.replace(/[,\s]/g, "").replace(/[¥￥]/g, "");
  if (!s) return { ok: false as const };
  const sign = s.startsWith("-") ? -1 : 1;
  const n = Number(s);
  if (!Number.isFinite(n)) return { ok: false as const };
  const abs = Math.abs(n);
  return { ok: true as const, sign, abs: abs.toFixed(2) };
}

function parseDirection(raw: string) {
  const v = raw.trim();
  if (v.includes("支")) return "EXPENSE" as const;
  if (v.includes("收") || v.includes("入")) return "INCOME" as const;
  return null;
}

function inferLoanLikeType(params: {
  source: Source;
  originalCategory: string;
  merchant: string;
  title: string;
  remark: string;
  statusRaw: string;
}) {
  const { source, originalCategory, merchant, title, remark, statusRaw } = params;
  const combined = [originalCategory, merchant, title, remark, statusRaw].join(" ");

  if (source === "wechat" && originalCategory.includes("信用卡还款")) {
    return "REPAYMENT" as const;
  }

  if (source === "alipay" && originalCategory.includes("信用借还")) {
    if (
      combined.includes("还款")
      || combined.includes("归还")
      || statusRaw.includes("还款成功")
    ) {
      return "REPAYMENT" as const;
    }

    if (
      combined.includes("放款")
      || combined.includes("取出至余额")
      || statusRaw.includes("放款成功")
    ) {
      return "TRANSFER" as const;
    }
  }

  return null;
}

function joinDesc(...parts: string[]) {
  const s = parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join(" | ");
  return s.length > 0 ? s : null;
}

function getUnifiedStatus(status: string, source: Source): UnifiedStatus | null {
  const statusMap = source === "wechat" ? WECHAT_STATUS_MAP : ALIPAY_STATUS_MAP;
  return statusMap[status] || null;
}

function mapCategory(category: string, source: Source): string {
  // 如果分类为空，返回"其他"
  if (!category) return "其他";

  if (source === "wechat") {
    // 微信：先尝试直接映射
    const mapped = WECHAT_TYPE_MAP[category];
    if (mapped) return mapped;

    // 模糊匹配
    for (const [key, value] of Object.entries(WECHAT_TYPE_MAP)) {
      if (category.includes(key) || key.includes(category)) {
        return value;
      }
    }
  }

  // 检查是否是有效的统一分类
  if (UNIFIED_CATEGORIES.includes(category as typeof UNIFIED_CATEGORIES[number])) {
    return category;
  }

  // 如果都不匹配，使用原始分类（可能是支付宝的分类，直接用）
  return category || "其他";
}

export function mapRowToTransaction(row: Record<string, string>, source: Source) {
  const dateRaw = getValue(row, "交易时间");
  const date = parseDate(dateRaw);
  if (!date) return { ok: false as const, reason: "INVALID_DATE" };

  const statusRaw = getValue(row, "当前状态", "交易状态", "状态");
  const unifiedStatus = getUnifiedStatus(statusRaw, source);

  // 即使状态是 FAILED 也导入，只是不显示为成功
  const finalStatus = unifiedStatus || "SUCCESS";

  const amountRaw = getValue(row, "金额(元)", "收/支金额", "金额");
  const amountInfo = parseAmount(amountRaw);
  // 金额无效则跳过
  if (!amountInfo.ok) return { ok: false as const, reason: "INVALID_AMOUNT" };

  const directionRaw = getValue(row, "收/支", "资金状态");
  const direction = parseDirection(directionRaw);

  const inferredType: MappedTransaction["type"] | null =
    direction === "EXPENSE"
      ? "EXPENSE"
      : direction === "INCOME"
        ? "INCOME"
        : amountInfo.sign < 0
          ? "EXPENSE"
          : amountInfo.sign > 0
            ? "INCOME"
            : "EXPENSE"; // 默认当作支出

  // 获取原始分类并映射到统一分类
  const originalCategory =
    source === "wechat"
      ? getValue(row, "交易类型", "交易分类")
      : getValue(row, "交易分类", "交易类型");

  // 如果没有分类，使用"其他"
  const category = originalCategory ? mapCategory(originalCategory, source) : "其他";

  const merchant = getValue(row, "交易对方", "对方", "对方账号");
  const title = getValue(row, "商品", "商品说明");
  const remark = getValue(row, "备注");

  const description = joinDesc(title, remark);

  const loanLikeType = inferLoanLikeType({
    source,
    originalCategory,
    merchant,
    title,
    remark,
    statusRaw,
  });

  const paymentMethod = getValue(row, "支付方式", "收/付款方式");
  const orderId =
    source === "wechat"
      ? getValue(row, "交易单号", "交易订单号")
      : getValue(row, "交易订单号", "商家订单号");

  if (!orderId) return { ok: false as const, reason: "MISSING_ORDER_ID" };

  const mapped: MappedTransaction = {
    orderId,
    date,
    type: loanLikeType ?? inferredType,
    amount: amountInfo.abs,
    category,
    platform: PLATFORM_MAP[source],
    merchant: merchant || null,
    description,
    paymentMethod: paymentMethod || null,
    status: finalStatus,
  };

  return { ok: true as const, tx: mapped };
}

// 导出统一分类列表，供前端使用
export function getUnifiedCategories() {
  return [...UNIFIED_CATEGORIES];
}
