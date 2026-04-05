import {
  Brain,
  CreditCard,
  Database,
  Info,
  Landmark,
  LayoutDashboard,
  Link as LinkIcon,
  Palette,
  PiggyBank,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  caption: string;
};

export type PageMeta = {
  title: string;
  subtitle: string;
};

export const NAV_ITEMS: NavigationItem[] = [
  { href: "/", label: "总览", icon: LayoutDashboard, caption: "查看全局财务概况" },
  { href: "/assets", label: "资产", icon: Wallet, caption: "账户余额与资产分布" },
  { href: "/consumption", label: "消费", icon: CreditCard, caption: "流水、分类与趋势" },
  { href: "/savings", label: "储蓄", icon: PiggyBank, caption: "目标进度与计划节奏" },
  { href: "/loans", label: "贷款", icon: Landmark, caption: "还款状态与负债管理" },
  { href: "/connections", label: "连接", icon: LinkIcon, caption: "设备绑定与外部接入" },
  { href: "/ai", label: "AI", icon: Brain, caption: "智能分析与辅助记账" },
  { href: "/data", label: "数据", icon: Database, caption: "导入导出与数据维护" },
  { href: "/themes", label: "主题", icon: Palette, caption: "切换界面视觉风格" },
  { href: "/settings", label: "设置", icon: Settings, caption: "账户与系统配置" },
  { href: "/about", label: "关于", icon: Info, caption: "项目说明与版本信息" },
];

export const PAGE_META: Record<string, PageMeta> = {
  "/": { title: "总览", subtitle: "集中查看资产、预算、现金流和风险信号。" },
  "/flutter": { title: "Flutter 预览", subtitle: "通过短地址查看新的 Flutter 页面。" },
  "/flutter/dashboard": { title: "新总览预览", subtitle: "查看 Flutter 版总览页，对照旧版继续迭代。" },
  "/flutter/assets": { title: "新资产预览", subtitle: "查看 Flutter 版资产页，对照旧版继续迭代。" },
  "/flutter/data": { title: "新数据预览", subtitle: "查看 Flutter 版数据页，对照旧版继续迭代。" },
  "/assets": { title: "资产管理", subtitle: "梳理账户余额、资产分布和净值结构。" },
  "/consumption": { title: "消费流水", subtitle: "追踪最近交易、分类结构和消费趋势。" },
  "/savings": { title: "储蓄目标", subtitle: "管理储蓄计划、目标进度和月度节奏。" },
  "/loans": { title: "贷款管理", subtitle: "查看还款压力、进度和负债风险。" },
  "/connections": { title: "设备连接", subtitle: "维护数据同步与外部接入状态。" },
  "/ai": { title: "AI 模型配置", subtitle: "管理视觉与文本模型接入，为 AI 记账和分析提供服务。" },
  "/data": { title: "数据管理", subtitle: "导入、清洗和维护核心财务数据。" },
  "/themes": { title: "主题设置", subtitle: "统一界面主题与视觉风格偏好。" },
  "/settings": { title: "系统设置", subtitle: "管理账户、通知和基础配置。" },
  "/about": { title: "关于项目", subtitle: "查看产品说明、版本信息和能力边界。" },
};

export function getPageMeta(pathname: string): PageMeta {
  return PAGE_META[pathname] ?? {
    title: "财务面板",
    subtitle: "用更清晰的视图组织你的资金状态。",
  };
}
