import cors from "cors";
import crypto from "crypto";
import express, { type Request, type Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { Readable } from "stream";
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

type UpdateDownloadItem = {
  id: string;
  label: string;
  fileName: string;
  url: string;
  size?: string;
  contentType?: string;
  description?: string;
};

type UpdateChannelManifest = {
  version?: string;
  action?: "refresh" | "download" | "reinstall";
  description?: string;
  downloads?: UpdateDownloadItem[];
};

type UpdateManifest = {
  version: string;
  publishedAt?: string;
  notes?: string[];
  web?: UpdateChannelManifest;
  app?: UpdateChannelManifest;
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
  createdAt: string;
  updatedAt: string;
};

type SyncCursor = {
  updatedAt: string;
  id: string;
};

type SyncTransactionPayload = {
  clientId?: string;
  id?: string;
  orderId?: string | null;
  date?: string;
  type?: string;
  amount?: string | number;
  category?: string;
  platform?: string;
  merchant?: string | null;
  description?: string | null;
  paymentMethod?: string | null;
  status?: string | null;
};

type Connection = {
  id: string;
  userId: string;
  accountId: string;
  otpCode: string;
  isVerified: boolean;
  expiresAt: number;
  createdAt: number;
  verifiedAt?: number;
  deviceId?: string;
  deviceName?: string;
  ipAddress?: string;
};

type AuthContext = {
  userId: string;
  accountId?: string;
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
  accountId?: string;
  platform: string;
  totalAmount: string;
  remainingAmount: string;
  periods: number;
  paidPeriods: number;
  monthlyPayment: string;
  dueDate: number;
  status: string;
  createdAt: string;
  matchKeywords?: string[] | null;
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

function stripPortFromHost(host: string) {
  const value = host.trim();
  if (value.startsWith("[") && value.includes("]")) {
    return value.slice(1, value.indexOf("]"));
  }
  return value.replace(/:\d+$/, "");
}

function normalizeIp(value: string | undefined | null) {
  if (!value) return null;
  const normalized = value.replace(/^::ffff:/, "").trim();
  if (!normalized) return null;
  if (normalized === "::1") return "127.0.0.1";
  return normalized;
}

function getPublicConnectHost(req: Request) {
  const configured = process.env.PUBLIC_IP?.trim();
  if (configured && configured !== "0.0.0.0") {
    return configured;
  }

  const forwardedHost = req.headers["x-forwarded-host"];
  if (typeof forwardedHost === "string" && forwardedHost.trim().length > 0) {
    return stripPortFromHost(forwardedHost.split(",")[0] ?? forwardedHost);
  }

  const host = req.headers.host;
  if (typeof host === "string" && host.trim().length > 0) {
    return stripPortFromHost(host);
  }

  return normalizeIp(getRequestIp(req)) ?? "127.0.0.1";
}

function getRepoRootCandidates() {
  const cwd = process.cwd();
  return Array.from(
    new Set([
      cwd,
      path.resolve(cwd, ".."),
      path.resolve(cwd, "..", ".."),
    ])
  );
}

function findExistingFileByRelativePath(relativePath: string) {
  for (const root of getRepoRootCandidates()) {
    const candidate = path.join(root, relativePath);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function getChangelogPath() {
  return findExistingFileByRelativePath("CHANGELOG.md");
}

function parseChangelogVersions(content: string) {
  const lines = content.split("\n");
  const versions: Array<{
    version: string;
    date: string;
    type: string;
    highlights: string[];
  }> = [];
  let currentVersion: { version: string; date: string; type: string; highlights: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const versionMatch = trimmed.match(/^##\s+([\d.]+)\s+-\s+(\d{4}-\d{2}-\d{2})/);

    if (versionMatch) {
      if (currentVersion) versions.push(currentVersion);
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        type: "feature",
        highlights: [],
      };
      continue;
    }

    if (!currentVersion) continue;

    const typeMatch = trimmed.match(/^###\s+(.+)$/);
    if (typeMatch) {
      const title = typeMatch[1].toLowerCase();
      if (title.includes("bug") || title.includes("fix")) currentVersion.type = "bugfix";
      else if (title.includes("major")) currentVersion.type = "major";
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      let text = listMatch[1].trim();
      text = text.replace(/\*\*(.+?)\*\*:\s*/g, "").replace(/\*\*/g, "").replace(/`/g, "");
      if (text && currentVersion.highlights.length < 10) {
        currentVersion.highlights.push(text);
      }
    }
  }

  if (currentVersion) versions.push(currentVersion);
  return versions;
}

function getCurrentReleaseVersion() {
  const changelogPath = getChangelogPath();
  if (changelogPath) {
    const versions = parseChangelogVersions(fs.readFileSync(changelogPath, "utf-8"));
    if (versions.length > 0) {
      return versions[0].version;
    }
  }
  return process.env.APP_CURRENT_VERSION?.trim() || "0.0.0";
}

function compareVersionStrings(left: string, right: string) {
  const leftParts = left.split(".").map((part) => Number(part));
  const rightParts = right.split(".").map((part) => Number(part));
  const length = Math.max(leftParts.length, rightParts.length);

  for (let i = 0; i < length; i += 1) {
    const a = leftParts[i] ?? 0;
    const b = rightParts[i] ?? 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

function getUpdateManifestSourceUrls() {
  const configured = process.env.UPDATE_MANIFEST_URLS?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }

  return [
    "https://raw.githubusercontent.com/xingseven/openstar-StarAccounting/main/web/public/updates/latest.json",
  ];
}

function getLocalUpdateManifestPath() {
  const configured = process.env.UPDATE_LOCAL_MANIFEST_PATH?.trim();
  if (configured) {
    return findExistingFileByRelativePath(configured);
  }

  return findExistingFileByRelativePath(path.join("web", "public", "updates", "latest.json"));
}

function parseUpdateManifest(input: string) {
  const parsed = JSON.parse(input) as UpdateManifest;
  if (!parsed || typeof parsed.version !== "string" || parsed.version.trim().length === 0) {
    throw new Error("Invalid update manifest");
  }
  return parsed;
}

async function loadResolvedUpdateManifest() {
  const localPath = getLocalUpdateManifestPath();
  if (localPath) {
    return {
      manifest: parseUpdateManifest(fs.readFileSync(localPath, "utf-8")),
      source: {
        type: "local" as const,
        label: "网站本地更新源",
        path: localPath,
      },
    };
  }

  for (const url of getUpdateManifestSourceUrls()) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(timer);
      if (!response.ok) continue;
      const text = await response.text();
      return {
        manifest: parseUpdateManifest(text),
        source: {
          type: "remote" as const,
          label: "远程更新源",
          url,
        },
      };
    } catch {
    }
  }

  return null;
}

function resolveLocalPublicAssetPath(assetUrl: string) {
  if (!assetUrl.startsWith("/")) return null;
  const normalized = assetUrl.split("?")[0].replace(/^\/+/, "");
  if (normalized.includes("..")) return null;

  for (const root of getRepoRootCandidates()) {
    const candidate = path.join(root, "web", "public", normalized);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getContentTypeFromFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".apk": "application/vnd.android.package-archive",
    ".zip": "application/zip",
    ".exe": "application/vnd.microsoft.portable-executable",
    ".dmg": "application/x-apple-diskimage",
    ".msix": "application/vnd.ms-appx",
    ".txt": "text/plain; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  };
  return map[ext] ?? "application/octet-stream";
}

function getOtpHashSecret() {
  const configured = process.env.OTP_HASH_SECRET?.trim();
  if (configured) return configured;
  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (jwtSecret) return jwtSecret;
  return "dev-otp-secret";
}

function hashOtpCode(otpCode: string) {
  return `otp_sha256$${crypto.createHmac("sha256", getOtpHashSecret()).update(otpCode).digest("hex")}`;
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

async function getAuthContext(req: Request): Promise<AuthContext | null> {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);
    if (payload) {
      return { userId: payload.userId };
    }

    if (!token.startsWith("dev-")) {
      return null;
    }

    const connectionId = token.slice("dev-".length).trim();
    if (!connectionId) {
      return null;
    }

    const prisma = getPrisma();
    if (prisma) {
      const connection = await prisma.appconnection.findFirst({
        where: { id: connectionId, isVerified: true },
        select: { userId: true, accountId: true },
      });

      if (!connection) {
        return null;
      }

      return { userId: connection.userId, accountId: connection.accountId };
    }

    const connection = connectionsById.get(connectionId);
    if (!connection?.isVerified) {
      return null;
    }

    return { userId: connection.userId, accountId: connection.accountId };
  }
  return null;
}

async function requireUserId(req: Request, res: Response) {
  const authContext = await getAuthContext(req);
  if (authContext?.userId) return authContext.userId;

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
  const authContext = await getAuthContext(req);
  const userId = authContext?.userId ?? await requireUserId(req, res);
  if (!userId) return null;

  if (authContext?.accountId) {
    return { userId, accountId: authContext.accountId };
  }

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

type LoanMatchCandidate = {
  id: string;
  platform: string;
  totalAmount: number;
  remainingAmount: number;
  periods: number;
  paidPeriods: number;
  createdAt: Date;
  status: string;
  matchKeywords?: unknown;
};

type ImportedTransactionForMatch = {
  id?: string;
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
  loanId?: string | null;
};

function normalizeLoanMatchText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[\s()（）【】\[\]{}\-_/&、·.]/g, "")
    .trim();
}

function parseMatchKeywords(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw
      .split(/[,，|、\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [] as string[];
}

function expandLoanAlias(term: string) {
  const normalized = normalizeLoanMatchText(term);
  if (!normalized) return [] as string[];

  const set = new Set<string>([normalized]);
  if (normalized.includes("信用卡")) {
    set.add(normalized.replace(/信用卡/g, ""));
  }
  if (normalized.includes("银行卡")) {
    set.add(normalized.replace(/银行卡/g, ""));
  }

  if (normalized.includes("招商")) {
    set.add("招商银行");
    set.add("招商信用卡");
    set.add("招行");
  }
  if (normalized.includes("中信")) {
    set.add("中信银行");
    set.add("中信信用卡");
  }
  if (normalized.includes("建设") || normalized.includes("建行")) {
    set.add("建设银行");
    set.add("建行");
    set.add("建设信用卡");
  }
  if (normalized.includes("工商") || normalized.includes("工行")) {
    set.add("工商银行");
    set.add("工行");
    set.add("工商信用卡");
  }
  if (normalized.includes("农业") || normalized.includes("农行")) {
    set.add("农业银行");
    set.add("农行");
  }
  if (normalized.includes("中国银行") || normalized.includes("中行")) {
    set.add("中国银行");
    set.add("中行");
  }
  if (normalized.includes("花呗")) set.add("花呗");
  if (normalized.includes("借呗")) set.add("借呗");
  if (normalized.includes("备用金")) set.add("备用金");

  return Array.from(set).filter((item) => item.length >= 2);
}

function collectLoanMatchTerms(loan: LoanMatchCandidate) {
  const rawTerms = [loan.platform, ...parseMatchKeywords(loan.matchKeywords)];
  const set = new Set<string>();

  rawTerms.forEach((term) => {
    expandLoanAlias(term).forEach((alias) => set.add(alias));
  });

  return Array.from(set);
}

function isSuccessfulTransactionStatus(status: string | null | undefined) {
  if (!status) return true;
  return status === "SUCCESS" || status.includes("成功");
}

function isRepaymentLikeTransaction(transaction: ImportedTransactionForMatch) {
  if (transaction.type === "REPAYMENT") return true;
  if (!isSuccessfulTransactionStatus(transaction.status)) return false;

  const category = transaction.category ?? "";
  const combined = `${transaction.merchant ?? ""} ${transaction.description ?? ""} ${transaction.paymentMethod ?? ""}`;

  if (category.includes("贷款还款") || category.includes("信用卡还款")) {
    return true;
  }

  if (category.includes("信用借还")) {
    if (/(还款|归还)/.test(combined) && !/(放款|取出至余额)/.test(combined)) {
      return true;
    }
  }

  return false;
}

function findMatchedLoanForRepaymentTransaction(
  transaction: ImportedTransactionForMatch,
  loans: LoanMatchCandidate[],
) {
  if (!isRepaymentLikeTransaction(transaction)) return null;

  const sourceText = normalizeLoanMatchText(`${transaction.merchant ?? ""} ${transaction.description ?? ""}`);
  if (!sourceText) return null;

  const candidates = loans
    .map((loan) => {
      const score = collectLoanMatchTerms(loan).reduce((maxScore, term) => {
        if (!term) return maxScore;
        return sourceText.includes(term) ? Math.max(maxScore, term.length) : maxScore;
      }, 0);

      return { loan, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0].loan;
  if (candidates[0].score > candidates[1].score) return candidates[0].loan;
  return null;
}

function canAutoSyncImportedRepayment(loan: LoanMatchCandidate) {
  return loan.paidPeriods === 0 && Math.abs(loan.remainingAmount - loan.totalAmount) < 0.000001;
}

function computeReconciledLoanState(
  loan: LoanMatchCandidate,
  transactions: ImportedTransactionForMatch[],
) {
  const repaymentTransactions = transactions.filter((transaction) => isRepaymentLikeTransaction(transaction) && isSuccessfulTransactionStatus(transaction.status));
  const totalRepaid = repaymentTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const nextRemaining = Math.max(0, loan.totalAmount - totalRepaid);
  const nextPaidPeriods = Math.min(loan.periods, repaymentTransactions.length);
  const nextStatus = nextRemaining <= 0 ? "PAID_OFF" : "ACTIVE";

  return {
    repaymentTransactions,
    totalRepaid,
    nextRemaining,
    nextPaidPeriods,
    nextStatus,
  };
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

    // 先创建用户
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: passwordHash,
        name: typeof name === "string" ? name : null,
        updatedAt: new Date(),
      },
      select: { id: true, email: true, name: true },
    });

    // 创建账户
    const account = await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        name: "我的账户",
        ownerId: user.id,
        updatedAt: new Date(),
      },
    });

    // 更新用户的默认账户
    await prisma.user.update({
      where: { id: user.id },
      data: { defaultAccountId: account.id },
    });

    // 创建账户成员关系
    await prisma.account_member.create({
      data: {
        id: crypto.randomUUID(),
        accountId: account.id,
        userId: user.id,
        role: "OWNER",
        nickname: null,
        joinedAt: new Date(),
      },
    });

    const token = signAccessToken({ userId: user.id });
    if (!token) {
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", "JWT_SECRET 未配置");
      return;
    }

    jsonOk(res, { accessToken: token, user: { ...user, defaultAccountId: account.id } });
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
      select: { id: true, email: true, name: true, defaultAccountId: true },
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
  const startDate =
    typeof req.query.startDate === "string"
      ? req.query.startDate
      : typeof req.query.start === "string"
        ? req.query.start
        : "";
  const endDate =
    typeof req.query.endDate === "string"
      ? req.query.endDate
      : typeof req.query.end === "string"
        ? req.query.end
        : "";
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

function isTransactionType(value: unknown): value is "INCOME" | "EXPENSE" | "TRANSFER" | "REPAYMENT" {
  return value === "INCOME" || value === "EXPENSE" || value === "TRANSFER" || value === "REPAYMENT";
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function encodeSyncCursor(cursor: SyncCursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeSyncCursor(value: string | undefined) {
  if (!value) return null;
  try {
    const raw = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<SyncCursor>;
    if (typeof raw.updatedAt !== "string" || typeof raw.id !== "string") return null;
    if (Number.isNaN(new Date(raw.updatedAt).getTime())) return null;
    return { updatedAt: raw.updatedAt, id: raw.id };
  } catch {
    return null;
  }
}

function compareSyncRecordCursor(
  record: { updatedAt?: string; date: string; id: string },
  cursor: SyncCursor | null
) {
  if (!cursor) return true;
  const value = new Date(record.updatedAt ?? record.date).toISOString();
  if (value > cursor.updatedAt) return true;
  if (value < cursor.updatedAt) return false;
  return record.id > cursor.id;
}

function normalizeSyncTransactionPayload(input: SyncTransactionPayload) {
  const clientId =
    typeof input.clientId === "string" && input.clientId.trim().length > 0 ? input.clientId.trim() : null;
  const id = typeof input.id === "string" && input.id.trim().length > 0 ? input.id.trim() : null;
  const orderId = normalizeOptionalText(input.orderId);
  const category = normalizeOptionalText(input.category);
  const platform = normalizeOptionalText(input.platform);
  const merchant = normalizeOptionalText(input.merchant);
  const description = normalizeOptionalText(input.description);
  const paymentMethod = normalizeOptionalText(input.paymentMethod);
  const status = normalizeOptionalText(input.status);
  const date = typeof input.date === "string" ? new Date(input.date) : null;
  const amountValue =
    typeof input.amount === "number" || typeof input.amount === "string" ? Number(input.amount) : Number.NaN;
  const type = typeof input.type === "string" ? input.type.trim() : "";

  if (!id && !orderId) {
    return { ok: false as const, clientId, error: "新交易至少需要提供 id 或 orderId" };
  }
  if (!date || Number.isNaN(date.getTime())) {
    return { ok: false as const, clientId, error: "date 格式不正确" };
  }
  if (!Number.isFinite(amountValue)) {
    return { ok: false as const, clientId, error: "amount 格式不正确" };
  }
  if (!isTransactionType(type)) {
    return { ok: false as const, clientId, error: "type 必须是 INCOME/EXPENSE/TRANSFER/REPAYMENT" };
  }
  if (!category) {
    return { ok: false as const, clientId, error: "category 不能为空" };
  }
  if (!platform) {
    return { ok: false as const, clientId, error: "platform 不能为空" };
  }

  return {
    ok: true as const,
    clientId,
    value: {
      id,
      orderId,
      date,
      type,
      amount: amountValue.toString(),
      category,
      platform,
      merchant,
      description,
      paymentMethod,
      status,
    },
  };
}

type DailyMetricRow = {
  date: Date | string;
  amount: unknown;
};

type DailyCashflowMetricRow = DailyMetricRow & {
  type: string | null;
};

type DailyCategoryMetricRow = DailyMetricRow & {
  category: string | null;
};

type ConsumptionDashboardRow = {
  id: string;
  date: Date | string;
  type: string;
  amount: unknown;
  category: string | null;
  platform: string | null;
  merchant: string | null;
  description: string | null;
};

type DashboardBudgetRow = {
  amount: number;
  category: string;
  platform?: string | null;
  period: "MONTHLY" | "YEARLY";
  scopeType?: "GLOBAL" | "CATEGORY" | "PLATFORM";
  alertPercent?: number | null;
};

type DashboardPlatformKey = "wechat" | "alipay" | "cloudpay" | "unknown";

const DASHBOARD_PLATFORM_LABELS: Record<DashboardPlatformKey, string> = {
  wechat: "微信",
  alipay: "支付宝",
  cloudpay: "云闪付",
  unknown: "其他",
};

const DASHBOARD_PLATFORM_COLORS: Record<DashboardPlatformKey, string> = {
  wechat: "#16a34a",
  alipay: "#1677ff",
  cloudpay: "#0ea5e9",
  unknown: "#94a3b8",
};

const DASHBOARD_CATEGORY_COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];
const CONSUMPTION_INSIGHT_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#ef4444", "#0ea5e9"];

const ESSENTIAL_CATEGORY_KEYWORDS = ["餐饮", "交通", "医疗", "教育", "居住", "生活", "日用", "缴费", "话费", "水电"];
const OPTIONAL_CATEGORY_KEYWORDS = ["购物", "娱乐", "理财", "礼物", "数码", "潮玩", "美容", "宠物", "文化", "休闲"];
const FIXED_KEYWORDS = ["房租", "租房", "物业", "水电", "燃气", "宽带", "话费", "学费", "保险", "按揭", "月供", "会员", "订阅"];
const IMPULSE_KEYWORDS = ["淘宝", "天猫", "京东", "拼多多", "抖音", "快手", "盲盒", "游戏", "外卖", "奶茶", "咖啡"];
const TRANSFER_KEYWORDS = ["转账", "红包", "还款", "借款", "信用卡", "贷款还款", "信用借还", "提现"];
const REFUND_KEYWORDS = ["退款", "退货", "退回", "返还", "售后"];
const SUBSCRIPTION_KEYWORDS = ["会员", "订阅", "连续包月", "自动续费", "视频", "音乐", "网盘", "云盘", "plus", "premium"];

const DASHBOARD_TIMEZONE = process.env.APP_TIMEZONE?.trim() || "Asia/Shanghai";

function getDashboardDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

function toDashboardLocalDate(date: Date) {
  return new Date(date.toLocaleString("en-US", { timeZone: DASHBOARD_TIMEZONE }));
}

function includesAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeInsightText(...values: Array<string | null | undefined>) {
  return values
    .map((value) => (value ?? "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");
}

function classifyNeedType(category: string, merchantText: string) {
  if (includesAnyKeyword(category, ESSENTIAL_CATEGORY_KEYWORDS) || includesAnyKeyword(merchantText, FIXED_KEYWORDS)) {
    return "essential";
  }
  if (includesAnyKeyword(category, OPTIONAL_CATEGORY_KEYWORDS) || includesAnyKeyword(merchantText, IMPULSE_KEYWORDS)) {
    return "optional";
  }
  return "essential";
}

function classifyTransactionNature(row: ConsumptionDashboardRow, category: string, merchantText: string) {
  if (includesAnyKeyword(category, REFUND_KEYWORDS) || includesAnyKeyword(merchantText, REFUND_KEYWORDS)) {
    return "refund";
  }
  if (includesAnyKeyword(category, TRANSFER_KEYWORDS) || includesAnyKeyword(merchantText, TRANSFER_KEYWORDS)) {
    return "transfer";
  }
  return row.type === "EXPENSE" ? "consumption" : "income";
}

function resolveTimeBucket(date: Date) {
  const localDate = toDashboardLocalDate(date);
  const hour = localDate.getHours();
  if (hour >= 5 && hour < 10) return "早晨";
  if (hour >= 10 && hour < 14) return "午间";
  if (hour >= 14 && hour < 18) return "下午";
  if (hour >= 18 && hour < 22) return "晚间";
  return "深夜";
}

function resolveBudgetInsightPeriod(start?: Date, end?: Date) {
  if (!start || !end) return null;
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return "MONTHLY" as const;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return "YEARLY" as const;
  }
  return null;
}

function getBudgetInsightName(budget: DashboardBudgetRow) {
  const scopeType = budget.scopeType || "GLOBAL";
  if (scopeType === "PLATFORM" && budget.platform) {
    return `${DASHBOARD_PLATFORM_LABELS[normalizeDashboardPlatform(budget.platform)]} 平台`;
  }
  if (budget.category && budget.category !== "ALL") {
    return budget.category;
  }
  return "总预算";
}

function formatMetricBucket(date: Date, groupBy: "day" | "month" | "year" = "day") {
  const { year, month, day } = getDashboardDateParts(date);
  if (groupBy === "year") return year;
  if (groupBy === "month") return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

function aggregateDailyMetrics(rows: DailyMetricRow[], groupBy: "day" | "month" | "year" = "day") {
  const map = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const date = row.date instanceof Date ? row.date : new Date(row.date);
    if (Number.isNaN(date.getTime())) continue;

    const key = formatMetricBucket(date, groupBy);
    const current = map.get(key) ?? { total: 0, count: 0 };
    current.total += Number(row.amount ?? 0);
    current.count += 1;
    map.set(key, current);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, value]) => ({
      day,
      date: day,
      total: String(value.total),
      count: value.count,
    }));
}

function aggregateCashflowMetrics(rows: DailyCashflowMetricRow[], groupBy: "day" | "month" | "year" = "day") {
  const map = new Map<string, { expense: number; income: number }>();

  for (const row of rows) {
    const date = row.date instanceof Date ? row.date : new Date(row.date);
    if (Number.isNaN(date.getTime())) continue;

    const key = formatMetricBucket(date, groupBy);
    const current = map.get(key) ?? { expense: 0, income: 0 };
    const amount = Number(row.amount ?? 0);
    if (!Number.isFinite(amount)) continue;

    if (row.type === "INCOME") current.income += amount;
    else current.expense += amount;

    map.set(key, current);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, value]) => ({
      day,
      date: day,
      expense: String(value.expense),
      income: String(value.income),
      total: String(value.expense + value.income),
    }));
}

function aggregateDailyCategoryMetrics(rows: DailyCategoryMetricRow[], groupBy: "day" | "month" | "year" = "day") {
  const map = new Map<string, number>();

  for (const row of rows) {
    const date = row.date instanceof Date ? row.date : new Date(row.date);
    if (Number.isNaN(date.getTime())) continue;

    const day = formatMetricBucket(date, groupBy);
    const category = row.category?.trim() || "未分类";
    const key = `${day}__${category}`;
    map.set(key, (map.get(key) ?? 0) + Number(row.amount ?? 0));
  }

  return Array.from(map.entries())
    .map(([key, total]) => {
      const [day, category] = key.split("__");
      return {
        day,
        date: day,
        category,
        total: String(total),
      };
    })
    .sort((a, b) => {
      const dayDiff = a.day.localeCompare(b.day);
      return dayDiff !== 0 ? dayDiff : a.category.localeCompare(b.category);
    });
}

function normalizeDashboardPlatform(platform: string | null | undefined): DashboardPlatformKey {
  const value = (platform ?? "").trim().toLowerCase();
  if (!value) return "unknown";
  if (value === "wechat" || value.includes("微信")) return "wechat";
  if (value === "alipay" || value.includes("支付宝")) return "alipay";
  if (
    value === "cloudpay"
    || value === "unionpay"
    || value.includes("云闪付")
    || value.includes("银联")
  ) {
    return "cloudpay";
  }
  return "unknown";
}

function buildConsumptionDashboard(rows: ConsumptionDashboardRow[], bucket: "day" | "month" = "day") {
  const expensePlatformMap = new Map<DashboardPlatformKey, number>();
  const incomePlatformMap = new Map<DashboardPlatformKey, number>();
  const categoryMap = new Map<string, { value: number; count: number }>();
  const merchantMap = new Map<string, number>();
  const cashflowRows: DailyCashflowMetricRow[] = [];
  const dailyCategoryRows: DailyCategoryMetricRow[] = [];
  const platformCategoryMap = new Map<string, { platform: DashboardPlatformKey; category: string; total: number }>();
  const recentTransactions = [...rows]
    .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
    .slice(0, 50);

  let totalExpense = 0;
  let totalIncome = 0;
  let expenseCount = 0;

  const histogram = [
    { range: "0-50", count: 0, fill: "#dbeafe" },
    { range: "50-200", count: 0, fill: "#93c5fd" },
    { range: "200-500", count: 0, fill: "#60a5fa" },
    { range: "500-1k", count: 0, fill: "#3b82f6" },
    { range: "1k-5k", count: 0, fill: "#2563eb" },
    { range: "5k+", count: 0, fill: "#1d4ed8" },
  ];

  const scatter = rows
    .filter((row) => row.type === "EXPENSE")
    .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
    .slice(0, 160)
    .map((row, index) => {
      const date = new Date(String(row.date));
      return {
        id: index,
        hour: date.getHours() + date.getMinutes() / 60,
        amount: Number(row.amount ?? 0),
        category: row.category || "未分类",
      };
    });

  for (const row of rows) {
    const amount = Number(row.amount ?? 0);
    if (!Number.isFinite(amount)) continue;

    const platformKey = normalizeDashboardPlatform(row.platform);
    const category = row.category?.trim() || "未分类";

    cashflowRows.push({ date: row.date, amount, type: row.type });

    if (row.type === "EXPENSE") {
      totalExpense += amount;
      expenseCount += 1;
      expensePlatformMap.set(platformKey, (expensePlatformMap.get(platformKey) ?? 0) + amount);

      const categoryEntry = categoryMap.get(category) ?? { value: 0, count: 0 };
      categoryEntry.value += amount;
      categoryEntry.count += 1;
      categoryMap.set(category, categoryEntry);

      const merchant = row.merchant?.trim() || "未知商户";
      merchantMap.set(merchant, (merchantMap.get(merchant) ?? 0) + amount);

      dailyCategoryRows.push({ date: row.date, amount, category });

      const platformCategoryKey = `${platformKey}__${category}`;
      const platformCategoryEntry = platformCategoryMap.get(platformCategoryKey) ?? {
        platform: platformKey,
        category,
        total: 0,
      };
      platformCategoryEntry.total += amount;
      platformCategoryMap.set(platformCategoryKey, platformCategoryEntry);

      if (amount < 50) histogram[0].count++;
      else if (amount < 200) histogram[1].count++;
      else if (amount < 500) histogram[2].count++;
      else if (amount < 1000) histogram[3].count++;
      else if (amount < 5000) histogram[4].count++;
      else histogram[5].count++;
    } else if (row.type === "INCOME") {
      totalIncome += amount;
      incomePlatformMap.set(platformKey, (incomePlatformMap.get(platformKey) ?? 0) + amount);
    }
  }

  const platformDistribution = Array.from(expensePlatformMap.entries())
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([platform, total]) => ({
      name: DASHBOARD_PLATFORM_LABELS[platform],
      value: total,
      fill: DASHBOARD_PLATFORM_COLORS[platform],
    }));

  const incomeExpense = [
    { name: "支出", value: totalExpense, fill: "#ef4444" },
    { name: "收入", value: totalIncome, fill: "#16a34a" },
  ];

  const merchants = Array.from(merchantMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([merchant, total], index) => ({
      merchant,
      total,
      fill: DASHBOARD_CATEGORY_COLORS[index % DASHBOARD_CATEGORY_COLORS.length],
    }));

  const trend = aggregateCashflowMetrics(cashflowRows, bucket).map((item) => ({
    day: item.day,
    expense: Number(item.expense),
    income: Number(item.income),
    total: Number(item.total),
  })).slice(bucket === "month" ? -24 : -62);

  const trendYearly = aggregateCashflowMetrics(cashflowRows, "year").map((item) => ({
    day: item.day,
    expense: Number(item.expense),
    income: Number(item.income),
    total: Number(item.total),
  }));

  const dailyCategoryItems = aggregateDailyCategoryMetrics(dailyCategoryRows, bucket).map((item) => ({
    day: item.day,
    category: item.category,
    total: Number(item.total),
  }));

  const stackedCategories = [...new Set(dailyCategoryItems.map((item) => item.category))];
  const stackedBar = trend.map((item) => {
    const row: Record<string, string | number> = { day: item.day };
    for (const category of stackedCategories) {
      const found = dailyCategoryItems.find(
        (dailyCategoryItem) => dailyCategoryItem.day === item.day && dailyCategoryItem.category === category
      );
      row[category] = found ? found.total : 0;
    }
    return row;
  });

  const sortedCategories = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value: value.value, count: value.count }))
    .sort((a, b) => b.value - a.value);

  let cumulative = 0;
  const totalCategoryValue = sortedCategories.reduce((sum, item) => sum + item.value, 0);
  const pareto = sortedCategories.map((item, index) => {
    cumulative += item.value;
    return {
      name: item.name,
      value: item.value,
      cumulativePercentage: totalCategoryValue > 0 ? (cumulative / totalCategoryValue) * 100 : 0,
      fill: DASHBOARD_CATEGORY_COLORS[index % DASHBOARD_CATEGORY_COLORS.length],
    };
  });

  const weekdayMap: Record<string, number> = {
    "周一": 0,
    "周二": 0,
    "周三": 0,
    "周四": 0,
    "周五": 0,
    "周六": 0,
    "周日": 0,
  };
  const weekdayCount: Record<string, number> = {
    "周一": 0,
    "周二": 0,
    "周三": 0,
    "周四": 0,
    "周五": 0,
    "周六": 0,
    "周日": 0,
  };
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  for (const item of trend) {
    const date = new Date(item.day);
    if (Number.isNaN(date.getTime())) continue;
    const dayName = dayNames[date.getDay()];
    weekdayMap[dayName] += item.total;
    weekdayCount[dayName] += 1;
  }
  const weekdayWeekend = Object.entries(weekdayMap).map(([name, total]) => ({
    name,
    value: weekdayCount[name] > 0 ? Math.round(total / weekdayCount[name]) : 0,
    fill: name === "周六" || name === "周日" ? "#1d4ed8" : "#93c5fd",
  }));

  const calendar = trend.map((item) => ({
    date: item.day,
    day: bucket === "month" ? new Date(`${item.day}-01`).getMonth() + 1 : new Date(item.day).getDate(),
    value: item.total,
  }));

  const heatmapRows = Array.from(platformCategoryMap.values());
  const heatmapPlatforms = [...new Set(heatmapRows.map((item) => DASHBOARD_PLATFORM_LABELS[item.platform]))];
  const heatmapCategories = [...new Set(heatmapRows.map((item) => item.category))];
  const heatmap = {
    platforms: heatmapPlatforms,
    categories: heatmapCategories,
    data: heatmapRows.map((item) => ({
      platform: DASHBOARD_PLATFORM_LABELS[item.platform],
      category: item.category,
      total: item.total,
    })),
  };

  const sankeyNodes = [
    ...heatmap.platforms.map((name) => ({ name })),
    ...heatmap.categories.map((name) => ({ name })),
  ];
  const platformIndexMap = new Map(heatmap.platforms.map((name, index) => [name, index]));
  const categoryOffset = heatmap.platforms.length;
  const sankeyLinks = heatmap.data
    .map((item) => {
      const source = platformIndexMap.get(item.platform);
      const targetIndex = heatmap.categories.indexOf(item.category);
      if (source === undefined || targetIndex < 0) return null;
      return {
        source,
        target: categoryOffset + targetIndex,
        value: item.total,
      };
    })
    .filter((item): item is { source: number; target: number; value: number } => item !== null);

  const transactions = recentTransactions.map((row) => ({
    id: row.id,
    merchant: row.merchant?.trim() || "未知商户",
    date: new Date(String(row.date)).toISOString(),
    category: row.category?.trim() || "未分类",
    platform: normalizeDashboardPlatform(row.platform),
    type: row.type,
    amount: String(row.amount ?? 0),
  }));

  return {
    summary: {
      totalExpense,
      totalIncome,
      expenseCount,
      wechat: {
        expense: expensePlatformMap.get("wechat") ?? 0,
        income: incomePlatformMap.get("wechat") ?? 0,
      },
      alipay: {
        expense: expensePlatformMap.get("alipay") ?? 0,
        income: incomePlatformMap.get("alipay") ?? 0,
      },
    },
    platformDistribution,
    incomeExpense,
    merchants,
    trend,
    trendYearly,
    stackedBar,
    pareto,
    weekdayWeekend,
    calendar,
    heatmap,
    sankey: {
      nodes: sankeyNodes,
      links: sankeyLinks,
    },
    scatter,
    histogram,
    transactions,
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

app.get("/api/consumption/dashboard", async (req, res) => {
  const { start, end } = parseQuery(req);
  const bucket = req.query.bucket === "month" ? "month" : "day";
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId };
      if (start || end) {
        where.date = {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        };
      }

      const rows = await prisma.transaction.findMany({
        where,
        select: {
          id: true,
          date: true,
          type: true,
          amount: true,
          category: true,
          platform: true,
          merchant: true,
          description: true,
        },
      });

      jsonOk(res, buildConsumptionDashboard(rows, bucket));
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const rows = (transactionsByUser.get(userId) ?? []).map((item) => ({
    id: item.id,
    date: item.date,
    type: item.type,
    amount: item.amount,
    category: item.category,
    platform: item.platform,
    merchant: item.merchant,
    description: item.description,
  }));

  const filtered = rows.filter((row) => {
    const ts = new Date(String(row.date)).getTime();
    if (start && ts < start.getTime()) return false;
    if (end && ts > end.getTime()) return false;
    return true;
  });

  jsonOk(res, buildConsumptionDashboard(filtered, bucket));
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
      const where: Record<string, unknown> = { userId, type };
      if (start || end) {
        where.date = {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        };
      }

      const rows = await prisma.transaction.findMany({
        where,
        select: {
          date: true,
          category: true,
          amount: true,
        },
        orderBy: { date: "asc" },
      });

      const items = aggregateDailyCategoryMetrics(rows);

      jsonOk(res, { items });
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

  jsonOk(res, {
    items: aggregateDailyCategoryMetrics(
      filtered.map((t) => ({
        date: t.date,
        category: t.category,
        amount: t.amount,
      })),
    ),
  });
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
      const where: Record<string, unknown> = { userId, type };
      if (start || end) {
        where.date = {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        };
      }

      const rows = await prisma.transaction.findMany({
        where,
        select: {
          date: true,
          amount: true,
        },
        orderBy: { date: "asc" },
      });

      const items = aggregateDailyMetrics(rows, groupBy);

      jsonOk(res, { items });
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

  jsonOk(res, {
    items: aggregateDailyMetrics(
      filtered.map((t) => ({
        date: t.date,
        amount: t.amount,
      })),
      groupBy,
    ),
  });
});

app.get("/api/transactions", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(200, Number(req.query.pageSize ?? 20));
  const startDate =
    typeof req.query.startDate === "string"
      ? req.query.startDate
      : typeof req.query.start === "string"
        ? req.query.start
        : "";
  const endDate =
    typeof req.query.endDate === "string"
      ? req.query.endDate
      : typeof req.query.end === "string"
        ? req.query.end
        : "";
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const platform = typeof req.query.platform === "string" ? req.query.platform : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const prisma = getPrisma();
  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId, accountId };
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

  const all = transactionsByAccount.get(accountId) ?? transactionsByUser.get(userId) ?? [];
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
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const id = req.params.id;
  const { amount, category, merchant, description, type, platform, date } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      const existing = await prisma.transaction.findFirst({
        where: { id, userId, accountId },
        select: { id: true },
      });

      if (!existing) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "交易不存在");
        return;
      }

      const tx = await prisma.transaction.update({
        where: { id: existing.id },
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

  const list = transactionsByAccount.get(accountId) ?? transactionsByUser.get(userId) ?? [];
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
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  transactionsByAccount.set(accountId, list);
  transactionsByUser.set(userId, list);
  jsonOk(res, { item: updated });
});

app.delete("/api/transactions/:id", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const result = await prisma.transaction.deleteMany({ where: { id, userId, accountId } });
      if (result.count === 0) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "交易不存在");
        return;
      }
      jsonOk(res, { deleted: true });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = transactionsByAccount.get(accountId) ?? transactionsByUser.get(userId) ?? [];
  const newList = list.filter((t) => t.id !== id);
  transactionsByAccount.set(accountId, newList);
  transactionsByUser.set(userId, newList);
  jsonOk(res, { deleted: true });
});

app.post("/api/transactions/batch", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
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
          where: { id: { in: ids }, userId, accountId },
        });
        jsonOk(res, { deleted: result.count });
        return;
      } else if (action === "updateCategory" && category) {
        const result = await prisma.transaction.updateMany({
          where: { id: { in: ids }, userId, accountId },
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

  const list = transactionsByAccount.get(accountId) ?? transactionsByUser.get(userId) ?? [];
  if (action === "delete") {
    const newList = list.filter((t) => !ids.includes(t.id));
    transactionsByAccount.set(accountId, newList);
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
    transactionsByAccount.set(accountId, newList);
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
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
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
          accountId,
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

  const created: TransactionRecord = {
    id: crypto.randomUUID(),
    accountId,
    orderId: null,
    amount: String(amount),
    type: String(type),
    category: String(category),
    platform: String(platform),
    merchant: typeof merchant === "string" ? merchant : null,
    date: String(date),
    description: typeof description === "string" ? description : null,
    paymentMethod: null,
    status: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const list = transactionsByAccount.get(accountId) ?? transactionsByUser.get(userId) ?? [];
  const nextList = [created, ...list];
  transactionsByAccount.set(accountId, nextList);
  transactionsByUser.set(userId, nextList);
  jsonOk(res, { item: created });
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
    console.log(`[Import] Parsed ${imported.rows.length} rows using ${imported.encoding}, header at index ${imported.headerIndex}, headers: ${imported.headers.join(", ")}`);
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e && "code" in e ? (e as { code?: unknown }).code : 50000;
    if (code === 30001) {
      jsonFail(res, 400, 30001, "IMPORT_HEADER_NOT_FOUND", "无法识别微信/支付宝列头，请检查文件格式");
      return;
    }
    if (code === 30002) {
      jsonFail(res, 400, 30002, "IMPORT_NO_DATA_ROWS", "识别到表头，但没有找到可导入的数据行。请优先尝试原始账单文件或 XLSX 文件");
      return;
    }
    jsonFail(res, 500, 50000, "INTERNAL_ERROR", "解析失败");
    return;
  }

  const mapped = imported.rows.map((r) => mapRowToTransaction(r, source));
  console.log(`[Import] Mapped ${mapped.length} rows, valid: ${mapped.filter(m => m.ok).length}, invalid reasons: ${mapped.filter(m => !m.ok).map(m => m.reason).join(", ")}`);
  if (mapped.length > 0 && mapped[0].ok === false) {
    console.log(`[Import] First row sample:`, JSON.stringify(imported.rows[0]));
  }
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
      const loans = await prisma.loan.findMany({
        where: { userId, accountId },
        select: {
          id: true,
          platform: true,
          totalAmount: true,
          remainingAmount: true,
          periods: true,
          paidPeriods: true,
          createdAt: true,
          status: true,
          matchKeywords: true,
        },
      });

      const loanCandidates: LoanMatchCandidate[] = loans.map((loan) => ({
        id: loan.id,
        platform: loan.platform,
        totalAmount: Number(loan.totalAmount),
        remainingAmount: Number(loan.remainingAmount),
        periods: Number(loan.periods),
        paidPeriods: Number(loan.paidPeriods),
        createdAt: new Date(loan.createdAt),
        status: String(loan.status),
        matchKeywords: loan.matchKeywords,
      }));

      const existing: Array<{ orderId: string | null }> =
        orderIds.length > 0
          ? await prisma.transaction.findMany({
              where: { orderId: { in: orderIds } }, // 全局检查 orderId，因为数据库中 orderId 是全局唯一的
              select: { orderId: true },
            })
          : [];
      const existingSet = new Set(existing.map((e) => e.orderId).filter((v): v is string => !!v));
      let localDuplicateCount = 0;
      const seenOrderIds = new Set(existingSet);
      const toInsert = valid.filter((transaction) => {
        if (!transaction.orderId) return true;
        if (seenOrderIds.has(transaction.orderId)) {
          localDuplicateCount += 1;
          return false;
        }
        seenOrderIds.add(transaction.orderId);
        return true;
      });
      const prepared = toInsert.map((transaction) => {
        const matchedLoan = findMatchedLoanForRepaymentTransaction(transaction, loanCandidates);
        return {
          ...transaction,
          matchedLoanId: matchedLoan?.id ?? null,
          shouldAutoSync: matchedLoan ? canAutoSyncImportedRepayment(matchedLoan) : false,
        };
      });

      const plainInserts = prepared.filter((item) => !item.matchedLoanId && !item.shouldAutoSync);
      const linkedInserts = prepared.filter((item) => item.matchedLoanId || item.shouldAutoSync);

      let linkedCount = 0;
      let syncedCount = 0;
      let batchInsertedCount = 0;
      const loanStateMap = new Map(
        loanCandidates.map((loan) => [
          loan.id,
          {
            remainingAmount: loan.remainingAmount,
            totalAmount: loan.totalAmount,
            periods: loan.periods,
            paidPeriods: loan.paidPeriods,
          },
        ]),
      );

      await prisma.$transaction(async (tx) => {
        if (plainInserts.length > 0) {
          const batchResult = await tx.transaction.createMany({
            data: plainInserts.map((t) => ({
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
          });
          batchInsertedCount = batchResult.count;
        }

        for (const transaction of linkedInserts.sort((a, b) => a.date.getTime() - b.date.getTime())) {
          const created = await tx.transaction.create({
            data: {
              id: crypto.randomUUID(),
              userId,
              accountId,
              orderId: transaction.orderId,
              date: transaction.date,
              type: transaction.type as any,
              amount: transaction.amount,
              category: transaction.category,
              platform: transaction.platform,
              merchant: transaction.merchant,
              description: transaction.description,
              paymentMethod: transaction.paymentMethod,
              status: transaction.status,
              loanId: transaction.matchedLoanId ?? undefined,
              updatedAt: new Date(),
            },
          });

          if (created.loanId) {
            linkedCount += 1;
          }

          if (transaction.shouldAutoSync && transaction.matchedLoanId) {
            const state = loanStateMap.get(transaction.matchedLoanId);
            if (!state) continue;

            const nextRemaining = Math.max(0, state.remainingAmount - Number(transaction.amount));
            const nextPaidPeriods = Math.min(state.periods, state.paidPeriods + 1);
            const nextStatus = nextRemaining <= 0 ? "PAID_OFF" : "ACTIVE";

            await tx.loan.update({
              where: { id: transaction.matchedLoanId },
              data: {
                remainingAmount: nextRemaining,
                paidPeriods: nextPaidPeriods,
                status: nextStatus,
              },
            });

            state.remainingAmount = nextRemaining;
            state.paidPeriods = nextPaidPeriods;
            syncedCount += 1;
          }
        }
      });

      const insertedCount = batchInsertedCount + linkedInserts.length;
      const dbSkippedCount = toInsert.length - insertedCount;

      jsonOk(res, {
        totalRows: imported.rows.length,
        insertedCount,
        duplicateCount: localDuplicateCount + dbSkippedCount,
        invalidCount,
        linkedLoanCount: linkedCount,
        syncedLoanCount: syncedCount,
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
    const nowIso = new Date().toISOString();
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
      createdAt: nowIso,
      updatedAt: nowIso,
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

app.get("/api/sync/transactions/pull", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;

  const limitRaw = Number(req.query.limit ?? 100);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 200) : 100;
  const cursorParam = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  const updatedAfterParam =
    typeof req.query.updatedAfter === "string" ? req.query.updatedAfter : undefined;
  const cursor =
    decodeSyncCursor(cursorParam) ??
    (updatedAfterParam && !Number.isNaN(new Date(updatedAfterParam).getTime())
      ? { updatedAt: new Date(updatedAfterParam).toISOString(), id: "" }
      : null);

  const prisma = getPrisma();
  if (prisma) {
    try {
      const where: Record<string, unknown> = { userId, accountId };
      if (cursor) {
        where.OR = [
          { updatedAt: { gt: new Date(cursor.updatedAt) } },
          { updatedAt: new Date(cursor.updatedAt), id: { gt: cursor.id } },
        ];
      }

      const rows = await prisma.transaction.findMany({
        where,
        orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
        take: limit + 1,
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
          createdAt: true,
          updatedAt: true,
        },
      });

      const hasMore = rows.length > limit;
      const items = rows.slice(0, limit).map((item) => ({
        id: item.id,
        orderId: item.orderId,
        date: item.date.toISOString(),
        type: item.type,
        amount: String(item.amount),
        category: item.category,
        platform: item.platform,
        merchant: item.merchant,
        description: item.description,
        paymentMethod: item.paymentMethod,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));

      const lastItem = items.at(-1);
      jsonOk(res, {
        items,
        limit,
        hasMore,
        nextCursor: hasMore && lastItem ? encodeSyncCursor({ updatedAt: lastItem.updatedAt, id: lastItem.id }) : null,
        serverTime: new Date().toISOString(),
      });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = (transactionsByAccount.get(accountId) ?? transactionsByUser.get(userId) ?? [])
    .filter((item) => compareSyncRecordCursor(item, cursor))
    .sort((a, b) => {
      const left = new Date(a.updatedAt ?? a.date).getTime();
      const right = new Date(b.updatedAt ?? b.date).getTime();
      if (left !== right) return left - right;
      return a.id.localeCompare(b.id);
    });

  const hasMore = list.length > limit;
  const items = list.slice(0, limit);
  const lastItem = items.at(-1);

  jsonOk(res, {
    items,
    limit,
    hasMore,
    nextCursor:
      hasMore && lastItem
        ? encodeSyncCursor({ updatedAt: lastItem.updatedAt ?? lastItem.date, id: lastItem.id })
        : null,
    serverTime: new Date().toISOString(),
  });
});

app.post("/api/sync/transactions/push", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const rawItems = Array.isArray(req.body?.items) ? (req.body.items as SyncTransactionPayload[]) : [];

  if (rawItems.length === 0) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "items 不能为空");
    return;
  }
  if (rawItems.length > 100) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "单次最多同步 100 条交易");
    return;
  }

  const prisma = getPrisma();
  const results: Array<{
    clientId: string | null;
    id?: string;
    orderId?: string | null;
    action?: "created" | "updated";
    error?: string;
  }> = [];

  if (prisma) {
    try {
      for (const rawItem of rawItems) {
        const normalized = normalizeSyncTransactionPayload(rawItem);
        if (!normalized.ok) {
          results.push({ clientId: normalized.clientId, error: normalized.error });
          continue;
        }

        const { clientId, value } = normalized;
        let existingById:
          | { id: string; orderId: string | null; userId: string; accountId: string }
          | null = null;
        let existingByOrderId:
          | { id: string; orderId: string | null; userId: string; accountId: string }
          | null = null;

        if (value.id) {
          existingById = await prisma.transaction.findUnique({
            where: { id: value.id },
            select: { id: true, orderId: true, userId: true, accountId: true },
          });

          if (!existingById || existingById.userId !== userId || existingById.accountId !== accountId) {
            results.push({ clientId, id: value.id, orderId: value.orderId, error: "指定的交易不存在或不属于当前账户" });
            continue;
          }
        }

        if (value.orderId) {
          existingByOrderId = await prisma.transaction.findUnique({
            where: { orderId: value.orderId },
            select: { id: true, orderId: true, userId: true, accountId: true },
          });

          if (
            existingByOrderId &&
            (existingByOrderId.userId !== userId || existingByOrderId.accountId !== accountId)
          ) {
            results.push({ clientId, id: value.id ?? undefined, orderId: value.orderId, error: "orderId 已被其他账户占用" });
            continue;
          }
        }

        const target = existingById ?? existingByOrderId;

        if (target) {
          const updated = await prisma.transaction.update({
            where: { id: target.id },
            data: {
              orderId: value.orderId,
              amount: value.amount,
              type: value.type as never,
              category: value.category,
              platform: value.platform,
              merchant: value.merchant,
              date: value.date,
              description: value.description,
              paymentMethod: value.paymentMethod,
              status: value.status,
              updatedAt: new Date(),
            },
            select: { id: true, orderId: true },
          });

          results.push({
            clientId,
            id: updated.id,
            orderId: updated.orderId,
            action: "updated",
          });
          continue;
        }

        const created = await prisma.transaction.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            accountId,
            orderId: value.orderId,
            amount: value.amount,
            type: value.type as never,
            category: value.category,
            platform: value.platform,
            merchant: value.merchant,
            date: value.date,
            description: value.description,
            paymentMethod: value.paymentMethod,
            status: value.status,
            updatedAt: new Date(),
          },
          select: { id: true, orderId: true },
        });

        results.push({
          clientId,
          id: created.id,
          orderId: created.orderId,
          action: "created",
        });
      }

      jsonOk(res, {
        summary: {
          total: rawItems.length,
          created: results.filter((item) => item.action === "created").length,
          updated: results.filter((item) => item.action === "updated").length,
          errors: results.filter((item) => item.error).length,
        },
        items: results,
        serverTime: new Date().toISOString(),
      });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const list = transactionsByAccount.get(accountId) ?? transactionsByUser.get(userId) ?? [];

  for (const rawItem of rawItems) {
    const normalized = normalizeSyncTransactionPayload(rawItem);
    if (!normalized.ok) {
      results.push({ clientId: normalized.clientId, error: normalized.error });
      continue;
    }

    const { clientId, value } = normalized;
    const targetIndex = list.findIndex((item) => {
      if (value.id && item.id === value.id) return true;
      return Boolean(value.orderId && item.orderId === value.orderId);
    });
    const nowIso = new Date().toISOString();

    if (targetIndex >= 0) {
      const current = list[targetIndex];
      list[targetIndex] = {
        ...current,
        orderId: value.orderId,
        date: value.date.toISOString(),
        type: value.type,
        amount: value.amount,
        category: value.category,
        platform: value.platform,
        merchant: value.merchant,
        description: value.description,
        paymentMethod: value.paymentMethod,
        status: value.status,
        updatedAt: nowIso,
      };

      results.push({
        clientId,
        id: list[targetIndex].id,
        orderId: list[targetIndex].orderId,
        action: "updated",
      });
      continue;
    }

    const id = value.id ?? crypto.randomUUID();
    list.push({
      id,
      accountId,
      orderId: value.orderId,
      date: value.date.toISOString(),
      type: value.type,
      amount: value.amount,
      category: value.category,
      platform: value.platform,
      merchant: value.merchant,
      description: value.description,
      paymentMethod: value.paymentMethod,
      status: value.status,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    results.push({
      clientId,
      id,
      orderId: value.orderId,
      action: "created",
    });
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  transactionsByAccount.set(accountId, list);
  transactionsByUser.set(userId, list);

  jsonOk(res, {
    summary: {
      total: rawItems.length,
      created: results.filter((item) => item.action === "created").length,
      updated: results.filter((item) => item.action === "updated").length,
      errors: results.filter((item) => item.error).length,
    },
    items: results,
    serverTime: new Date().toISOString(),
  });
});

app.get("/api/connect/devices", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const prisma = getPrisma();
  if (prisma) {
    try {
      const devices = await prisma.appconnection.findMany({
        where: { userId, accountId, isVerified: true },
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
    .filter((c) => c.userId === userId && c.accountId === accountId && c.isVerified)
    .map((c) => ({
      id: c.id,
      deviceId: c.deviceId ?? null,
      deviceName: c.deviceName ?? null,
      ipAddress: c.ipAddress ?? null,
      verifiedAt: c.verifiedAt ? new Date(c.verifiedAt).toISOString() : null,
      createdAt: new Date(c.createdAt).toISOString(),
    }))
    .sort((a, b) => {
      const left = a.verifiedAt ? new Date(a.verifiedAt).getTime() : new Date(a.createdAt).getTime();
      const right = b.verifiedAt ? new Date(b.verifiedAt).getTime() : new Date(b.createdAt).getTime();
      return right - left;
    });

  jsonOk(res, { devices });
});

app.post("/api/connect/generate", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  try {
    await cleanupExpiredInDb();
  } catch {
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.appconnection.deleteMany({
        where: { userId, accountId, isVerified: false },
      });

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const publicIp = getPublicConnectHost(req);

      for (let i = 0; i < 20; i++) {
        const otpCode = generateOtpCode();
        const otpHash = hashOtpCode(otpCode);
        try {
          // @ts-ignore - Prisma type mismatch
          const created = await prisma.appconnection.create({
            data: {
              id: crypto.randomUUID(),
              userId,
              accountId,
              otpCode: otpHash,
              expiresAt,
              ipAddress: getRequestIp(req),
            },
          });

          jsonOk(res, {
            connectionId: created.id,
            otpCode,
            publicIp,
            verifyPath: "/api/connect/verify",
            expiresAt: expiresAt.toISOString(),
            expiresInSeconds: 5 * 60,
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

  for (const [id, conn] of connectionsById.entries()) {
    if (conn.userId === userId && conn.accountId === accountId && !conn.isVerified) {
      connectionsById.delete(id);
      connectionIdByOtp.delete(conn.otpCode);
    }
  }

  let otpCode = generateOtpCode();
  let otpHash = hashOtpCode(otpCode);
  while (connectionIdByOtp.has(otpHash)) {
    otpCode = generateOtpCode();
    otpHash = hashOtpCode(otpCode);
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000;

  const conn: Connection = {
    id,
    userId,
    accountId,
    otpCode: otpHash,
    isVerified: false,
    createdAt: now,
    expiresAt,
    ipAddress: getRequestIp(req),
  };

  connectionsById.set(id, conn);
  connectionIdByOtp.set(otpHash, id);

  jsonOk(res, {
    connectionId: id,
    otpCode,
    publicIp: getPublicConnectHost(req),
    verifyPath: "/api/connect/verify",
    expiresAt: new Date(expiresAt).toISOString(),
    expiresInSeconds: 5 * 60,
  });
});

app.post("/api/connect/verify", async (req, res) => {
  try {
    await cleanupExpiredInDb();
  } catch {
  }

  const { otpCode, deviceId, deviceName } = req.body ?? {};
  const normalizedOtpCode = typeof otpCode === "string" ? otpCode.trim() : "";
  const hashedOtpCode = /^\d{6}$/.test(normalizedOtpCode) ? hashOtpCode(normalizedOtpCode) : "";
  const normalizedDeviceId = typeof deviceId === "string" ? deviceId.trim() : "";
  const normalizedDeviceName =
    typeof deviceName === "string" && deviceName.trim().length > 0 ? deviceName.trim() : null;

  if (!/^\d{6}$/.test(normalizedOtpCode)) {
    jsonFail(res, 400, 20001, "OTP_NOT_FOUND", "otpCode 格式不正确");
    return;
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
        const conn = await prisma.appconnection.findFirst({
          where: {
            OR: [{ otpCode: hashedOtpCode }, { otpCode: normalizedOtpCode }],
            isVerified: false,
            expiresAt: { gt: new Date() },
          },
        orderBy: { createdAt: "desc" },
      });

      if (!conn) {
        jsonFail(res, 400, 20001, "OTP_NOT_FOUND", "验证码不存在或已过期");
        return;
      }

      if (!normalizedDeviceId) {
        jsonFail(res, 400, 50000, "INTERNAL_ERROR", "deviceId 必填");
        return;
      }

      const updated = await prisma.appconnection.update({
        where: { id: conn.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          deviceId: normalizedDeviceId,
          deviceName: normalizedDeviceName,
          ipAddress: getRequestIp(req),
        },
      });

      jsonOk(
        res,
        {
          accessToken: `dev-${updated.id}`,
          tokenType: "device",
          connectionId: updated.id,
          verifiedAt: updated.verifiedAt?.toISOString() ?? new Date().toISOString(),
        },
        "verified"
      );
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  const id = connectionIdByOtp.get(hashedOtpCode) ?? connectionIdByOtp.get(normalizedOtpCode);
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

  if (!normalizedDeviceId) {
    jsonFail(res, 400, 50000, "INTERNAL_ERROR", "deviceId 必填");
    return;
  }

  conn.isVerified = true;
  conn.verifiedAt = Date.now();
  conn.deviceId = normalizedDeviceId;
  conn.deviceName = normalizedDeviceName ?? undefined;
  conn.ipAddress = getRequestIp(req);

  jsonOk(
    res,
    {
      accessToken: `dev-${id}`,
      tokenType: "device",
      connectionId: id,
      verifiedAt: new Date(conn.verifiedAt).toISOString(),
    },
    "verified"
  );
});

app.delete("/api/connect/:id", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const deleted = await prisma.appconnection.deleteMany({
        where: { id, userId, accountId },
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
  if (!conn || conn.userId !== userId || conn.accountId !== accountId) {
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
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const loans = await prisma.loan.findMany({
        where: { userId, accountId },
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
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;

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
          accountId,
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
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const id = req.params.id;
  const { platform, totalAmount, remainingAmount, periods, paidPeriods, monthlyPayment, dueDate, status } = req.body ?? {};

  const prisma = getPrisma();
  if (prisma) {
    try {
      const existing = await prisma.loan.findFirst({
        where: { id, userId, accountId },
        select: { id: true },
      });

      if (!existing) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "贷款不存在");
        return;
      }

      const loan = await prisma.loan.update({
        where: { id: existing.id },
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
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const result = await prisma.loan.deleteMany({ where: { id, userId, accountId } });
      if (result.count === 0) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "贷款不存在");
        return;
      }
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
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
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
        const loan = await tx.loan.findFirst({ where: { id, userId, accountId } });
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
            accountId,
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

app.post("/api/loans/:id/reconcile", async (req, res) => {
  const account = await requireAccountId(req, res);
  if (!account) return;
  const { userId, accountId } = account;
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const [loan, allLoans, allTransactions] = await Promise.all([
          tx.loan.findFirst({
            where: { id, userId, accountId },
            select: {
              id: true,
              platform: true,
              totalAmount: true,
              remainingAmount: true,
              periods: true,
              paidPeriods: true,
              createdAt: true,
              status: true,
              matchKeywords: true,
            },
          }),
          tx.loan.findMany({
            where: { userId, accountId },
            select: {
              id: true,
              platform: true,
              totalAmount: true,
              remainingAmount: true,
              periods: true,
              paidPeriods: true,
              createdAt: true,
              status: true,
              matchKeywords: true,
            },
          }),
          tx.transaction.findMany({
            where: { userId, accountId },
            orderBy: { date: "asc" },
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
              loanId: true,
            },
          }),
        ]);

        if (!loan) {
          throw new Error("贷款不存在");
        }

        const loanCandidates: LoanMatchCandidate[] = allLoans.map((item) => ({
          id: item.id,
          platform: item.platform,
          totalAmount: Number(item.totalAmount),
          remainingAmount: Number(item.remainingAmount),
          periods: Number(item.periods),
          paidPeriods: Number(item.paidPeriods),
          createdAt: new Date(item.createdAt),
          status: String(item.status),
          matchKeywords: item.matchKeywords,
        }));

        const targetLoan = loanCandidates.find((item) => item.id === loan.id)!;

        const unlinkedMatches = allTransactions.filter((transaction) => {
          if (transaction.loanId) return false;
          const matchedLoan = findMatchedLoanForRepaymentTransaction(
            {
              id: transaction.id,
              orderId: transaction.orderId,
              date: new Date(transaction.date),
              type: String(transaction.type),
              amount: String(transaction.amount),
              category: transaction.category,
              platform: transaction.platform,
              merchant: transaction.merchant,
              description: transaction.description,
              paymentMethod: transaction.paymentMethod,
              status: transaction.status,
              loanId: transaction.loanId,
            },
            loanCandidates,
          );
          return matchedLoan?.id === loan.id;
        });

        if (unlinkedMatches.length > 0) {
          await tx.transaction.updateMany({
            where: { id: { in: unlinkedMatches.map((transaction) => transaction.id) } },
            data: { loanId: loan.id, type: "REPAYMENT" as any },
          });
        }

        const reconciledTransactions = allTransactions
          .filter((transaction) => transaction.loanId === loan.id)
          .concat(
            unlinkedMatches.map((transaction) => ({
              ...transaction,
              type: "REPAYMENT",
              loanId: loan.id,
            })),
          )
          .map((transaction) => ({
            id: transaction.id,
            orderId: transaction.orderId,
            date: new Date(transaction.date),
            type: String(transaction.type),
            amount: String(transaction.amount),
            category: transaction.category,
            platform: transaction.platform,
            merchant: transaction.merchant,
            description: transaction.description,
            paymentMethod: transaction.paymentMethod,
            status: transaction.status,
            loanId: transaction.loanId,
          }));

        const reconciled = computeReconciledLoanState(targetLoan, reconciledTransactions);

        const updatedLoan = await tx.loan.update({
          where: { id: loan.id },
          data: {
            remainingAmount: reconciled.nextRemaining,
            paidPeriods: reconciled.nextPaidPeriods,
            status: reconciled.nextStatus as any,
          },
        });

        return {
          item: updatedLoan,
          matchedCount: unlinkedMatches.length,
          repaymentCount: reconciled.repaymentTransactions.length,
          totalRepaid: Number(reconciled.totalRepaid.toFixed(2)),
        };
      });

      jsonOk(res, result);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      if (message.includes("贷款不存在")) {
        jsonFail(res, 404, 50000, "NOT_FOUND", "贷款不存在");
        return;
      }
      jsonFail(res, 500, 50000, "INTERNAL_ERROR", message);
      return;
    }
  }

  jsonFail(res, 500, 50000, "INTERNAL_ERROR", "Memory mode not supported for reconcile");
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
      // 检查用户是否有默认账户
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultAccountId: true },
      });

      const hasDefaultAccount = !!user?.defaultAccountId;

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

      // 如果用户没有默认账户，自动设为默认
      if (!hasDefaultAccount) {
        await prisma.user.update({
          where: { id: userId },
          data: { defaultAccountId: account.id },
        });
      }

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

app.get("/api/update/check", async (_req, res) => {
  const currentVersion = getCurrentReleaseVersion();
  const resolved = await loadResolvedUpdateManifest();

  if (!resolved) {
    jsonOk(res, {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      checkedAt: new Date().toISOString(),
      source: {
        label: "未找到可用更新源",
      },
      notes: [],
      web: {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        action: "refresh",
        description: "当前没有检测到新的网页版本。",
        downloads: [],
      },
      app: {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        action: "reinstall",
        description: "当前没有检测到新的 App 安装包。",
        downloads: [],
      },
    });
    return;
  }

  const { manifest, source } = resolved;
  const latestVersion = manifest.version;
  const hasUpdate = compareVersionStrings(latestVersion, currentVersion) > 0;
  const webVersion = manifest.web?.version || latestVersion;
  const appVersion = manifest.app?.version || latestVersion;

  jsonOk(res, {
    currentVersion,
    latestVersion,
    hasUpdate,
    checkedAt: new Date().toISOString(),
    source: {
      label: source.label,
      type: source.type,
      url: source.url ?? null,
    },
    notes: manifest.notes ?? [],
    web: {
      currentVersion,
      latestVersion: webVersion,
      hasUpdate: compareVersionStrings(webVersion, currentVersion) > 0,
      action: manifest.web?.action ?? "refresh",
      description: manifest.web?.description ?? "网页版更新后刷新页面即可生效。",
      downloads: (manifest.web?.downloads ?? []).map((item) => ({
        ...item,
        proxyUrl: `/api/update/download/web/${item.id}`,
      })),
    },
    app: {
      currentVersion,
      latestVersion: appVersion,
      hasUpdate: compareVersionStrings(appVersion, currentVersion) > 0,
      action: manifest.app?.action ?? "reinstall",
      description: manifest.app?.description ?? "移动端 App 更新后需要重新下载安装。",
      downloads: (manifest.app?.downloads ?? []).map((item) => ({
        ...item,
        proxyUrl: `/api/update/download/app/${item.id}`,
      })),
    },
  });
});

app.get("/api/update/download/:channel/:downloadId", async (req, res) => {
  const { channel, downloadId } = req.params;
  if (channel !== "web" && channel !== "app") {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "channel 仅支持 web 或 app");
    return;
  }

  const resolved = await loadResolvedUpdateManifest();
  if (!resolved) {
    jsonFail(res, 404, 50000, "NOT_FOUND", "未找到可用更新源");
    return;
  }

  const channelManifest = channel === "web" ? resolved.manifest.web : resolved.manifest.app;
  const download = channelManifest?.downloads?.find((item) => item.id === downloadId);

  if (!download) {
    jsonFail(res, 404, 50000, "NOT_FOUND", "未找到对应的更新包");
    return;
  }

  const contentType = download.contentType || getContentTypeFromFileName(download.fileName);

  if (download.url.startsWith("/")) {
    const localPath = resolveLocalPublicAssetPath(download.url);
    if (!localPath) {
      jsonFail(res, 404, 50000, "NOT_FOUND", "本地更新包尚未上传");
      return;
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(download.fileName)}`);
    res.setHeader("Cache-Control", "no-store");
    fs.createReadStream(localPath).pipe(res);
    return;
  }

  if (!/^https?:\/\//.test(download.url)) {
    jsonFail(res, 400, 50000, "INVALID_PARAM", "更新包地址无效");
    return;
  }

  try {
    const response = await fetch(download.url);
    if (!response.ok || !response.body) {
      jsonFail(res, 502, 50000, "REMOTE_FETCH_FAILED", "远程更新包不可用");
      return;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(download.fileName)}`);
    res.setHeader("Cache-Control", "no-store");
    const remoteType = response.headers.get("content-type");
    if (remoteType) {
      res.setHeader("Content-Type", remoteType);
    }

    Readable.fromWeb(response.body as never).pipe(res);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    jsonFail(res, 502, 50000, "REMOTE_FETCH_FAILED", message);
  }
});

const port = Number(process.env.PORT ?? 3006);

app.get("/api/changelog", async (_req, res) => {
  try {
    const changelogPath = getChangelogPath();
    if (!changelogPath) {
      console.warn("Changelog file not found");
      return jsonOk(res, { versions: [] });
    }
    const versions = parseChangelogVersions(fs.readFileSync(changelogPath, "utf-8"));
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
