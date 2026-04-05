"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  CreditCard,
  Layers3,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
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
import {
  THEME_SURFACE_CLASS,
  ThemeHero,
  ThemeMetricCard,
  ThemeSurface,
  getThemeModuleStyle,
  getThemeToneClass,
} from "@/components/shared/theme-primitives";
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

const SURFACE_CLASS = THEME_SURFACE_CLASS;

const LIQUID_TYPES = new Set(["CASH", "BANK_CARD", "ALIPAY", "WECHAT"]);

const STRUCTURE_TONE_STYLE: Record<Tone, { dot: string; bar: string }> = {
  blue: {
    dot: "#60a5fa",
    bar: "linear-gradient(90deg, rgba(96,165,250,0.96), rgba(37,99,235,0.8))",
  },
  emerald: {
    dot: "#34d399",
    bar: "linear-gradient(90deg, rgba(52,211,153,0.96), rgba(5,150,105,0.8))",
  },
  violet: {
    dot: "#a78bfa",
    bar: "linear-gradient(90deg, rgba(167,139,250,0.96), rgba(124,58,237,0.8))",
  },
  red: {
    dot: "#f87171",
    bar: "linear-gradient(90deg, rgba(248,113,113,0.96), rgba(220,38,38,0.8))",
  },
  slate: {
    dot: "#94a3b8",
    bar: "linear-gradient(90deg, rgba(148,163,184,0.96), rgba(71,85,105,0.8))",
  },
};

function formatMoney(
  value: number,
  currency: string,
  options: { compact?: boolean; maximumFractionDigits?: number } = {}
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

function AssetAvatar({ item, className }: { item: Asset; className?: string }) {
  const logo = resolveAssetLogo(item.name, item.type);
  const meta = getTypeMeta(item.type);
  const Icon = meta.icon;

  return (
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_8px_18px_rgba(15,23,42,0.06)]", className)}>
      {logo ? (
        <Image src={logo} alt={item.name} width={28} height={28} className="h-7 w-7 object-contain" />
      ) : (
        <Icon className="h-5 w-5" style={{ color: "var(--theme-muted-text)" }} />
      )}
    </div>
  );
}

function AssetWatermark({ item }: { item: Asset }) {
  const logo = resolveAssetLogo(item.name, item.type);
  const meta = getTypeMeta(item.type);
  const Icon = meta.icon;

  if (logo) {
    return (
      <div className="pointer-events-none absolute bottom-2 right-0 translate-x-3 opacity-[0.1] select-none">
        <Image
          src={logo}
          alt=""
          width={176}
          height={176}
          aria-hidden="true"
          className="h-auto w-24 object-contain sm:w-36"
        />
      </div>
    );
  }

  const iconToneClass: Record<Tone, string> = {
    blue: "text-blue-300/20",
    emerald: "text-emerald-300/20",
    violet: "text-violet-300/20",
    red: "text-red-300/20",
    slate: "text-slate-300/25",
  };

  return (
    <div className="pointer-events-none absolute bottom-2 right-0 translate-x-2 select-none">
      <Icon className={cn("h-20 w-20 sm:h-28 sm:w-28", iconToneClass[meta.tone])} aria-hidden="true" />
    </div>
  );
}

function HeroStat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: Tone;
  icon: LucideIcon;
}) {
  return (
    <ThemeMetricCard label={label} value={value} tone={tone} icon={Icon} className="p-3.5 sm:p-4" />
  );
}

function StructureRow({
  label,
  value,
  count,
  progress,
  tone,
}: {
  label: string;
  value: string;
  count: number;
  progress: number;
  tone: Tone;
}) {
  const toneStyle = STRUCTURE_TONE_STYLE[tone];

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "var(--theme-dialog-section-bg)",
        borderColor: "var(--theme-surface-border,rgba(148,163,184,0.12))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: toneStyle.dot }} />
            <p className="text-sm font-medium" style={{ color: "var(--theme-body-text)" }}>{label}</p>
          </div>
          <p className="mt-2 text-xl font-semibold tracking-tight" style={{ color: "var(--theme-body-text)" }}>{value}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--theme-muted-text)" }}>{count} 个账户</p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}
        >
          {count} accounts
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted-text)" }}>
          <span>Exposure</span>
          <span>{Math.max(0, progress).toFixed(0)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--theme-empty-icon-bg)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(6, Math.min(100, progress))}%`,
              background: toneStyle.bar,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AssetCard({
  item,
  displayCurrency,
  portfolioBase,
  onEdit,
}: {
  item: Asset;
  displayCurrency: string;
  portfolioBase: number;
  onEdit: () => void;
}) {
  const meta = getTypeMeta(item.type);
  const isLiability = item.estimatedValue < 0 || item.balance < 0;
  const share = portfolioBase > 0 ? (Math.abs(item.estimatedValue) / portfolioBase) * 100 : 0;
  const balanceText = formatMoney(item.balance, item.currency, {
    maximumFractionDigits: Math.abs(item.balance) < 1000 ? 2 : 0,
  });
  const estimatedText =
    item.currency !== displayCurrency
      ? formatMoney(item.estimatedValue, displayCurrency, {
          maximumFractionDigits: Math.abs(item.estimatedValue) < 1000 ? 2 : 0,
        })
      : null;

  return (
    <div className={cn(SURFACE_CLASS, "group p-3 sm:p-4 lg:p-3.5")}>
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)] lg:h-16 lg:w-16" />
      <AssetWatermark item={item} />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <AssetAvatar item={item} className="h-8 w-8 rounded-[14px] sm:h-9 sm:w-9 sm:rounded-xl lg:h-8 lg:w-8 lg:rounded-[14px]" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold sm:text-base" style={{ color: "var(--theme-body-text)" }}>{item.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 sm:mt-1 sm:gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 sm:px-2.5 sm:py-1 sm:text-[11px]", getThemeToneClass(meta.tone))}>{meta.label}</span>
                  <span className="text-[10px] sm:text-[11px]" style={{ color: "var(--theme-muted-text)" }}>{item.currency}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-[12px] transition hover:bg-white hover:text-slate-700 sm:h-7 sm:w-7 sm:rounded-[14px] lg:h-6.5 lg:w-6.5 lg:rounded-[12px]"
              style={{ background: "var(--theme-metric-bg)", color: "var(--theme-muted-text)" }}
              aria-label={`编辑${item.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2.5 sm:mt-3 lg:mt-2.5">
            <p className={cn("text-[1.5rem] font-semibold tracking-tight sm:text-[1.95rem] lg:text-[1.7rem]", isLiability && "text-red-600")}
               style={!isLiability ? { color: "var(--theme-body-text)" } : undefined}>
              {balanceText}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px]">
              {estimatedText ? <span style={{ color: "var(--theme-muted-text)" }}>折合 {estimatedText}</span> : <span style={{ color: "var(--theme-muted-text)" }}>按当前显示货币直接统计</span>}
              <span className="rounded-full px-2 py-0.5 font-medium" 
                     style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}>占比 {share.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 pt-1.5 sm:mt-3 sm:gap-2.5 sm:pt-2 lg:mt-2.5 lg:pt-1.5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] sm:text-[11px] sm:tracking-[0.16em]" style={{ color: "var(--theme-muted-text)" }}>Portfolio</p>
            <p className="mt-0.5 text-[12px] font-medium sm:text-[13px]" style={{ color: "var(--theme-body-text)" }}>{isLiability ? "负债类账户" : "资产类账户"}</p>
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-[11px]",
              isLiability ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
            )}
          >
            {isLiability ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
            {isLiability ? "需关注" : "表现稳定"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetsDefaultTheme({
  items,
  totalAssets,
  displayCurrency,
  onCurrencyChange,
  supportedCurrencies,
  loading = false,
  onOpenCreate,
  onOpenEdit,
}: AssetsViewProps) {
  const isSkeletonVisible = loading;

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Math.abs(b.estimatedValue) - Math.abs(a.estimatedValue)),
    [items]
  );

  const positiveAssets = useMemo(
    () => items.filter((item) => item.estimatedValue > 0).reduce((sum, item) => sum + item.estimatedValue, 0),
    [items]
  );
  const liabilities = useMemo(
    () => Math.abs(items.filter((item) => item.estimatedValue < 0).reduce((sum, item) => sum + item.estimatedValue, 0)),
    [items]
  );
  const liquidAssets = useMemo(
    () =>
      items
        .filter((item) => item.estimatedValue > 0 && LIQUID_TYPES.has(item.type))
        .reduce((sum, item) => sum + item.estimatedValue, 0),
    [items]
  );
  const investmentAssets = useMemo(
    () =>
      items
        .filter((item) => item.estimatedValue > 0 && item.type === "INVESTMENT")
        .reduce((sum, item) => sum + item.estimatedValue, 0),
    [items]
  );
  const accountCount = items.length;
  const currencyCount = new Set(items.map((item) => item.currency)).size;
  const largestAsset = sortedItems.find((item) => item.estimatedValue > 0) ?? sortedItems[0];
  const structureBase = Math.max(positiveAssets + liabilities, 1);

  if (isSkeletonVisible) {
    return <AssetsLoadingShell />;
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5" style={getThemeModuleStyle("assets")}>
      <ThemeHero className="p-4 sm:p-6 lg:p-8">
          <div className="relative z-10 space-y-4 sm:space-y-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "var(--module-accent-soft)", color: "var(--module-accent-text)" }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  资产工作台
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}
                >
                  <Layers3 className="h-3.5 w-3.5" />
                  显示货币 {displayCurrency}
                </span>
              </div>

              <div className="space-y-3">
                <p className="max-w-2xl text-sm leading-6" style={{ color: "var(--theme-label-text)" }}>
                  用统一视图查看账户余额、投资仓位和负债暴露，把你的钱分布在哪里一眼看清。
                </p>
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--theme-muted-text)" }}>资产净值</p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl" style={{ color: "var(--theme-body-text)" }}>
                      {formatMoney(totalAssets, displayCurrency, { maximumFractionDigits: Math.abs(totalAssets) < 1000 ? 2 : 0 })}
                    </h1>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "var(--module-soft-panel)", color: "var(--theme-label-text)" }}>
                    <Wallet className="h-4 w-4" style={{ color: "var(--module-accent-strong)" }} />
                    共 {accountCount} 个账户，覆盖 {currencyCount} 种货币
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-7">
                <HeroStat label="正向资产" value={formatMoney(positiveAssets, displayCurrency, { compact: true })} tone="emerald" icon={ArrowUpRight} />
                <HeroStat label="投资资产" value={formatMoney(investmentAssets, displayCurrency, { compact: true })} tone="violet" icon={PiggyBank} />
                <HeroStat label="负债敞口" value={formatMoney(liabilities, displayCurrency, { compact: true })} tone="red" icon={CreditCard} />
                <HeroStat label="账户数量" value={`${accountCount} 个`} tone="blue" icon={Layers3} />
                <HeroStat label="现金类账户" value={`${items.filter((item) => LIQUID_TYPES.has(item.type)).length} 个`} tone="emerald" icon={Coins} />
                <HeroStat label="投资仓位" value={`${items.filter((item) => item.type === "INVESTMENT").length} 个`} tone="violet" icon={PiggyBank} />
                <HeroStat label="需关注账户" value={`${items.filter((item) => item.estimatedValue < 0).length} 个`} tone="red" icon={CreditCard} />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={displayCurrency} onValueChange={onCurrencyChange}>
                <SelectTrigger
                  className="h-11 flex-1 rounded-2xl shadow-none"
                  style={{ background: "var(--theme-input-bg)", borderColor: "var(--theme-input-border)", color: "var(--theme-body-text)" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={onOpenCreate}
                className="h-11 rounded-2xl text-white shadow-none hover:brightness-105"
                style={{ background: "var(--module-accent-strong)" }}
              >
                <Plus className="mr-2 h-4 w-4" />
                新增资产
              </Button>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(260px,0.92fr)_minmax(0,1.4fr)] xl:items-stretch">
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    background: "var(--theme-dialog-section-bg)",
                    borderColor: "var(--theme-surface-border,rgba(148,163,184,0.12))",
                  }}
                >
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted-text)" }}>Largest Holding</p>
                <div className="mt-3 flex items-center gap-3">
                  {largestAsset ? <AssetAvatar item={largestAsset} className="bg-white" /> : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--theme-body-text)" }}>{largestAsset?.name ?? "暂无资产"}</p>
                    <p className="mt-1 truncate text-xs" style={{ color: "var(--theme-muted-text)" }}>
                      {largestAsset ? formatMoney(largestAsset.estimatedValue, displayCurrency, { maximumFractionDigits: 0 }) : "录入后会自动显示重点账户"}
                    </p>
                  </div>
                </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-3">
                <StructureRow
                  label="流动资产"
                  value={formatMoney(liquidAssets, displayCurrency, { compact: true })}
                  count={items.filter((item) => LIQUID_TYPES.has(item.type) && item.estimatedValue > 0).length}
                  progress={(liquidAssets / structureBase) * 100}
                  tone="blue"
                />
                <StructureRow
                  label="投资资产"
                  value={formatMoney(investmentAssets, displayCurrency, { compact: true })}
                  count={items.filter((item) => item.type === "INVESTMENT" && item.estimatedValue > 0).length}
                  progress={(investmentAssets / structureBase) * 100}
                  tone="violet"
                />
                <StructureRow
                  label="负债账户"
                  value={formatMoney(liabilities, displayCurrency, { compact: true })}
                  count={items.filter((item) => item.estimatedValue < 0).length}
                  progress={(liabilities / structureBase) * 100}
                  tone="red"
                />
              </div>
            </div>
          </div>
      </ThemeHero>

      <ThemeSurface className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            

            <div className="rounded-full px-3 py-1.5 text-xs font-medium" 
                 style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}>
              共 {accountCount} 项
            </div>
          </div>

          <div className="mt-5">
            {sortedItems.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="还没有资产记录"
                description="先创建一个账户，资产工作台就会开始汇总你的资金分布。"
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50"
                action={
                  <Button
                    onClick={onOpenCreate}
                    className="rounded-2xl text-white hover:brightness-105"
                    style={{ background: "var(--module-accent-strong)" }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    新增资产
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {sortedItems.map((item) => (
                  <AssetCard
                    key={item.id}
                    item={item}
                    displayCurrency={displayCurrency}
                    portfolioBase={Math.max(positiveAssets, 1)}
                    onEdit={() => onOpenEdit(item)}
                  />
                ))}
              </div>
            )}
          </div>
      </ThemeSurface>
    </div>
  );
}
