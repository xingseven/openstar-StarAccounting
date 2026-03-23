"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
  HeartHandshake,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeletons";
import { ThemeHero, ThemeMetricCard, ThemeSectionHeader, ThemeSurface } from "@/components/shared/theme-primitives";

type VersionItem = {
  version: string;
  date: string;
  type: string;
  highlights: string[];
};

type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

const fallbackVersionHistory: VersionItem[] = [
  {
    version: "2.3.4",
    date: "2026-03-23",
    type: "feature",
    highlights: [
      "统一项目名称与展示文案。",
      "关于页面接入动态版本记录。",
      "继续完善导入、消费分析与系统配置能力。",
    ],
  },
  {
    version: "2.3.3",
    date: "2026-03-22",
    type: "bugfix",
    highlights: [
      "修复账单导入重复数据统计不准确的问题。",
      "优化导入结果提示，避免出现 0/0/0 的误导信息。",
    ],
  },
  {
    version: "2.3.2",
    date: "2026-03-21",
    type: "feature",
    highlights: [
      "优化微信 / 支付宝账单导入识别逻辑。",
      "统一导入分类和状态映射。",
    ],
  },
];

const DEFAULT_VERSION = fallbackVersionHistory[0]?.version ?? "2.3.4";

const features = [
  { icon: TrendingUp, label: "资产管理" },
  { icon: Sparkles, label: "消费分析" },
  { icon: Shield, label: "储蓄目标" },
  { icon: Zap, label: "贷款追踪" },
];

const websites = [
  {
    name: "GitHub 仓库",
    url: "https://github.com/openstar-project/StarAccounting",
    icon: Github,
    description: "查看源码、提交 Issue 或参与开发。",
  },
  {
    name: "问题反馈",
    url: "https://github.com/openstar-project/StarAccounting/issues",
    icon: Zap,
    description: "报告 Bug 或提出功能建议。",
  },
  {
    name: "功能讨论",
    url: "https://github.com/openstar-project/StarAccounting/discussions",
    icon: Sparkles,
    description: "参与产品和技术讨论，分享想法。",
  },
];

const acknowledgements = [
  {
    title: "开源生态",
    description: "感谢 Next.js、Prisma、Tailwind CSS、Lucide 等开源项目提供的底层能力。",
    note: "后续可继续补充具体依赖、工具链或特别感谢的项目。",
    icon: HeartHandshake,
  },
  {
    title: "社区反馈",
    description: "感谢提交 Issue、参与讨论、帮助测试和提供建议的用户与贡献者。",
    note: "后续可补充具体成员、测试同学、合作伙伴或支持者名单。",
    icon: Users,
  },
  {
    title: "参考与启发",
    description: "感谢设计灵感、产品参考、技术实践文章和示例项目带来的启发。",
    note: "后续可添加博客、仓库、老师朋友或任何值得致谢的来源。",
    icon: Sparkles,
  },
];

function VersionTypeBadge({ type }: { type: string }) {
  const config: Record<string, string> = {
    major: "bg-slate-100 text-slate-700 border border-slate-200",
    feature: "bg-blue-100 text-blue-700 border border-blue-200",
    bugfix: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };

  const labelMap: Record<string, string> = {
    major: "重大更新",
    feature: "新功能",
    bugfix: "Bug 修复",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${config[type] || config.feature}`}>
      {labelMap[type] || type}
    </span>
  );
}

export default function AboutPage() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>([DEFAULT_VERSION]);
  const [currentVersion, setCurrentVersion] = useState(DEFAULT_VERSION);
  const [githubContributors, setGithubContributors] = useState<Contributor[]>([]);
  const [versionHistory, setVersionHistory] = useState<VersionItem[]>(fallbackVersionHistory);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    apiFetch<{ versions: VersionItem[] }>("/api/changelog")
      .then((data) => {
        const versions = data.versions ?? [];
        if (versions.length > 0) {
          setVersionHistory(versions);
          setCurrentVersion(versions[0].version);
          setExpandedVersions([versions[0].version]);
        }
      })
      .catch(() => {
        setVersionHistory(fallbackVersionHistory);
        setCurrentVersion(fallbackVersionHistory[0]?.version ?? DEFAULT_VERSION);
        setExpandedVersions([fallbackVersionHistory[0]?.version ?? DEFAULT_VERSION]);
      });
  }, []);

  useEffect(() => {
    fetch("https://api.github.com/repos/xingseven/openstar-xfdashborad/contributors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGithubContributors(data);
        }
      })
      .catch(() => {});
  }, []);

  const visibleVersions = showAllVersions ? versionHistory : versionHistory.slice(0, 1);

  if (showInitialSkeleton) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
        <Skeleton className="h-[220px] rounded-[28px]" />
        <div className="grid gap-3 md:grid-cols-4">
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
          <Skeleton className="h-[110px] rounded-[20px]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-[24px]" />
          <Skeleton className="h-[320px] rounded-[24px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
      <ThemeHero className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-700">
            OS
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">OpenStar Accounting</h1>
            <p className="mt-1 text-sm text-slate-500">
              一个用于管理资产、消费、储蓄和贷款的个人财务工作台。
            </p>
          </div>
        </div>
      </ThemeHero>

      <div className="grid gap-3 md:grid-cols-4">
        {features.map((feature) => (
          <ThemeMetricCard
            key={feature.label}
            label={feature.label}
            value="已接入"
            detail="核心模块"
            tone="blue"
            icon={feature.icon}
            className="p-4"
            hideDetailOnMobile
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ThemeSurface className="p-4 sm:p-6">
          <ThemeSectionHeader
            eyebrow="当前版本"
            title={`v${currentVersion}`}
            description={versionHistory[0]?.date || "版本信息同步中"}
          />
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium text-green-700">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              当前已是最新版本
            </div>
          </div>
          <a
            href="https://github.com/openstar-project/StarAccounting/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Github className="h-4 w-4" />
            查看所有版本
            <ExternalLink className="h-4 w-4" />
          </a>
        </ThemeSurface>

        <ThemeSurface className="p-4 sm:p-6">
          <ThemeSectionHeader
            eyebrow="贡献者"
            title="社区与核心团队"
            description="感谢所有让 OpenStar 持续进化的参与者。"
          />
          <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {githubContributors.length > 0 ? (
              githubContributors.map((contributor) => (
                <a
                  key={contributor.login}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                >
                  <Image
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="max-w-full truncate text-[11px] text-slate-500">{contributor.login}</span>
                </a>
              ))
            ) : (
              <p className="col-span-full text-sm text-slate-400">Loading contributors...</p>
            )}
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
                <button
                  onClick={() => setExpandedVersions(versionHistory.map((item) => item.version))}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
                >
                  展开全部
                </button>
                <button
                  onClick={() => setExpandedVersions([])}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
                >
                  收起全部
                </button>
              </div>
            ) : null
          }
        />

        <div className="mt-5 space-y-3">
          {visibleVersions.map((item) => (
            <div
              key={item.version}
              className={`overflow-hidden rounded-xl border transition-all ${
                item.version === currentVersion ? "border-blue-200 bg-blue-50/50" : "border-slate-200"
              }`}
            >
              <button
                onClick={() =>
                  setExpandedVersions((prev) =>
                    prev.includes(item.version)
                      ? prev.filter((version) => version !== item.version)
                      : [...prev, item.version]
                  )
                }
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <VersionTypeBadge type={item.type} />
                  <span className="text-sm font-semibold text-slate-900">v{item.version}</span>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                {expandedVersions.includes(item.version) ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {expandedVersions.includes(item.version) ? (
                <div className="border-t border-slate-200 px-4 pb-4 pt-3">
                  <ul className="space-y-2">
                    {item.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              查看全部历史版本 ({versionHistory.length})
              <ChevronDown className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </ThemeSurface>

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="相关链接"
          title="更多信息"
          description="访问仓库、反馈问题或参与讨论。"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {websites.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <site.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-950">{site.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{site.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600">
                访问
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>
          ))}
        </div>
      </ThemeSurface>

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="鸣谢"
          title="致谢与感谢"
          description="这里预留给后续补充致谢对象、参考来源、协作者和支持者。"
        />
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {acknowledgements.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <p className="mt-3 text-xs leading-5 text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </ThemeSurface>
    </div>
  );
}
