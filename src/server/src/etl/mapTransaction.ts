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

const successStatuses = new Set([
  "支付成功",
  "交易成功",
  "已存入",
  "已取出",
  "已完成",
]);

function getValue(row: Record<string, string>, ...keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
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

function joinDesc(...parts: string[]) {
  const s = parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join(" | ");
  return s.length > 0 ? s : null;
}

function isSuccessful(status: string) {
  if (!status) return true;
  return successStatuses.has(status);
}

export function mapRowToTransaction(row: Record<string, string>, source: Source) {
  const dateRaw = getValue(row, "交易时间");
  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return { ok: false as const, reason: "INVALID_DATE" };

  const status = getValue(row, "当前状态", "交易状态", "状态");
  if (!isSuccessful(status)) return { ok: false as const, reason: "INVALID_STATUS" };

  const amountRaw = getValue(row, "金额(元)", "收/支金额", "金额");
  const amountInfo = parseAmount(amountRaw);
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
            : null;

  if (!inferredType) return { ok: false as const, reason: "INVALID_TYPE" };

  const category =
    source === "wechat"
      ? getValue(row, "交易类型", "交易分类")
      : getValue(row, "交易分类", "交易类型");

  if (!category) return { ok: false as const, reason: "INVALID_CATEGORY" };

  const merchant = getValue(row, "交易对方", "对方", "商家名称");
  const title = getValue(row, "商品", "商品说明");
  const remark = getValue(row, "备注");

  const description = joinDesc(title, remark);

  const paymentMethod = getValue(row, "支付方式", "收/付款方式");
  const orderId =
    source === "wechat"
      ? getValue(row, "交易单号", "交易订单号")
      : getValue(row, "交易订单号", "商家订单号");

  const mapped: MappedTransaction = {
    orderId: orderId || null,
    date,
    type: inferredType,
    amount: amountInfo.abs,
    category,
    platform: source,
    merchant: merchant || null,
    description,
    paymentMethod: paymentMethod || null,
    status: status || null,
  };

  return { ok: true as const, tx: mapped };
}
