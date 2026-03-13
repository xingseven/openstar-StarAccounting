import cors from "cors";
import crypto from "crypto";
import express, { type Request, type Response } from "express";
import { getPrisma } from "./lib/prisma.js";

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

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  jsonOk(res, { status: "ok" });
});

app.get("/api/connect/devices", async (req, res) => {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const userId = await ensureUserId(getUserEmail(req));
      if (!userId) {
        jsonFail(res, 500, 50000, "INTERNAL_ERROR", "用户初始化失败");
        return;
      }

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
  try {
    await cleanupExpiredInDb();
  } catch {
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const userId = await ensureUserId(getUserEmail(req));
      if (!userId) {
        jsonFail(res, 500, 50000, "INTERNAL_ERROR", "用户初始化失败");
        return;
      }

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
  const id = req.params.id;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.appConnection.delete({ where: { id } });
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
