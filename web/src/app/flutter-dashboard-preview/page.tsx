"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function FlutterDashboardPreviewPage() {
  const [loaded, setLoaded] = useState(false);
  const iframeSrc = useMemo(
    () => `/flutter-dashboard/index.html#/dashboard?v=20260331-2`,
    [],
  );

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(29,78,216,0.12),_transparent_32%),linear-gradient(180deg,#eef5ff_0%,#f8fbff_42%,#eef3f8_100%)]">
      <div className="relative flex h-full flex-col">
        <div className="z-20 border-b border-slate-200/70 bg-white/88 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                Flutter Main Preview
              </p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                新总览页独立主页面
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                这里不再复用旧站的总览壳层，直接查看 Flutter 自己的主页面结构。旧总览页仍保留在
                <span className="font-medium text-slate-800"> / </span>
                方便继续对照开发。
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
                单独打开 Flutter 主页
              </a>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {!loaded ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))]">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">正在加载 Flutter 主页面</p>
                  <p className="mt-1 text-xs text-slate-500">当前入口不再套用旧站壳层，看到的就是新的独立主页面。</p>
                </div>
              </div>
            </div>
          ) : null}

          <iframe
            title="Flutter Dashboard Main Preview"
            src={iframeSrc}
            className="block h-full min-h-0 w-full border-0 bg-slate-50"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
