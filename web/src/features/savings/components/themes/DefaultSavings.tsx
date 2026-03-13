import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MoreHorizontal,
  Wallet,
  PiggyBank,
  ArrowRight
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
        <Button onClick={onOpenCreate} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新建目标
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">总存款</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
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
            <CardTitle className="text-sm font-medium text-gray-500">目标总额</CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
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
            <CardTitle className="text-sm font-medium text-gray-500">总体进度</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <Progress value={overallProgress} className="h-2 mt-2" />
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
            <Card key={item.id} className="group overflow-hidden hover:shadow-md transition-shadow relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                          item.type === "LONG_TERM" ? "bg-blue-50 text-blue-700" :
                          item.type === "YEARLY" ? "bg-purple-50 text-purple-700" :
                          "bg-amber-50 text-amber-700"
                        )}>
                          {item.type === "LONG_TERM" ? "长期" : item.type === "YEARLY" ? "年度" : "月度"}
                        </span>
                        {item.deadline && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <CalendarIcon className="h-3 w-3" />
                            {item.deadline.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onOpenEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-black transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="text-2xl font-bold text-gray-900">
                      {progress.toFixed(0)}<span className="text-sm text-gray-500 font-normal">%</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      ¥{item.currentAmount.toLocaleString()} / ¥{item.targetAmount.toLocaleString()}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" indicatorClassName={clsx(progress >= 100 ? "bg-green-500" : "bg-black")} />
                </div>
              </CardContent>
              {/* Decorative bottom border */}
              <div className={clsx(
                "absolute bottom-0 left-0 w-full h-1 opacity-50",
                item.type === "LONG_TERM" ? "bg-blue-500" :
                item.type === "YEARLY" ? "bg-purple-500" :
                "bg-amber-500"
              )} />
            </Card>
          );
        })}
        
        {/* Empty State Add Button */}
        <button
          onClick={onOpenCreate}
          className="group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-gray-400 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-medium">添加新目标</span>
        </button>
      </div>

      {/* Savings Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
             <CardTitle className="text-base font-semibold">存取记录</CardTitle>
             <CardDescription>
               包含“储蓄”、“存款”、“理财”等分类的流水
             </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-black">
            查看全部 <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-dashed">
              <PiggyBank className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              暂无相关记录
            </div>
          ) : (
            <div className="space-y-0 divide-y">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors -mx-6 px-6 first:border-t">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "h-10 w-10 rounded-full flex items-center justify-center border",
                      t.type === "EXPENSE" ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-600"
                    )}>
                      {t.type === "EXPENSE" ? <ArrowRight className="h-4 w-4 -rotate-45" /> : <ArrowRight className="h-4 w-4 rotate-[135deg]" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{t.description || t.category}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{new Date(t.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={clsx("font-bold text-sm", t.type === "EXPENSE" ? "text-gray-900" : "text-green-600")}>
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
