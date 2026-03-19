import {
  Wallet,
  CreditCard,
  TrendingUp,
  MoreHorizontal,
  Plus,
  Coins,
} from "lucide-react";
import { siAlipay, siWechat } from "simple-icons";
import { clsx } from "clsx";
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
import type { Asset } from "@/types";
export type { Asset };

// 平台图标组件
function AlipayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`#${siAlipay.hex}`} />
      <path d={siAlipay.path} fill="#FFFFFF" transform="translate(1.5 1.5) scale(0.875)" />
    </svg>
  );
}

function WechatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`#${siWechat.hex}`} />
      <path d={siWechat.path} fill="#FFFFFF" transform="translate(1.5 1.5) scale(0.875)" />
    </svg>
  );
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

function getAssetIcon(type: string) {
  switch (type) {
    case 'CASH': return <Coins className="h-5 w-5 text-blue-500" />;
    case 'BANK_CARD': return <CreditCard className="h-5 w-5 text-blue-500" />;
    case 'ALIPAY': return <AlipayIcon className="h-5 w-5" />;
    case 'WECHAT': return <WechatIcon className="h-5 w-5" />;
    case 'INVESTMENT': return <TrendingUp className="h-5 w-5 text-purple-500" />;
    default: return <Wallet className="h-5 w-5 text-gray-500" />;
  }
}

function getAssetLabel(type: string) {
  const map: Record<string, string> = {
    'CASH': '现金', 'BANK_CARD': '银行卡', 'ALIPAY': '支付宝',
    'WECHAT': '微信', 'INVESTMENT': '投资', 'OTHER': '其他'
  };
  return map[type] || type;
}

function getAssetColor(type: string) {
  switch (type) {
    case 'ALIPAY': return 'bg-blue-500';
    case 'WECHAT': return 'bg-green-500';
    case 'BANK_CARD': return 'bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500';
    default: return 'bg-blue-500';
  }
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
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            {getAssetIcon(item.type)}
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

      <div className={clsx("absolute bottom-0 left-0 w-full h-1", getAssetColor(item.type), "opacity-50")} />
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

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900">资产管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理你的现金、银行卡与投资账户</p>
        </div>
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

      {/* Total Assets Card */}
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
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gray-800/20 to-transparent" />
      </div>

      {/* Asset List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 md:p-5 lg:p-7 h-[120px]">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
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
    </div>
  );
}
