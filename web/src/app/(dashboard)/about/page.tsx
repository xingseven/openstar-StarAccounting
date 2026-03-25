"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudDownload,
  Download,
  ExternalLink,
  Github,
  Globe,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeletons";
import { THEME_LIST_ITEM_CLASS, ThemeHero, ThemeMetricCard, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";
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
  currentVersion: "2.3.15",
  latestVersion: "2.3.15",
  hasUpdate: false,
  checkedAt: new Date().toISOString(),
  source: {
    label: "本地更新清单",
    type: "local",
    url: null,
  },
  notes: [
    "当前版本已支持手动收支录入与贷款历史还款回溯。",
    "网站镜像优先，GitHub 可作为备用更新源。",
  ],
  web: {
    currentVersion: "2.3.15",
    latestVersion: "2.3.15",
    hasUpdate: false,
    action: "refresh",
    description: "网页版更新到 2.3.15 后，刷新页面即可获取新资源。",
    downloads: [],
  },
  app: {
    currentVersion: "2.3.15",
    latestVersion: "2.3.15",
    hasUpdate: false,
    action: "reinstall",
    description: "移动端 App 更新到 2.3.15 后需要重新下载安装。",
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

const websites = [
  {
    name: "GitHub 仓库",
    url: "https://github.com/xingseven/openstar-StarAccounting",
    icon: Github,
    description: "查看源码、提交 Issue 或参与开发。",
  },
  {
    name: "问题反馈",
    url: "https://github.com/xingseven/openstar-StarAccounting/issues",
    icon: ShieldCheck,
    description: "集中提交 Bug、功能建议与体验反馈。",
  },
  {
    name: "版本发布",
    url: "https://github.com/xingseven/openstar-StarAccounting/releases",
    icon: Download,
    description: "查看 Release 记录和已发布安装包。",
  },
  {
    name: "项目说明",
    url: "https://github.com/xingseven/openstar-StarAccounting#readme",
    icon: Sparkles,
    description: "快速了解项目定位、功能与部署方式。",
  },
  {
    name: "版本发布说明",
    url: "/updates/README.txt",
    icon: UploadCloud,
    description: "查看如何把安装包放到网站镜像和 GitHub 备用源。",
  },
  {
    name: "更新清单",
    url: "/updates/latest.json",
    icon: Globe,
    description: "网站本地更新清单，部署后可直接被关于页面读取。",
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
  const [expandedVersions, setExpandedVersions] = useState<string[]>([fallbackVersionHistory[0].version]);
  const [versionHistory, setVersionHistory] = useState<VersionItem[]>(fallbackVersionHistory);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(fallbackUpdateInfo);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
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
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    void Promise.all([loadVersionHistory(), loadUpdateInfo()]);
  }, []);

  const currentVersion = useMemo(
    () => versionHistory[0]?.version ?? updateInfo.currentVersion ?? fallbackUpdateInfo.currentVersion,
    [updateInfo.currentVersion, versionHistory]
  );
  const recentMilestones = useMemo(() => versionHistory.slice(0, 3), [versionHistory]);

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

  const visibleVersions = showAllVersions ? versionHistory : versionHistory.slice(0, 1);

  if (showInitialSkeleton) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:py-6 lg:py-8">
        <Skeleton className="h-[220px] rounded-[28px]" />
        <div className="grid gap-3 md:grid-cols-4">
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[340px] rounded-[24px]" />
          <Skeleton className="h-[340px] rounded-[24px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 py-4 sm:space-y-5 sm:py-6 lg:py-8">
      <ThemeHero className="bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Open Source Workspace
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">关于 OpenStar Accounting</h1>
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ThemeMetricCard label="当前版本" value={`v${currentVersion}`} tone="blue" icon={Sparkles} detail="来自 CHANGELOG 最新版本记录" />
            <ThemeMetricCard
              label="更新源"
              value={updateInfo.source.label}
              tone={updateInfo.source.type === "remote" ? "amber" : "green"}
              icon={CloudDownload}
              detail={updateInfo.source.url ?? "当前使用本地网站更新清单"}
            />
          </div>
        </div>
      </ThemeHero>

      <div className="grid gap-3 md:grid-cols-4">
        <ThemeMetricCard label="资产 / 预算" value="已接入" detail="核心账务模块" tone="blue" icon={Globe} className="p-4" hideDetailOnMobile />
        <ThemeMetricCard label="版本检查" value={updateInfo.hasUpdate ? "有更新" : "最新"} detail="统一更新入口" tone={updateInfo.hasUpdate ? "amber" : "green"} icon={RefreshCw} className="p-4" hideDetailOnMobile />
        <ThemeMetricCard label="网页版更新" value={updateInfo.web.action === "refresh" ? "刷新更新" : "下载安装"} detail="适配网页端发布" tone="slate" icon={Globe} className="p-4" hideDetailOnMobile />
        <ThemeMetricCard label="App 更新" value={updateInfo.app.action === "reinstall" ? "重新安装" : "下载安装"} detail="适配移动端发布" tone="violet" icon={Smartphone} className="p-4" hideDetailOnMobile />
      </div>

      <ThemeSurface className="p-4 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <ThemeSectionHeader
              eyebrow="关于我们"
              title="项目初心与演进节奏"
              description="OpenStar Accounting 不是一次性的展示页，而是一套持续迭代的个人财务工作台。"
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
                    OpenStar Accounting 关注的不是单次展示，而是把资产、预算、储蓄、贷款、更新与 AI
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
                <p className="text-sm font-semibold text-slate-950">其他网站连接</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {websites.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target={site.url.startsWith("http") ? "_blank" : undefined}
                    rel={site.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <site.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-950">{site.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{site.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600">
                      查看
                      {site.url.startsWith("http") ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">版本脉络</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">最近迭代节点</h3>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">当前 v{currentVersion}</span>
            </div>

            <div className="mt-5 space-y-4">
              {recentMilestones.map((item, index) => (
                <div key={item.version} className="relative pl-5">
                  {index < recentMilestones.length - 1 ? <div className="absolute left-[7px] top-6 h-[calc(100%+12px)] w-px bg-slate-200" /> : null}
                  <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-950">v{item.version}</span>
                      <VersionTypeBadge type={item.type} />
                      <span className="text-xs text-slate-400">{item.date}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.highlights[0] ?? "当前版本暂无额外说明。"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          eyebrow="版本更新记录"
          title="项目演进历史"
          description="查看近期版本迭代的核心变化。"
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

          {!showAllVersions && versionHistory.length > 1 ? (
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
