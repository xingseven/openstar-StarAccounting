import cors from "cors";
import crypto from "crypto";
import express, { type Request, type Response } from "express";
import multer from "multer";
import { getPrisma } from "./lib/prisma.js";
import { importCsvBuffer } from "./etl/importCsv.js";
import { mapRowToTransaction } from "./etl/mapTransaction.js";
import { signAccessToken, verifyAccessToken } from "./auth/jwt.js";
import { hashPassword, verifyPassword } from "./auth/password.js";

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
  await prisma.appConnection.deleteMany({
    where: { isVerified: false, expiresAt: { lt: new Date() } },
  });
}

function getUserEmail(req: Request) {
  const header = req.headers["x-user-email"] ?? req.headers["x-user-id"];
  if (typeof header === "string" && header.trim().length > 0) {
    const v = header.trim();
    return v.includes("@") ? v : `${v}@dev.local`;
  }
  return "dev@local";
}

async function ensureUserId(email: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: "dev" },
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
    return memoryUserId(getUserEmail(req));
  }

  const allowDevHeaders = process.env.ALLOW_DEV_HEADERS === "1";
  if (!allowDevHeaders) {
    jsonFail(res, 401, 10002, "TOKEN_EXPIRED", "请先登录");
    return null;
  }

  const email = getUserEmail(req);
  const userId = await ensureUserId(email);
  if (!userId) {
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "用户初始化失败");
    return null;
  }
  return userId;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
const upload = multer({ storage: multer.memoryStorage() });

app.get("/api/health", (_req, res) => {
  jsonOk(res, { status: "ok" });
});

app.post("/api/auth/register", async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "未配置数据库");
    return;
  }

  const { email, password, name } = req.body ?? {};
  if (typeof email !== "string" || !email.includes("@")) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "email 不合法");
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "password 至少 6 位");
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name: typeof name === "string" ? name : null },
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
  const prisma = getPrisma();
  if (!prisma) {
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "未配置数据库");
    return;
  }

  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    jsonFail(res, 400, 10001, "INVALID_CREDENTIALS", "账号或密码错误");
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
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "未配置数据库");
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

      const rows: Array<{
        platform: string;
        _sum: { amount: unknown };
        _count: { _all: number };
      }> = await prisma.transaction.groupBy({
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

      const rows: Array<{
        category: string;
        _sum: { amount: unknown };
        _count: { _all: number };
      }> = await prisma.transaction.groupBy({
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

    const cur = map.get(t.category) ?? { total: 0, count: 0 };
    cur.total += Number(t.amount);
    cur.count += 1;
    map.set(t.category, cur);
  }

  const items = Array.from(map.entries())
    .map(([category, v]) => ({ category, total: v.total.toFixed(2), count: v.count }))
    .sort((a, b) => Number(b.total) - Number(a.total));

  jsonOk(res, { items });
});

app.get("/api/metrics/consumption/daily", async (req, res) => {
  const { start, end, type } = parseQuery(req);
  const userId = await requireUserId(req, res);
  if (!userId) return;
  const prisma = getPrisma();

  if (prisma) {
    try {
      const rows = (await prisma.$queryRaw`SELECT date_trunc('day',"date") AS day, SUM(amount) AS total, COUNT(*)::int AS count
        FROM "Transaction"
        WHERE "userId"=${userId}
          AND "type"=${type}
          AND (${start}::timestamptz IS NULL OR "date" >= ${start})
          AND (${end}::timestamptz IS NULL OR "date" <= ${end})
        GROUP BY day
        ORDER BY day`) as Array<{ day: Date; total: unknown; count: number }>;

      const items = rows.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
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
    const key = d.toISOString().slice(0, 10);
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

app.post("/api/transactions/import", upload.single("file"), async (req, res) => {
  const userId = await requireUserId(req, res);
  if (!userId) return;
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
              where: { orderId: { in: orderIds } },
              select: { orderId: true },
            })
          : [];
      const existingSet = new Set(existing.map((e) => e.orderId).filter((v): v is string => !!v));
      const duplicateCount = valid.filter((v) => v.orderId && existingSet.has(v.orderId)).length;

      const toInsert = valid.filter((v) => !v.orderId || !existingSet.has(v.orderId));
      const result =
        toInsert.length > 0
          ? await prisma.transaction.createMany({
              data: toInsert.map((t) => ({
                userId,
                orderId: t.orderId,
                date: t.date,
                type: t.type as never,
                amount: t.amount,
                category: t.category,
                platform: t.platform,
                merchant: t.merchant,
                description: t.description,
                paymentMethod: t.paymentMethod,
                status: t.status,
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
      const devices = await prisma.appConnection.findMany({
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
      await prisma.appConnection.deleteMany({
        where: { userId, isVerified: false },
      });

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      for (let i = 0; i < 20; i++) {
        const otpCode = generateOtpCode();
        try {
          await prisma.appConnection.create({
            data: {
              userId,
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
      const conn = await prisma.appConnection.findFirst({
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

      const updated = await prisma.appConnection.update({
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
      const deleted = await prisma.appConnection.deleteMany({
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

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  process.stdout.write(`server listening on http://localhost:${port}\n`);
});
