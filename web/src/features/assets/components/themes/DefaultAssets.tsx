"use client";

import Image from "next/image";
import { type CSSProperties, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Coins,
  CreditCard,
  Layers3,
  MoreVertical,
  PiggyBank,
  Plus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { AssetsLoadingShell } from "./AssetsLoadingShell";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types";

export type { Asset };

interface AssetsViewProps {
  items: Asset[];
  totalAssets: number;
  displayCurrency: string;
  onCurrencyChange: (currency: string) => void;
  supportedCurrencies: string[];
  loading?: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: Asset) => void;
  onDelete: (id: string) => void;
}

type Tone = "blue" | "emerald" | "violet" | "red" | "slate";

type DistributionItem = {
  name: string;
  value: number;
  color: string;
  count?: number;
};

const LIQUID_TYPES = new Set(["CASH", "BANK_CARD", "ALIPAY", "WECHAT"]);

const TONE_COLOR: Record<Tone, string> = {
  blue: "#2B6AF2",
  emerald: "#4CC98F",
  violet: "#A56BFA",
  red: "#F97316",
  slate: "#94a3b8",
};

const TONE_BADGE_CLASS: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  violet: "bg-violet-50 text-violet-700",
  red: "bg-orange-50 text-orange-700",
  slate: "bg-slate-100 text-slate-700",
};

const CHART_COLORS = ["#2B6AF2", "#4CC98F", "#A56BFA", "#92C0F2", "#F5A623"];

const tooltipStyle = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

const axisTick = {
  fill: "#64748b",
  fontSize: 10,
  fontWeight: 600,
};

function formatMoney(
  value: number,
  currency: string,
  options: { compact?: boolean; maximumFractionDigits?: number } = {},
) {
  const { compact = false, maximumFractionDigits = 0 } = options;

  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      minimumFractionDigits: 0,
      maximumFractionDigits,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("zh-CN", { maximumFractionDigits })}`;
  }
}

function formatShortValue(value: number) {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) return `${(value / 1000000).toFixed(absValue >= 10000000 ? 0 : 1)}m`;
  if (absValue >= 10000) return `${(value / 10000).toFixed(absValue >= 100000 ? 0 : 1)}w`;
  if (absValue >= 1000) return `${(value / 1000).toFixed(absValue >= 10000 ? 0 : 1)}k`;
  return `${Math.round(value)}`;
}

function resolveAssetLogo(name: string, type: string): string | null {
  const lowerName = name.toLowerCase();
  if (type === "ALIPAY" || lowerName.includes("支付宝") || lowerName.includes("zfb")) return "/logo/ZFB.svg";
  if (type === "WECHAT" || lowerName.includes("微信") || lowerName.includes("wx")) return "/logo/WX.svg";
  if (lowerName.includes("招商") || lowerName.includes("cmb")) return "/logo/CMB.svg";
  if (lowerName.includes("工商") || lowerName.includes("icbc")) return "/logo/ICBC.svg";
  if (lowerName.includes("建设") || lowerName.includes("ccb")) return "/logo/CCB.svg";
  if (lowerName.includes("农业") || lowerName.includes("abc")) return "/logo/ABC.svg";
  if (lowerName.includes("中国银行") || lowerName.includes("boc")) return "/logo/BOC.svg";
  if (lowerName.includes("交通") || lowerName.includes("bcom") || lowerName.includes("bcm")) return "/logo/BCM.svg";
  if (lowerName.includes("浦发") || lowerName.includes("spd")) return "/logo/SPD.svg";
  if (lowerName.includes("兴业") || lowerName.includes("cib")) return "/logo/CIB.svg";
  if (lowerName.includes("民生") || lowerName.includes("cmbc")) return "/logo/CMBC.svg";
  if (lowerName.includes("平安") || lowerName.includes("pab") || lowerName.includes("pingan")) return "/logo/PAB.svg";
  if (lowerName.includes("邮储") || lowerName.includes("psbc")) return "/logo/PSBC.svg";
  if (lowerName.includes("中信") || lowerName.includes("citic")) return "/logo/CITIC.svg";
  if (lowerName.includes("华夏") || lowerName.includes("hxb")) return "/logo/HXB.svg";
  if (lowerName.includes("广发") || lowerName.includes("gdb")) return "/logo/GDB.svg";
  if (type === "BANK_CARD" || type === "CREDIT_CARD") return "/logo/UNION.svg";
  return null;
}

function getTypeMeta(type: string): { label: string; tone: Tone; icon: LucideIcon } {
  switch (type) {
    case "CASH":
      return { label: "现金", tone: "emerald", icon: Coins };
    case "BANK_CARD":
      return { label: "银行卡", tone: "blue", icon: Wallet };
    case "CREDIT_CARD":
      return { label: "信用卡", tone: "red", icon: CreditCard };
    case "ALIPAY":
      return { label: "支付宝", tone: "blue", icon: Wallet };
    case "WECHAT":
      return { label: "微信", tone: "emerald", icon: Wallet };
    case "INVESTMENT":
      return { label: "投资", tone: "violet", icon: PiggyBank };
    default:
      return { label: "其他", tone: "slate", icon: Layers3 };
  }
}

function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sm:rounded-[24px] sm:p-6",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function AssetAvatar({ item, className }: { item: Asset; className?: string }) {
  const logo = resolveAssetLogo(item.name, item.type);
  const meta = getTypeMeta(item.type);
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_8px_18px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      {logo ? (
        <Image src={logo} alt={item.name} width={28} height={28} className="h-7 w-7 object-contain" />
      ) : (
        <Icon className="h-5 w-5 text-slate-500" />
      )}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
      <h3 className="text-[13px] font-bold text-[#1e293b] sm:text-[15px]">{title}</h3>
      {action}
    </div>
  );
}

function ActionDots() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full text-[#94a3b8] sm:h-7 sm:w-7">
      <MoreVertical className="h-4 w-4" />
    </span>
  );
}

function HeaderBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-3 py-1.5 text-[11px] font-semibold text-[#64748b]">
      {children}
    </span>
  );
}

function StatBar({
  label,
  value,
  progress,
  color,
}: {
  label: string;
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold text-[#64748b]">{label}</span>
        <span className="text-[11px] font-bold text-[#0f172a]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(6, Math.min(100, progress))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function HoldingRow({
  item,
  displayCurrency,
  portfolioBase,
}: {
  item: Asset;
  displayCurrency: string;
  portfolioBase: number;
}) {
  const share = portfolioBase > 0 ? (item.estimatedValue / portfolioBase) * 100 : 0;
  const meta = getTypeMeta(item.type);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <AssetAvatar item={item} className="h-8 w-8 rounded-[14px]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[12px] font-semibold text-[#1e293b] sm:text-[13px]">{item.name}</p>
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", TONE_BADGE_CLASS[meta.tone])}>
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-[#475569]">
            {formatMoney(item.estimatedValue, displayCurrency, {
              compact: true,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#0f172a]">{share.toFixed(1)}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(8, Math.min(100, share))}%`,
            backgroundColor: TONE_COLOR[meta.tone],
          }}
        />
      </div>
    </div>
  );
}

function FocusAccountRow({
  item,
  displayCurrency,
  exposureBase,
}: {
  item: Asset;
  displayCurrency: string;
  exposureBase: number;
}) {
  const isLiability = item.estimatedValue < 0;
  const meta = getTypeMeta(item.type);
  const share = exposureBase > 0 ? (Math.abs(item.estimatedValue) / exposureBase) * 100 : 0;

  return (
    <div className="rounded-[18px] border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-start gap-3">
        <AssetAvatar item={item} className="h-9 w-9 rounded-[16px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[13px] font-semibold text-[#1e293b]">{item.name}</p>
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", TONE_BADGE_CLASS[meta.tone])}>
              {meta.label}
            </span>
          </div>
          <p className={cn("mt-1 text-sm font-bold", isLiability ? "text-orange-600" : "text-[#0f172a]")}>
            {formatMoney(item.estimatedValue, displayCurrency, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-[11px] text-[#64748b]">
            占总敞口 {share.toFixed(1)}% · {isLiability ? "优先处理这类账户" : "当前组合中的关键仓位"}
          </p>
        </div>
      </div>
    </div>
  );
}

function AccountListRow({
  item,
  displayCurrency,
  exposureBase,
  onEdit,
}: {
  item: Asset;
  displayCurrency: string;
  exposureBase: number;
  onEdit: () => void;
}) {
  const meta = getTypeMeta(item.type);
  const isLiability = item.estimatedValue < 0 || item.balance < 0;
  const share = exposureBase > 0 ? (Math.abs(item.estimatedValue) / exposureBase) * 100 : 0;
  const balanceText = formatMoney(item.balance, item.currency, {
    maximumFractionDigits: Math.abs(item.balance) < 1000 ? 2 : 0,
  });
  const estimatedText = formatMoney(item.estimatedValue, displayCurrency, {
    maximumFractionDigits: Math.abs(item.estimatedValue) < 1000 ? 2 : 0,
  });

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:px-4 sm:py-4">
      <AssetAvatar item={item} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-[#1e293b] sm:text-sm">{item.name}</p>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", TONE_BADGE_CLASS[meta.tone])}>
            {meta.label}
          </span>
          <span className="text-[10px] font-semibold text-[#94a3b8]">{item.currency}</span>
        </div>
        <p className="mt-1 text-[11px] text-[#64748b] sm:text-xs">
          原始余额 {balanceText} · 组合占比 {share.toFixed(1)}%
        </p>
      </div>

      <div className="text-right">
        <p className={cn("text-[13px] font-bold sm:text-sm", isLiability ? "text-orange-600" : "text-[#0f172a]")}>
          {estimatedText}
        </p>
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            isLiability ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700",
          )}
        >
          {isLiability ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
          {isLiability ? "负债类" : "资产类"}
        </span>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-slate-100"
        aria-label={`编辑${item.name}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AssetsDefaultTheme(props: AssetsViewProps) {
  if (props.loading) {
    return <AssetsLoadingShell />;
  }

  const sortedItems = [...props.items].sort((a, b) => Math.abs(b.estimatedValue) - Math.abs(a.estimatedValue));
  const positiveItems = [...props.items]
    .filter((item) => item.estimatedValue > 0)
    .sort((a, b) => b.estimatedValue - a.estimatedValue);
  const liabilityItems = [...props.items]
    .filter((item) => item.estimatedValue < 0)
    .sort((a, b) => Math.abs(b.estimatedValue) - Math.abs(a.estimatedValue));

  const positiveAssets = positiveItems.reduce((sum, item) => sum + item.estimatedValue, 0);
  const liabilities = Math.abs(liabilityItems.reduce((sum, item) => sum + item.estimatedValue, 0));
  const liquidAssets = props.items
    .filter((item) => item.estimatedValue > 0 && LIQUID_TYPES.has(item.type))
    .reduce((sum, item) => sum + item.estimatedValue, 0);
  const investmentAssets = props.items
    .filter((item) => item.estimatedValue > 0 && item.type === "INVESTMENT")
    .reduce((sum, item) => sum + item.estimatedValue, 0);

  const accountCount = props.items.length;
  const currencyCount = new Set(props.items.map((item) => item.currency)).size;
  const totalExposure = Math.max(positiveAssets + liabilities, 1);
  const topHoldings = positiveItems.slice(0, 4);
  const largestAsset = topHoldings[0] ?? null;
  const largestLiability = liabilityItems[0] ?? null;
  const liquidRatio = positiveAssets > 0 ? (liquidAssets / positiveAssets) * 100 : 0;
  const investmentRatio = positiveAssets > 0 ? (investmentAssets / positiveAssets) * 100 : 0;
  const debtRatio = positiveAssets > 0 ? (liabilities / positiveAssets) * 100 : 0;
  const coverageRatio = positiveAssets > 0 ? Math.max(0, 100 - debtRatio) : 0;

  const primaryCurrency =
    props.items.some((item) => item.currency === props.displayCurrency)
      ? props.displayCurrency
      : sortedItems[0]?.currency ?? props.displayCurrency;

  const typeDistributionData = (() => {
    const map = new Map<string, DistributionItem>();

    props.items.forEach((item) => {
      const meta = getTypeMeta(item.type);
      const current = map.get(meta.label) ?? {
        name: meta.label,
        value: 0,
        color: TONE_COLOR[meta.tone],
        count: 0,
      };

      current.value += Math.abs(item.estimatedValue);
      current.count = (current.count ?? 0) + 1;
      map.set(meta.label, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  })();

  const currencyBreakdownData = (() => {
    const map = new Map<string, number>();

    props.items.forEach((item) => {
      map.set(item.currency, (map.get(item.currency) ?? 0) + Math.abs(item.estimatedValue));
    });

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  })();

  const accountStructureData = (() => {
    const otherAssets = Math.max(positiveAssets - liquidAssets - investmentAssets, 0);
    return [
      { name: "流动资产", value: liquidAssets, color: "#2B6AF2" },
      { name: "投资资产", value: investmentAssets, color: "#A56BFA" },
      { name: "其他资产", value: otherAssets, color: "#4CC98F" },
      { name: "负债敞口", value: liabilities, color: "#F97316" },
    ].filter((item) => item.value > 0);
  })();

  const focusAccounts = liabilityItems.length > 0 ? liabilityItems.slice(0, 4) : topHoldings;

  return (
    <div
      className="mx-auto max-w-[1680px] space-y-4 px-0.5 pb-2 sm:space-y-5 sm:px-4"
      style={getThemeModuleStyle("assets")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <Card className="bg-[#2B6AF2] p-3 pb-4 text-white sm:p-3 sm:pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-semibold text-white/90">资产净值</p>
              <p className="mt-0.5 text-[10px] font-medium text-white/75">
                共 {accountCount} 个账户 · 主显示 {props.displayCurrency}
              </p>
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          </div>

          <p className="mt-2 text-[24px] font-bold leading-none tracking-tight sm:text-[24px]">
            {formatMoney(props.totalAssets, props.displayCurrency, {
              maximumFractionDigits: Math.abs(props.totalAssets) < 1000 ? 2 : 0,
            })}
          </p>

          <p className="mt-2 text-[10px] font-medium text-white/80">
            正向资产 {formatMoney(positiveAssets, props.displayCurrency, { compact: true })} · 负债敞口{" "}
            {formatMoney(liabilities, props.displayCurrency, { compact: true })}
          </p>
        </Card>

        <Card className="bg-[#4CC98F] p-3 pb-4 text-white sm:p-3 sm:pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-semibold text-white/90">可动用资产</p>
              <p className="mt-0.5 text-[10px] font-medium text-white/75">
                现金、银行卡、支付宝、微信
              </p>
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-[24px] font-bold leading-none tracking-tight sm:text-[24px]">
              {formatMoney(liquidAssets, props.displayCurrency, {
                maximumFractionDigits: Math.abs(liquidAssets) < 1000 ? 2 : 0,
              })}
            </p>
            <span className="text-[10px] font-semibold text-white/85">
              占正向资产 {liquidRatio.toFixed(0)}%
            </span>
          </div>

          <p className="mt-2 text-[10px] font-medium text-white/80">
            投资仓位 {formatMoney(investmentAssets, props.displayCurrency, { compact: true })} · 负债{" "}
            {formatMoney(liabilities, props.displayCurrency, { compact: true })}
          </p>
        </Card>

        <Card className="p-3 sm:p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-[#1e293b]">结构总览</h3>
            <ActionDots />
          </div>

          <div className="mt-3 space-y-3">
            <StatBar label="净值覆盖" value={`${coverageRatio.toFixed(0)}%`} progress={coverageRatio} color="#2B6AF2" />
            <StatBar label="流动占比" value={`${liquidRatio.toFixed(0)}%`} progress={liquidRatio} color="#4CC98F" />
            <StatBar label="投资占比" value={`${investmentRatio.toFixed(0)}%`} progress={investmentRatio} color="#A56BFA" />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[16px] bg-[#f8fafc] px-3 py-2">
            <div>
              <p className="text-[10px] font-semibold text-[#64748b]">主要币种</p>
              <p className="mt-0.5 text-[12px] font-bold text-[#0f172a]">{primaryCurrency}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-[#64748b]">币种数量</p>
              <p className="mt-0.5 text-[12px] font-bold text-[#0f172a]">{currencyCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#D8E6FC] p-3 sm:p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-[#1e293b]">重点持仓</h3>
            <ActionDots />
          </div>

          <div className="mt-3 space-y-3">
            {topHoldings.length > 0 ? (
              topHoldings.map((item) => (
                <HoldingRow
                  key={item.id}
                  item={item}
                  displayCurrency={props.displayCurrency}
                  portfolioBase={Math.max(positiveAssets, 1)}
                />
              ))
            ) : (
              <div className="flex min-h-[124px] items-center justify-center rounded-[18px] border border-dashed border-white/70 bg-white/35 px-4 text-center text-[12px] font-medium text-[#64748b]">
                暂无正向资产，录入账户后这里会显示持仓重点。
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="账户类型" action={<HeaderBadge>Exposure</HeaderBadge>} />

          <div className="h-[140px] sm:h-[180px] md:h-[220px]">
            {typeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={typeDistributionData}
                  layout="vertical"
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={axisTick}
                    tickFormatter={formatShortValue}
                    width={35}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={axisTick}
                    width={56}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={tooltipStyle}
                    formatter={(value: number) =>
                      formatMoney(value, props.displayCurrency, { maximumFractionDigits: 0 })
                    }
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                    {typeDistributionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[18px] bg-[#f8fafc] text-[12px] font-medium text-[#64748b]">
                暂无账户类型数据
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="币种分布" action={<HeaderBadge>{props.displayCurrency}</HeaderBadge>} />

          <div className="flex h-[140px] sm:h-[180px] md:h-[220px]">
            <div className="relative flex w-1/2 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      currencyBreakdownData.length > 0
                        ? currencyBreakdownData
                        : [{ name: "暂无数据", value: 1, color: "#e2e8f0" }]
                    }
                    innerRadius="62%"
                    outerRadius="84%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {(currencyBreakdownData.length > 0
                      ? currencyBreakdownData
                      : [{ name: "暂无数据", value: 1, color: "#e2e8f0" }]
                    ).map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      formatMoney(value, props.displayCurrency, { maximumFractionDigits: 0 })
                    }
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                  币种
                </span>
                <span className="mt-1 text-[18px] font-bold text-[#0f172a]">{currencyCount}</span>
              </div>
            </div>

            <div className="flex w-1/2 flex-col justify-center gap-2 pl-2 sm:gap-2.5 sm:pl-4">
              {(currencyBreakdownData.length > 0
                ? currencyBreakdownData
                : [{ name: "暂无数据", value: 0, color: "#cbd5e1" }]
              ).map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#475569] sm:text-xs">
                    {entry.name}
                  </span>
                  <span className="text-[10px] font-semibold text-[#0f172a] sm:text-xs">
                    {entry.value > 0
                      ? formatMoney(entry.value, props.displayCurrency, { compact: true, maximumFractionDigits: 0 })
                      : "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="管理面板" action={<ActionDots />} />

          <div className="space-y-3">
            <Select value={props.displayCurrency} onValueChange={props.onCurrencyChange}>
              <SelectTrigger className="h-11 rounded-2xl border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] shadow-none">
                <SelectValue placeholder="显示币种" />
              </SelectTrigger>
              <SelectContent>
                {props.supportedCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={props.onOpenCreate}
              className="h-11 w-full rounded-2xl bg-[#2B6AF2] text-white shadow-none hover:bg-[#245ad0]"
            >
              <Plus className="mr-2 h-4 w-4" />
              新增资产
            </Button>

            <div className="space-y-2">
              <div className="rounded-[18px] bg-[#f8fafc] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                  最大持仓
                </p>
                <p className="mt-2 text-[13px] font-bold text-[#0f172a]">
                  {largestAsset ? largestAsset.name : "暂无资产"}
                </p>
                <p className="mt-1 text-[11px] text-[#64748b]">
                  {largestAsset
                    ? formatMoney(largestAsset.estimatedValue, props.displayCurrency, { maximumFractionDigits: 0 })
                    : "录入账户后自动生成"}
                </p>
              </div>

              <div className="rounded-[18px] bg-[#f8fafc] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                  关注账户
                </p>
                <p className="mt-2 text-[13px] font-bold text-[#0f172a]">
                  {largestLiability ? largestLiability.name : "暂无负债账户"}
                </p>
                <p className="mt-1 text-[11px] text-[#64748b]">
                  {largestLiability
                    ? `负债 ${formatMoney(liabilities, props.displayCurrency, { compact: true })}`
                    : "当前净值结构比较轻"}
                </p>
              </div>

              <div className="rounded-[18px] bg-[#f8fafc] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                  现金账户
                </p>
                <p className="mt-2 text-[13px] font-bold text-[#0f172a]">
                  {props.items.filter((item) => LIQUID_TYPES.has(item.type)).length} 个
                </p>
                <p className="mt-1 text-[11px] text-[#64748b]">
                  可动用资金 {formatMoney(liquidAssets, props.displayCurrency, { compact: true })}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader
            title={liabilityItems.length > 0 ? "需要关注" : "账户分层"}
            action={<HeaderBadge>{liabilityItems.length > 0 ? `${liabilityItems.length} 项` : "Top 4"}</HeaderBadge>}
          />

          <div className="space-y-3">
            {focusAccounts.length > 0 ? (
              focusAccounts.map((item) => (
                <FocusAccountRow
                  key={item.id}
                  item={item}
                  displayCurrency={props.displayCurrency}
                  exposureBase={totalExposure}
                />
              ))
            ) : accountStructureData.length > 0 ? (
              accountStructureData.map((item) => {
                const progress = (item.value / totalExposure) * 100;
                return (
                  <div key={item.name} className="space-y-2 rounded-[18px] bg-[#f8fafc] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-[#1e293b]">{item.name}</span>
                      <span className="text-[11px] font-bold text-[#0f172a]">
                        {formatMoney(item.value, props.displayCurrency, { compact: true })}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(6, Math.min(100, progress))}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-[18px] bg-[#f8fafc] px-4 text-center text-[12px] font-medium text-[#64748b]">
                暂无账户，新增资产后这里会自动给出关注列表。
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-8 p-0">
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[#1e293b]">资产账户</h3>
              <p className="text-[10px] text-[#64748b] sm:text-xs">
                全部账户按敞口从高到低排序，点击右侧可直接编辑
              </p>
            </div>
            <HeaderBadge>{accountCount} 项</HeaderBadge>
          </div>

          {sortedItems.length === 0 ? (
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
              <EmptyState
                icon={Wallet}
                title="还没有资产记录"
                description="先创建一个账户，资产页会按默认总览主题把账户结构和重点持仓整理出来。"
                className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50"
                action={
                  <Button
                    onClick={props.onOpenCreate}
                    className="rounded-2xl bg-[#2B6AF2] text-white hover:bg-[#245ad0]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    新增资产
                  </Button>
                }
              />
            </div>
          ) : (
            <div>
              {sortedItems.map((item) => (
                <AccountListRow
                  key={item.id}
                  item={item}
                  displayCurrency={props.displayCurrency}
                  exposureBase={totalExposure}
                  onEdit={() => props.onOpenEdit(item)}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
