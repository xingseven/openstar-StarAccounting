"use client";

import { CheckCircle2, Palette } from "lucide-react";
import { ThemeHero, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";
import { useTheme } from "@/components/shared/theme-provider";

export default function ThemesPage() {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:py-6 lg:py-8">
      <ThemeHero className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div
            className="rounded-2xl p-3"
            style={{ background: "var(--theme-dialog-section-bg)", color: "var(--theme-label-text)" }}
          >
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1
              className="text-xl font-semibold tracking-tight sm:text-2xl"
              style={{ color: "var(--theme-body-text)" }}
            >
              主题中心
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--theme-muted-text)" }}>
              切换全局视觉风格。后续新增主题，只需要补一份主题配置即可。
            </p>
          </div>
        </div>
      </ThemeHero>

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="全局主题"
          title="选择当前主题"
          description="切换后会立即影响全局布局、导航、卡片外壳和共享主题组件。"
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {themes.map((theme) => {
            const isActive = theme.id === themeId;
            const isDark = theme.id === "midnight";

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeId(theme.id)}
                className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition ${
                  isActive
                    ? "border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.16)]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                style={
                  isDark
                    ? { background: "#0f172a", borderColor: isActive ? undefined : "#1e293b" }
                    : undefined
                }
              >
                {/* ── 预览区域 ── */}
                <div
                  className="overflow-hidden rounded-[18px] border"
                  style={{
                    background: theme.preview.shell,
                    borderColor: isDark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.18)",
                    aspectRatio: "16/10",
                  }}
                >
                  {/* 模拟顶栏 */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5"
                    style={{
                      background: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.78)",
                      borderBottom: isDark
                        ? "1px solid rgba(148,163,184,0.08)"
                        : "1px solid rgba(148,163,184,0.14)",
                    }}
                  >
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: theme.preview.accent }}
                    />
                    <div
                      className="h-1 w-8 rounded-full opacity-40"
                      style={{ background: isDark ? "#94a3b8" : "#64748b" }}
                    />
                    <div className="flex-1" />
                    <div
                      className="h-1.5 w-10 rounded-full opacity-30"
                      style={{ background: isDark ? "#94a3b8" : "#64748b" }}
                    />
                  </div>

                  {/* 主体：侧栏 + 内容 */}
                  <div className="flex h-[calc(100%-28px)]">
                    {/* 侧栏 */}
                    <div
                      className="flex w-[26%] flex-col gap-1 px-1.5 py-2"
                      style={{
                        background: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.62)",
                        borderRight: isDark
                          ? "1px solid rgba(148,163,184,0.06)"
                          : "1px solid rgba(148,163,184,0.12)",
                      }}
                    >
                      {[true, false, false, false].map((active, i) => (
                        <div
                          key={i}
                          className="h-1.5 rounded-full"
                          style={{
                            background: active ? theme.preview.accent : isDark ? "#334155" : "#e2e8f0",
                            opacity: active ? 1 : 0.6,
                            width: active ? "80%" : `${55 + i * 7}%`,
                          }}
                        />
                      ))}
                    </div>

                    {/* 内容区 */}
                    <div className="flex flex-1 flex-col gap-1.5 p-2">
                      {/* metric 行 */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {[0, 1].map((i) => (
                          <div
                            key={i}
                            className="flex flex-col gap-0.5 rounded-[8px] p-1.5"
                            style={{
                              background: isDark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.74)",
                              border: isDark
                                ? "1px solid rgba(148,163,184,0.06)"
                                : "1px solid rgba(148,163,184,0.14)",
                            }}
                          >
                            <div
                              className="h-1 w-3/4 rounded-full opacity-40"
                              style={{ background: isDark ? "#94a3b8" : "#64748b" }}
                            />
                            <div
                              className="h-2 w-1/2 rounded-full"
                              style={{ background: i === 0 ? theme.preview.accent : (isDark ? "#334155" : "#cbd5e1"), opacity: i === 0 ? 0.9 : 0.7 }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* 暗色面板 */}
                      <div
                        className="flex-1 rounded-[8px] p-1.5"
                        style={{ background: theme.preview.darkPanel }}
                      >
                        <div className="h-1 w-1/3 rounded-full bg-white/20 mb-1" />
                        <div className="h-1 w-2/3 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 卡片底部信息 ── */}
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="text-base font-semibold sm:text-lg"
                      style={{ color: isDark ? "#f1f5f9" : "var(--theme-body-text)" }}
                    >
                      {theme.name}
                    </h3>
                    <p
                      className="mt-0.5 text-xs leading-5 sm:text-sm"
                      style={{ color: isDark ? "#64748b" : "var(--theme-muted-text)" }}
                    >
                      {theme.description}
                    </p>
                  </div>
                  {isActive ? <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-500" /> : null}
                </div>

                {/* 色板小圆点 */}
                <div className="mt-3 flex items-center gap-2">
                  {[theme.preview.accent, theme.preview.surface, theme.preview.darkPanel].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ background: color }}
                      />
                    )
                  )}
                  <span
                    className="ml-auto text-xs font-medium"
                    style={{ color: isDark ? "#475569" : "var(--theme-muted-text)" }}
                  >
                    {isActive ? "当前使用中" : "点击切换"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </ThemeSurface>
    </div>
  );
}
