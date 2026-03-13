import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MoreHorizontal,
  Wallet
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clsx } from "clsx";

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  type: "MONTHLY" | "YEARLY" | "LONG_TERM";
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
};

export type TransactionItem = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
};

interface SavingsViewProps {
  items: SavingsGoal[];
  transactions: TransactionItem[];
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  onOpenCreate: () => void;
  onOpenEdit: (item: SavingsGoal) => void;
}

export function SavingsDefaultTheme({
  items,
  transactions,
  totalSaved,
  totalTarget,
  overallProgress,
  onOpenCreate,
  onOpenEdit,
}: SavingsViewProps) {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">储蓄目标</h1>
          <p className="text-gray-500 mt-1">积少成多，实现你的财务愿望</p>
        </div>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新建目标
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总存款</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalSaved.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              所有目标的当前存款总和
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">目标总额</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalTarget.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              所有目标的计划总额
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总体进度</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <div className="h-2 w-full rounded-full bg-gray-100 mt-2 overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-500" 
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const progress = item.targetAmount > 0 
            ? Math.min(100, (item.currentAmount / item.targetAmount) * 100) 
            : 0;
          
          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                        item.type === "LONG_TERM" ? "bg-blue-50 text-blue-700" :
                        item.type === "YEARLY" ? "bg-purple-50 text-purple-700" :
                        "bg-amber-50 text-amber-700"
                      )}>
                        {item.type === "LONG_TERM" ? "长期" : item.type === "YEARLY" ? "年度" : "月度"}
                      </span>
                      {item.deadline && (
                        <span className="flex items-center gap-1 text-xs">
                          <CalendarIcon className="h-3 w-3" />
                          {item.deadline.slice(0, 10)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <button onClick={() => onOpenEdit(item)} className="text-gray-400 hover:text-black">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="text-2xl font-bold">
                      {progress.toFixed(0)}<span className="text-sm text-gray-500 font-normal">%</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      ¥{item.currentAmount.toLocaleString()} / ¥{item.targetAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all duration-500",
                        progress >= 100 ? "bg-green-500" : "bg-black"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Empty State Add Button */}
        <button
          onClick={onOpenCreate}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-8 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-medium">添加新目标</span>
        </button>
      </div>

      {/* Savings Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>存取记录</CardTitle>
          <CardDescription>
            包含“储蓄”、“存款”、“理财”等分类的流水
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">暂无相关记录</div>
          ) : (
            <div className="space-y-2">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      t.type === "EXPENSE" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                      {t.type === "EXPENSE" ? "out" : "in"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{t.description || t.category}</div>
                      <div className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="font-medium text-sm">
                    {t.type === "EXPENSE" ? "-" : "+"}¥{Number(t.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
