"use client";

import { CheckCircle2, Palette } from "lucide-react";
import { ThemeHero, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";
import { useTheme } from "@/components/shared/theme-provider";

export default function ThemesPage() {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
      <ThemeHero className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">主题中心</h1>
            <p className="mt-1 text-sm text-slate-500">切换全局视觉风格。后续新增主题，只需要补一份主题配置即可。</p>
          </div>
        </div>
      </ThemeHero>

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="Global Themes"
          title="选择当前主题"
          description="切换后会立即影响全局布局、导航、卡片外壳和共享主题组件。"
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => {
            const isActive = theme.id === themeId;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeId(theme.id)}
                className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition ${
                  isActive ? "border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.16)]" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className="aspect-video rounded-[18px] border border-slate-200 p-3"
                  style={{ background: theme.preview.shell }}
                >
                  <div className="grid h-full grid-cols-[76px_minmax(0,1fr)] gap-3">
                    <div className="rounded-[14px] border" style={{ background: theme.preview.surface, borderColor: "rgba(148,163,184,0.22)" }} />
                    <div className="space-y-2">
                      <div className="h-3 w-1/3 rounded-full" style={{ background: theme.preview.accent }} />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-16 rounded-[14px] border" style={{ background: theme.preview.surface, borderColor: "rgba(148,163,184,0.22)" }} />
                        <div className="h-16 rounded-[14px] border" style={{ background: theme.preview.contrast, borderColor: "rgba(148,163,184,0.12)" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{theme.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{theme.description}</p>
                  </div>
                  {isActive ? <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" /> : null}
                </div>

                <div className="mt-4 text-xs font-medium text-slate-500">{isActive ? "当前使用中" : "点击切换"}</div>
              </button>
            );
          })}
        </div>
      </ThemeSurface>
    </div>
  );
}
