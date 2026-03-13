import cors from "cors";
import crypto from "crypto";
import express, { type Request, type Response } from "express";

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

function cleanupExpired() {
  const now = Date.now();
  for (const [id, conn] of connectionsById.entries()) {
    if (!conn.isVerified && conn.expiresAt <= now) {
      connectionsById.delete(id);
      connectionIdByOtp.delete(conn.otpCode);
    }
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  jsonOk(res, { status: "ok" });
});

app.post("/api/connect/generate", (req, res) => {
  cleanupExpired();

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

app.post("/api/connect/verify", (req, res) => {
  cleanupExpired();

  const { otpCode, deviceId, deviceName } = req.body ?? {};

  if (typeof otpCode !== "string" || otpCode.trim().length !== 6) {
    jsonFail(res, 400, 20001, "OTP_NOT_FOUND", "otpCode 格式不正确");
    return;
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

app.delete("/api/connect/:id", (req, res) => {
  const id = req.params.id;
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
