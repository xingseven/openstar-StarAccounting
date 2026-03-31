"use client";

import { useMemo, useState } from "react";

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const iframeSrc = useMemo(
    () => `/flutter-dashboard/index.html#/embed/dashboard?v=20260331-1`,
    [],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Flutter Dashboard
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              总览页已切换到新的 Flutter 首版
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              当前入口已经使用新的 Flutter 总览页，旧的 TypeScript 文件仍然保留在仓库里，方便后续对照和回滚。
            </p>
          </div>

          <a
            href={iframeSrc}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            单独打开新页面
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
        {!loaded ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">正在加载新的 Flutter 总览页</p>
                <p className="mt-1 text-xs text-slate-500">首次打开会比普通页面慢一点，后续会走静态资源缓存。</p>
              </div>
            </div>
          </div>
        ) : null}

        <iframe
          title="Flutter Dashboard"
          src={iframeSrc}
          className="block h-[calc(100dvh-13rem)] min-h-[780px] w-full border-0 bg-slate-50 md:h-[calc(100dvh-10rem)] md:min-h-[860px]"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
