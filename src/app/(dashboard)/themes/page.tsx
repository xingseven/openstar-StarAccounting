"use client";

import { Palette } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

export default function ThemesPage() {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <div className="mx-auto max-w-[1680px] py-4 sm:py-6 lg:py-8">

      {/* ── 页面标题 ── */}
      <div className="mb-8 px-1">
        <div className="flex items-center gap-2.5 mb-1">
          <Palette className="h-4 w-4" style={{ color: "var(--theme-muted-text)" }} />
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--theme-muted-text)" }}>
            Appearance
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--theme-body-text)" }}>
          选择你的主题
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>
          切换后立即全局生效，包括导航、卡片、图表配色。
        </p>
      </div>

      {/* ── 主题卡片网格 ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {themes.map((theme) => {
          const isActive = theme.id === themeId;
          const isNova = theme.id === "nova";
          const isFrost = theme.id === "frost";
          const isDark = theme.id === "midnight" || isNova;
          const accent = theme.preview.accent;

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
                  className="pointer-events-none absolute -inset-[3px] rounded-[26px]"
                  style={{
                    background: `${accent}22`,
                    boxShadow: `0 0 0 2px ${accent}`,
                  }}
                />
              )}

              {/* 主卡片 */}
              <div
                className="relative overflow-hidden rounded-[22px] transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.99]"
                style={{
                  background: isNova
                    ? theme.preview.shell
                    : isDark
                    ? "linear-gradient(145deg, #0f172a 0%, #0c1220 100%)"
                    : isFrost
                    ? theme.preview.shell
                    : theme.preview.shell,
                  border: `1.5px solid ${isActive ? accent : isNova ? "rgba(255,255,255,0.08)" : isFrost ? "rgba(255,255,255,0.55)" : isDark ? "#1e293b" : "rgba(148,163,184,0.22)"}`,
                  boxShadow: isActive
                    ? `0 20px 48px -8px ${accent}40`
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
                  className="h-1 w-full transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${accent} 0%, ${accent}66 100%)`,
                    opacity: isActive ? 1 : 0,
                  }}
                />

                {/* ── 预览区：深色沉浸式 UI 截图感 ── */}
                <div className="p-3 pb-0">
                  <div
                    className="overflow-hidden rounded-[14px]"
                    style={{
                      aspectRatio: "16/9",
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
                    {/* 模拟顶栏 */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-[5px]"
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
                      {/* 圆点装饰 */}
                      <div className="flex gap-1">
                        {["#ff5f56","#ffbd2e","#27c93f"].map((c) => (
                          <div key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                        ))}
                      </div>
                      <div className="flex-1" />
                      <div
                        className="h-1 w-12 rounded-full"
                        style={{ background: isNova ? "rgba(255,255,255,0.08)" : isDark ? "#1e293b" : "#e2e8f0" }}
                      />
                    </div>

                    {/* 主体：侧栏 + 内容 */}
                    <div className="flex h-[calc(100%-22px)]">
                      {/* 侧栏 */}
                      <div
                        className="flex w-[20%] flex-col gap-[5px] px-1.5 py-2"
                        style={{
                          background: isNova
                            ? "rgba(5,11,26,0.85)"
                            : isDark
                            ? "rgba(8,15,30,0.9)"
                            : isFrost
                            ? "rgba(255,255,255,0.55)"
                            : "rgba(248,250,252,0.85)",
                          borderRight: `1px solid ${isNova ? "rgba(255,255,255,0.06)" : isFrost ? "rgba(255,255,255,0.5)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                        }}
                      >
                        {/* 激活菜单项 */}
                        <div
                          className="flex items-center gap-1 rounded-[5px] px-1 py-0.5"
                          style={{ background: `${accent}22` }}
                        >
                          <div className="h-1 w-1 rounded-full" style={{ background: accent }} />
                          <div className="h-1 flex-1 rounded-full" style={{ background: accent, opacity: 0.7 }} />
                        </div>
                        {[70, 55, 80].map((w, i) => (
                          <div
                            key={i}
                            className="h-[5px] rounded-full"
                            style={{
                              width: `${w}%`,
                              background: isNova ? "rgba(255,255,255,0.1)" : isFrost ? "rgba(100,140,180,0.2)" : isDark ? "#1e293b" : "#e2e8f0",
                            }}
                          />
                        ))}
                      </div>

                      {/* 内容区 */}
                      <div className="flex flex-1 flex-col gap-1.5 p-1.5">
                        {/* Metric 卡片行 */}
                        <div className="grid grid-cols-3 gap-1">
                          {isFrost
                            ? [0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-1 rounded-[6px] p-1"
                                  style={{
                                    background: "rgba(255,255,255,0.75)",
                                    backdropFilter: "blur(8px)",
                                    boxShadow: "0 1px 6px rgba(100,140,180,0.1)",
                                  }}
                                >
                                  {/* 左侧竖线 */}
                                  <div
                                    className="mt-[1px] h-5 w-[2px] rounded-full"
                                    style={{ background: accent }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-0.5 h-[2px] w-1/2 rounded-full" style={{ background: "rgba(100,140,180,0.25)" }} />
                                    <div
                                      className="h-[5px] rounded-full"
                                      style={{
                                        width: i === 0 ? "80%" : i === 1 ? "65%" : "50%",
                                        background: i === 0 ? accent : "rgba(100,140,180,0.3)",
                                      }}
                                    />
                                  </div>
                                </div>
                              ))
                            : isNova
                            ? [0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-1 rounded-[6px] p-1"
                                  style={{
                                    background: "rgba(255,255,255,0.07)",
                                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                                  }}
                                >
                                  <div
                                    className="mt-[1px] h-5 w-[2px] rounded-full"
                                    style={{
                                      background: accent,
                                      boxShadow: "0 0 8px rgba(99,179,255,0.5)",
                                    }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-0.5 h-[2px] w-1/2 rounded-full bg-white/25" />
                                    <div
                                      className="h-[5px] rounded-full"
                                      style={{
                                        width: i === 1 ? "70%" : i === 2 ? "55%" : "82%",
                                        background: i === 0 ? accent : "rgba(240,244,255,0.68)",
                                        boxShadow: i === 0 ? "0 0 8px rgba(99,179,255,0.45)" : "none",
                                      }}
                                    />
                                  </div>
                                </div>
                              ))
                            : [true, false, false].map((isHighlight, i) => (
                                <div
                                  key={i}
                                  className="rounded-[6px] p-1"
                                  style={{
                                    background: isHighlight
                                      ? `${accent}18`
                                      : isDark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.8)",
                                    border: `1px solid ${isHighlight ? `${accent}30` : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                                  }}
                                >
                                  <div
                                    className="mb-0.5 h-[3px] w-3/4 rounded-full"
                                    style={{ background: isDark ? "#334155" : "#e2e8f0" }}
                                  />
                                  <div
                                    className="h-[5px] w-1/2 rounded-full"
                                    style={{
                                      background: isHighlight ? accent : isDark ? "#334155" : "#cbd5e1",
                                      opacity: isHighlight ? 1 : 0.6,
                                    }}
                                  />
                                </div>
                              ))}
                        </div>

                        {/* 图表区 */}
                        <div
                          className="flex flex-1 items-end gap-[2px] rounded-[8px] px-1.5 pb-1 pt-1.5"
                          style={{ background: isFrost ? "rgba(20,50,90,0.82)" : isNova ? "rgba(0,0,0,0.42)" : theme.preview.darkPanel }}
                        >
                          {bars.map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t-[2px]"
                              style={{
                                height: `${h}%`,
                                background: i === 7
                                  ? accent
                                  : `${accent}50`,
                                boxShadow: isNova && i === 7 ? "0 0 8px rgba(99,179,255,0.5)" : "none",
                                transition: "height 0.3s ease",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 底部信息区 ── */}
                <div className="p-3 pt-2.5">
                  {/* 三段色条 */}
                  <div className="mb-2.5 flex h-[3px] overflow-hidden rounded-full gap-px">
                    <div className="flex-[2]" style={{ background: accent }} />
                    <div className="flex-1" style={{ background: theme.preview.surface === "#ffffff" || theme.preview.surface === "#fffdf9" ? (isDark ? "#1e293b" : "#e2e8f0") : theme.preview.surface }} />
                    <div className="flex-1" style={{ background: theme.preview.darkPanel }} />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3
                        className="text-sm font-semibold tracking-tight"
                        style={{ color: isNova ? "#f0f4ff" : isDark ? "#f1f5f9" : isFrost ? "#1a3550" : "var(--theme-body-text)" }}
                      >
                        {theme.name}
                      </h3>
                      <p
                        className="text-[11px] leading-4 mt-0.5"
                        style={{ color: isNova ? "#6e84a8" : isDark ? "#475569" : isFrost ? "#6a8faa" : "var(--theme-muted-text)" }}
                      >
                        {theme.description}
                      </p>
                    </div>

                    {/* 状态胶囊 */}
                    {isActive ? (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
                        style={{
                          background: `${accent}20`,
                          color: accent,
                          border: `1px solid ${accent}40`,
                        }}
                      >
                        使用中
                      </span>
                    ) : (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        style={{
                          background: isNova ? "rgba(255,255,255,0.06)" : isFrost ? "rgba(255,255,255,0.7)" : isDark ? "#1e293b" : "rgba(148,163,184,0.15)",
                          color: isNova ? "#a8b8d8" : isFrost ? "#6a8faa" : isDark ? "#94a3b8" : "var(--theme-muted-text)",
                          border: `1px solid ${isNova ? "rgba(255,255,255,0.08)" : isFrost ? "rgba(100,140,180,0.2)" : isDark ? "#334155" : "rgba(148,163,184,0.2)"}`,
                        }}
                      >
                        切换
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
