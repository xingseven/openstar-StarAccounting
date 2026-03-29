"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Globe,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  LoadingPageShell,
} from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";
import { THEME_LIST_ITEM_CLASS, ThemeHero, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VersionItem = {
  version: string;
  date: string;
  type: string;
  highlights: string[];
};

type UpdateDownloadItem = {
  id: string;
  label: string;
  fileName: string;
  size?: string;
  description?: string;
  proxyUrl: string;
};

type UpdateChannelInfo = {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  action: string;
  description: string;
  downloads: UpdateDownloadItem[];
};

type UpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  checkedAt: string;
  source: {
    label: string;
    type?: string;
    url?: string | null;
  };
  notes: string[];
  web: UpdateChannelInfo;
  app: UpdateChannelInfo;
};

const fallbackVersionHistory: VersionItem[] = [
  {
    version: "2.3.18",
    date: "2026-03-29",
    type: "improvement",
    highlights: [
      "消费页新增多组分析维度，并将分析区重构为四组图表面板。",
      "消费图表移动端布局、平台列表、热区矩阵和日历可读性继续统一优化。",
    ],
  },
  {
    version: "2.3.17",
    date: "2026-03-28",
    type: "improvement",
    highlights: [
      "主题系统新增模块级分色层次，让仪表盘、消费、资产、贷款、储蓄首屏视觉更易区分。",
      "默认主题整体去掉毛玻璃和半透明壳层，收口为更扎实的实色容器与清晰边框。",
    ],
  },
  {
    version: "2.3.16",
    date: "2026-03-29",
    type: "feature",
    highlights: [
      "数据页新增按交易对方建立自动归类规则，并支持回填历史交易。",
      "AI 模型配置改为按当前账户读写，修复添加模型只提示创建失败的问题。",
    ],
  },
  {
    version: "2.3.15",
    date: "2026-03-25",
    type: "feature",
    highlights: [
      "数据管理页手动录入升级为收入 / 支出双模式，并补充云闪付、现金等消费补录场景。",
      "贷款页支持扫描历史还款记录，把已导入账单回溯关联到贷款。",
    ],
  },
  {
    version: "2.3.14",
    date: "2026-03-25",
    type: "feature",
    highlights: [
      "数据管理页新增银行卡收入手动补录表单。",
      "交易接口统一切换到当前账户作用域，收入与支出统计口径更一致。",
    ],
  },
  {
    version: "2.3.13",
    date: "2026-03-25",
    type: "improvement",
    highlights: [
      "移动端主题壳层、储蓄页和贷款页卡片继续减轻层级与边框。",
      "贷款页还款进度图表图例移动到顶部，避免与 X 轴标签重叠。",
    ],
  },
  {
    version: "2.3.12",
    date: "2026-03-24",
    type: "feature",
    highlights: [
      "主题系统收尾完成，并新增 terracotta 赤陶主题作为验收样本。",
      "共享表单、提示和常用控件样式继续收口到 shared primitive。",
    ],
  },
  {
    version: "2.3.9",
    date: "2026-03-24",
    type: "feature",
    highlights: [
      "新增全局主题系统与页面视觉统一能力。",
      "关于页面开始接入版本与更新相关能力。",
    ],
  },
  {
    version: "2.3.6",
    date: "2026-03-23",
    type: "feature",
    highlights: [
      "新增 App 交易同步接口。",
      "连接验证码升级为哈希保存与校验。",
    ],
  },
];

const fallbackUpdateInfo: UpdateInfo = {
  currentVersion: "2.3.18",
  latestVersion: "2.3.18",
  hasUpdate: false,
  checkedAt: new Date().toISOString(),
  source: {
    label: "本地更新清单",
    type: "local",
    url: null,
  },
  notes: [
    "当前版本已包含消费分析面板增强、图表布局优化和主题层级收敛。",
    "网站镜像优先，GitHub 可作为备用更新源。",
  ],
  web: {
    currentVersion: "2.3.18",
    latestVersion: "2.3.18",
    hasUpdate: false,
    action: "refresh",
    description: "网页版更新到 2.3.18 后，刷新页面即可获取新资源。",
    downloads: [],
  },
  app: {
    currentVersion: "2.3.18",
    latestVersion: "2.3.18",
    hasUpdate: false,
    action: "reinstall",
    description: "移动端 App 更新到 2.3.18 后需要重新下载安装。",
    downloads: [],
  },
};

const aboutStory = [
  {
    title: "项目初心",
    description: "把资产、预算、储蓄、贷款和更新入口放进一个长期可维护的个人财务工作台，减少工具切换成本。",
  },
  {
    title: "为什么开源",
    description: "希望你可以自己部署、继续扩展、按自己的记账方式改造，而不是被固定产品流程绑定。",
  },
  {
    title: "当前方向",
    description: "继续围绕统一主题系统、多端体验、更新分发和 AI 记账收口，让整套系统更稳定也更好用。",
  },
];

const openSourceWebsite = {
  label: "我们的开源网站",
  description: "欢迎访问：openstars.org",
  url: "https://openstars.org",
};

const contributors = [
  {
    name: "xingseven",
    initials: "x7",
    profileUrl: "https://github.com/xingseven",
    avatarUrl: "https://github.com/xingseven.png?size=96",
  },
];

function VersionTypeBadge({ type }: { type: string }) {
  const styleMap: Record<string, string> = {
    major: "border-slate-200 bg-slate-100 text-slate-700",
    feature: "border-blue-200 bg-blue-50 text-blue-700",
    bugfix: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  const labelMap: Record<string, string> = {
    major: "重大更新",
    feature: "功能更新",
    bugfix: "修复更新",
  };

  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", styleMap[type] ?? styleMap.feature)}>
      {labelMap[type] ?? type}
    </span>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AboutPage() {
  const DEFAULT_VISIBLE_VERSION_COUNT = 3;
  const [expandedVersions, setExpandedVersions] = useState<string[]>([fallbackVersionHistory[0].version]);
  const [versionHistory, setVersionHistory] = useState<VersionItem[]>(fallbackVersionHistory);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(fallbackUpdateInfo);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isRefreshingWeb, setIsRefreshingWeb] = useState(false);

  async function loadVersionHistory() {
    try {
      const data = await apiFetch<{ versions: VersionItem[] }>("/api/changelog");
      if (data.versions?.length) {
        setVersionHistory(data.versions);
        setExpandedVersions([data.versions[0].version]);
      }
    } catch {
      setVersionHistory(fallbackVersionHistory);
    }
  }

  async function loadUpdateInfo() {
    setIsCheckingUpdates(true);
    try {
      const data = await apiFetch<UpdateInfo>("/api/update/check");
      setUpdateInfo(data);
    } catch {
      setUpdateInfo(fallbackUpdateInfo);
    } finally {
      setIsCheckingUpdates(false);
    }
  }

  useEffect(() => {
    async function loadPage() {
      try {
        await Promise.all([loadVersionHistory(), loadUpdateInfo()]);
      } finally {
        setPageLoading(false);
      }
    }

    void loadPage();
  }, []);

  const currentVersion = useMemo(
    () => versionHistory[0]?.version ?? updateInfo.currentVersion ?? fallbackUpdateInfo.currentVersion,
    [updateInfo.currentVersion, versionHistory]
  );

  async function handleRefreshWeb() {
    setIsRefreshingWeb(true);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.update()));
      }
    } finally {
      window.location.reload();
    }
  }

  const visibleVersions = showAllVersions ? versionHistory : versionHistory.slice(0, DEFAULT_VISIBLE_VERSION_COUNT);

  if (pageLoading) {
    return (
      <LoadingPageShell className="py-4 sm:py-6 lg:py-8">
        <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-4 sm:rounded-[26px] sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-8 w-36 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-60 rounded-[14px]" />
                <Skeleton className="h-4 w-full max-w-xl rounded-full" />
                <Skeleton className="h-4 w-full max-w-lg rounded-full opacity-60" />
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-24 rounded-full" />
                ))}
              </div>
            </div>

            <div className="rounded-[22px] bg-white/40 p-5 sm:p-6">
              <Skeleton className="h-4 w-24 rounded-full opacity-60" />
              <div className="mt-4 grid grid-cols-5 gap-x-2 gap-y-4 sm:grid-cols-[repeat(6,64px)] sm:gap-x-3 lg:grid-cols-[repeat(8,64px)]">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex w-16 flex-col items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="mt-2 h-3 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
            <Skeleton className="h-7 w-44 rounded-[12px]" />
            <Skeleton className="h-3 w-64 rounded-full opacity-60" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[22px] p-4" style={{ background: "var(--theme-dialog-section-bg)" }}>
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="mt-3 h-3 w-full rounded-full" />
                <Skeleton className="mt-2 h-3 w-[88%] rounded-full opacity-60" />
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] p-5" style={{ background: "var(--theme-dialog-section-bg)" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-full opacity-60" />
                <Skeleton className="h-7 w-64 rounded-[12px]" />
                <Skeleton className="h-3 w-full max-w-2xl rounded-full opacity-60" />
                <Skeleton className="h-3 w-full max-w-xl rounded-full opacity-60" />
              </div>
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-28 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
                <Skeleton className="h-7 w-40 rounded-[12px]" />
                <Skeleton className="h-3 w-56 rounded-full opacity-60" />
              </div>
              <div className="mt-5 rounded-[22px] p-4" style={{ background: "var(--theme-dialog-section-bg)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-3 w-48 rounded-full opacity-60" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </LoadingPageShell>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:py-6 lg:py-8">
      <ThemeHero className="bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Open Source Workspace
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">关于 Star Accounting</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                现在关于页面已经接入统一更新检查、网站镜像优先下载和网页版刷新更新能力。用户不需要直接跳转 GitHub，就能检查和获取新版本。
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {["更新检查", "网站镜像优先", "App 安装包下载", "网页版刷新更新"].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-slate-600 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/40 p-5 sm:p-6">
            <div>
              <p className="text-sm font-medium text-slate-500">项目贡献者</p>
            </div>

            <div className="mt-4 grid grid-cols-5 justify-start gap-x-2 gap-y-4 sm:grid-cols-[repeat(6,64px)] sm:gap-x-3 lg:grid-cols-[repeat(8,64px)]">
              {contributors.map((contributor) => (
                <a
                  key={contributor.name}
                  href={contributor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-16 flex-col items-center justify-start rounded-xl py-1 text-center transition hover:bg-slate-50"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-semibold text-white"
                    style={
                      contributor.avatarUrl
                        ? {
                            backgroundImage: `url(${contributor.avatarUrl})`,
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "cover",
                          }
                        : undefined
                    }
                  >
                    {!contributor.avatarUrl ? contributor.initials : null}
                  </div>
                  <span className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-slate-900">{contributor.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </ThemeHero>
      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="关于我们"
          title="项目初心与演进节奏"
          description="Star Accounting 不是一次性的展示页，而是一套持续迭代的个人财务工作台。"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {aboutStory.map((item) => (
            <div key={item.title} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">我们的定位</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">把财务管理做成一个长期可维护的工作台</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Star Accounting 关注的不是单次展示，而是把资产、预算、储蓄、贷款、更新与 AI
                工具整合进一个可以持续演进的个人财务系统，让你能自己部署、自己扩展，也能长期积累自己的数据与流程。
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              Open Source
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["个人财务工作台", "开源可部署", "持续迭代", "网站与 App 更新统一入口"].map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-950">开源网站</p>
          </div>
          <a
            href={openSourceWebsite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950">{openSourceWebsite.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{openSourceWebsite.description}</p>
                </div>
              </div>

              <div className="mt-0.5 flex items-center gap-1 text-sm font-medium text-blue-600">
                访问
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </div>
          </a>
        </div>
      </ThemeSurface>

      <div className="grid gap-4 lg:grid-cols-2">
        <ThemeSurface className="p-4 sm:p-6">
          <ThemeSectionHeader
            eyebrow="版本状态"
            title={`最新检测：v${updateInfo.latestVersion}`}
            description={`上次检查时间：${formatDateTime(updateInfo.checkedAt)}`}
            action={
              <Button variant="outline" className="rounded-2xl" onClick={() => void loadUpdateInfo()} disabled={isCheckingUpdates}>
                <RefreshCw className={cn("h-4 w-4", isCheckingUpdates && "animate-spin")} />
                检查更新
              </Button>
            }
          />

          <div className={cn(
            "mt-5 rounded-[22px] border px-4 py-4 text-xs sm:text-sm",
            updateInfo.hasUpdate ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          )}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              {updateInfo.hasUpdate ? `检测到新版本 v${updateInfo.latestVersion}` : "当前已经是最新版本"}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">本次更新重点</h3>
            <ul className="space-y-2">
              {(updateInfo.notes.length > 0 ? updateInfo.notes : ["当前更新清单暂无额外说明。"]).map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-xs leading-5 text-slate-600 sm:text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </ThemeSurface>

        <ThemeSurface className="p-4 sm:p-6">
          <ThemeSectionHeader
            eyebrow="更新动作"
            title="在当前页面内完成更新"
            description="网页端刷新获取新资源，移动端直接下载安装包。"
          />

          <div className="mt-5 grid gap-4">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-950 sm:text-sm">网页版</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{updateInfo.web.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    当前 v{updateInfo.web.currentVersion} · 最新 v{updateInfo.web.latestVersion}
                  </p>
                </div>
                <Globe className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="rounded-2xl" onClick={() => void handleRefreshWeb()} disabled={isRefreshingWeb}>
                  <RefreshCw className={cn("h-4 w-4", isRefreshingWeb && "animate-spin")} />
                  刷新并更新
                </Button>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-950 sm:text-sm">移动端 App</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{updateInfo.app.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    当前 v{updateInfo.app.currentVersion} · 最新 v{updateInfo.app.latestVersion}
                  </p>
                </div>
                <Smartphone className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {updateInfo.app.downloads.length > 0 ? (
                  updateInfo.app.downloads.map((item) => (
                    <a
                      key={item.id}
                      href={item.proxyUrl}
                      className={THEME_LIST_ITEM_CLASS}
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">{item.label}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.fileName}
                          {item.size ? ` · ${item.size}` : ""}
                        </div>
                        {item.description ? <div className="mt-1 text-xs text-slate-400">{item.description}</div> : null}
                      </div>
                      <Download className="h-4 w-4 text-slate-500" />
                    </a>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-xs leading-5 text-slate-500 sm:text-sm">
                    当前还没有上传新的安装包。把安装包放到网站镜像或 GitHub Release 后，这里会自动显示下载入口。
                  </div>
                )}
              </div>
            </div>
          </div>
        </ThemeSurface>
      </div>

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="更新记录"
          title="近期更新与历史版本"
          description={`默认展示最近 ${DEFAULT_VISIBLE_VERSION_COUNT} 个版本，可按需展开全部历史记录。`}
          action={
            showAllVersions ? (
              <div className="flex gap-2">
                <button onClick={() => setExpandedVersions(versionHistory.map((item) => item.version))} className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100">
                  展开全部
                </button>
                <button onClick={() => setExpandedVersions([])} className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100">
                  收起全部
                </button>
              </div>
            ) : null
          }
        />

        <div className="mt-5 space-y-3">
          {visibleVersions.map((item) => (
            <div key={item.version} className={cn("overflow-hidden rounded-xl border transition-all", item.version === currentVersion ? "border-blue-200 bg-blue-50/50" : "border-slate-200")}>
              <button
                onClick={() =>
                  setExpandedVersions((prev) =>
                    prev.includes(item.version) ? prev.filter((version) => version !== item.version) : [...prev, item.version]
                  )
                }
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <VersionTypeBadge type={item.type} />
                  <span className="text-xs font-semibold text-slate-900 sm:text-sm">v{item.version}</span>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                {expandedVersions.includes(item.version) ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {expandedVersions.includes(item.version) ? (
                <div className="border-t border-slate-200 px-4 pb-4 pt-3">
                  <ul className="space-y-2">
                    {item.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs leading-5 text-slate-600 sm:text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}

          {!showAllVersions && versionHistory.length > DEFAULT_VISIBLE_VERSION_COUNT ? (
            <button
              onClick={() => setShowAllVersions(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 py-3 text-xs font-medium text-blue-600 transition hover:bg-blue-50 sm:text-sm"
            >
              查看全部历史版本 ({versionHistory.length})
              <ChevronDown className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </ThemeSurface>

    </div>
  );
}
