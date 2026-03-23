"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Trash2,
  Waypoints,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/shared/Skeletons";
import { ThemeHero, ThemeMetricCard, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";

type GenerateData = {
  connectionId: string;
  otpCode: string;
  publicIp: string;
  verifyPath: string;
  expiresAt: string;
  expiresInSeconds: number;
};

type Device = {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  ipAddress: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

function formatSeconds(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function ConnectionsPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);
  const [generateData, setGenerateData] = useState<GenerateData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPageLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!generateData) return 0;
    return (new Date(generateData.expiresAt).getTime() - now) / 1000;
  }, [generateData, now]);

  const expired = Boolean(generateData) && remainingSeconds <= 0;

  const currentConnectionDevice = useMemo(() => {
    if (!generateData) return null;
    return devices.find((device) => device.id === generateData.connectionId) ?? null;
  }, [devices, generateData]);

  const connectionStatus = useMemo(() => {
    if (currentConnectionDevice?.verifiedAt) {
      return {
        title: "已完成绑定",
        detail: `${currentConnectionDevice.deviceName ?? "新设备"} 已通过验证码完成授权。`,
        tone: "emerald",
      };
    }

    if (generateData && !expired) {
      return {
        title: "等待 APP 验证",
        detail: "请在 App 中输入服务器地址和当前验证码完成绑定。",
        tone: "blue",
      };
    }

    if (generateData && expired) {
      return {
        title: "验证码已过期",
        detail: "旧验证码已失效，请重新生成新的连接码。",
        tone: "amber",
      };
    }

    return {
      title: "尚未生成连接码",
      detail: "生成验证码后，App 才能发起第一次设备绑定。",
      tone: "slate",
    };
  }, [currentConnectionDevice, expired, generateData]);

  const verifyPayload = useMemo(
    () =>
      JSON.stringify(
        {
          otpCode: generateData?.otpCode ?? "123456",
          deviceId: "your-device-id",
          deviceName: "iPhone 15",
        },
        null,
        2
      ),
    [generateData]
  );

  useEffect(() => {
    void loadDevices();
  }, []);

  useEffect(() => {
    if (!generateData) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [generateData]);

  useEffect(() => {
    if (!generateData || expired || currentConnectionDevice?.verifiedAt) return;

    const timer = window.setInterval(() => {
      void loadDevices(true);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [currentConnectionDevice?.verifiedAt, expired, generateData]);

  async function loadDevices(silent = false) {
    if (!silent) {
      setIsRefreshingDevices(true);
    }

    try {
      const data = await apiFetch<{ devices: Device[] }>("/api/connect/devices");
      setDevices(data.devices);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "加载已授权设备失败");
      }
    } finally {
      if (!silent) {
        setIsRefreshingDevices(false);
      }
    }
  }

  async function generateOtp() {
    setError(null);
    setIsGenerating(true);

    try {
      const data = await apiFetch<GenerateData>("/api/connect/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      setGenerateData(data);
      setNow(Date.now());
      await loadDevices(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成连接码失败");
    } finally {
      setIsGenerating(false);
    }
  }

  async function revokeDevice(id: string) {
    setError(null);

    try {
      await apiFetch<{ revoked: boolean }>(`/api/connect/${id}`, { method: "DELETE" });
      if (generateData?.connectionId === id) {
        setGenerateData(null);
      }
      await loadDevices(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "撤销授权失败");
    }
  }

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1600);
    } catch {
      setError("复制失败，请手动复制");
    }
  }

  if (isPageLoading) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="space-y-4">
          <DelayedRender delay={0}>
            <Skeleton className="h-[220px] rounded-[28px]" />
          </DelayedRender>
          <DelayedRender delay={60}>
            <Skeleton className="h-[380px] rounded-[24px]" />
          </DelayedRender>
          <DelayedRender delay={120}>
            <Skeleton className="h-[240px] rounded-[24px]" />
          </DelayedRender>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="5xl">
      <ThemeHero className="border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.16),transparent_60%)] lg:block" />

        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Connection Workspace
            </div>

            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                用一次性验证码把 Web 和后续 App 连接起来
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                当前流程基于“服务器地址 + 6 位验证码 + 设备信息”完成绑定。网页负责生成连接码和管理设备，App 负责发起验证并保存设备令牌。
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {["1. 生成连接码", "2. App 输入服务器地址", "3. 提交 OTP 完成绑定"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-slate-600 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ThemeMetricCard
              label="当前状态"
              value={connectionStatus.title}
              tone={connectionStatus.tone === "emerald" ? "green" : connectionStatus.tone === "amber" ? "amber" : connectionStatus.tone === "blue" ? "blue" : "slate"}
              icon={connectionStatus.tone === "emerald" ? CheckCircle2 : connectionStatus.tone === "amber" ? KeyRound : Waypoints}
              detail={connectionStatus.detail}
              hideDetailOnMobile
            />
            <ThemeMetricCard
              label="已授权设备"
              value={`${devices.length} 台`}
              tone="blue"
              icon={Smartphone}
              detail="撤销后对应设备令牌立即失效。"
            />
          </div>
        </div>
      </ThemeHero>

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ThemeSurface>
        <div className="space-y-6 p-4 sm:p-6">
          <ThemeSectionHeader
            eyebrow="Web 端"
            title="生成连接码"
            description="每次生成都会使当前账户下旧的未验证验证码失效。生成后页面会自动轮询设备列表，判断这次连接是否已完成。"
            action={
              <button
                type="button"
                onClick={generateOtp}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {isGenerating ? "生成中" : generateData && !expired ? "重新生成" : "生成连接码"}
              </button>
            }
          />

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-blue-200 bg-[linear-gradient(145deg,#eff6ff_0%,#dbeafe_100%)] p-5 shadow-sm md:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-700/80">验证码</p>
                    <p className="mt-3 text-4xl font-semibold tracking-[0.35em] text-slate-950 sm:text-5xl">
                      {generateData?.otpCode ?? "------"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => generateData && copyValue("otp", generateData.otpCode)}
                    disabled={!generateData}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedField === "otp" ? "已复制" : "复制验证码"}
                  </button>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  {generateData
                    ? "请在有效期内把这组验证码输入到 App 中。验证成功后，这次连接会在设备列表里自动显示。"
                    : "点击右上角按钮生成第一组连接码。"}
                </p>
              </div>

              <InfoCard
                icon={Server}
                label="服务器地址"
                value={generateData?.publicIp ?? "等待生成"}
                actionLabel={copiedField === "host" ? "已复制" : "复制"}
                onAction={() => generateData && copyValue("host", generateData.publicIp)}
                disabled={!generateData}
              />

              <InfoCard
                icon={Waypoints}
                label="验证路径"
                value={generateData?.verifyPath ?? "/api/connect/verify"}
                actionLabel={copiedField === "path" ? "已复制" : "复制"}
                onAction={() => copyValue("path", generateData?.verifyPath ?? "/api/connect/verify")}
              />

              <InfoCard
                icon={KeyRound}
                label="剩余时间"
                value={generateData ? (expired ? "已过期" : formatSeconds(remainingSeconds)) : "05:00"}
                valueClassName={expired ? "text-amber-600" : undefined}
              />

              <InfoCard
                icon={ShieldCheck}
                label="绑定状态"
                value={connectionStatus.title}
                valueClassName={currentConnectionDevice?.verifiedAt ? "text-emerald-600" : undefined}
              />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Smartphone className="h-4 w-4 text-cyan-300" />
                App 对接摘要
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">请求方式</p>
                  <p className="mt-2 font-mono text-sm text-white">POST /api/connect/verify</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">请求体示例</p>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-5 text-slate-100">
                    {verifyPayload}
                  </pre>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">返回令牌</p>
                  <p className="mt-2 leading-6 text-slate-200">
                    验证成功后会返回 `dev-connectionId` 形式的设备令牌。后续 App 请求应使用
                    <span className="font-mono text-white"> Authorization: Bearer ...</span> 继续访问接口。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {currentConnectionDevice?.verifiedAt ? (
            <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              本次连接已完成绑定，设备为“{currentConnectionDevice.deviceName ?? "未命名设备"}”，绑定时间 {formatDateTime(currentConnectionDevice.verifiedAt)}。
            </div>
          ) : null}
        </div>
      </ThemeSurface>

      <ThemeSurface>
        <div className="space-y-5 p-4 sm:p-6">
          <ThemeSectionHeader
            eyebrow="设备管理"
            title="已授权设备"
            description="这里展示当前账户下已完成验证的设备。撤销后，该设备对应的访问令牌会立即不可用。"
            action={
              <button
                type="button"
                onClick={() => void loadDevices()}
                disabled={isRefreshingDevices}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshingDevices && "animate-spin")} />
                刷新设备
              </button>
            }
          />

          {devices.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              还没有已授权设备。生成连接码后，使用 App 完成一次验证，这里就会出现第一台设备。
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[22px] border border-slate-200">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">设备</th>
                    <th className="px-4 py-3 font-medium">设备 ID</th>
                    <th className="px-4 py-3 font-medium">IP 地址</th>
                    <th className="px-4 py-3 font-medium">绑定时间</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => {
                    const isCurrentConnection = generateData?.connectionId === device.id;

                    return (
                      <tr key={device.id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{device.deviceName ?? "未命名设备"}</div>
                          <div className="mt-1 text-xs text-slate-500">连接记录：{device.id}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{device.deviceId ?? "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{device.ipAddress ?? "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(device.verifiedAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                              isCurrentConnection ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                            )}
                          >
                            {isCurrentConnection ? "当前连接" : "已授权"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => revokeDevice(device.id)}
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            撤销
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ThemeSurface>
    </PageContainer>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  valueClassName,
  actionLabel,
  onAction,
  disabled = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className={cn("mt-2 break-all text-base font-semibold tracking-tight text-slate-950", valueClassName)}>
              {value}
            </p>
          </div>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={disabled}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
