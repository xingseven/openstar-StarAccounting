import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  MoreHorizontal,
  Plus,
  Coins,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { DelayedRender } from "@/components/shared/DelayedRender";
import type { Asset } from "@/types";
export type { Asset };

// 银行 Logo SVG 组件
function BankLogoSvg({ bankName, className }: { bankName: string; className?: string }) {
  const lowerName = bankName.toLowerCase();

  // 招商银行 CMB
  if (lowerName.includes('招商') || lowerName.includes('cmb')) {
    return <img src="/logo/CMB.svg" alt="招商银行" className={className} />;
  }

  // 工商银行 ICBC
  if (lowerName.includes('工商') || lowerName.includes('icbc')) {
    return <img src="/logo/ICBC.svg" alt="工商银行" className={className} />;
  }

  // 建设银行 CCB
  if (lowerName.includes('建设') || lowerName.includes('ccb')) {
    return <img src="/logo/CCB.svg" alt="建设银行" className={className} />;
  }

  // 农业银行 ABC
  if (lowerName.includes('农业') || lowerName.includes('abc')) {
    return <img src="/logo/ABC.svg" alt="农业银行" className={className} />;
  }

  // 中国银行 BOC
  if (lowerName.includes('中国银行') || lowerName.includes('boc')) {
    return <img src="/logo/BOC.svg" alt="中国银行" className={className} />;
  }

  // 交通银行 BCM
  if (lowerName.includes('交通') || lowerName.includes('bcom') || lowerName.includes('bcm')) {
    return <img src="/logo/BCM.svg" alt="交通银行" className={className} />;
  }

  // 浦发银行 SPD
  if (lowerName.includes('浦发') || lowerName.includes('spd')) {
    return <img src="/logo/SPD.svg" alt="浦发银行" className={className} />;
  }

  // 兴业银行 CIB
  if (lowerName.includes('兴业') || lowerName.includes('cib')) {
    return <img src="/logo/CIB.svg" alt="兴业银行" className={className} />;
  }

  // 民生银行 CMBC
  if (lowerName.includes('民生') || lowerName.includes('cmbc')) {
    return <img src="/logo/CMBC.svg" alt="民生银行" className={className} />;
  }

  // 平安银行 PAB
  if (lowerName.includes('平安') || lowerName.includes('pab') || lowerName.includes('pingan')) {
    return <img src="/logo/PAB.svg" alt="平安银行" className={className} />;
  }

  // 邮储银行 PSBC
  if (lowerName.includes('邮储') || lowerName.includes('psbc')) {
    return <img src="/logo/PSBC.svg" alt="邮储银行" className={className} />;
  }

  // 中信银行 CITIC
  if (lowerName.includes('中信') || lowerName.includes('citic')) {
    return <img src="/logo/CITIC.svg" alt="中信银行" className={className} />;
  }

  // 华夏银行 HXB
  if (lowerName.includes('华夏') || lowerName.includes('hxb')) {
    return <img src="/logo/HXB.svg" alt="华夏银行" className={className} />;
  }

  // 广发银行 GDB
  if (lowerName.includes('广发') || lowerName.includes('gdb')) {
    return <img src="/logo/GDB.svg" alt="广发银行" className={className} />;
  }

  // 默认银联图标
  return <img src="/logo/UNION.svg" alt="银行卡" className={className} />;
}

// 支付宝 Logo
function AlipayLogo({ className }: { className?: string }) {
  return <img src="/logo/ZFB.svg" alt="支付宝" className={className} />;
}

// 微信 Logo
function WechatLogo({ className }: { className?: string }) {
  return <img src="/logo/WX.svg" alt="微信" className={className} />;
}

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

function getAssetIcon(type: string, name?: string) {
  switch (type) {
    case 'CASH': return <Coins className="h-5 w-5 text-blue-500" />;
    case 'BANK_CARD':
    case 'CREDIT_CARD': return name ? <BankLogoSvg bankName={name} className="h-5 w-5" /> : <CreditCard className="h-5 w-5 text-blue-500" />;
    case 'ALIPAY': return <AlipayLogo className="h-5 w-5" />;
    case 'WECHAT': return <WechatLogo className="h-5 w-5" />;
    case 'INVESTMENT': return <TrendingUp className="h-5 w-5 text-purple-500" />;
    default: return <Wallet className="h-5 w-5 text-gray-500" />;
  }
}

// 获取资产类型对应的大图标装饰（右下角）
function getAssetBigIcon(type: string, name: string) {
  switch (type) {
    case 'CASH': return <Coins className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 text-blue-500/10" />;
    case 'BANK_CARD':
    case 'CREDIT_CARD': return <BankLogoSvg bankName={name} className="absolute right-0 bottom-0 w-20 sm:w-44 h-auto opacity-10" />;
    case 'ALIPAY': return <AlipayLogo className="absolute right-0 bottom-0 w-20 sm:w-44 h-auto opacity-10" />;
    case 'WECHAT': return <WechatLogo className="absolute right-0 bottom-0 w-20 sm:w-44 h-auto opacity-10" />;
    case 'INVESTMENT': return <TrendingUp className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 text-purple-500/10" />;
    default: return <Wallet className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 text-gray-500/10" />;
  }
}

function getAssetLabel(type: string) {
  const map: Record<string, string> = {
    'CASH': '现金', 'BANK_CARD': '银行卡', 'CREDIT_CARD': '信用卡',
    'ALIPAY': '支付宝', 'WECHAT': '微信', 'INVESTMENT': '投资', 'OTHER': '其他'
  };
  return map[type] || type;
}

// 资产卡片组件
function AssetCard({
  item,
  displayCurrency,
  onEdit,
}: {
  item: Asset;
  displayCurrency: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 md:p-5 lg:p-7 relative overflow-hidden group flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden">
            {getAssetIcon(item.type, item.name)}
          </div>
          <div>
            <div className="font-medium whitespace-nowrap">{item.name}</div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{getAssetLabel(item.type)}</div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="text-lg md:text-xl font-bold text-gray-900">
        {item.currency === "CNY" ? "¥" : item.currency} {item.balance.toLocaleString()}
      </div>
      {item.currency !== displayCurrency && (
        <div className="text-xs text-gray-500 mt-1">
          ≈ {displayCurrency} {item.estimatedValue.toLocaleString()}
        </div>
      )}

      {/* 右下角大图标装饰 */}
      {getAssetBigIcon(item.type, item.name)}
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
  // 首次加载时显示骨架的延迟状态
  const [骨架显示, set骨架显示] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => set骨架显示(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const 显示骨架 = loading || 骨架显示;

  if (显示骨架) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <DelayedRender delay={0}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-9 w-32 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </div>
        </DelayedRender>
        <DelayedRender delay={80}>
          <Skeleton className="h-[120px] w-full rounded-2xl" />
        </DelayedRender>
        <DelayedRender delay={160}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 md:p-5 lg:p-7 flex flex-col justify-between h-full min-h-[120px]">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </DelayedRender>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <DelayedRender delay={0}>
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <Select value={displayCurrency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="w-[120px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onOpenCreate} className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              新增资产
            </Button>
          </div>
        </div>
      </DelayedRender>

      {/* Total Assets Card */}
      <DelayedRender delay={80} fallback={
        <div className="rounded-2xl bg-gray-900 p-4 md:p-5 lg:p-7 text-white shadow-sm relative overflow-hidden min-h-[100px]">
          <Wallet className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 text-white/10" />
        </div>
      }>
        <div className="rounded-2xl bg-black p-4 md:p-5 lg:p-7 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Wallet className="h-4 w-4" />
              总资产估值 ({displayCurrency})
            </div>
            <div className="text-3xl font-bold">
              {displayCurrency === "CNY" ? "¥" : displayCurrency} {totalAssets.toLocaleString()}
            </div>
          </div>
          <Wallet className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-24 sm:w-24 text-white/10" />
        </div>
      </DelayedRender>

      {/* Asset List */}
      <DelayedRender delay={160} fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 md:p-5 lg:p-7 flex flex-col justify-between h-full min-h-[120px]">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
      }>
        {items.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="暂无资产记录"
            description="开始添加你的第一笔资产吧"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <AssetCard
                key={item.id}
                item={item}
                displayCurrency={displayCurrency}
                onEdit={() => onOpenEdit(item)}
              />
            ))}
          </div>
        )}
      </DelayedRender>
    </div>
  );
}
