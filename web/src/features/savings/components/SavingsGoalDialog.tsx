import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, CalendarIcon, Coins, PiggyBank, Wallet } from "lucide-react";
import { SavingsGoal } from "./themes/DefaultSavings";
import { clsx } from "clsx";

interface SavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SavingsGoal | null;
  onSave: (data: Partial<SavingsGoal>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function SavingsGoalDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSave,
  onDelete 
}: SavingsGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState("MONTHLY");
  const [depositType, setDepositType] = useState("CASH");
  const [status, setStatus] = useState("ACTIVE");

  // Reset or Load data when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setTargetAmount(String(initialData.targetAmount));
        setCurrentAmount(String(initialData.currentAmount));
        setDeadline(initialData.deadline ? initialData.deadline.slice(0, 10) : "");
        setType(initialData.type);
        setDepositType(initialData.depositType);
        setStatus(initialData.status);
      } else {
        // Reset for create mode
        setName("");
        setTargetAmount("");
        setCurrentAmount("0");
        setDeadline("");
        setType("MONTHLY");
        setDepositType("CASH");
        setStatus("ACTIVE");
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        deadline: deadline || null,
        type: type as any,
        depositType: depositType as any,
        status: status as any,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (initialData && onDelete && confirm("确定要删除这个目标吗？此操作无法撤销。")) {
      setLoading(true);
      try {
        await onDelete(initialData.id);
        onOpenChange(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
              {initialData ? <PiggyBank className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
            </div>
            {initialData ? "编辑储蓄目标" : "新建储蓄目标"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">目标名称</label>
            <Input
              required
              placeholder="例如：买房首付、旅游基金"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-gray-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Amount Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                目标金额 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="pl-7 h-11 bg-gray-50/50 focus:bg-white transition-colors font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">当前已存</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="pl-7 h-11 bg-gray-50/50 focus:bg-white transition-colors font-medium"
                />
              </div>
            </div>
          </div>

          {/* Type & Deposit Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">存钱模式</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-11 bg-gray-50/50 focus:bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">每月存</SelectItem>
                  <SelectItem value="BI_MONTHLY_ODD">隔月存 (单月)</SelectItem>
                  <SelectItem value="BI_MONTHLY_EVEN">隔月存 (双月)</SelectItem>
                  <SelectItem value="YEARLY">年度目标</SelectItem>
                  <SelectItem value="LONG_TERM">长期目标</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">资金性质</label>
              <Select value={depositType} onValueChange={setDepositType}>
                <SelectTrigger className="h-11 bg-gray-50/50 focus:bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">现金</SelectItem>
                  <SelectItem value="FIXED_TERM">死期存款</SelectItem>
                  <SelectItem value="HELP_DEPOSIT">他人帮存</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                截止日期
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="pl-9 h-11 bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            {initialData && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">状态</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={clsx(
                    "h-11 border-2 font-medium",
                    status === "COMPLETED" ? "border-green-100 bg-green-50 text-green-700" : 
                    status === "ARCHIVED" ? "border-gray-100 bg-gray-50 text-gray-500" :
                    "border-blue-100 bg-blue-50 text-blue-700"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">进行中</SelectItem>
                    <SelectItem value="COMPLETED">已达成</SelectItem>
                    <SelectItem value="ARCHIVED">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            {initialData && onDelete && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleDelete}
                className="mr-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                disabled={loading}
              >
                删除
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {initialData ? "保存修改" : "立即创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
