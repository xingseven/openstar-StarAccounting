import {
  ArrowUpRight,
  Wallet,
  CreditCard,
  Banknote,
  TrendingUp,
  MoreHorizontal,
  Calendar,
  Plus,
  Coins,
  Landmark,
  Smartphone
} from "lucide-react";
import { siAlipay, siWechat } from "simple-icons";
import { clsx } from "clsx";

// Simple-icons 官方图标组件
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
import { Skeleton, CardListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
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

export function AssetsDefaultTheme({
  items,
  totalAssets,
  displayCurrency,
  onCurrencyChange,
  supportedCurrencies,
  loading = false,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: AssetsViewProps) {

  const getIcon = (type: string) => {
    switch(type) {
      case 'CASH': return <Coins className="h-5 w-5 text-orange-500" />;
      case 'BANK_CARD': return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'ALIPAY': return <AlipayIcon className="h-5 w-5" />;
      case 'WECHAT': return <WechatIcon className="h-5 w-5" />;
      case 'INVESTMENT': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default: return <Wallet className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLabel = (type: string) => {
     const map: Record<string, string> = {
       'CASH': '现金',
       'BANK_CARD': '银行卡',
       'ALIPAY': '支付宝',
       'WECHAT': '微信',
       'INVESTMENT': '投资',
       'OTHER': '其他'
     };
     return map[type] || type;
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900">资产管理</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">管理你的现金、银行卡与投资账户</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Select value={displayCurrency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-[100px] sm:w-[140px] bg-white h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="选择币种" />
            </SelectTrigger>
            <SelectContent>
              {supportedCurrencies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c} 显示
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={onOpenCreate} className="bg-black hover:bg-gray-800 text-white h-9 sm:h-10 px-3 sm:px-4">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">新增资产</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl sm:rounded-xl border bg-black p-4 sm:p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] sm:text-sm text-gray-400 font-medium mb-1 sm:mb-2">
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
            总资产估值 ({displayCurrency})
          </div>
          <div className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {displayCurrency === "CNY" ? "¥" : displayCurrency} {totalAssets.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gray-800/20 to-transparent pointer-events-none" />
      </div>

      {loading ? (
        <CardListSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="暂无资产记录"
          description="开始添加你的第一笔资产吧"
        />
      ) : (
        <div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow relative overflow-hidden">
              <CardHeader className="pb-1 sm:pb-3 p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-50 flex items-center justify-center border">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <CardTitle className="text-xs sm:text-base font-semibold">{item.name}</CardTitle>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{getLabel(item.type)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onOpenEdit(item)}
                      className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-black transition-colors"
                    >
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-6">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="text-base sm:text-2xl font-bold text-gray-900">
                    {item.currency === "CNY" ? "¥" : item.currency} {item.balance.toLocaleString()}
                  </div>
                  {item.currency !== displayCurrency && (
                    <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                      <span>≈ {displayCurrency} {item.estimatedValue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              {/* Decorative gradient bar */}
              <div className={clsx(
                "absolute bottom-0 left-0 w-full h-1 opacity-50",
                item.type === "CASH" ? "bg-orange-500" :
                item.type === "BANK_CARD" ? "bg-blue-500" :
                item.type === "ALIPAY" ? "bg-cyan-500" :
                item.type === "WECHAT" ? "bg-green-500" :
                "bg-gray-500"
              )} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
