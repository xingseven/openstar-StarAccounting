"use client";

import { Palette, Check, Copy } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";
import { useState } from "react";
import { getDashboardEntryFileName } from "@/themes/dashboard-registry";
import { getThemeManifest } from "@/themes/theme-manifest";

export default function ThemesPage() {
  const { themeId, setThemeId, themes } = useTheme();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1680px] py-3 sm:py-6 lg:py-8 px-3 sm:px-0 overflow-x-hidden">

      {/* ── 页面标题 ── */}
      <div className="mb-4 sm:mb-8 px-1">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
          <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: "var(--theme-muted-text)" }} />
          <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase" style={{ color: "var(--theme-muted-text)" }}>
            Appearance
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight lg:text-3xl" style={{ color: "var(--theme-body-text)" }}>
          选择你的主题
        </h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm" style={{ color: "var(--theme-muted-text)" }}>
          切换后立即全局生效，包括导航、卡片、图表配色。
        </p>
      </div>

      {/* ── 主题卡片网格 ── */}
      <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 px-1">
        {themes.map((theme) => {
          const isActive = theme.id === themeId;
          const themeManifest = getThemeManifest(theme.id);
          const isNova = themeManifest.previewTone === "nova";
          const isFrost = themeManifest.previewTone === "frost";
          const isDark = themeManifest.previewTone === "dark" || isNova;
          const accent = theme.preview.accent;
          const dashboardFileName = getDashboardEntryFileName(theme.id);

          const copyFileName = (e: React.MouseEvent) => {
            e.stopPropagation();
            navigator.clipboard.writeText(dashboardFileName);
            setCopiedId(theme.id);
            setTimeout(() => setCopiedId(null), 2000);
          };

          // 柱图高度序列
          const bars = [35, 58, 42, 78, 52, 68, 44, 82, 60, 48];

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setThemeId(theme.id)}
              className="group relative text-left outline-none"
            >
              {/* 选中时的外发光圈（在卡片外层，不裁切） */}
              {isActive && (
                <div
                  className="pointer-events-none absolute -inset-[2px] sm:-inset-[3px] rounded-[20px] sm:rounded-[26px]"
                  style={{
                    background: `${accent}22`,
                    boxShadow: `0 0 0 2px ${accent}`,
                  }}
                />
              )}

              {/* 文件名称复制按钮 */}
              <div 
                className={`absolute right-2 sm:right-4 top-2 sm:top-4 z-10 flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 sm:px-2 py-1 sm:py-1.5 backdrop-blur-md transition-all active:scale-95 ${
                  copiedId === theme.id 
                    ? "bg-green-500/80 text-white" 
                    : "bg-black/20 text-white hover:bg-black/40"
                }`}
                onClick={copyFileName}
                title="复制当前 Dashboard 入口文件"
              >
                {copiedId === theme.id ? (
                  <>
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="text-[9px] sm:text-[10px] font-bold">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden text-[9px] sm:text-[10px] font-bold group-hover:inline">复制</span>
                  </>
                )}
              </div>

              {/* 主卡片 */}
              <div
                className="relative overflow-hidden rounded-[18px] sm:rounded-[24px] transition-transform duration-200 group-hover:scale-[1.01] group-active:scale-[0.99]"
                style={{
                  minHeight: "260px",
                  background: isNova
                    ? theme.preview.shell
                    : isDark
                    ? "linear-gradient(145deg, #0f172a 0%, #0c1220 100%)"
                    : isFrost
                    ? theme.preview.shell
                    : theme.preview.shell,
                  border: `1.5px solid ${isActive ? accent : isNova ? "rgba(255,255,255,0.08)" : isFrost ? "rgba(255,255,255,0.55)" : isDark ? "#1e293b" : "rgba(148,163,184,0.22)"}`,
                  boxShadow: isActive
                    ? `0 24px 60px -12px ${accent}40`
                    : isNova
                    ? "0 16px 44px rgba(0,0,0,0.45)"
                    : isFrost
                    ? "0 8px 32px rgba(100,140,180,0.14)"
                    : isDark
                    ? "0 8px 24px rgba(0,0,0,0.3)"
                    : "0 4px 16px rgba(15,23,42,0.06)",
                }}
              >
                {/* ── 顶部 accent 色条 ── */}
                <div
                  className="h-0.5 sm:h-1 w-full transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${accent} 0%, ${accent}66 100%)`,
                    opacity: isActive ? 1 : 0,
                  }}
                />

                {/* ── 预览区：如果是图片则显示图片，否则显示模拟 UI ── */}
                <div className="p-2.5 sm:p-4 pb-0">
                  <div
                    className="relative overflow-hidden rounded-[12px] sm:rounded-[16px]"
                    style={{
                      aspectRatio: "21/9",
                      background: isNova
                        ? "radial-gradient(ellipse at 30% 40%, #0d1b3e 0%, #050b1a 72%, #000000 100%)"
                        : isDark
                        ? "#060d1a"
                        : isFrost
                        ? "radial-gradient(ellipse at 30% 20%, #ddeeff 0%, #e8f0f8 60%, #f0f4f8 100%)"
                        : "#f0f4f8",
                      border: `1px solid ${isNova ? "rgba(255,255,255,0.08)" : isFrost ? "rgba(255,255,255,0.5)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                    }}
                  >
                    {theme.previewImage ? (
                      <div className="h-full w-full">
                         {/* 用户可以在此放入图片 */}
                         <div className="flex h-full w-full items-center justify-center bg-black/5 text-[10px] text-gray-400">
                           {/* 这里显示预览图 */}
                           <img 
                            src={theme.previewImage} 
                            alt={theme.name} 
                            className="h-full w-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                           />
                           <span className="absolute">预览图待放置: {theme.previewImage}</span>
                         </div>
                      </div>
                    ) : (
                      <div className="h-full w-full opacity-60">
                        {/* 模拟顶栏 */}
                        <div
                          className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-[4px] sm:py-[5px]"
                          style={{
                            background: isNova
                              ? "rgba(5,11,26,0.72)"
                              : isDark
                              ? "rgba(10,18,35,0.95)"
                              : isFrost
                              ? "rgba(255,255,255,0.65)"
                              : "rgba(255,255,255,0.9)",
                            borderBottom: `1px solid ${isNova ? "rgba(255,255,255,0.06)" : isFrost ? "rgba(255,255,255,0.6)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                          }}
                        >
                          <div className="flex gap-0.5 sm:gap-1">
                            {["#ff5f56","#ffbd2e","#27c93f"].map((c) => (
                              <div key={c} className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                            ))}
                          </div>
                          <div className="flex-1" />
                          <div
                            className="h-0.5 sm:h-1 w-8 sm:w-12 rounded-full"
                            style={{ background: isNova ? "rgba(255,255,255,0.08)" : isDark ? "#1e293b" : "#e2e8f0" }}
                          />
                        </div>

                        {/* 主体：侧栏 + 内容 */}
                        <div className="flex h-[calc(100%-18px)] sm:h-[calc(100%-22px)]">
                          <div
                            className="flex w-[18%] sm:w-[20%] flex-col gap-[4px] sm:gap-[5px] px-1 sm:px-1.5 py-1.5 sm:py-2"
                            style={{
                              background: isNova ? "rgba(5,11,26,0.85)" : isDark ? "rgba(8,15,30,0.9)" : isFrost ? "rgba(255,255,255,0.55)" : "rgba(248,250,252,0.85)",
                              borderRight: `1px solid ${isNova ? "rgba(255,255,255,0.06)" : isFrost ? "rgba(255,255,255,0.5)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                            }}
                          >
                            <div className="flex items-center gap-0.5 sm:gap-1 rounded-[4px] sm:rounded-[5px] px-0.5 sm:px-1 py-0.5" style={{ background: `${accent}22` }}>
                              <div className="h-0.5 sm:h-1 w-0.5 sm:w-1 rounded-full" style={{ background: accent }} />
                              <div className="h-0.5 sm:h-1 flex-1 rounded-full" style={{ background: accent, opacity: 0.7 }} />
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col gap-1 sm:gap-1.5 p-1 sm:p-1.5">
                            <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="h-6 sm:h-8 rounded-[4px] sm:rounded-[6px]" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.05)" }} />
                                ))}
                            </div>
                            <div className="flex flex-1 items-end gap-[1px] sm:gap-[2px] rounded-[6px] sm:rounded-[8px] bg-black/10 px-1 sm:px-1.5 pb-0.5 sm:pb-1 pt-1 sm:pt-1.5">
                              {bars.map((h, i) => (
                                <div key={i} className="flex-1 rounded-t-[1px] sm:rounded-t-[2px]" style={{ height: `${h}%`, background: i === 7 ? accent : `${accent}30` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── 底部信息区 ── */}
                <div className="p-2.5 sm:p-4 pt-2 sm:pt-3.5">
                  <div className="mb-2 sm:mb-3 flex h-[3px] sm:h-[4px] overflow-hidden rounded-full gap-px">
                    <div className="flex-[3]" style={{ background: accent }} />
                    <div className="flex-1" style={{ background: isDark ? "#1e293b" : "#e2e8f0" }} />
                    <div className="flex-1" style={{ background: theme.preview.darkPanel }} />
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-sm sm:text-base font-bold tracking-tight"
                        style={{ color: isNova ? "#f0f4ff" : isDark ? "#f1f5f9" : isFrost ? "#1a3550" : "var(--theme-body-text)" }}
                      >
                        {theme.name}
                      </h3>
                      <p
                        className="truncate text-[10px] sm:text-xs mt-0.5 sm:mt-1"
                        style={{ color: isNova ? "#6e84a8" : isDark ? "#475569" : isFrost ? "#6a8faa" : "var(--theme-muted-text)" }}
                      >
                        {theme.description}
                      </p>
                    </div>

                    {isActive ? (
                      <span
                        className="shrink-0 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold"
                        style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
                      >
                        使用中
                      </span>
                    ) : (
                      <span
                        className="shrink-0 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        style={{
                          background: isNova ? "rgba(255,255,255,0.1)" : isDark ? "#1e293b" : "rgba(148,163,184,0.15)",
                          color: isNova ? "#a8b8d8" : isDark ? "#94a3b8" : "var(--theme-muted-text)",
                          border: `1px solid ${isNova ? "rgba(255,255,255,0.1)" : isDark ? "#334155" : "rgba(148,163,184,0.2)"}`,
                        }}
                      >
                        点击应用
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
