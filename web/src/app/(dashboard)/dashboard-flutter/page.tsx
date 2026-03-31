"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function FlutterDashboardPreviewPage() {
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
              Flutter Preview
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              新总览页预览路由
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              这里专门用于查看新的 Flutter 总览页。旧的 TypeScript 总览页已经恢复到原路由，后续可以一边参照旧样式，一边继续打磨新页面。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              返回旧总览
            </Link>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              单独打开 Flutter 页
            </a>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
        {!loaded ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">正在加载 Flutter 总览页预览</p>
                <p className="mt-1 text-xs text-slate-500">这个路由只用于新旧对照开发，不会覆盖当前旧总览页面。</p>
              </div>
            </div>
          </div>
        ) : null}

        <iframe
          title="Flutter Dashboard Preview"
          src={iframeSrc}
          className="block h-[calc(100dvh-13rem)] min-h-[780px] w-full border-0 bg-slate-50 md:h-[calc(100dvh-10rem)] md:min-h-[860px]"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
