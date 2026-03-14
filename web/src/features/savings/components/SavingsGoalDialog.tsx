import { useState, useEffect, useMemo, useRef } from "react";
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
import { Loader2, CalendarIcon, PiggyBank, Wallet, Plus, Trash2, ArrowRight } from "lucide-react";
import { SavingsGoal } from "./themes/DefaultSavings";
import { clsx } from "clsx";

interface SavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SavingsGoal | null;
  onSave: (data: Partial<SavingsGoal> & { plans?: any[], planConfig?: any }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

type PlanRow = {
  id: string;
  month: string; // YYYY-MM
  salary: number;
  expenses: Record<string, number>; // dynamic columns
  amount: number; // deposit amount
  remark: string;
  // Computed
  balance?: number; // current month remaining
  carryOver?: number; // from previous month
  totalAvailable?: number;
  finalBalance?: number; // carry to next month
};

export function SavingsGoalDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSave,
  onDelete 
}: SavingsGoalDialogProps) {
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

  // Reset or Load data when dialog opens
  useEffect(() => {
    if (open) {
      setIsDirty(false);
      setStep(1);
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setDepositType(initialData.depositType);
        // Loading existing plans is complex, skipping for simplicity in this "Create" focus
        // Assuming Edit mode just edits basic info or redirects to Plan Management
      } else {
        // Reset for create mode
        setName("");
        setType("MONTHLY");
        setDepositType("CASH");
        setStartMonth(new Date().toISOString().slice(0, 7));
        setDuration(12);
        setExpenseColumns([{ id: "exp1", name: "固定支出1" }]);
        setRows([]);
      }
    }
  }, [open, initialData]);

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
        remark: ""
      });
    }
    setRows(newRows);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty) {
      if (confirm("您有未保存的内容，确定要关闭吗？")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(newOpen);
    }
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
      
      await onSave({
        name,
        targetAmount: totalTarget,
        type: type as any,
        depositType: depositType as any,
        deadline: finalRows[finalRows.length - 1].month + "-01", // Approx
        status: "ACTIVE",
        plans: finalRows.map(r => ({
          month: r.month,
          amount: r.amount,
          salary: r.salary,
          expenses: r.expenses,
          remark: r.remark,
          status: "PENDING"
        })),
        planConfig: {
          expenseColumns,
          startMonth,
          duration
        } as any
      });
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={clsx("transition-all duration-300", step === 2 ? "sm:max-w-[1000px] h-[80vh] flex flex-col" : "sm:max-w-[500px]")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
              {step === 1 ? <Wallet className="h-5 w-5" /> : <PiggyBank className="h-5 w-5" />}
            </div>
            {step === 1 ? "新建储蓄目标" : `制定计划 - ${name}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">目标名称</label>
              <Input
                required
                placeholder="例如：买房首付"
                value={name}
                onChange={(e) => handleBasicInfoChange(setName, e.target.value)}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">存钱模式</label>
                <Select value={type} onValueChange={(val) => handleBasicInfoChange(setType, val)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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
                <Select value={depositType} onValueChange={(val) => handleBasicInfoChange(setDepositType, val)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">现金</SelectItem>
                    <SelectItem value="FIXED_TERM">死期存款</SelectItem>
                    <SelectItem value="HELP_DEPOSIT">他人帮存</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">开始月份</label>
                <Input type="month" value={startMonth} onChange={e => handleBasicInfoChange(setStartMonth, e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">持续月数</label>
                <Input type="number" value={duration} onChange={e => handleBasicInfoChange(setDuration, Number(e.target.value))} className="h-11" />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleNext} className="w-full">
                下一步 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex justify-between items-center py-2 mb-2">
              <div className="text-sm text-gray-500">
                提示：修改第一行数据将自动填充后续行
              </div>
              {type !== 'MONTHLY' && (
                <Button variant="outline" size="sm" onClick={handleAddColumn}>
                  <Plus className="h-4 w-4 mr-2" /> 添加支出列
                </Button>
              )}
            </div>

            {/* Table */}
            <div
              ref={tableScrollRef}
              onWheel={handleTableWheel}
              className="flex-1 overflow-auto border rounded-lg bg-white"
            >
              <table className="text-sm text-left relative table-auto" style={{ width: "max-content", minWidth: type === 'MONTHLY' ? '100%' : '1400px' }}>
                <thead className="bg-gray-50 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 min-w-[120px] w-[120px] whitespace-nowrap sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">月份</th>
                    {type !== 'MONTHLY' && (
                      <>
                        <th className="p-3 min-w-[120px] w-[120px] whitespace-nowrap">月薪</th>
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
                        <th className="p-3 min-w-[120px] w-[120px] text-gray-500 whitespace-nowrap">本月结余</th>
                        <th className="p-3 min-w-[120px] w-[120px] text-blue-600 font-bold whitespace-nowrap">可存金额</th>
                      </>
                    )}
                    <th className="p-3 min-w-[120px] w-[120px] whitespace-nowrap">计划存款</th>
                    {type !== 'MONTHLY' && (
                      <th className="p-3 min-w-[120px] w-[120px] text-purple-600 whitespace-nowrap">下月结余</th>
                    )}
                    <th className="p-3 min-w-[200px]">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {finalRows.map((row, idx) => (
                    <tr key={row.id} className={clsx("hover:bg-gray-50/50 transition-colors", idx === 0 && "bg-blue-50/30")}>
                      <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap font-medium text-gray-900 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-gray-50/50">{row.month.replace("-", "/")}</td>
                      {type !== 'MONTHLY' && (
                        <>
                          <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap">
                            <input
                              type="number"
                              className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-all"
                              value={row.salary || ""}
                              placeholder="0"
                              onChange={e => handleRowChange(idx, 'salary', e.target.value)}
                            />
                          </td>
                          {expenseColumns.map(col => (
                            <td key={col.id} className="p-3 min-w-[140px] w-[140px] whitespace-nowrap">
                              <input
                                type="number"
                                className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-all"
                                value={row.expenses[col.name] || ""}
                                placeholder="0"
                                onChange={e => handleRowChange(idx, col.name, e.target.value, true)}
                              />
                            </td>
                          ))}
                          <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-gray-500">¥{row.balance?.toLocaleString()}</td>
                          <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-blue-600 font-medium">¥{row.totalAvailable?.toLocaleString()}</td>
                        </>
                      )}
                      <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap">
                        <input
                          type="number"
                          className="w-full bg-transparent font-bold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-all text-gray-900"
                          value={row.amount || ""}
                          placeholder="0"
                          onChange={e => handleRowChange(idx, 'amount', e.target.value)}
                        />
                      </td>
                      {type !== 'MONTHLY' && (
                        <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-purple-600 font-medium">¥{row.finalBalance?.toLocaleString()}</td>
                      )}
                      <td className="p-3">
                        <input
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-gray-500"
                          value={row.remark}
                          placeholder="备注..."
                          onChange={e => handleRowChange(idx, 'remark', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50/80 border-t-2 border-amber-200 font-semibold">
                    <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap sticky left-0 bg-amber-50/80 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">汇总</td>
                    {type !== 'MONTHLY' && (
                      <>
                        <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-gray-900">¥{summary.totalSalary.toLocaleString()}</td>
                        {expenseColumns.map(col => (
                          <td key={`sum-${col.id}`} className="p-3 min-w-[140px] w-[140px] whitespace-nowrap text-gray-700">¥{(summary.expenseTotals[col.name] || 0).toLocaleString()}</td>
                        ))}
                        <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-gray-700">¥{summary.totalBalance.toLocaleString()}</td>
                        <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-blue-700">¥{summary.totalAvailable.toLocaleString()}</td>
                      </>
                    )}
                    <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-gray-900">¥{summary.totalAmount.toLocaleString()}</td>
                    {type !== 'MONTHLY' && (
                      <td className="p-3 min-w-[120px] w-[120px] whitespace-nowrap text-purple-700">¥{summary.endingBalance.toLocaleString()}</td>
                    )}
                    <td className="p-3 min-w-[200px] whitespace-nowrap text-gray-600">{finalRows.length}个月</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <DialogFooter className="pt-4 border-t mt-auto">
              <Button variant="ghost" onClick={() => setStep(1)}>上一步</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                确认创建
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
