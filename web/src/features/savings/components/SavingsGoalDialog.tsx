import { useState, useEffect, useMemo, useRef } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter
} from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, CalendarIcon, PiggyBank, Wallet, Plus, Trash2, ArrowRight } from "lucide-react";
import { SavingsGoal } from "./themes/DefaultSavings";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";

interface SavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SavingsGoal | null;
  onSave: (data: Partial<SavingsGoal> & { plans?: any[], planConfig?: any }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  defaultStep?: 1 | 2;
  onDataChanged?: () => void;
}

type PlanRow = {
  id: string;
  month: string; // YYYY-MM
  salary: number;
  expenses: Record<string, number>; // dynamic columns
  amount: number; // deposit amount
  remark: string;
  status?: "PENDING" | "COMPLETED" | "SKIPPED";
  // Computed
  balance?: number; // current month remaining
  carryOver?: number; // from previous month
  totalAvailable?: number;
  finalBalance?: number; // carry to next month
  proofImage?: string;
};

export function SavingsGoalDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSave,
  onDelete,
  defaultStep = 1,
  onDataChanged,
}: SavingsGoalDialogProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1: Basic Info
  const [name, setName] = useState("");
  const [type, setType] = useState("MONTHLY");
  const [depositType, setDepositType] = useState("CASH");
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
  const [duration, setDuration] = useState(12);

  // Step 2: Plan Table
  const [expenseColumns, setExpenseColumns] = useState<{id: string, name: string}[]>([
    { id: "exp1", name: "固定支出1" }
  ]);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const reminderRef = useRef<string>("");
  const [dragOverProofId, setDragOverProofId] = useState<string | null>(null);
  const bypassUnsavedConfirmRef = useRef(false);
  const closeConfirmOpenRef = useRef(false);
  const ignoreNextCloseAttemptRef = useRef(false);

  const pushToast = (message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Reset or Load data when dialog opens
  useEffect(() => {
    if (!open) return;
    const init = async () => {
      setIsDirty(false);
      bypassUnsavedConfirmRef.current = false;
      closeConfirmOpenRef.current = false;
      ignoreNextCloseAttemptRef.current = false;
      setStep(defaultStep);
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setDepositType(initialData.depositType);
        if (defaultStep === 2) {
          try {
            const data = await apiFetch<{ items: any[] }>(`/api/savings/${initialData.id}/plans`);
            const items = data.items ?? [];
            if (items.length > 0) {
              const expenseNames = Array.from(new Set(items.flatMap((p) => Object.keys(p.expenses ?? {}))));
              setExpenseColumns(
                expenseNames.length > 0
                  ? expenseNames.map((n, i) => ({ id: `exp${i + 1}`, name: n }))
                  : [{ id: "exp1", name: "固定支出1" }]
              );
              setRows(
                items.map((p) => ({
                  id: p.id,
                  month: p.month,
                  salary: Number(p.salary ?? 0),
                  expenses: p.expenses ?? {},
                  amount: Number(p.amount ?? 0),
                  remark: p.remark ?? "",
                  status: p.status ?? "PENDING",
                  proofImage: p.proofImage ?? "",
                }))
              );
              setStartMonth(items[0].month);
              setDuration(items.length);
            } else {
              initRows();
            }
          } catch {
            initRows();
          }
        }
      } else {
        setName("");
        setType("MONTHLY");
        setDepositType("CASH");
        setStartMonth(new Date().toISOString().slice(0, 7));
        setDuration(12);
        setExpenseColumns([{ id: "exp1", name: "固定支出1" }]);
        setRows([]);
      }
    };
    init();
  }, [open, initialData, defaultStep]);

  useEffect(() => {
    if (!open) return;
    const tick = () => setCurrentMonth(new Date().toISOString().slice(0, 7));
    const timer = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  // Initialize Rows when entering Step 2
  const initRows = () => {
    const newRows: PlanRow[] = [];
    const [year, month] = startMonth.split("-").map(Number);
    
    for (let i = 0; i < duration; i++) {
      const date = new Date(year, month - 1 + i, 1);
      const mStr = date.toISOString().slice(0, 7);
      newRows.push({
        id: Math.random().toString(36).substr(2, 9),
        month: mStr,
        salary: 0,
        expenses: {},
        amount: 0,
        remark: "",
        status: "PENDING",
      });
    }
    setRows(newRows);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (bypassUnsavedConfirmRef.current) {
        bypassUnsavedConfirmRef.current = false;
        onOpenChange(false);
        return;
      }
      if (ignoreNextCloseAttemptRef.current) {
        ignoreNextCloseAttemptRef.current = false;
        return;
      }
      if (isDirty) {
        if (closeConfirmOpenRef.current) return;
        closeConfirmOpenRef.current = true;
        confirm({
          title: "确认关闭",
          description: "您有未保存的内容，确定要关闭吗？",
          onConfirm: () => {
            closeConfirmOpenRef.current = false;
            bypassUnsavedConfirmRef.current = true;
            onOpenChange(false);
          },
          onCancel: () => {
            closeConfirmOpenRef.current = false;
            ignoreNextCloseAttemptRef.current = true;
          },
        });
        return;
      }
    }
    onOpenChange(newOpen);
  };

  const handleNext = () => {
    if (!name) return;
    if (rows.length === 0) {
      initRows();
    }
    setStep(2);
  };

  // Auto-fill logic: When first row changes, update others if they are "pristine" (simplified: just update all below)
  const handleRowChange = (index: number, field: keyof PlanRow | string, value: any, isExpense = false) => {
    setIsDirty(true);
    const newRows = [...rows];
    
    if (isExpense) {
      newRows[index].expenses = { ...newRows[index].expenses, [field]: Number(value) };
    } else {
      (newRows[index] as any)[field] = value;
    }

    // Auto-fill logic for first row
    if (index === 0) {
      for (let i = 1; i < newRows.length; i++) {
        if (isExpense) {
          newRows[i].expenses = { ...newRows[i].expenses, [field]: Number(value) };
        } else if (field === 'salary') {
          newRows[i].salary = Number(value);
        } else if (field === 'amount' && type === 'MONTHLY') {
          // Only auto-fill deposit amount for Monthly mode
          newRows[i].amount = Number(value);
        }
      }
    }

    setRows(newRows);
  };

  // Dynamic Calculation
  const calculatedRows = useMemo(() => {
    let carryOver = 0;
    return rows.map((row, idx) => {
      const totalExpenses = Object.values(row.expenses).reduce((a, b) => a + Number(b), 0);
      const currentBalance = Number(row.salary) - totalExpenses;
      
      // Determine if this is a deposit month for Bi-Monthly
      const [y, m] = row.month.split('-').map(Number);
      const isOdd = m % 2 !== 0;
      const isTargetMonth = type === 'MONTHLY' || 
                           (type === 'BI_MONTHLY_ODD' && isOdd) || 
                           (type === 'BI_MONTHLY_EVEN' && !isOdd);

      const totalAvailable = currentBalance + carryOver;
      
      // Auto-calculate deposit amount for Bi-Monthly if not manually set (or just default logic)
      // Here we respect user input 'amount', but we can pre-fill it in initRows or handleRowChange
      // Let's stick to user input for 'amount', but display available
      
      const finalBalance = totalAvailable - Number(row.amount);
      
      // Update carryOver for next iteration
      const prevCarryOver = carryOver;
      carryOver = finalBalance;

      return {
        ...row,
        balance: currentBalance,
        carryOver: prevCarryOver,
        totalAvailable,
        finalBalance
      };
    });
  }, [rows, type]);

  const finalRows = calculatedRows;
  const displayRows = finalRows;
  const summary = useMemo(() => {
    const totalAmount = finalRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const totalSalary = finalRows.reduce((sum, row) => sum + Number(row.salary || 0), 0);
    const totalBalance = finalRows.reduce((sum, row) => sum + Number(row.balance || 0), 0);
    const totalAvailable = finalRows.reduce((sum, row) => sum + Number(row.totalAvailable || 0), 0);
    const endingBalance = finalRows.length > 0 ? Number(finalRows[finalRows.length - 1].finalBalance || 0) : 0;
    const expenseTotals = expenseColumns.reduce<Record<string, number>>((acc, col) => {
      acc[col.name] = finalRows.reduce((sum, row) => sum + Number(row.expenses?.[col.name] || 0), 0);
      return acc;
    }, {});
    return {
      totalAmount,
      totalSalary,
      totalBalance,
      totalAvailable,
      endingBalance,
      expenseTotals,
    };
  }, [finalRows, expenseColumns]);

  useEffect(() => {
    if (!open || step !== 2 || !initialData) return;
    const depositRows = finalRows.filter((r) => Number(r.amount) > 0);
    if (depositRows.length === 0) return;
    const reminderState = `${currentMonth}|${depositRows.map((r) => `${r.month}:${r.status}`).join(",")}`;
    if (reminderRef.current === reminderState) return;
    reminderRef.current = reminderState;
    const previousUncompleted = depositRows
      .filter((r) => r.month < currentMonth && r.status !== "COMPLETED")
      .sort((a, b) => b.month.localeCompare(a.month))[0];
    if (previousUncompleted) {
      pushToast(`提醒：${previousUncompleted.month.replace("-", "/")} 的计划存款尚未打卡`);
    }
    const now = new Date();
    const isLastDay =
      now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentPlan = depositRows.find((r) => r.month === currentMonth);
    if (isLastDay && currentPlan && currentPlan.status !== "COMPLETED") {
      pushToast(`提醒：本月 (${currentMonth.replace("-", "/")}) 计划存款尚未打卡`);
    }
  }, [open, step, currentMonth, finalRows]);

  useEffect(() => {
    if (!open) reminderRef.current = "";
  }, [open]);

  const handleAddColumn = () => {
    const name = prompt("请输入列名 (如: 房租)");
    if (name) {
      setExpenseColumns([...expenseColumns, { id: Math.random().toString(36).substr(2, 5), name }]);
      setIsDirty(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const totalTarget = finalRows.reduce((sum, r) => sum + Number(r.amount), 0);
      if (initialData) {
        await onSave({
          name,
          targetAmount: totalTarget,
          type: type as any,
          depositType: depositType as any,
          deadline: finalRows[finalRows.length - 1]?.month ? finalRows[finalRows.length - 1].month + "-01" : initialData.deadline ?? undefined,
          status: "ACTIVE",
        });
        await apiFetch(`/api/savings/${initialData.id}/plans/batch`, {
          method: "POST",
          body: JSON.stringify({
            plans: finalRows.map((r) => ({
              month: r.month,
              amount: r.amount,
              salary: r.salary,
              expenses: r.expenses,
              remark: r.remark,
              status: r.status ?? "PENDING",
              proofImage: r.proofImage ?? "",
            })),
            config: {
              expenseColumns,
              startMonth,
              duration,
            },
          }),
        });
        onDataChanged?.();
      } else {
        await onSave({
          name,
          targetAmount: totalTarget,
          type: type as any,
          depositType: depositType as any,
          deadline: finalRows[finalRows.length - 1].month + "-01",
          status: "ACTIVE",
          plans: finalRows.map(r => ({
            month: r.month,
            amount: r.amount,
            salary: r.salary,
            expenses: r.expenses,
            remark: r.remark,
            status: r.status ?? "PENDING",
            proofImage: r.proofImage ?? "",
          })),
          planConfig: {
            expenseColumns,
            startMonth,
            duration
          } as any
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoChange = (setter: any, value: any) => {
    setter(value);
    setIsDirty(true);
    setRows([]); // Reset rows when basic info changes to force re-initialization
  };

  const handleTableWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container) return;
    if (e.shiftKey || e.deltaX !== 0) {
      e.preventDefault();
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      container.scrollLeft += delta;
    }
  };

  const handleProofUpload = (index: number, file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushToast("请上传图片文件");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) return;
      handleRowChange(index, "proofImage", value);
    };
    reader.readAsDataURL(file);
  };

  const handleProofDragOver = (rowId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverProofId(rowId);
  };

  const handleProofDrop = (index: number, rowId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverProofId(null);
    const file = e.dataTransfer.files?.[0];
    handleProofUpload(index, file);
  };

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheetContent className={clsx("transition-all duration-300 flex flex-col", step === 2 ? "h-[85vh]" : "")} hideClose>
        <BottomSheetHeader>
          <BottomSheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
              {step === 1 ? <Wallet className="h-5 w-5" /> : <PiggyBank className="h-5 w-5" />}
            </div>
            {step === 1 ? "新建储蓄目标" : `制定计划 - ${name}`}
          </BottomSheetTitle>
          <BottomSheetDescription>
            {step === 1 ? "填写目标基础信息并进入逐月计划表。" : "按月份逐行编辑计划与金额。"}
          </BottomSheetDescription>
        </BottomSheetHeader>

        {step === 1 ? (
          <div className="space-y-3 py-2 overflow-y-auto">
            {/* 目标名称 */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <label className="text-sm font-medium text-gray-700">目标名称</label>
              <Input
                required
                placeholder="例如：买房首付"
                value={name}
                onChange={(e) => handleBasicInfoChange(setName, e.target.value)}
                className="h-10 bg-white border-gray-200 rounded-lg"
              />
            </div>

            {/* 存钱模式和资金性质 */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">存钱模式</label>
                  <Select value={type} onValueChange={(val) => handleBasicInfoChange(setType, val)}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">每月存</SelectItem>
                      <SelectItem value="BI_MONTHLY_ODD">隔月存 (单月)</SelectItem>
                      <SelectItem value="BI_MONTHLY_EVEN">隔月存 (双月)</SelectItem>
                      <SelectItem value="YEARLY">年度目标</SelectItem>
                      <SelectItem value="LONG_TERM">长期目标</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">资金性质</label>
                  <Select value={depositType} onValueChange={(val) => handleBasicInfoChange(setDepositType, val)}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">现金</SelectItem>
                      <SelectItem value="FIXED_TERM">死期存款</SelectItem>
                      <SelectItem value="HELP_DEPOSIT">他人帮存</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 时间设置 */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">开始月份</label>
                  <Input type="month" value={startMonth} onChange={e => handleBasicInfoChange(setStartMonth, e.target.value)} className="h-10 bg-white border-gray-200 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">持续月数</label>
                  <Input type="number" value={duration} onChange={e => handleBasicInfoChange(setDuration, Number(e.target.value))} className="h-10 bg-white border-gray-200 rounded-lg" />
                </div>
              </div>
            </div>

            <BottomSheetFooter>
              <Button onClick={handleNext} className="w-full h-11 bg-blue-500 hover:bg-blue-600 rounded-lg">
                下一步 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </BottomSheetFooter>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
            {/* Toolbar */}
            <div className="flex justify-between items-center py-2 mb-2">
              <div className="text-sm text-gray-500">
                小提示：修改第一行数据将自动填充后续行，鼠标放在“添加支出列”上面回车即可打开新增列窗口。
              </div>
              {type !== 'MONTHLY' && (
                <Button variant="outline" size="sm" onClick={handleAddColumn} className="flex-shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> 添加支出列
                </Button>
              )}
            </div>

            {/* Table */}
            <div
              ref={tableScrollRef}
              onWheel={handleTableWheel}
              className="flex-1 overflow-auto border rounded-lg bg-white min-h-0"
            >
              <table className="text-sm text-left relative table-auto" style={{ width: "max-content", minWidth: type === 'MONTHLY' ? '100%' : '1400px' }}>
                <thead className="bg-gray-50 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">月份</th>
                    {type !== 'MONTHLY' && (
                      <>
                        <th className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap">月薪</th>
                        {expenseColumns.map(col => (
                          <th key={col.id} className="p-3 min-w-[140px] w-[140px] whitespace-nowrap group relative">
                            <div className="flex items-center justify-between">
                              {col.name}
                              <button 
                                onClick={() => setExpenseColumns(expenseColumns.filter(c => c.id !== col.id))}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="p-3 text-center min-w-[80px] w-[80px] text-gray-500 whitespace-nowrap">本月结余</th>
                        <th className="p-3 text-center min-w-[80px] w-[80px] text-blue-600 font-bold whitespace-nowrap">可存金额</th>
                      </>
                    )}
                    <th className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap">计划存款</th>
                    {type !== 'MONTHLY' && (
                      <th className="p-3 text-center min-w-[80px] w-[80px] text-purple-600 whitespace-nowrap">下月结余</th>
                    )}
                    <th className="p-3 text-center min-w-[100px] w-[100px] whitespace-nowrap">状态</th>
                    <th className="p-3 text-center min-w-[180px] w-[180px] whitespace-nowrap">打卡凭证</th>
                    <th className="p-3 text-center min-w-[200px]">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayRows.map((row) => {
                    const sourceIndex = rows.findIndex((r) => r.id === row.id);
                    return (
                    <tr
                      key={row.id}
                      className={clsx(
                        "hover:bg-gray-50/50 transition-colors h-4",
                        sourceIndex === 0 && "bg-blue-50/30",
                        row.month === currentMonth && "ring-1 ring-blue-200"
                      )}
                    >
                      <td className="p-2 text-center min-w-[80px] w-[80px] whitespace-nowrap align-middle text-center font-medium text-gray-900 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-gray-50/50">{row.month.replace("-", "/")}</td>
                      {type !== 'MONTHLY' && (
                        <>
                          <td className="p-2 text-center min-w-[80px] w-[80px] whitespace-nowrap align-middle">
                            <input
                              type="number"
                              className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-all text-center"
                              value={row.salary || ""}
                              placeholder="0"
                              onChange={e => handleRowChange(sourceIndex, 'salary', e.target.value)}
                            />
                          </td>
                          {expenseColumns.map(col => (
                            <td key={col.id} className="p-2 min-w-[140px] w-[140px] whitespace-nowrap align-middle">
                              <input
                                type="number"
                                className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-all text-center"
                                value={row.expenses[col.name] || ""}
                                placeholder="0"
                                onChange={e => handleRowChange(sourceIndex, col.name, e.target.value, true)}
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center min-w-[80px] w-[80px] whitespace-nowrap align-middle text-gray-500">¥{row.balance?.toLocaleString()}</td>
                          <td className="p-2 text-center min-w-[80px] w-[80px] whitespace-nowrap align-middle text-blue-600 font-medium">¥{row.totalAvailable?.toLocaleString()}</td>
                        </>
                      )}
                      <td className="p-2 text-center min-w-[80px] w-[80px] whitespace-nowrap align-middle">
                        <input
                          type="number"
                          className="w-full bg-transparent font-bold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-all text-gray-900"
                          value={row.amount || ""}
                          placeholder="0"
                          onChange={e => handleRowChange(sourceIndex, 'amount', e.target.value)}
                        />
                      </td>
                      {type !== 'MONTHLY' && (
                        <td className="p-2 text-center min-w-[80px] w-[80px] whitespace-nowrap align-middle text-purple-600 font-medium">¥{row.finalBalance?.toLocaleString()}</td>
                      )}
                      <td className="p-2 text-center min-w-[100px] w-[100px] whitespace-nowrap align-middle">
                        <button
                          onClick={() => handleRowChange(sourceIndex, "status", row.status === "COMPLETED" ? "PENDING" : "COMPLETED")}
                          className={clsx(
                            "px-2 py-1 rounded text-xs font-medium",
                            row.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {row.status === "COMPLETED" ? "已存款" : "未存款"}
                        </button>
                      </td>
                      <td className="p-2 text-center min-w-[180px] w-[180px] align-middle">
                        <div
                          className={clsx(
                            "rounded-md border border-dashed p-2 transition-colors",
                            dragOverProofId === row.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50/50"
                          )}
                          onDragOver={(e) => handleProofDragOver(row.id, e)}
                          onDragLeave={() => setDragOverProofId(null)}
                          onDrop={(e) => handleProofDrop(sourceIndex, row.id, e)}
                        >
                          <div className="flex items-center gap-2">
                            <label htmlFor={`proof-${row.id}`} className="inline-flex items-center gap-2 cursor-pointer">
                              <span className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-700">上传</span>
                            </label>
                            <span className="text-[11px] text-gray-400">或拖入图片</span>
                            <input
                              id={`proof-${row.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleProofUpload(sourceIndex, e.target.files?.[0])}
                            />
                          </div>
                          {row.proofImage ? (
                            <div className="mt-2 space-y-1">
                              <img
                                src={row.proofImage}
                                alt="打卡凭证"
                                className="w-14 h-14 rounded object-cover border"
                              />
                              <button
                                className="block text-xs text-blue-600 hover:underline"
                                onClick={() => window.open(row.proofImage, "_blank")}
                              >
                                查看大图
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-2 text-center align-middle">
                        <input
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-gray-500"
                          value={row.remark}
                          placeholder="备注..."
                          onChange={e => handleRowChange(sourceIndex, 'remark', e.target.value)}
                        />
                      </td>
                    </tr>
                  )})}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50/80 border-t-2 border-amber-200 font-semibold">
                    <td className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap sticky left-0 bg-amber-50/80 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">汇总</td>
                    {type !== 'MONTHLY' && (
                      <>
                        <td className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap text-gray-900">¥{summary.totalSalary.toLocaleString()}</td>
                        {expenseColumns.map(col => (
                          <td key={`sum-${col.id}`} className="p-3 min-w-[140px] w-[140px] whitespace-nowrap text-gray-700">¥{(summary.expenseTotals[col.name] || 0).toLocaleString()}</td>
                        ))}
                        <td className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap text-gray-700">¥{summary.totalBalance.toLocaleString()}</td>
                        <td className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap text-blue-700">¥{summary.totalAvailable.toLocaleString()}</td>
                      </>
                    )}
                    <td className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap text-gray-900">¥{summary.totalAmount.toLocaleString()}</td>
                    {type !== 'MONTHLY' && (
                      <td className="p-3 text-center min-w-[80px] w-[80px] whitespace-nowrap text-purple-700">¥{summary.endingBalance.toLocaleString()}</td>
                    )}
                    <td className="p-3 text-center min-w-[100px] w-[100px]"></td>
                    <td className="p-3 text-center min-w-[180px] w-[180px]"></td>
                    <td className="p-3 text-center min-w-[200px] whitespace-nowrap text-gray-600">{finalRows.length}个月</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <BottomSheetFooter className="pt-4 border-t mt-auto flex-row justify-between">
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-lg h-11">上一步</Button>
              )}
              <Button onClick={handleSubmit} disabled={loading} className="rounded-lg h-11 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {initialData ? "保存计划" : "确认创建"}
              </Button>
            </BottomSheetFooter>
          </div>
        )}
      </BottomSheetContent>
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="max-w-sm rounded-lg bg-black text-white text-sm px-4 py-3 shadow-lg">
            {toast.message}
          </div>
        ))}
      </div>

      {ConfirmDialog}
    </BottomSheet>
  );
}
