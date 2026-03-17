"use client";

import { useState } from "react";
import {
  Info,
  History,
  Download,
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
  Star,
  GitFork,
  Bug,
  Lightbulb,
  Code,
  Heart,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

const CURRENT_VERSION = "1.8.25";

const versionHistory = [
  {
    version: "1.8.25",
    date: "2026-03-17",
    type: "feature",
    highlights: [
      "新增关于页面",
      "项目介绍模块：展示项目名称、版本、技术栈和主要功能",
      "版本更新记录模块：可展开/收起的版本历史列表",
      "更新版本模块：显示当前版本信息，提供下载链接",
      "贡献者模块：展示核心开发团队和社区贡献者",
      "网站模块：提供 GitHub 仓库、问题反馈等链接",
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
    avatar: null,
    contributions: ["架构设计", "核心功能开发", "性能优化"],
  },
  {
    name: "Community",
    role: "社区贡献者",
    avatar: null,
    contributions: ["Bug 修复", "功能建议", "文档完善"],
  },
];

const websites = [
  {
    name: "GitHub 仓库",
    url: "https://github.com/openstar-project/xfdashboard",
    icon: Github,
    description: "查看源码、提交 Issue 或参与开发",
  },
  {
    name: "问题反馈",
    url: "https://github.com/openstar-project/xfdashboard/issues",
    icon: Bug,
    description: "报告 Bug 或提出功能建议",
  },
  {
    name: "功能建议",
    url: "https://github.com/openstar-project/xfdashboard/discussions",
    icon: Lightbulb,
    description: "参与讨论，分享你的想法",
  },
];

function VersionTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    major: { label: "重大更新", className: "bg-purple-100 text-purple-700" },
    feature: { label: "新功能", className: "bg-blue-100 text-blue-700" },
    bugfix: { label: "Bug 修复", className: "bg-green-100 text-green-700" },
  };
  const { label, className } = config[type] || config.feature;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AboutPage() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);

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
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">关于</h1>
        <p className="text-sm text-gray-600 mt-1">了解 XFDashboard 项目</p>
      </div>

      <SectionCard title="项目介绍" icon={Info}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              X
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">XFDashboard</h3>
              <p className="text-sm text-gray-500">OpenStar 开源个人财务管理面板</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">v{CURRENT_VERSION}</span>
                <span className="text-xs text-gray-400">Next.js + Express + Prisma</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed space-y-2">
            <p>
              XFDashboard 是一个开源的个人财务管理面板，旨在帮助用户更好地管理和追踪个人财务状况。
              项目采用现代化的技术栈，提供直观的可视化图表和丰富的功能模块。
            </p>
            <p>
              主要功能包括：资产管理、消费分析、储蓄目标、贷款追踪、预算管理等。
              支持导入微信/支付宝账单，自动分类统计消费数据，生成多维度分析报告。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              <Star className="h-3 w-3" /> 开源免费
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              <Code className="h-3 w-3" /> TypeScript
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              <GitFork className="h-3 w-3" /> 社区驱动
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="版本更新记录" icon={History}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">查看项目的版本迭代历史</p>
            <div className="flex gap-2">
              <button
                onClick={expandAllVersions}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                展开全部
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={collapseAllVersions}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                收起全部
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {versionHistory.map((item) => (
              <div
                key={item.version}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleVersion(item.version)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <VersionTypeBadge type={item.type} />
                    <span className="font-medium text-gray-900">
                      v{item.version}
                    </span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                    {item.version === CURRENT_VERSION && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        当前版本
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
                  <div className="px-4 pb-4 pt-0 border-t bg-gray-50/50">
                    <ul className="space-y-2 mt-3">
                      {item.highlights.map((highlight, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
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
      </SectionCard>

      <SectionCard title="更新版本" icon={Download}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">当前版本</p>
                <p className="text-sm text-gray-500">v{CURRENT_VERSION}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">发布日期</p>
              <p className="text-sm text-gray-600">2026-03-17</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="https://github.com/openstar-project/xfdashboard/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <Github className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">GitHub Releases</p>
                <p className="text-xs text-gray-500">下载最新发布版本</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <Clock className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">检查更新</p>
                <p className="text-xs text-gray-500">已是最新版本</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">
              建议定期更新以获取最新功能和安全修复。更新前请备份重要数据。
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="贡献者" icon={Users}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            感谢所有为项目做出贡献的开发者
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contributors.map((contributor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {contributor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{contributor.name}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {contributor.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contributor.contributions.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
            <Heart className="h-4 w-4 text-pink-500" />
            <p className="text-sm text-gray-600">
              感谢所有贡献者的付出，让项目变得更好
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="网站" icon={Globe}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            访问以下网站获取更多信息或参与项目
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {websites.map((site, idx) => (
              <a
                key={idx}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-200 transition-all group"
              >
                <div className="h-12 w-12 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mb-3 transition-colors">
                  <site.icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="font-medium text-gray-900 text-sm">{site.name}</p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {site.description}
                </p>
                <ExternalLink className="h-3 w-3 text-gray-400 mt-2" />
              </a>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="text-center text-xs text-gray-400 py-4">
        <p>OpenStar XFDashboard v{CURRENT_VERSION}</p>
        <p className="mt-1">Made with ❤️ by OpenStar Team</p>
      </div>
    </div>
  );
}
