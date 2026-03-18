"use client";

import { useState, useEffect } from "react";
import {
  History,
  Download,
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

const DEFAULT_VERSION = "2.0.3";

type VersionItem = {
  version: string;
  date: string;
  type: string;
  highlights: string[];
};

const fallbackVersionHistory: VersionItem[] = [
  {
    version: "2.0.3",
    date: "2026-03-18",
    type: "bugfix",
    highlights: [
      "终极修复储蓄页面布局抖动与滚动条闪现问题",
      "为 DefaultSavings.tsx 根容器重新添加 min-h-[101vh]",
      "强制页面始终保留垂直滚动条轨道，确保布局稳定",
    ],
  },
  {
    version: "1.8.24",
    date: "2026-03-14",
    type: "feature",
    highlights: [
      "桑基图升级为 ECharts，支持 4 级分支数据流展示",
      "消费页布局优化，移动端桑基图支持横向滚动",
      "修复 hydration 警告问题",
      "储蓄弹窗交互修复",
      "页面切换性能优化",
    ],
  },
  {
    version: "1.8.23",
    date: "2026-03-14",
    type: "feature",
    highlights: [
      "消费页移动端图表优化",
      "图表横向滚动支持",
      "图表布局优化",
      "每日平均消费图表增强",
    ],
  },
  {
    version: "1.8.22",
    date: "2026-03-14",
    type: "feature",
    highlights: [
      "消费页移动端优化",
      "图表横向滚动支持",
      "每日平均消费图表增强",
    ],
  },
  {
    version: "1.8.21",
    date: "2026-03-14",
    type: "bugfix",
    highlights: [
      "数据库 transaction 表结构修复",
      "修复 createdAt 和 updatedAt 字段缺少默认值问题",
    ],
  },
  {
    version: "1.8.20",
    date: "2026-03-14",
    type: "feature",
    highlights: [
      "后端交易创建接口",
      "新增 POST /api/transactions 接口",
      "修复取款和打卡记录不显示问题",
    ],
  },
  {
    version: "1.8.0",
    date: "2026-03-13",
    type: "major",
    highlights: [
      "前端架构重构：迁移至 Feature-based 架构",
      "组件库升级：集成 shadcn/ui 与 recharts",
      "图表增强：新增多种可视化图表",
      "主题支持：实现基于组件的主题切换架构",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-03-13",
    type: "major",
    highlights: [
      "后端新增贷款（Loan）模块",
      "前端新增贷款管理页",
      "支持展示还款进度条、每月还款信息与增删改操作",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-03-13",
    type: "major",
    highlights: [
      "初始化前端 Next.js 工程",
      "初始化后端 Express 工程",
      "建立 Dashboard 路由组与基础布局",
    ],
  },
];

const contributors = [
  {
    name: "OpenStar Team",
    role: "核心开发",
    contributions: ["架构设计", "核心功能开发", "性能优化"],
    gradient: "from-blue-500 to-blue-700",
  },
  {
    name: "Community",
    role: "社区贡献者",
    contributions: ["Bug 修复", "功能建议", "文档完善"],
    gradient: "from-slate-500 to-gray-500",
  },
];

const websites = [
  {
    name: "GitHub 仓库",
    url: "https://github.com/openstar-project/xfdashboard",
    icon: Github,
    description: "查看源码、提交 Issue 或参与开发",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    name: "问题反馈",
    url: "https://github.com/openstar-project/xfdashboard/issues",
    icon: Zap,
    description: "报告 Bug 或提出功能建议",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "功能建议",
    url: "https://github.com/openstar-project/xfdashboard/discussions",
    icon: Sparkles,
    description: "参与讨论，分享你的想法",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const features = [
  { icon: TrendingUp, label: "资产管理", color: "text-blue-500" },
  { icon: Sparkles, label: "消费分析", color: "text-slate-500" },
  { icon: Shield, label: "储蓄目标", color: "text-emerald-500" },
  { icon: Zap, label: "贷款追踪", color: "text-amber-500" },
];

function VersionTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    major: { label: "重大更新", className: "bg-slate-100 text-slate-700 border border-slate-200" },
    feature: { label: "新功能", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    bugfix: { label: "Bug 修复", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  };
  const { label, className } = config[type] || config.feature;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

export default function AboutPage() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>([DEFAULT_VERSION]);
  const [currentVersion, setCurrentVersion] = useState(DEFAULT_VERSION);
  const [githubContributors, setGithubContributors] = useState<Contributor[]>([]);
  const [versionHistory, setVersionHistory] = useState<VersionItem[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/changelog`)
      .then((res) => res.json())
      .then((data) => {
        // 兼容后端返回 code: 200 或 code: 0 的情况
        if ((data.code === 200 || data.code === 0) && data.data?.versions) {
          setVersionHistory(data.data.versions);
          if (data.data.versions.length > 0) {
            const latestVersion = data.data.versions[0].version;
            setCurrentVersion(latestVersion);
            setExpandedVersions([latestVersion]);
          }
        } else {
          setVersionHistory(fallbackVersionHistory);
        }
      })
      .catch(() => {
        setVersionHistory(fallbackVersionHistory);
      })
      .finally(() => {
        setLoadingVersions(false);
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
      .catch((err) => console.error("Failed to fetch contributors:", err));
  }, []);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version]
    );
  };

  const expandAllVersions = () => {
    setExpandedVersions(versionHistory.map((v) => v.version));
  };

  const collapseAllVersions = () => {
    setExpandedVersions([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-slate-800 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwIDItMiAyLTRzLTItMi0yLTJoLThjMCAwIDIgMiAyIDRzLTIgMi0yIDJjMCAwIDIgMiAyIDRzLTIgMi0yIDJoOGMwIDAtMi0yLTItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-xl border border-white/30">
              X
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">XFDashboard</h1>
              <p className="text-blue-100 mt-1">OpenStar 开源个人财务管理面板</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/30">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              v{currentVersion}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 px-3 py-1.5 rounded-full text-sm">
              Next.js + Express + Prisma
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 p-4 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">{feature.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">当前版本</h2>
              <p className="text-sm text-gray-500">v{currentVersion} · {versionHistory[0]?.date || '2026-03-17'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700 font-medium">已是最新版本</span>
          </div>
          <a
            href="https://github.com/openstar-project/xfdashboard/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors group"
          >
            <Github className="h-4 w-4" />
            查看所有版本
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">贡献者</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Contributors
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {githubContributors.map((contributor) => (
                <a
                  key={contributor.login}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 group"
                  title={`${contributor.login} (${contributor.contributions} contributions)`}
                >
                  <div className="relative">
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      className="h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-100 text-blue-700 text-[10px] px-1 rounded-full font-medium border border-white">
                      {contributor.contributions}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 truncate max-w-full group-hover:text-blue-600 transition-colors">
                    {contributor.login}
                  </span>
                </a>
              ))}
              {githubContributors.length === 0 && (
                <div className="col-span-full text-center py-4 text-sm text-gray-400">
                  Loading contributors...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Core Team</h3>
            {contributors.map((contributor, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${contributor.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                  {contributor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{contributor.name}</p>
                  <p className="text-xs text-gray-500">{contributor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">版本更新记录</h2>
              <p className="text-sm text-gray-500">查看项目的版本迭代历史</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAllVersions}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              展开全部
            </button>
            <button
              onClick={collapseAllVersions}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              收起全部
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {versionHistory.map((item, index) => (
            <div
              key={item.version}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                item.version === currentVersion 
                  ? "border-blue-200 bg-blue-50/50" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <button
                onClick={() => toggleVersion(item.version)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <VersionTypeBadge type={item.type} />
                  <span className="font-semibold text-gray-900">v{item.version}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                  {item.version === currentVersion && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      当前
                    </span>
                  )}
                </div>
                {expandedVersions.includes(item.version) ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedVersions.includes(item.version) && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                  <ul className="space-y-2 mt-3">
                    {item.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-gray-600"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">相关链接</h2>
            <p className="text-sm text-gray-500">访问以下网站获取更多信息</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {websites.map((site, idx) => (
            <a
              key={idx}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${site.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <site.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{site.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{site.description}</p>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                访问 <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-sm text-gray-400">OpenStar XFDashboard v{currentVersion}</p>
        <p className="text-xs text-gray-300 mt-1">Made with ❤️ by OpenStar Team</p>
      </div>
    </div>
  );
}
