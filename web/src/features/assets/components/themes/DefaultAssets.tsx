import { 
  ArrowUpRight, 
  Wallet, 
  CreditCard, 
  Banknote, 
  TrendingUp,
  MoreHorizontal,
  Calendar,
  Plus
} from "lucide-react";
import { clsx } from "clsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type Asset = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  estimatedValue: number;
};

interface AssetsViewProps {
  items: Asset[];
  totalAssets: number;
  displayCurrency: string;
  onCurrencyChange: (currency: string) => void;
  supportedCurrencies: string[];
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
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: AssetsViewProps) {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">资产管理</h1>
          <p className="text-gray-500 mt-1">管理你的现金、银行卡与投资账户</p>
        </div>
        <div className="flex gap-3">
          <select
            className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
            value={displayCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            {supportedCurrencies.map((c) => (
              <option key={c} value={c}>
                以 {c} 显示
              </option>
            ))}
          </select>
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 h-10 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新增资产
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-black p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-sm text-gray-400 font-medium mb-2">总资产估值 ({displayCurrency})</div>
          <div className="text-4xl font-bold tracking-tight">
            {displayCurrency === "CNY" ? "¥" : displayCurrency} {totalAssets.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gray-800/20 to-transparent pointer-events-none" />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-gray-500">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Wallet className="h-6 w-6 text-gray-400" />
          </div>
          <p>暂无资产记录，开始添加你的第一笔资产吧</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                        item.type === "CASH" ? "bg-green-50 text-green-700" :
                        item.type === "ALIPAY" ? "bg-blue-50 text-blue-700" :
                        item.type === "WECHAT" ? "bg-green-50 text-green-700" :
                        item.type === "INVESTMENT" ? "bg-purple-50 text-purple-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onOpenEdit(item)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-black"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="text-xl font-bold text-gray-900">
                    {item.currency === "CNY" ? "¥" : item.currency} {item.balance.toLocaleString()}
                  </div>
                  {item.currency !== displayCurrency && (
                    <div className="text-xs text-gray-500">
                      ≈ {displayCurrency} {item.estimatedValue.toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
