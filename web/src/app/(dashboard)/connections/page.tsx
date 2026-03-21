"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/shared/Skeletons";
import { DelayedRender } from "@/components/shared/DelayedRender";

type GenerateData = {
  otpCode: string;
  publicIp: string;
  expiresAt: string;
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
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ConnectionsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateData, setGenerateData] = useState<GenerateData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // 首次加载时显示骨架的延迟状态
  const [骨架显示, set骨架显示] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => set骨架显示(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!generateData) return 0;
    return (new Date(generateData.expiresAt).getTime() - now) / 1000;
  }, [generateData, now]);

  useEffect(() => {
    if (!generateData) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [generateData]);

  async function loadDevices() {
    const data = await apiFetch<{ devices: Device[] }>("/api/connect/devices");
    setDevices(data.devices);
  }

  useEffect(() => {
    loadDevices().catch(() => {
    });
  }, []);

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
      await loadDevices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成连接码失败");
    } finally {
      setIsGenerating(false);
    }
  }

  async function revokeDevice(id: string) {
    setError(null);
    try {
      await apiFetch<{ revoked: boolean }>(`/api/connect/${id}`, { method: "DELETE" });
      await loadDevices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "撤销失败");
    }
  }

  const expired = generateData ? remainingSeconds <= 0 : false;

  if (骨架显示) {
    return (
      <PageContainer maxWidth="2xl">
        <div className="space-y-2 text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="space-y-4">
          <DelayedRender delay={0}>
            <Skeleton className="h-[120px] w-full rounded-xl" />
          </DelayedRender>
          <DelayedRender delay={50}>
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </DelayedRender>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold">连接管理</h1>
        <p className="text-sm text-gray-600">用于 APP 通过公网 IP + 一次性验证码建立安全绑定</p>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-medium">生成连接码</div>
            <div className="text-sm text-gray-600">有效期 5 分钟，验证成功后立即失效</div>
          </div>
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            onClick={generateOtp}
            disabled={isGenerating}
            type="button"
          >
            {isGenerating ? "生成中..." : generateData && !expired ? "重新生成" : "生成"}
          </button>
        </div>

        {generateData ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">验证码</div>
              <div className="text-3xl font-semibold tracking-widest mt-1">
                {generateData.otpCode}
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">服务器 IP</div>
              <div className="text-sm font-medium mt-1">{generateData.publicIp}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-600">剩余时间</div>
              <div className={`text-sm font-medium mt-1 ${expired ? "text-red-600" : ""}`}>
                {expired ? "已过期" : formatSeconds(remainingSeconds)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">点击生成后展示验证码</div>
        )}
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">已授权设备</div>
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={() => loadDevices().catch(() => {
            })}
            type="button"
          >
            刷新
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="text-sm text-gray-600">暂无已授权设备</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-3">设备</th>
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2 pr-3">连接时间</th>
                  <th className="py-2 pr-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-3">
                      <div className="font-medium">{d.deviceName ?? "未知设备"}</div>
                      <div className="text-xs text-gray-600">{d.deviceId ?? "-"}</div>
                    </td>
                    <td className="py-2 pr-3">{d.ipAddress ?? "-"}</td>
                    <td className="py-2 pr-3">
                      {d.verifiedAt ? new Date(d.verifiedAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => revokeDevice(d.id)}
                        type="button"
                      >
                        撤销
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  );
}

