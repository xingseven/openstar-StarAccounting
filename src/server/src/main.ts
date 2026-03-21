import cors from "cors";
import crypto from "crypto";
import express, { type Request, type Response } from "express";
import multer from "multer";
import { getPrisma } from "./lib/prisma.js";
import { importCsvBuffer } from "./etl/importCsv.js";
import { mapRowToTransaction } from "./etl/mapTransaction.js";
import { signAccessToken, verifyAccessToken } from "./auth/jwt.js";
import { hashPassword, verifyPassword } from "./auth/password.js";
import { convertCurrency, type ExchangeRate as CurrencyExchangeRate } from "./lib/currency.js";
import { calculateBudgetUsage, calculateBudgetHealth, type BudgetStatus } from "./logic/budget.js";
import { calculateAssetValue } from "./logic/asset.js";
import { fetchExchangeRates } from "./services/exchangeRate.js";
import { scanReceipt, type ReceiptData, analyzeConsumption, type TransactionInput, type BudgetInput } from "./services/doubaoAi.js";

type ApiSuccess<T> = {
  code: 200;
  message: string;
  data: T;
};

type ApiError = {
  code: number;
  message: string;
  detail?: string;
};

type TransactionRecord = {
  id: string;
  accountId: string;
  orderId: string | null;
  date: string;
  type: string;
  amount: string;
  category: string;
  platform: string;
  merchant: string | null;
  description: string | null;
  paymentMethod: string | null;
  status: string | null;
};

type Connection = {
  id: string;
  otpCode: string;
  isVerified: boolean;
  expiresAt: number;
  createdAt: number;
  verifiedAt?: number;
  deviceId?: string;
  deviceName?: string;
  ipAddress?: string;
};

const connectionsById = new Map<string, Connection>();
const connectionIdByOtp = new Map<string, string>();
const transactionsByUser = new Map<string, TransactionRecord[]>();
const transactionsByAccount = new Map<string, TransactionRecord[]>();

type SavingsGoal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string | null;
  type: string;
  depositType?: string;
  status: string;
  createdAt: string;
};
const savingsGoalsByUser = new Map<string, SavingsGoal[]>();

type Loan = {
  id: string;
  userId: string;
  platform: string;
  totalAmount: string;
  remainingAmount: string;
  periods: number;
  paidPeriods: number;
  monthlyPayment: string;
  dueDate: number;
  status: string;
  createdAt: string;
};
const loansByUser = new Map<string, Loan[]>();

type Asset = {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  createdAt: string;
};
const assetsByUser = new Map<string, Asset[]>();

type Budget = {
  id: string;
  userId: string;
  amount: string;
  category: string;
  period: "MONTHLY" | "YEARLY";
  createdAt: string;
};
const budgetsByUser = new Map<string, Budget[]>();

type ExchangeRate = {
  id: string;
  from: string;
  to: string;
  rate: string;
  updatedAt: string;
};
const exchangeRates = new Map<string, ExchangeRate>();

// Initialize some default rates
const defaultRates = [
  { from: "USD", to: "CNY", rate: "7.20" },
  { from: "EUR", to: "CNY", rate: "7.80" },
  { from: "HKD", to: "CNY", rate: "0.92" },
  { from: "JPY", to: "CNY", rate: "0.048" },
];
for (const r of defaultRates) {
  const key = `${r.from}-${r.to}`;
  exchangeRates.set(key, {
    id: crypto.randomUUID(),
    from: r.from,
    to: r.to,
    rate: r.rate,
    updatedAt: new Date().toISOString(),
  });
}

function jsonOk<T>(res: Response, data: T, message = "ok") {
  const body: ApiSuccess<T> = { code: 200, message, data };
  res.json(body);
}

function jsonFail(
  res: Response,
  status: number,
  code: number,
  message: string,
  detail?: string
) {
  const body: ApiError = { code, message, detail };
  res.status(status).json(body);
}

function getRequestIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0]?.trim();
  }
  return req.ip;
}

function generateOtpCode() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function cleanupExpiredInMemory() {
  const now = Date.now();
  for (const [id, conn] of connectionsById.entries()) {
    if (!conn.isVerified && conn.expiresAt <= now) {
      connectionsById.delete(id);
      connectionIdByOtp.delete(conn.otpCode);
    }
  }
}

async function cleanupExpiredInDb() {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.appconnection.deleteMany({
    where: { isVerified: false, expiresAt: { lt: new Date() } },
  });
}

function getUserEmail(req: Request): string | null {
  const header = req.headers["x-user-email"] ?? req.headers["x-user-id"];
  if (typeof header === "string" && header.trim().length > 0) {
    const v = header.trim();
    return v.includes("@") ? v : `${v}@dev.local`;
  }
  return null;
}

async function ensureUserId(email: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { id: crypto.randomUUID(), email, password: "dev", updatedAt: new Date() },
  });
  return user.id;
}

function memoryUserId(email: string) {
  return `mem-${email}`;
}

function getAuthUserId(req: Request) {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);
    if (payload) return payload.userId;
  }
  return null;
}

async function requireUserId(req: Request, res: Response) {
  const tokenUserId = getAuthUserId(req);
  if (tokenUserId) return tokenUserId;

  const prisma = getPrisma();
  if (!prisma) {
    const email = getUserEmail(req);
    if (!email) {
      jsonFail(res, 401, 10002, "TOKEN_EXPIRED", "请先登录");
      return null;
    }
    return memoryUserId(email);
  }

  const allowDevHeaders = true; // process.env.ALLOW_DEV_HEADERS === "1";
  if (!allowDevHeaders) {
    jsonFail(res, 401, 10002, "TOKEN_EXPIRED", "请先登录");
    return null;
  }

  const email = getUserEmail(req);
  if (!email) {
    jsonFail(res, 401, 10002, "TOKEN_EXPIRED", "请先登录");
    return null;
  }
  const userId = await ensureUserId(email);
  if (!userId) {
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "用户初始化失败");
    return null;
  }
  return userId;
}

async function requireAccountId(req: Request, res: Response): Promise<{ userId: string; accountId: string } | null> {
  const userId = await requireUserId(req, res);
  if (!userId) return null;

  const prisma = getPrisma();
  if (!prisma) {
    return { userId, accountId: userId }; // 内存模式用 userId 作为 accountId
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultAccountId: true },
  });

  if (!user?.defaultAccountId) {
    jsonFail(res, 400, 40001, "NO_ACCOUNT", "用户未绑定默认账户，请先创建账户");
    return null;
  }

  return { userId, accountId: user.defaultAccountId };
}

async function requireAdmin(req: Request, res: Response): Promise<string | null> {
  const userId = await requireUserId(req, res);
  if (!userId) return null;

  const prisma = getPrisma();
  if (!prisma) {
    return userId;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      jsonFail(res, 403, 10003, "FORBIDDEN", "需要管理员权限");
      return null;
    }
    return userId;
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
    return null;
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.get("/api/health", (_req, res) => {
  jsonOk(res, { status: "ok" });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (typeof email !== "string" || !email.includes("@")) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "email 不合法");
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "password 至少 6 位");
    return;
  }

  const prisma = getPrisma();
  if (!prisma) {
    const token = signAccessToken({ userId: memoryUserId(email) });
    if (!token) {
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", "JWT_SECRET 未配置");
      return;
    }
    jsonOk(res, { accessToken: token, user: { id: memoryUserId(email), email, name: typeof name === "string" ? name : email.split("@")[0] } });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { id: crypto.randomUUID(), email, password: passwordHash, name: typeof name === "string" ? name : null, updatedAt: new Date() },
      select: { id: true, email: true, name: true },
    });

    const token = signAccessToken({ userId: user.id });
    if (!token) {
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", "JWT_SECRET 未配置");
      return;
    }

    jsonOk(res, { accessToken: token, user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", message);
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    jsonFail(res, 400, 10001, "INVALID_CREDENTIALS", "账号或密码错误");
    return;
  }

  const prisma = getPrisma();
  if (!prisma) {
    const token = signAccessToken({ userId: memoryUserId(email) });
    if (!token) {
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", "JWT_SECRET 未配置");
      return;
    }
    jsonOk(res, { accessToken: token, user: { id: memoryUserId(email), email, name: email.split("@")[0] } });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, password: true },
  });
  if (!user) {
    jsonFail(res, 400, 10001, "INVALID_CREDENTIALS", "账号或密码错误");
    return;
  }

  const ok = await verifyPassword(user.password, password);
  if (!ok) {
    jsonFail(res, 400, 10001, "INVALID_CREDENTIALS", "账号或密码错误");
    return;
  }

  const token = signAccessToken({ userId: user.id });
  if (!token) {
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "JWT_SECRET 未配置");
    return;
  }

  jsonOk(res, { accessToken: token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get("/api/auth/me", async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    const userId = await requireUserId(req, res);
    if (!userId) return;
    
    let email = "dev@local";
    if (userId.startsWith("mem-")) {
      email = userId.replace("mem-", "");
    }
    jsonOk(res, { user: { id: userId, email, name: email.split("@")[0] } });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) {
      jsonFail(res, 401, 10002, "TOKEN_EXPIRED", "请重新登录");
      return;
    }
    jsonOk(res, { user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
  }
});

function parseQuery(req: Request) {
  const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
  const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
  const type = typeof req.query.type === "string" ? req.query.type : "EXPENSE";
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  return {
    startDate,
    endDate,
    type,
    start: start && !Number.isNaN(start.getTime()) ? start : null,
    end: end && !Number.isNaN(end.getTime()) ? end : null,
  };
}

app.get("/api/metrics/consumption/summary", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const prisma = getPrisma();

  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId, type };
      if (start || end) {
        where.date = {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        };
      }

      const [count, sum] = await Promise.all([
        prisma.transaction.count({ where }),
        prisma.transaction.aggregate({ where, _sum: { amount: true } }),
      ]);

      const totalExpense = String(sum._sum.amount ?? 0);
      const avgExpense = count > 0 ? String(Number(totalExpense) / count) : "0";

      jsonOk(res, { totalExpense, expenseCount: count, avgExpense });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const all = transactionsByUser.get(userId) ?? [];
  const filtered = all.filter((t) => {
    if (t.type !== type) return false;
    const ts = new Date(t.date).getTime();
    if (start && ts < start.getTime()) return false;
    if (end && ts > end.getTime()) return false;
    return true;
  });

  const total = filtered.reduce((acc, t) => acc + Number(t.amount), 0);
  const count = filtered.length;
  jsonOk(res, {
    totalExpense: total.toFixed(2),
    expenseCount: count,
    avgExpense: count > 0 ? (total / count).toFixed(2) : "0",
  });
});

app.get("/api/metrics/consumption/by-platform", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const prisma = getPrisma();

  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId, type };
      if (start || end) {
        where.date = {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        };
      }

      // @ts-ignore - Prisma aggregation type mismatch
      const rows = await prisma.transaction.groupBy({
        by: ["platform"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      });

      const items = rows
        .map((r) => ({
          platform: r.platform,
          total: String(r._sum.amount ?? 0),
          count: r._count._all,
        }))
        .sort((a: { total: string }, b: { total: string }) => Number(b.total) - Number(a.total));

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const all = transactionsByUser.get(userId) ?? [];
  const map = new Map<string, { total: number; count: number }>();

  for (const t of all) {
    if (t.type !== type) continue;
    const ts = new Date(t.date).getTime();
    if (start && ts < start.getTime()) continue;
    if (end && ts > end.getTime()) continue;

    const cur = map.get(t.platform) ?? { total: 0, count: 0 };
    cur.total += Number(t.amount);
    cur.count += 1;
    map.set(t.platform, cur);
  }

  const items = Array.from(map.entries())
    .map(([platform, v]) => ({ platform, total: v.total.toFixed(2), count: v.count }))
    .sort((a, b) => Number(b.total) - Number(a.total));

  jsonOk(res, { items });
});

app.get("/api/metrics/consumption/by-category", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 10)));
  const prisma = getPrisma();

  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId, type };
      if (start || end) {
        where.date = {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        };
      }

      // @ts-ignore - Prisma aggregation type mismatch
      const rows = await prisma.transaction.groupBy({
        by: ["category"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      });

      const items = rows
        .map((r) => ({
          category: r.category,
          total: String(r._sum.amount ?? 0),
          count: r._count._all,
        }))
        .sort((a: { total: string }, b: { total: string }) => Number(b.total) - Number(a.total))
        .slice(0, limit);

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const all = transactionsByUser.get(userId) ?? [];
  const map = new Map<string, { total: number; count: number }>();

  for (const t of all) {
    if (t.type !== type) continue;
    const ts = new Date(t.date).getTime();
    if (start && ts < start.getTime()) continue;
    if (end && ts > end.getTime()) continue;

    const cur = map.get(t.category) ?? { total: 0, count: 0 };
    cur.total += Number(t.amount);
    cur.count += 1;
    map.set(t.category, cur);
  }

  const items = Array.from(map.entries())
    .map(([category, v]) => ({ category, total: v.total.toFixed(2), count: v.count }))
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, limit);

  jsonOk(res, { items });
});

app.get("/api/metrics/consumption/by-merchant", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 10)));
  const prisma = getPrisma();

  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId, type };
      if (start || end) {
        where.date = {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        };
      }

      // @ts-ignore - Prisma aggregation type mismatch
      const rows = await prisma.transaction.groupBy({
        by: ["merchant"],
        where,
        _sum: { amount: true },
      });

      const items = rows
        .map((r) => ({
          merchant: r.merchant || "未知",
          total: String(r._sum.amount ?? 0),
        }))
        .sort((a, b) => Number(b.total) - Number(a.total))
        .slice(0, limit);

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  // Memory implementation omitted for brevity, fallback to empty
  jsonOk(res, { items: [] });
});

app.get("/api/metrics/consumption/daily-category", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const prisma = getPrisma();

  if (prisma) {
    try {
      // Group by day and category
      const rows = (await prisma.$queryRawUnsafe(`
        SELECT date_trunc('day', "date") AS d, "category", SUM(amount) AS total
        FROM "Transaction"
        WHERE "userId"='${userId}'
          AND "type"='${type}'
          AND (${start ? `'${start.toISOString()}'::timestamptz` : "NULL"} IS NULL OR "date" >= '${start ? start.toISOString() : ""}')
          AND (${end ? `'${end.toISOString()}'::timestamptz` : "NULL"} IS NULL OR "date" <= '${end ? end.toISOString() : ""}')
        GROUP BY d, "category"
        ORDER BY d
      `)) as Array<{ d: Date; category: string; total: unknown }>;

      const items = rows.map((r) => ({
        day: r.d.toISOString().slice(0, 10),
        category: r.category,
        total: String(r.total ?? 0),
      }));

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonOk(res, { items: [] });
});

app.get("/api/metrics/consumption/platform-category", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const prisma = getPrisma();

  if (prisma) {
    try {
      // @ts-ignore - Prisma aggregation type mismatch
      const rows = await prisma.transaction.groupBy({
        by: ["platform", "category"],
        where: {
          userId,
          type: type as any,
          date: {
            ...(start ? { gte: start } : {}),
            ...(end ? { lte: end } : {}),
          }
        },
        _sum: { amount: true },
      });

      const items = rows.map((r) => ({
        platform: r.platform,
        category: r.category,
        total: String(r._sum.amount ?? 0),
      }));

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonOk(res, { items: [] });
});

app.get("/api/metrics/consumption/daily", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const groupBy = req.query.groupBy === "month" ? "month" : "day";
  const prisma = getPrisma();

  if (prisma) {
    try {
      const trunc = groupBy === "month" ? "month" : "day";
      const rows = (await prisma.$queryRawUnsafe(`SELECT date_trunc('${trunc}',"date") AS d, SUM(amount) AS total, COUNT(*)::int AS count
        FROM "Transaction"
        WHERE "userId"='${userId}'
          AND "type"='${type}'
          AND (${start ? `'${start.toISOString()}'::timestamptz` : "NULL"} IS NULL OR "date" >= '${start ? start.toISOString() : ""}')
          AND (${end ? `'${end.toISOString()}'::timestamptz` : "NULL"} IS NULL OR "date" <= '${end ? end.toISOString() : ""}')
        GROUP BY d
        ORDER BY d`)) as Array<{ d: Date; total: unknown; count: number }>;

      const items = rows.map((r) => ({
        day: r.d.toISOString().slice(0, groupBy === "month" ? 7 : 10),
        total: String(r.total ?? 0),
        count: r.count,
      }));

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const all = transactionsByUser.get(userId) ?? [];
  const map = new Map<string, { total: number; count: number }>();

  for (const t of all) {
    if (t.type !== type) continue;
    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) continue;
    if (start && d.getTime() < start.getTime()) continue;
    if (end && d.getTime() > end.getTime()) continue;
    
    const key = d.toISOString().slice(0, groupBy === "month" ? 7 : 10);
    const cur = map.get(key) ?? { total: 0, count: 0 };
    cur.total += Number(t.amount);
    cur.count += 1;
    map.set(key, cur);
  }

  const items = Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({ day, total: v.total.toFixed(2), count: v.count }));

  jsonOk(res, { items });
});

app.get("/api/transactions", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(200, Number(req.query.pageSize ?? 20));
  const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
  const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const platform = typeof req.query.platform === "string" ? req.query.platform : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const prisma = getPrisma();
  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId };
      if (startDate || endDate) {
        where.date = {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        };
      }
      if (type) where.type = type;
      if (platform) where.platform = platform;
      if (search) {
        where.OR = [
          { merchant: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } },
        ];
      }

      const [total, items] = await Promise.all([
        prisma.transaction.count({ where }),
        prisma.transaction.findMany({
          where,
          orderBy: { date: "desc" },
          skip: (Math.max(1, page) - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            orderId: true,
            date: true,
            type: true,
            amount: true,
            category: true,
            platform: true,
            merchant: true,
            description: true,
            paymentMethod: true,
            status: true,
          },
        }),
      ]);

      jsonOk(res, { page, pageSize, total, items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const all = transactionsByUser.get(userId) ?? [];
  const filtered = all.filter((t) => {
    if (type && t.type !== type) return false;
    if (platform && t.platform !== platform) return false;
    const ts = new Date(t.date).getTime();
    if (startDate) {
      const s = new Date(startDate).getTime();
      if (Number.isFinite(s) && ts < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate).getTime();
      if (Number.isFinite(e) && ts > e) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const text = `${t.merchant ?? ""} ${t.description ?? ""} ${t.category}`.toLowerCase();
      if (!text.includes(s)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const items = filtered.slice(
    (Math.max(1, page) - 1) * pageSize,
    Math.max(1, page) * pageSize
  );
  jsonOk(res, { page, pageSize, total, items });
});

app.put("/api/transactions/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;
  const { amount, category, merchant, description, type, platform, date } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      const tx = await prisma.transaction.update({
        where: { id, userId },
        data: {
          ...(amount ? { amount: String(amount) } : {}),
          ...(category ? { category } : {}),
          ...(merchant ? { merchant } : {}),
          ...(description ? { description } : {}),
          ...(type ? { type } : {}),
          ...(platform ? { platform } : {}),
          ...(date ? { date: new Date(date) } : {}),
        },
      });
      jsonOk(res, { item: tx });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = transactionsByUser.get(userId) ?? [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) {
    jsonFail(res, 404, 50000, "NOT_FOUND", "交易不存在");
    return;
  }
  const old = list[idx];
  const updated: TransactionRecord = {
    ...old,
    ...(amount ? { amount: String(amount) } : {}),
    ...(category ? { category } : {}),
    ...(merchant ? { merchant } : {}),
    ...(description ? { description } : {}),
    ...(type ? { type } : {}),
    ...(platform ? { platform } : {}),
    ...(date ? { date: String(date) } : {}),
  };
  list[idx] = updated;
  jsonOk(res, { item: updated });
});

app.delete("/api/transactions/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.transaction.delete({ where: { id, userId } });
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = transactionsByUser.get(userId) ?? [];
  const newList = list.filter((t) => t.id !== id);
  transactionsByUser.set(userId, newList);
  jsonOk(res, { deleted: true });
});

app.post("/api/transactions/batch", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const { action, ids, category } = req.body ?? {};

  if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "缺少必要参数");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      if (action === "delete") {
        const result = await prisma.transaction.deleteMany({
          where: { id: { in: ids }, userId },
        });
        jsonOk(res, { deleted: result.count });
        return;
      } else if (action === "updateCategory" && category) {
        const result = await prisma.transaction.updateMany({
          where: { id: { in: ids }, userId },
          data: { category },
        });
        jsonOk(res, { updated: result.count });
        return;
      } else {
        jsonFail(res, 400, 50000, "INVALID_ACTION", "不支持的操作类型");
        return;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = transactionsByUser.get(userId) ?? [];
  if (action === "delete") {
    const newList = list.filter((t) => !ids.includes(t.id));
    transactionsByUser.set(userId, newList);
    jsonOk(res, { deleted: ids.length });
    return;
  } else if (action === "updateCategory" && category) {
    let count = 0;
    const newList = list.map((t) => {
      if (ids.includes(t.id)) {
        count++;
        return { ...t, category };
      }
      return t;
    });
    transactionsByUser.set(userId, newList);
    jsonOk(res, { updated: count });
    return;
  }

  jsonFail(res, 400, 50000, "INVALID_ACTION", "不支持的操作类型");
});

app.get("/api/import-errors", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const { resolved } = req.query;
      const where: any = { userId };
      if (resolved !== undefined) {
        where.resolved = resolved === "true";
      }
      const logs = await prisma.importerrorlog.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      jsonOk(res, { items: logs });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonOk(res, { items: [] });
});

app.put("/api/import-errors/:id/resolve", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const log = await prisma.importerrorlog.update({
        where: { id, userId },
        data: { resolved: true },
      });
      jsonOk(res, { item: log });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 404, 50000, "NOT_FOUND", "记录不存在");
});

app.delete("/api/import-errors/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.importerrorlog.delete({ where: { id, userId } });
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonOk(res, { deleted: true });
});

app.post("/api/transactions", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const { amount, type, category, platform, merchant, date, description } = req.body ?? {};

  if (!amount || !type || !category || !platform || !date) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "缺少必填字段");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      // @ts-ignore - Prisma type mismatch
      const tx = await prisma.transaction.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          accountId: userId, // fallback to userId for single-account mode
          amount: String(amount),
          type: type as any,
          category,
          platform,
          merchant: merchant ?? null,
          date: new Date(date),
          description: description ?? null,
          updatedAt: new Date(),
        },
      });
      jsonOk(res, { item: tx });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 500, 50000, "INTERNAL_ERROR", "Database not available");
});

app.post("/api/transactions/import", upload.single("file"), async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const source = typeof req.body?.source === "string" ? req.body.source : "";
  if (source !== "wechat" && source !== "alipay") {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "source 必须为 wechat 或 alipay");
    return;
  }

  const file = req.file;
  if (!file?.buffer || file.buffer.length === 0) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "file 不能为空");
    return;
  }

  let imported;
  try {
    imported = importCsvBuffer(file.buffer, source);
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e && "code" in e ? (e as { code?: unknown }).code : 50000;
    if (code === 30001) {
      jsonFail(res, 400, 30001, "IMPORT_HEADER_NOT_FOUND", "无法识别微信/支付宝列头，请检查文件格式");
      return;
    }
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "解析失败");
    return;
  }

  const mapped = imported.rows.map((r) => mapRowToTransaction(r, source));
  const valid = mapped
    .filter((m) => m.ok)
    .map((m) => (m as { ok: true; tx: unknown }).tx) as {
    orderId: string | null;
    date: Date;
    type: string;
    amount: string;
    category: string;
    platform: string;
    merchant: string | null;
    description: string | null;
    paymentMethod: string | null;
    status: string | null;
  }[];
  const invalidCount = mapped.length - valid.length;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const orderIds = valid.map((v) => v.orderId).filter((v): v is string => !!v);
      const existing: Array<{ orderId: string | null }> =
        orderIds.length > 0
          ? await prisma.transaction.findMany({
              where: { orderId: { in: orderIds }, accountId },
              select: { orderId: true },
            })
          : [];
      const existingSet = new Set(existing.map((e) => e.orderId).filter((v): v is string => !!v));
      const duplicateCount = valid.filter((v) => v.orderId && existingSet.has(v.orderId)).length;

      const toInsert = valid.filter((v) => !v.orderId || !existingSet.has(v.orderId));
      // @ts-ignore - Prisma type mismatch
      const result =
        toInsert.length > 0
          ? await prisma.transaction.createMany({
              data: toInsert.map((t) => ({
                id: crypto.randomUUID(),
                userId,
                accountId,
                orderId: t.orderId,
                date: t.date,
                type: t.type as any,
                amount: t.amount,
                category: t.category,
                platform: t.platform,
                merchant: t.merchant,
                description: t.description,
                paymentMethod: t.paymentMethod,
                status: t.status,
                updatedAt: new Date(),
              })),
              skipDuplicates: true,
            })
          : { count: 0 };

      jsonOk(res, {
        totalRows: imported.rows.length,
        insertedCount: result.count,
        duplicateCount,
        invalidCount,
      });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = transactionsByUser.get(userId) ?? [];
  const existingSet = new Set(list.map((t) => t.orderId).filter((v): v is string => !!v));
  let duplicateCount = 0;
  let insertedCount = 0;

  for (const t of valid) {
    if (t.orderId && existingSet.has(t.orderId)) {
      duplicateCount++;
      continue;
    }
    const id = crypto.randomUUID();
    list.push({
      id,
      accountId,
      orderId: t.orderId,
      date: t.date.toISOString(),
      type: t.type,
      amount: t.amount,
      category: t.category,
      platform: t.platform,
      merchant: t.merchant,
      description: t.description,
      paymentMethod: t.paymentMethod,
      status: t.status,
    });
    if (t.orderId) existingSet.add(t.orderId);
    insertedCount++;
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  transactionsByUser.set(userId, list);
  transactionsByAccount.set(accountId, list);

  jsonOk(res, {
    totalRows: imported.rows.length,
    insertedCount,
    duplicateCount,
    invalidCount,
  });
});

app.get("/api/connect/devices", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const prisma = getPrisma();
  if (prisma) {
    try {
      const devices = await prisma.appconnection.findMany({
        where: { userId, isVerified: true },
        orderBy: [{ verifiedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          deviceId: true,
          deviceName: true,
          ipAddress: true,
          verifiedAt: true,
          createdAt: true,
        },
      });

      jsonOk(res, { devices });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const devices = Array.from(connectionsById.values())
    .filter((c) => c.isVerified)
    .map((c) => ({
      id: c.id,
      deviceId: c.deviceId ?? null,
      deviceName: c.deviceName ?? null,
      ipAddress: c.ipAddress ?? null,
      verifiedAt: c.verifiedAt ? new Date(c.verifiedAt).toISOString() : null,
      createdAt: new Date(c.createdAt).toISOString(),
    }));

  jsonOk(res, { devices });
});

app.post("/api/connect/generate", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  try {
    await cleanupExpiredInDb();
  } catch {
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.appconnection.deleteMany({
        where: { userId, isVerified: false },
      });

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      for (let i = 0; i < 20; i++) {
        const otpCode = generateOtpCode();
        try {
          // @ts-ignore - Prisma type mismatch
          await prisma.appconnection.create({
            data: {
              id: crypto.randomUUID(),
              userId,
              accountId: userId, // fallback to userId for single-account mode
              otpCode,
              expiresAt,
              ipAddress: getRequestIp(req),
            },
          });

          jsonOk(res, {
            otpCode,
            publicIp: process.env.PUBLIC_IP ?? "0.0.0.0",
            expiresAt: expiresAt.toISOString(),
          });
          return;
        } catch (e: unknown) {
          if (
            typeof e === "object" &&
            e &&
            "code" in e &&
            (e as { code?: unknown }).code === "P2002"
          )
            continue;
          throw e;
        }
      }

      jsonFail(res, 500, 50000, "INTERNAL_ERROR", "生成验证码失败");
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  cleanupExpiredInMemory();

  for (const conn of connectionsById.values()) {
    if (!conn.isVerified && conn.expiresAt > Date.now()) {
      jsonOk(res, {
        otpCode: conn.otpCode,
        publicIp: process.env.PUBLIC_IP ?? "0.0.0.0",
        expiresAt: new Date(conn.expiresAt).toISOString(),
      });
      return;
    }
  }

  let otpCode = generateOtpCode();
  while (connectionIdByOtp.has(otpCode)) otpCode = generateOtpCode();

  const id = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000;

  const conn: Connection = {
    id,
    otpCode,
    isVerified: false,
    createdAt: now,
    expiresAt,
    ipAddress: getRequestIp(req),
  };

  connectionsById.set(id, conn);
  connectionIdByOtp.set(otpCode, id);

  jsonOk(res, {
    otpCode,
    publicIp: process.env.PUBLIC_IP ?? "0.0.0.0",
    expiresAt: new Date(expiresAt).toISOString(),
  });
});

app.post("/api/connect/verify", async (req, res) => {
  try {
    await cleanupExpiredInDb();
  } catch {
  }

  const { otpCode, deviceId, deviceName } = req.body ?? {};

  if (typeof otpCode !== "string" || otpCode.trim().length !== 6) {
    jsonFail(res, 400, 20001, "OTP_NOT_FOUND", "otpCode 格式不正确");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const conn = await prisma.appconnection.findFirst({
        where: {
          otpCode,
          isVerified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!conn) {
        jsonFail(res, 400, 20001, "OTP_NOT_FOUND", "验证码不存在或已过期");
        return;
      }

      if (typeof deviceId !== "string" || deviceId.trim().length === 0) {
        jsonFail(res, 400, 50000, "INTERNAL_ERROR", "deviceId 必填");
        return;
      }

      const updated = await prisma.appconnection.update({
        where: { id: conn.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          deviceId: deviceId.trim(),
          deviceName: typeof deviceName === "string" ? deviceName : null,
          ipAddress: getRequestIp(req),
        },
      });

      jsonOk(
        res,
        { accessToken: `dev-${updated.id}`, connectionId: updated.id },
        "verified"
      );
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const id = connectionIdByOtp.get(otpCode);
  if (!id) {
    jsonFail(res, 400, 20001, "OTP_NOT_FOUND", "验证码不存在");
    return;
  }

  const conn = connectionsById.get(id);
  if (!conn) {
    jsonFail(res, 400, 20001, "OTP_NOT_FOUND", "验证码不存在");
    return;
  }

  if (conn.isVerified) {
    jsonFail(res, 400, 20003, "OTP_ALREADY_USED", "验证码已使用");
    return;
  }

  if (conn.expiresAt <= Date.now()) {
    jsonFail(res, 400, 20002, "OTP_EXPIRED", "验证码已过期");
    return;
  }

  if (typeof deviceId !== "string" || deviceId.trim().length === 0) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "deviceId 必填");
    return;
  }

  conn.isVerified = true;
  conn.verifiedAt = Date.now();
  conn.deviceId = deviceId;
  if (typeof deviceName === "string") conn.deviceName = deviceName;

  jsonOk(res, { accessToken: `dev-${id}`, connectionId: id }, "verified");
});

app.delete("/api/connect/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const deleted = await prisma.appconnection.deleteMany({
        where: { id, userId },
      });
      if (deleted.count === 0) {
        jsonFail(res, 404, 50000, "INTERNAL_ERROR", "connection 不存在");
        return;
      }
      jsonOk(res, { revoked: true });
      return;
    } catch {
      jsonFail(res, 404, 50000, "INTERNAL_ERROR", "connection 不存在");
      return;
    }
  }

  const conn = connectionsById.get(id);
  if (!conn) {
    jsonFail(res, 404, 50000, "INTERNAL_ERROR", "connection 不存在");
    return;
  }
  connectionsById.delete(id);
  connectionIdByOtp.delete(conn.otpCode);
  jsonOk(res, { revoked: true });
});

// Savings Goal API
app.get("/api/savings", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const goals = await prisma.savingsgoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      jsonOk(res, { items: goals });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const items = savingsGoalsByUser.get(userId) ?? [];
  jsonOk(res, { items });
});

app.post("/api/savings", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { name, targetAmount, deadline, type, depositType, plans, planConfig } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "name 必填");
    return;
  }
  // targetAmount can be 0 if calculated from plans
  const targetVal = targetAmount && !Number.isNaN(Number(targetAmount)) ? Number(targetAmount) : 0;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Goal
        // @ts-ignore - Prisma type mismatch
        const goal = await tx.savingsgoal.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            accountId: userId, // fallback to userId for single-account mode
            name,
            targetAmount: targetVal,
            deadline: deadline ? new Date(deadline) : null,
            type: type || "LONG_TERM",
            depositType: depositType || "CASH",
            planConfig: planConfig ?? undefined,
            updatedAt: new Date(),
          },
        });

        // 2. Create Plans if provided
        let createdPlans: any[] = [];
        if (Array.isArray(plans) && plans.length > 0) {
          // @ts-ignore - Prisma type mismatch
          await tx.savingsplan.createMany({
            data: plans.map((p: any) => ({
              id: crypto.randomUUID(),
              goalId: goal.id,
              month: p.month,
              amount: Number(p.amount ?? 0),
              status: p.status ?? "PENDING",
              salary: p.salary ? Number(p.salary) : 0,
              expenses: p.expenses ?? {},
              remark: p.remark ?? "",
              proofImage: p.proofImage ?? null,
              updatedAt: new Date(),
            })),
          });
          
          createdPlans = await tx.savingsplan.findMany({
            where: { goalId: goal.id },
            orderBy: { month: "asc" },
          });
        }

        return { goal, plans: createdPlans };
      });

      jsonOk(res, { item: result.goal, plans: result.plans });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  // Memory fallback (simplified, no plans)
  const list = savingsGoalsByUser.get(userId) ?? [];
  const goal: SavingsGoal = {
    id: crypto.randomUUID(),
    userId,
    name,
    targetAmount: String(targetVal),
    currentAmount: "0",
    deadline: deadline || null,
    type: type || "LONG_TERM",
    depositType: depositType || "CASH",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  list.unshift(goal);
  savingsGoalsByUser.set(userId, list);
  jsonOk(res, { item: goal });
});

app.put("/api/savings/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;
  const { name, targetAmount, currentAmount, deadline, status, type, depositType } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      const goal = await prisma.savingsgoal.update({
        where: { id, userId },
        data: {
          ...(name ? { name } : {}),
          ...(targetAmount ? { targetAmount: Number(targetAmount) } : {}),
          ...(currentAmount !== undefined ? { currentAmount: Number(currentAmount) } : {}),
          ...(deadline ? { deadline: new Date(deadline) } : {}),
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(depositType ? { depositType } : {}),
        },
      });
      jsonOk(res, { item: goal });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = savingsGoalsByUser.get(userId) ?? [];
  const idx = list.findIndex((g) => g.id === id);
  if (idx < 0) {
    jsonFail(res, 404, 50000, "NOT_FOUND", "目标不存在");
    return;
  }
  const old = list[idx];
  const updated: SavingsGoal = {
    ...old,
    ...(name ? { name } : {}),
    ...(targetAmount ? { targetAmount: String(targetAmount) } : {}),
    ...(currentAmount !== undefined ? { currentAmount: String(currentAmount) } : {}),
    ...(deadline ? { deadline } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(depositType ? { depositType } : {}),
  };
  list[idx] = updated;
  jsonOk(res, { item: updated });
});

app.delete("/api/savings/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.savingsgoal.delete({ where: { id, userId } });
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = savingsGoalsByUser.get(userId) ?? [];
  const newList = list.filter((g) => g.id !== id);
  savingsGoalsByUser.set(userId, newList);
  jsonOk(res, { deleted: true });
});

// Savings Plan API
app.get("/api/savings/:id/plans", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const goalId = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const plans = await prisma.savingsplan.findMany({
        where: { goalId },
        orderBy: { month: "asc" },
      });
      jsonOk(res, { items: plans });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }
  jsonOk(res, { items: [] });
});

app.post("/api/savings/:id/plans/batch", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const goalId = req.params.id;
  const { plans, config } = req.body ?? {};

  if (!Array.isArray(plans) || plans.length === 0) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "plans 不能为空");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      // Check if goal belongs to user
      const goal = await prisma.savingsgoal.findFirst({ where: { id: goalId, userId } });
      if (!goal) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "目标不存在");
        return;
      }

      // Update goal config if provided
      if (config) {
        await prisma.savingsgoal.update({
          where: { id: goalId },
          data: { planConfig: config },
        });
      }

      // Transaction: Delete existing plans and create new ones (or upsert?)
      // For simplicity in this "Generation" mode, we might want to clear and recreate, 
      // OR intelligently merge. Given the user "Generate" flow, clear and create is safer for consistency.
      // But user might have existing data. 
      // Let's assume this endpoint is for "Initialization/Reset".
      
      // Better approach: Upsert based on Month?
      // Since we don't have unique constraint on [goalId, month], we should be careful.
      // Let's delete all for now as this is a "Re-generate" action usually.
      
      await prisma.$transaction(async (tx) => {
        await tx.savingsplan.deleteMany({ where: { goalId } });
        // @ts-ignore - Prisma type mismatch
        await tx.savingsplan.createMany({
          data: plans.map((p: any) => ({
            id: crypto.randomUUID(),
            goalId,
            month: p.month,
            amount: Number(p.amount ?? 0),
            status: p.status ?? "PENDING",
            salary: p.salary ? Number(p.salary) : 0,
            expenses: p.expenses ?? {},
            remark: p.remark ?? "",
            proofImage: p.proofImage ?? null,
            updatedAt: new Date(),
          })),
        });
        // @ts-ignore - Prisma aggregation type
        const completedAgg = await tx.savingsplan.aggregate({
          where: { goalId, status: "COMPLETED" },
          _sum: { amount: true },
        });
        await tx.savingsgoal.update({
          where: { id: goalId },
          data: { currentAmount: Number(completedAgg._sum.amount ?? 0) },
        });
      });

      const newPlans = await prisma.savingsplan.findMany({
        where: { goalId },
        orderBy: { month: "asc" },
      });
      
      jsonOk(res, { items: newPlans });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }
  jsonFail(res, 500, 50000, "INTERNAL_ERROR", "Memory mode not supported for plans");
});

app.put("/api/savings/plans/:planId", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const planId = req.params.planId;
  const { status, amount, salary, expenses, remark, proofImage } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      // Verify ownership via goal
      const plan = await prisma.savingsplan.findUnique({
        where: { id: planId },
        include: { savingsgoal: true },
      });
      if (!plan || plan.savingsgoal.userId !== userId) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "计划不存在");
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        const next = await tx.savingsplan.update({
          where: { id: planId },
          data: {
            ...(status ? { status } : {}),
            ...(amount !== undefined ? { amount: Number(amount) } : {}),
            ...(salary !== undefined ? { salary: Number(salary) } : {}),
            ...(expenses ? { expenses } : {}),
            ...(remark !== undefined ? { remark } : {}),
            ...(proofImage !== undefined ? { proofImage } : {}),
          },
        });
        const completedAgg = await tx.savingsplan.aggregate({
          where: { goalId: plan.goalId, status: "COMPLETED" },
          _sum: { amount: true },
        });
        await tx.savingsgoal.update({
          where: { id: plan.goalId },
          data: { currentAmount: Number(completedAgg._sum.amount ?? 0) },
        });
        return next;
      });
      jsonOk(res, { item: updated });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }
  jsonFail(res, 500, 50000, "INTERNAL_ERROR", "Memory mode not supported for plans");
});

app.delete("/api/savings/plans/:planId", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const planId = req.params.planId;

  const prisma = getPrisma();
  if (prisma) {
    try {
      // Verify ownership via goal
      const plan = await prisma.savingsplan.findUnique({
        where: { id: planId },
        include: { savingsgoal: true },
      });
      if (!plan || plan.savingsgoal.userId !== userId) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "计划不存在");
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.savingsplan.delete({ where: { id: planId } });
        const completedAgg = await tx.savingsplan.aggregate({
          where: { goalId: plan.goalId, status: "COMPLETED" },
          _sum: { amount: true },
        });
        await tx.savingsgoal.update({
          where: { id: plan.goalId },
          data: { currentAmount: Number(completedAgg._sum.amount ?? 0) },
        });
      });
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }
  jsonFail(res, 500, 50000, "INTERNAL_ERROR", "Memory mode not supported for plans");
});

// Loan API
app.get("/api/loans", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const loans = await prisma.loan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      jsonOk(res, { items: loans });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const items = loansByUser.get(userId) ?? [];
  jsonOk(res, { items });
});

app.post("/api/loans", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { platform, totalAmount, periods, monthlyPayment, dueDate } = req.body ?? {};
  if (typeof platform !== "string" || !platform.trim()) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "platform 必填");
    return;
  }
  if (!totalAmount || Number.isNaN(Number(totalAmount))) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "totalAmount 必填");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      // @ts-ignore - Prisma type mismatch
      const loan = await prisma.loan.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          accountId: userId, // fallback to userId for single-account mode
          platform,
          totalAmount: Number(totalAmount),
          remainingAmount: Number(totalAmount),
          periods: Number(periods ?? 1),
          paidPeriods: 0,
          monthlyPayment: Number(monthlyPayment ?? 0),
          dueDate: Number(dueDate ?? 1),
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });
      jsonOk(res, { item: loan });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = loansByUser.get(userId) ?? [];
  const loan: Loan = {
    id: crypto.randomUUID(),
    userId,
    platform,
    totalAmount: String(totalAmount),
    remainingAmount: String(totalAmount),
    periods: Number(periods ?? 1),
    paidPeriods: 0,
    monthlyPayment: String(monthlyPayment ?? 0),
    dueDate: Number(dueDate ?? 1),
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  list.unshift(loan);
  loansByUser.set(userId, list);
  jsonOk(res, { item: loan });
});

app.put("/api/loans/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;
  const { platform, totalAmount, remainingAmount, periods, paidPeriods, monthlyPayment, dueDate, status } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      const loan = await prisma.loan.update({
        where: { id, userId },
        data: {
          ...(platform ? { platform } : {}),
          ...(totalAmount !== undefined ? { totalAmount: Number(totalAmount) } : {}),
          ...(remainingAmount !== undefined ? { remainingAmount: Number(remainingAmount) } : {}),
          ...(periods !== undefined ? { periods: Number(periods) } : {}),
          ...(paidPeriods !== undefined ? { paidPeriods: Number(paidPeriods) } : {}),
          ...(monthlyPayment !== undefined ? { monthlyPayment: Number(monthlyPayment) } : {}),
          ...(dueDate !== undefined ? { dueDate: Number(dueDate) } : {}),
          ...(status ? { status } : {}),
        },
      });
      jsonOk(res, { item: loan });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = loansByUser.get(userId) ?? [];
  const idx = list.findIndex((l) => l.id === id);
  if (idx < 0) {
    jsonFail(res, 404, 50000, "NOT_FOUND", "贷款不存在");
    return;
  }
  const old = list[idx];
  const updated: Loan = {
    ...old,
    ...(platform ? { platform } : {}),
    ...(totalAmount !== undefined ? { totalAmount: String(totalAmount) } : {}),
    ...(remainingAmount !== undefined ? { remainingAmount: String(remainingAmount) } : {}),
    ...(periods !== undefined ? { periods: Number(periods) } : {}),
    ...(paidPeriods !== undefined ? { paidPeriods: Number(paidPeriods) } : {}),
    ...(monthlyPayment !== undefined ? { monthlyPayment: String(monthlyPayment) } : {}),
    ...(dueDate !== undefined ? { dueDate: Number(dueDate) } : {}),
    ...(status ? { status } : {}),
  };
  list[idx] = updated;
  jsonOk(res, { item: updated });
});

app.delete("/api/loans/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.loan.delete({ where: { id, userId } });
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = loansByUser.get(userId) ?? [];
  const newList = list.filter((l) => l.id !== id);
  loansByUser.set(userId, newList);
  jsonOk(res, { deleted: true });
});

app.post("/api/loans/:id/repay", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;
  const { amount, date, description } = req.body ?? {};
  const repayAmount = Number(amount);
  if (!Number.isFinite(repayAmount) || repayAmount <= 0) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "amount 必须大于 0");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const loan = await tx.loan.findFirst({ where: { id, userId } });
        if (!loan) {
          throw new Error("贷款不存在");
        }
        const nextRemaining = Math.max(0, Number(loan.remainingAmount) - repayAmount);
        const nextPaidPeriods = Math.min(Number(loan.periods), Number(loan.paidPeriods) + 1);
        const nextStatus = nextRemaining <= 0 ? "PAID_OFF" : "ACTIVE";
        const updatedLoan = await tx.loan.update({
          where: { id: loan.id },
          data: {
            remainingAmount: nextRemaining,
            paidPeriods: nextPaidPeriods,
            status: nextStatus,
          },
        });
        // @ts-ignore - Prisma type mismatch
        const repaymentTx = await tx.transaction.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            accountId: userId, // fallback to userId for single-account mode
            amount: repayAmount,
            type: "REPAYMENT",
            category: "贷款还款",
            platform: loan.platform,
            merchant: loan.platform,
            date: date ? new Date(date) : new Date(),
            description: typeof description === "string" ? description : null,
            loanId: loan.id,
            updatedAt: new Date(),
          },
        });
        return { loan: updatedLoan, transaction: repaymentTx };
      });
      jsonOk(res, result);
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      if (message.includes("贷款不存在")) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "贷款不存在");
        return;
      }
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 500, 50000, "INTERNAL_ERROR", "Memory mode not supported for repay");
});

// Asset API
app.get("/api/assets", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const targetCurrency = typeof req.query.currency === "string" ? req.query.currency : "CNY";

  const prisma = getPrisma();
  let assets: any[] = [];
  let rates: ExchangeRate[] = [];

  if (prisma) {
    try {
      const [assetsData, ratesData] = await Promise.all([
        prisma.asset.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.exchangerate.findMany(),
      ]);
      assets = assetsData;
      rates = ratesData.map(r => ({
        id: r.id,
        from: r.from,
        to: r.to,
        rate: String(r.rate),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  } else {
    assets = assetsByUser.get(userId) ?? [];
    rates = Array.from(exchangeRates.values());
  }

  // Build rate map
  const rateItems: CurrencyExchangeRate[] = rates.map(r => ({
    from: r.from,
    to: r.to,
    rate: Number(r.rate)
  }));

  const items = assets.map((asset) => {
    const estimatedValue = calculateAssetValue(asset, targetCurrency, rateItems);
    return {
      ...asset,
      balance: String(asset.balance), // Ensure string
      estimatedValue: estimatedValue.toFixed(2),
    };
  });

  jsonOk(res, { items });
});

app.post("/api/assets", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { name, type, balance, currency } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "name 必填");
    return;
  }
  if (!type || typeof type !== "string") {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "type 必填");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      // @ts-ignore - Prisma type mismatch
      const asset = await prisma.asset.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          accountId: userId, // fallback to userId for single-account mode
          name,
          type: type as "CASH", // Simplified type casting for now
          balance: Number(balance ?? 0),
          currency: currency || "CNY",
          updatedAt: new Date(),
        },
      });
      jsonOk(res, { item: asset });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = assetsByUser.get(userId) ?? [];
  const asset: Asset = {
    id: crypto.randomUUID(),
    userId,
    name,
    type,
    balance: String(balance ?? 0),
    currency: currency || "CNY",
    createdAt: new Date().toISOString(),
  };
  list.unshift(asset);
  assetsByUser.set(userId, list);
  jsonOk(res, { item: asset });
});

app.put("/api/assets/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;
  const { name, type, balance, currency } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      const asset = await prisma.asset.update({
        where: { id, userId },
        data: {
          ...(name ? { name } : {}),
          ...(type ? { type: type as "CASH" } : {}),
          ...(balance !== undefined ? { balance: Number(balance) } : {}),
          ...(currency ? { currency } : {}),
        },
      });
      jsonOk(res, { item: asset });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = assetsByUser.get(userId) ?? [];
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) {
    jsonFail(res, 404, 50000, "NOT_FOUND", "资产不存在");
    return;
  }
  const old = list[idx];
  const updated: Asset = {
    ...old,
    ...(name ? { name } : {}),
    ...(type ? { type } : {}),
    ...(balance !== undefined ? { balance: String(balance) } : {}),
    ...(currency ? { currency } : {}),
  };
  list[idx] = updated;
  jsonOk(res, { item: updated });
});

app.delete("/api/assets/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.asset.delete({ where: { id, userId } });
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = assetsByUser.get(userId) ?? [];
  const newList = list.filter((a) => a.id !== id);
  assetsByUser.set(userId, newList);
  jsonOk(res, { deleted: true });
});

// Budget API
app.get("/api/budgets", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentYearStart = new Date(now.getFullYear(), 0, 1);

      const items = await Promise.all(
        budgets.map(async (b) => {
          const start = b.period === "MONTHLY" ? currentMonthStart : currentYearStart;
          const where: any = {
            userId,
            type: "EXPENSE",
            date: { gte: start },
          };
          
          const scopeType = b.scopeType || "GLOBAL";
          if (scopeType === "CATEGORY" && b.category !== "ALL") {
            where.category = b.category;
          } else if (scopeType === "PLATFORM" && b.platform) {
            where.platform = b.platform;
          } else if (scopeType === "GLOBAL" && b.category !== "ALL") {
            where.category = b.category;
          }
          
          const sum = await prisma.transaction.aggregate({
            where,
            _sum: { amount: true },
          });
          
          const used = Number(sum._sum.amount ?? 0);
          const budgetAmount = Number(b.amount);
          const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0;
          const alertPercent = b.alertPercent ?? 80;
          
          let status: BudgetStatus = "normal";
          if (percent >= 100) {
            status = "overdue";
          } else if (percent >= alertPercent) {
            status = "warning";
          }

          return {
            ...b,
            amount: String(b.amount),
            used: used.toFixed(2),
            percent: percent.toFixed(2),
            status,
            alertPercent,
          };
        })
      );

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const budgets = budgetsByUser.get(userId) ?? [];
  const transactions = transactionsByUser.get(userId) ?? [];
  const now = new Date();
  
  const items = budgets.map((b) => {
    const health = calculateBudgetHealth(
      { ...b, amount: Number(b.amount) },
      transactions.map(t => ({ ...t, amount: Number(t.amount), date: new Date(t.date) })),
      now
    );
    return { 
      ...b, 
      used: health.used.toFixed(2),
      percent: health.percent.toFixed(2),
      status: health.status,
      alertPercent: health.alertPercent,
    };
  });

  jsonOk(res, { items });
});

app.post("/api/budgets", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { amount, category, period, scopeType, platform, alertPercent } = req.body ?? {};
  if (!amount || Number.isNaN(Number(amount))) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "amount 必填");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      // @ts-ignore - Prisma type mismatch
      const budget = await prisma.budget.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          accountId: userId, // fallback to userId for single-account mode
          amount: Number(amount),
          category: category || "ALL",
          period: period || "MONTHLY",
          scopeType: scopeType || "GLOBAL",
          platform: platform || null,
          alertPercent: alertPercent ?? 80,
          updatedAt: new Date(),
        },
      });
      jsonOk(res, { item: { ...budget, amount: String(budget.amount) } });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      if (typeof e === "object" && e && "code" in e && (e as any).code === "P2002") {
        jsonFail(res, 400, 50000, "DUPLICATE_BUDGET", "该分类在此周期下已存在预算");
        return;
      }
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = budgetsByUser.get(userId) ?? [];
  const exists = list.some(
    (b) => b.category === (category || "ALL") && b.period === (period || "MONTHLY")
  );
  if (exists) {
    jsonFail(res, 400, 50000, "DUPLICATE_BUDGET", "该分类在此周期下已存在预算");
    return;
  }

  const budget: Budget = {
    id: crypto.randomUUID(),
    userId,
    amount: String(amount),
    category: category || "ALL",
    period: period || "MONTHLY",
    createdAt: new Date().toISOString(),
  };
  list.unshift(budget);
  budgetsByUser.set(userId, list);
  jsonOk(res, { item: budget });
});

app.put("/api/budgets/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;
  const { amount, alertPercent } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      const budget = await prisma.budget.update({
        where: { id, userId },
        data: {
          ...(amount !== undefined ? { amount: Number(amount) } : {}),
          ...(alertPercent !== undefined ? { alertPercent: Number(alertPercent) } : {}),
        },
      });
      jsonOk(res, { item: { ...budget, amount: String(budget.amount) } });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = budgetsByUser.get(userId) ?? [];
  const idx = list.findIndex((b) => b.id === id);
  if (idx < 0) {
    jsonFail(res, 404, 50000, "NOT_FOUND", "预算不存在");
    return;
  }
  const old = list[idx];
  const updated: Budget = {
    ...old,
    ...(amount ? { amount: String(amount) } : {}),
  };
  list[idx] = updated;
  jsonOk(res, { item: updated });
});

app.delete("/api/budgets/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.budget.delete({ where: { id, userId } });
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = budgetsByUser.get(userId) ?? [];
  const newList = list.filter((b) => b.id !== id);
  budgetsByUser.set(userId, newList);
  jsonOk(res, { deleted: true });
});

app.get("/api/budgets/alerts", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentYearStart = new Date(now.getFullYear(), 0, 1);

      const alerts: Array<{
        id: string;
        category: string;
        platform?: string | null;
        period: string;
        scopeType: string;
        amount: string;
        used: string;
        percent: number;
        status: BudgetStatus;
        alertPercent: number;
      }> = [];

      for (const b of budgets) {
        const start = b.period === "MONTHLY" ? currentMonthStart : currentYearStart;
        const where: any = {
          userId,
          type: "EXPENSE",
          date: { gte: start },
        };
        
        const scopeType = b.scopeType || "GLOBAL";
        if (scopeType === "CATEGORY" && b.category !== "ALL") {
          where.category = b.category;
        } else if (scopeType === "PLATFORM" && b.platform) {
          where.platform = b.platform;
        } else if (scopeType === "GLOBAL" && b.category !== "ALL") {
          where.category = b.category;
        }
        
        const sum = await prisma.transaction.aggregate({
          where,
          _sum: { amount: true },
        });
        
        const used = Number(sum._sum.amount ?? 0);
        const budgetAmount = Number(b.amount);
        const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0;
        const alertPercent = b.alertPercent ?? 80;
        
        let status: BudgetStatus = "normal";
        if (percent >= 100) {
          status = "overdue";
        } else if (percent >= alertPercent) {
          status = "warning";
        }

        if (status !== "normal") {
          alerts.push({
            id: b.id,
            category: b.category,
            platform: b.platform,
            period: b.period,
            scopeType: b.scopeType || "GLOBAL",
            amount: String(b.amount),
            used: used.toFixed(2),
            percent,
            status,
            alertPercent,
          });
        }
      }

      jsonOk(res, { alerts });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const budgets = budgetsByUser.get(userId) ?? [];
  const transactions = transactionsByUser.get(userId) ?? [];
  const now = new Date();
  
  const alerts: Array<{
    id: string;
    category: string;
    period: string;
    amount: string;
    used: string;
    percent: number;
    status: BudgetStatus;
    alertPercent: number;
  }> = [];

  for (const b of budgets) {
    const health = calculateBudgetHealth(
      { ...b, amount: Number(b.amount) },
      transactions.map(t => ({ ...t, amount: Number(t.amount), date: new Date(t.date) })),
      now
    );
    
    if (health.status !== "normal") {
      alerts.push({
        id: b.id,
        category: b.category,
        period: b.period,
        amount: b.amount,
        used: health.used.toFixed(2),
        percent: health.percent,
        status: health.status,
        alertPercent: health.alertPercent,
      });
    }
  }

  jsonOk(res, { alerts });
});

// Exchange Rate API
app.get("/api/exchange-rates", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const rates = await prisma.exchangerate.findMany({
        orderBy: { updatedAt: "desc" },
      });
      // Convert Decimal to string
      const items = rates.map((r: any) => ({
        ...r,
        rate: String(r.rate),
        updatedAt: r.updatedAt.toISOString(),
      }));
      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const items = Array.from(exchangeRates.values());
  jsonOk(res, { items });
});

app.post("/api/exchange-rates", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { from, to, rate } = req.body ?? {};
  if (typeof from !== "string" || !from) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "from 必填");
    return;
  }
  if (typeof to !== "string" || !to) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "to 必填");
    return;
  }
  if (!rate || Number.isNaN(Number(rate))) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "rate 必填");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const r = await prisma.exchangerate.upsert({
        where: { from_to: { from, to } },
        update: { rate: Number(rate) },
        // @ts-ignore - Prisma type mismatch
        create: { id: crypto.randomUUID(), from, to, rate: Number(rate), updatedAt: new Date() },
      });
      jsonOk(res, { item: { ...r, rate: String(r.rate), updatedAt: r.updatedAt.toISOString() } });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const key = `${from}-${to}`;
  const now = new Date().toISOString();
  const existing = exchangeRates.get(key);
  
  const newItem: ExchangeRate = {
    id: existing?.id ?? crypto.randomUUID(),
    from,
    to,
    rate: String(rate),
    updatedAt: now,
  };
  exchangeRates.set(key, newItem);
  jsonOk(res, { item: newItem });
});

app.post("/api/exchange-rates/refresh", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const rates = await fetchExchangeRates("CNY");
  if (!rates) {
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "获取汇率失败");
    return;
  }

  // Filter common currencies to avoid bloating DB
  const common = ["USD", "EUR", "HKD", "JPY", "GBP", "AUD", "CAD", "SGD", "CHF"];
  const updates: Array<{ from: string; to: string; rate: number }> = [];

  for (const c of common) {
    // API returns rates relative to base (CNY). 
    // e.g. base=CNY, rates={USD: 0.14} means 1 CNY = 0.14 USD.
    // We want to store pairs like USD -> CNY (how much CNY is 1 USD).
    // So if 1 CNY = X USD, then 1 USD = 1/X CNY.
    
    // Direct rate: CNY -> c
    const direct = rates[c];
    if (direct) {
      updates.push({ from: "CNY", to: c, rate: direct });
      if (direct !== 0) {
        updates.push({ from: c, to: "CNY", rate: 1 / direct });
      }
    }
  }

  const prisma = getPrisma();
  let count = 0;

  if (prisma) {
    try {
      await Promise.all(
        updates.map((u) =>
          // @ts-ignore - Prisma type mismatch
          prisma.exchangerate.upsert({
            where: { from_to: { from: u.from, to: u.to } },
            update: { rate: u.rate },
            create: { id: crypto.randomUUID(), from: u.from, to: u.to, rate: u.rate, updatedAt: new Date() },
          })
        )
      );
      count = updates.length;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  } else {
    // Memory mode
    for (const u of updates) {
      const key = `${u.from}-${u.to}`;
      const now = new Date().toISOString();
      const existing = exchangeRates.get(key);
      exchangeRates.set(key, {
        id: existing?.id ?? crypto.randomUUID(),
        from: u.from,
        to: u.to,
        rate: String(u.rate),
        updatedAt: now,
      });
    }
    count = updates.length;
  }

  jsonOk(res, { updated: count, source: "open.er-api.com" });
});

// Settings API
app.put("/api/settings/profile", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const { name } = req.body ?? {};
  
  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { name: typeof name === "string" ? name : undefined },
        select: { id: true, email: true, name: true },
      });
      jsonOk(res, { user });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  // Memory mode: user info not editable
  jsonFail(res, 400, 50000, "NOT_SUPPORTED", "内存模式不支持修改用户信息");
});

app.put("/api/settings/password", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const { oldPassword, newPassword } = req.body ?? {};

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "新密码至少 6 位");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "用户不存在");
        return;
      }

      const ok = await verifyPassword(user.password, oldPassword);
      if (!ok) {
        jsonFail(res, 400, 50000, "INVALID_CREDENTIALS", "旧密码错误");
        return;
      }

      const hash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hash },
      });

      jsonOk(res, { updated: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 400, 50000, "NOT_SUPPORTED", "内存模式不支持修改密码");
});

// Account API - 创建新账户
app.post("/api/accounts", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { name } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "账户名称不能为空");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      // 创建账户
      const account = await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          name: name.trim(),
          ownerId: userId,
          updatedAt: new Date(),
        },
      });

      // 创建账户成员关系（自己是OWNER）
      await prisma.account_member.create({
        data: {
          id: crypto.randomUUID(),
          accountId: account.id,
          userId,
          role: "OWNER",
          nickname: null,
          joinedAt: new Date(),
        },
      });

      jsonOk(res, { item: account });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 400, 50000, "NOT_SUPPORTED", "内存模式不支持账户管理");
});

// Account API - 获取用户的账户列表
app.get("/api/accounts", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          accountMember: {
            some: { userId },
          },
        },
        include: {
          accountMember: {
            where: { userId },
            select: { role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const items = accounts.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.accountMember[0]?.role || null,
        createdAt: a.createdAt,
      }));

      jsonOk(res, { items });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 400, 50000, "NOT_SUPPORTED", "内存模式不支持账户管理");
});

// Account API - 设置默认账户
app.put("/api/accounts/:id/default", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const accountId = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      // 验证用户是否是该账户的成员
      const member = await prisma.account_member.findFirst({
        where: { accountId, userId },
      });

      if (!member) {
        jsonFail(res, 403, 50000, "FORBIDDEN", "无权操作此账户");
        return;
      }

      // 更新用户的默认账户
      await prisma.user.update({
        where: { id: userId },
        data: { defaultAccountId: accountId },
      });

      jsonOk(res, { updated: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 400, 50000, "NOT_SUPPORTED", "内存模式不支持账户管理");
});

// Admin API
app.get("/api/admin/stats", async (req, res) => {
  const userId = await requireAdmin(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const [userCount, transactionCount, assetCount, loanCount, savingsCount, budgetCount] = await Promise.all([
        prisma.user.count(),
        prisma.transaction.count(),
        prisma.asset.count(),
        prisma.loan.count(),
        prisma.savingsgoal.count(),
        prisma.budget.count(),
      ]);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentTransactions = await prisma.transaction.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      });

      const importSuccessRate = await prisma.importerrorlog.aggregate({
        _count: { id: true },
        where: { resolved: false },
      });

      jsonOk(res, {
        users: userCount,
        transactions: transactionCount,
        assets: assetCount,
        loans: loanCount,
        savings: savingsCount,
        budgets: budgetCount,
        recentTransactions,
        unresolvedErrors: importSuccessRate._count.id,
      });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonOk(res, {
    users: 0,
    transactions: 0,
    assets: 0,
    loans: 0,
    savings: 0,
    budgets: 0,
    recentTransactions: 0,
    unresolvedErrors: 0,
  });
});

app.get("/api/admin/users", async (req, res) => {
  const userId = await requireAdmin(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(pageSize);
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: Number(pageSize),
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                transaction: true,
                asset: true,
                budget: true,
              },
            },
          },
        }),
        prisma.user.count(),
      ]);

      jsonOk(res, { items: users, total, page: Number(page), pageSize: Number(pageSize) });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonOk(res, { items: [], total: 0, page: 1, pageSize: 20 });
});

app.put("/api/admin/users/:id/role", async (req, res) => {
  const adminId = await requireAdmin(req, res);
  if (!adminId) return;
  const targetId = req.params.id;
  const { role } = req.body ?? {};

  if (!role || !["USER", "ADMIN"].includes(role)) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "无效的角色类型");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.update({
        where: { id: targetId },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
      });
      jsonOk(res, { item: user });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 404, 50000, "NOT_FOUND", "用户不存在");
});

const port = Number(process.env.PORT ?? 3004);

app.get("/api/changelog", async (_req, res) => {
  const fs = await import("fs");
  const path = await import("path");

  // CHANGELOG.md 位于项目根目录，即相对于 src/server/src/main.ts 的两层父目录
  const changelogPath = path.join(process.cwd(), "..", "..", "CHANGELOG.md");

  try {
    if (!fs.existsSync(changelogPath)) {
      console.warn("Changelog file not found:", changelogPath);
      return jsonOk(res, { versions: [] });
    }

    const content = fs.readFileSync(changelogPath, "utf-8");
    const lines = content.split("\n");
    
    const versions: any[] = [];
    let currentVersion: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // 匹配版本标题: ## 1.8.36 - 2026-03-17
      const versionMatch = trimmed.match(/^##\s+([\d\.]+)\s+-\s+(\d{4}-\d{2}-\d{2})/);
      
      if (versionMatch) {
        if (currentVersion) versions.push(currentVersion);
        currentVersion = {
          version: versionMatch[1],
          date: versionMatch[2],
          type: "feature",
          highlights: []
        };
        continue;
      }

      if (!currentVersion) continue;

      // 匹配类型标题: ### Features
      const typeMatch = trimmed.match(/^###\s+(.+)$/);
      if (typeMatch) {
        const title = typeMatch[1].toLowerCase();
        if (title.includes("bug") || title.includes("fix")) currentVersion.type = "bugfix";
        else if (title.includes("major")) currentVersion.type = "major";
        continue;
      }

      // 匹配列表项: - 修复了 xxx
      const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (listMatch) {
        let text = listMatch[1].trim();
        // 移除 Markdown 加粗和代码块语法
        text = text.replace(/\*\*(.+?)\*\*:\s*/g, "").replace(/\*\*/g, "").replace(/`/g, "");
        if (text && currentVersion.highlights.length < 10) {
          currentVersion.highlights.push(text);
        }
      }
    }

    if (currentVersion) versions.push(currentVersion);

    jsonOk(res, { versions: versions.slice(0, 50) });
  } catch (e) {
    console.error("Parse changelog error:", e);
    jsonOk(res, { versions: [] });
  }
});

// AI 视觉记账 - 扫描小票
// 使用 multer.memoryStorage 处理文件上传，不占用磁盘

app.post("/api/ai/scan-receipt", upload.single("image"), async (req, res) => {
  try {
    // 验证用户
    const userId = await requireUserId(req, res);
    if (!userId) return;

    if (!req.file) {
      jsonFail(res, 400, 40001, "MISSING_FILE", "请上传图片文件");
      return;
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      jsonFail(res, 400, 40002, "INVALID_FILE_TYPE", "仅支持 JPEG、PNG、WebP 格式图片");
      return;
    }

    // 获取平台参数（默认支付宝）
    const platform = (req.body?.platform as string) || "alipay";
    const validPlatforms = ["alipay", "wechat", "unionpay"];
    if (!validPlatforms.includes(platform)) {
      jsonFail(res, 400, 40003, "INVALID_PLATFORM", "平台类型无效");
      return;
    }

    // 将图片转为 Base64
    const imageBase64 = req.file.buffer.toString("base64");

    // 从数据库获取用户配置的大模型
    const prisma = getPrisma();
    let modelConfig: { apiKey?: string; endpoint?: string; modelId?: string } | null = null;

    if (prisma) {
      // 优先使用默认模型，否则使用第一个可用的活跃模型
      let model = await prisma.aimodelconfig.findFirst({
        where: { userId, status: "active", isDefault: true }
      });

      if (!model) {
        model = await prisma.aimodelconfig.findFirst({
          where: { userId, status: "active" }
        });
      }

      if (model) {
        modelConfig = {
          apiKey: model.apiKey || undefined,
          endpoint: model.endpoint || undefined,
          modelId: model.modelId || undefined
        };
      }
    }

    // 调用 AI 进行识别（传入配置和平台）
    const result = await scanReceipt(imageBase64, modelConfig || undefined, platform as "alipay" | "wechat" | "unionpay");

    // 返回结果，包含平台特有字段
    jsonOk(res, {
      amount: result.amount,
      currency: result.currency,
      merchant: result.merchant,
      date: result.date,
      category: result.category,
      description: result.description,
      platform: result.platform,
      // 云闪付字段
      tradeName: result.tradeName,
      cardNo: result.cardNo,
      tradeTime: result.tradeTime,
      tradeCategory: result.tradeCategory,
      // 微信字段
      product: result.product,
      payeeFullName: result.payeeFullName,
      // 支付宝字段
      billCategory: result.billCategory,
      paymentMethod: result.paymentMethod,
      paymentTime: result.paymentTime,
      remark: result.remark
    });
  } catch (error) {
    console.error("AI Scan Receipt Error:", error);
    const message = error instanceof Error ? error.message : "AI 识别失败，请重试";
    jsonFail(res, 500, 50001, "AI_PROCESSING_ERROR", message);
  }
});

// AI 消费分析
app.post("/api/ai/analyze-consumption", async (req, res) => {
  try {
    const userId = await requireUserId(req, res);
    if (!userId) return;

    const { transactions, budgets, startDate, endDate } = req.body as {
      transactions: TransactionInput[];
      budgets: BudgetInput[];
      startDate?: string;
      endDate?: string;
    };

    if (!transactions || !Array.isArray(transactions)) {
      jsonFail(res, 400, 40001, "INVALID_PARAMS", "transactions 参数无效");
      return;
    }

    // 获取用户配置的大模型
    const prisma = getPrisma();
    let modelConfig: { apiKey?: string; endpoint?: string; modelId?: string } | null = null;

    if (prisma) {
      let model = await prisma.aimodelconfig.findFirst({
        where: { userId, status: "active", isDefault: true }
      });

      if (!model) {
        model = await prisma.aimodelconfig.findFirst({
          where: { userId, status: "active" }
        });
      }

      if (model) {
        modelConfig = {
          apiKey: model.apiKey || undefined,
          endpoint: model.endpoint || undefined,
          modelId: model.modelId || undefined
        };
      }
    }

    const result = await analyzeConsumption(
      transactions,
      budgets || [],
      modelConfig || undefined
    );

    jsonOk(res, result);
  } catch (error) {
    console.error("AI Analyze Consumption Error:", error);
    const message = error instanceof Error ? error.message : "AI 分析失败，请重试";
    jsonFail(res, 500, 50001, "AI_PROCESSING_ERROR", message);
  }
});

// 测试 AI 模型连接
app.post("/api/ai/models/test", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { apiKey, endpoint, modelId, provider } = req.body;

  if (!apiKey || !endpoint || !modelId) {
    jsonFail(res, 400, 40001, "MISSING_PARAMS", "API Key、端点和模型ID不能为空");
    return;
  }

  try {
    // 尝试调用 AI API 验证连接
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey, baseURL: endpoint });

    const response = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 5,
    });

    jsonOk(res, {
      success: true,
      message: "连接成功！",
      response: response.choices[0]?.message?.content
    });
  } catch (error) {
    console.error("AI connection test error:", error);
    const message = error instanceof Error ? error.message : "连接失败";
    jsonFail(res, 500, 50002, "CONNECTION_FAILED", message);
  }
});

// ========== AI 大模型配置 CRUD ==========

// 获取用户的大模型配置列表
app.get("/api/ai/models", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (!prisma) {
    // 内存模式返回空数组
    jsonOk(res, { items: [] });
    return;
  }

  try {
    const models = await prisma.aimodelconfig.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    // 不返回 apiKey
    const safeModels = models.map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      type: m.type,
      endpoint: m.endpoint,
      modelId: m.modelId,
      description: m.description,
      status: m.status,
      isDefault: m.isDefault,
      apiKeyConfigured: !!m.apiKey
    }));
    jsonOk(res, { items: safeModels });
  } catch (error) {
    console.error("Get AI models error:", error);
    jsonFail(res, 500, 50002, "GET_MODELS_ERROR", "获取模型列表失败");
  }
});

// 创建大模型配置
app.post("/api/ai/models", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { name, provider, type, apiKey, endpoint, modelId, description } = req.body;

  if (!name || !provider) {
    jsonFail(res, 400, 40003, "VALIDATION_ERROR", "名称和提供商不能为空");
    return;
  }

  const prisma = getPrisma();
  if (!prisma) {
    jsonFail(res, 500, 50003, "DATABASE_ERROR", "数据库未连接");
    return;
  }

  try {
    // @ts-ignore - Prisma type mismatch
    const newModel = await prisma.aimodelconfig.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        accountId: userId, // fallback to userId for single-account mode
        name,
        provider,
        type: type || "vision",
        apiKey: apiKey || null,
        endpoint: endpoint || null,
        modelId: modelId || null,
        description: description || null,
        status: apiKey ? "active" : "inactive",
        updatedAt: new Date()
      }
    });
    jsonOk(res, {
      id: newModel.id,
      name: newModel.name,
      provider: newModel.provider,
      type: newModel.type,
      endpoint: newModel.endpoint,
      modelId: newModel.modelId,
      description: newModel.description,
      status: newModel.status,
      isDefault: newModel.isDefault,
      apiKeyConfigured: !!newModel.apiKey
    });
  } catch (error) {
    console.error("Create AI model error:", error);
    jsonFail(res, 500, 50004, "CREATE_MODEL_ERROR", "创建模型失败");
  }
});

// 更新大模型配置
app.put("/api/ai/models/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const { name, provider, type, apiKey, endpoint, modelId, description, status, isDefault } = req.body;

  const prisma = getPrisma();
  if (!prisma) {
    jsonFail(res, 500, 50003, "DATABASE_ERROR", "数据库未连接");
    return;
  }

  // 如果设置默认模型，先取消其他默认
  if (isDefault) {
    await prisma.aimodelconfig.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });
  }

  try {
    const updated = await prisma.aimodelconfig.update({
      where: { id, userId },
      data: {
        ...(name && { name }),
        ...(provider && { provider }),
        ...(type && { type }),
        ...(endpoint !== undefined && { endpoint }),
        ...(modelId !== undefined && { modelId }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(isDefault !== undefined && { isDefault }),
        ...(apiKey !== undefined && { apiKey: apiKey || null })
      }
    });
    jsonOk(res, {
      id: updated.id,
      name: updated.name,
      provider: updated.provider,
      type: updated.type,
      endpoint: updated.endpoint,
      modelId: updated.modelId,
      description: updated.description,
      status: updated.status,
      isDefault: updated.isDefault,
      apiKeyConfigured: !!updated.apiKey
    });
  } catch (error) {
    console.error("Update AI model error:", error);
    jsonFail(res, 500, 50005, "UPDATE_MODEL_ERROR", "更新模型失败");
  }
});

// 删除大模型配置
app.delete("/api/ai/models/:id", async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const prisma = getPrisma();
  if (!prisma) {
    jsonFail(res, 500, 50003, "DATABASE_ERROR", "数据库未连接");
    return;
  }

  try {
    await prisma.aimodelconfig.delete({
      where: { id, userId }
    });
    jsonOk(res, { message: "删除成功" });
  } catch (error) {
    console.error("Delete AI model error:", error);
    jsonFail(res, 500, 50006, "DELETE_MODEL_ERROR", "删除模型失败");
  }
});

app.listen(port, () => {
  process.stdout.write(`server listening on http://localhost:${port}\n`);
});
