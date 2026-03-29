import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, PiggyBank, Plus, Trash2, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeActionBar, ThemeDialogSection, ThemeFormField, ThemeFormGrid, ThemeTable, ThemeToolbar } from "@/components/shared/theme-primitives";
import { addMonthsToMonthKey, getLocalMonthKey } from "./month-utils";
import { getSavingsAssetSyncConfig } from "../plan-config";
import type { Asset, SavingsPlanConfig } from "@/types";
import type { SavingsGoal } from "./themes/DefaultSavings";

type PlanStatus = "PENDING" | "COMPLETED" | "SKIPPED";

type PlanPayload = {
  month: string;
  amount: number;
  salary: number;
  expenses: Record<string, number>;
  remark: string;
  status: PlanStatus;
  proofImage?: string;
};

type StoredPlan = PlanPayload & {
  id: string;
  updatedAt?: string;
};

type ExpenseColumn = {
  id: string;
  name: string;
};

type PlanRow = StoredPlan & {
  balance?: number;
  carryOver?: number;
  totalAvailable?: number;
  finalBalance?: number;
};

type GoalPlanConfig = SavingsPlanConfig & {
  expenseColumns: ExpenseColumn[];
  startMonth: string;
  duration: number;
};

const NONE_ASSET_VALUE = "__none__";

interface SavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SavingsGoal | null;
  onSave: (data: Partial<SavingsGoal> & { plans?: PlanPayload[]; planConfig?: GoalPlanConfig }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  defaultStep?: 1 | 2;
  onDataChanged?: () => void;
}

function createRow(month: string): PlanRow {
  return {
    id: Math.random().toString(36).slice(2, 11),
    month,
    salary: 0,
    expenses: {},
    amount: 0,
    remark: "",
    status: "PENDING",
    proofImage: "",
  };
}

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
  const [name, setName] = useState("");
  const [type, setType] = useState<SavingsGoal["type"]>("MONTHLY");
  const [depositType, setDepositType] = useState<SavingsGoal["depositType"]>("CASH");
  const [startMonth, setStartMonth] = useState(getLocalMonthKey());
  const [duration, setDuration] = useState(12);
  const [expenseColumns, setExpenseColumns] = useState<ExpenseColumn[]>([{ id: "exp1", name: "固定支出1" }]);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(getLocalMonthKey());
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);
  const [dragOverProofId, setDragOverProofId] = useState<string | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const pushToast = useCallback((message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const buildRows = useCallback((month: string, count: number) => {
    return Array.from({ length: count }, (_, index) => createRow(addMonthsToMonthKey(month, index)));
  }, []);

  const loadExistingPlans = useCallback(async (goalId: string) => {
    const response = await apiFetch<{ items: StoredPlan[] }>(`/api/savings/${goalId}/plans`);
    const items = response.items ?? [];
    if (items.length === 0) return null;

    const columnNames = Array.from(new Set(items.flatMap((plan) => Object.keys(plan.expenses ?? {}))));
    return {
      columns: columnNames.length > 0 ? columnNames.map((columnName, index) => ({ id: `exp${index + 1}`, name: columnName })) : [{ id: "exp1", name: "固定支出1" }],
      rows: items.map((plan) => ({
        ...plan,
        salary: Number(plan.salary ?? 0),
        amount: Number(plan.amount ?? 0),
        expenses: plan.expenses ?? {},
        remark: plan.remark ?? "",
        status: plan.status ?? "PENDING",
        proofImage: plan.proofImage ?? "",
      })),
      startMonth: items[0].month,
      duration: items.length,
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function initialize() {
      setIsDirty(false);
      setStep(defaultStep);

      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setDepositType(initialData.depositType);
        setStartMonth(getLocalMonthKey());
        setDuration(12);
        setExpenseColumns([{ id: "exp1", name: "固定支出1" }]);
        setRows([]);

        if (defaultStep === 2) {
          try {
            const loaded = await loadExistingPlans(initialData.id);
            if (!active) return;
            if (loaded) {
              setExpenseColumns(loaded.columns);
              setRows(loaded.rows);
              setStartMonth(loaded.startMonth);
              setDuration(loaded.duration);
            } else {
              setRows(buildRows(getLocalMonthKey(), 12));
            }
          } catch {
            if (active) {
              setRows(buildRows(getLocalMonthKey(), 12));
            }
          }
        }
      } else {
        const defaultMonth = getLocalMonthKey();
        setName("");
        setType("MONTHLY");
        setDepositType("CASH");
        setStartMonth(defaultMonth);
        setDuration(12);
        setExpenseColumns([{ id: "exp1", name: "固定支出1" }]);
        setRows([]);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [open, initialData, defaultStep, buildRows, loadExistingPlans]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      setCurrentMonth(getLocalMonthKey());
    }, 60000);
    return () => window.clearInterval(timer);
  }, [open]);

  const calculatedRows = useMemo(() => {
    let carryOver = 0;
    return rows.map((row) => {
      const totalExpenses = Object.values(row.expenses).reduce((sum, value) => sum + Number(value), 0);
      const currentBalance = Number(row.salary) - totalExpenses;
      const totalAvailable = currentBalance + carryOver;
      const finalBalance = totalAvailable - Number(row.amount);
      const nextCarryOver = finalBalance;

      const result: PlanRow = {
        ...row,
        balance: currentBalance,
        carryOver,
        totalAvailable,
        finalBalance,
      };

      carryOver = nextCarryOver;
      return result;
    });
  }, [rows]);

  const summary = useMemo(() => {
    const expenseTotals = expenseColumns.reduce<Record<string, number>>((accumulator, column) => {
      accumulator[column.name] = calculatedRows.reduce((sum, row) => sum + Number(row.expenses?.[column.name] || 0), 0);
      return accumulator;
    }, {});

    return {
      totalAmount: calculatedRows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
      totalSalary: calculatedRows.reduce((sum, row) => sum + Number(row.salary || 0), 0),
      totalBalance: calculatedRows.reduce((sum, row) => sum + Number(row.balance || 0), 0),
      totalAvailable: calculatedRows.reduce((sum, row) => sum + Number(row.totalAvailable || 0), 0),
      endingBalance: calculatedRows.length > 0 ? Number(calculatedRows[calculatedRows.length - 1].finalBalance || 0) : 0,
      expenseTotals,
    };
  }, [calculatedRows, expenseColumns]);

  useEffect(() => {
    if (!open || step !== 2 || !initialData) return;
    const depositRows = calculatedRows.filter((row) => Number(row.amount) > 0);
    const previousUncompleted = depositRows.filter((row) => row.month < currentMonth && row.status !== "COMPLETED").sort((a, b) => b.month.localeCompare(a.month))[0];
    if (previousUncompleted) {
      pushToast(`提醒：${previousUncompleted.month.replace("-", "/")} 的计划存款尚未打卡`);
    }
  }, [open, step, initialData, calculatedRows, currentMonth, pushToast]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen || !isDirty) {
        onOpenChange(nextOpen);
        return;
      }

      confirm({
        title: "确认关闭",
        description: "当前有未保存内容，确定要关闭吗？",
        onConfirm: () => onOpenChange(false),
      });
    },
    [confirm, isDirty, onOpenChange]
  );

  const ensureRowsLoaded = useCallback(async () => {
    if (rows.length > 0) return;

    if (initialData) {
      const loaded = await loadExistingPlans(initialData.id);
      if (loaded) {
        setExpenseColumns(loaded.columns);
        setRows(loaded.rows);
        setStartMonth(loaded.startMonth);
        setDuration(loaded.duration);
        return;
      }
    }

    setRows(buildRows(startMonth, duration));
  }, [rows.length, initialData, loadExistingPlans, buildRows, startMonth, duration]);

  const handleNext = async () => {
    if (!name.trim()) return;
    await ensureRowsLoaded();
    setStep(2);
  };

  const updateRow = (index: number, updates: Partial<PlanRow>) => {
    setIsDirty(true);
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...updates } : row)));
  };

  const updateExpense = (index: number, expenseKey: string, value: number) => {
    setIsDirty(true);
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, expenses: { ...row.expenses, [expenseKey]: value } } : row
      )
    );
  };

  const handleBasicInfoChange = (field: "name" | "type" | "depositType" | "startMonth" | "duration", value: string | number) => {
    setIsDirty(true);
    setRows([]);
    if (field === "name") setName(String(value));
    if (field === "type") setType(value as SavingsGoal["type"]);
    if (field === "depositType") setDepositType(value as SavingsGoal["depositType"]);
    if (field === "startMonth") setStartMonth(String(value));
    if (field === "duration") setDuration(Number(value));
  };

  const handleProofUpload = (index: number, file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      pushToast("请上传图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) return;
      updateRow(index, { proofImage: value });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const plans: PlanPayload[] = calculatedRows.map((row) => ({
        month: row.month,
        amount: Number(row.amount),
        salary: Number(row.salary),
        expenses: row.expenses,
        remark: row.remark,
        status: row.status ?? "PENDING",
        proofImage: row.proofImage ?? "",
      }));

      const planConfig: GoalPlanConfig = {
        expenseColumns,
        startMonth,
        duration,
      };

      const payload: Partial<SavingsGoal> & { plans?: PlanPayload[]; planConfig?: GoalPlanConfig } = {
        name,
        type,
        depositType,
        targetAmount: plans.reduce((sum, plan) => sum + Number(plan.amount), 0),
        status: "ACTIVE",
      };

      if (!initialData) {
        payload.plans = plans;
        payload.planConfig = planConfig;
      }

      await onSave(payload);

      if (initialData) {
        await apiFetch(`/api/savings/${initialData.id}/plans/batch`, {
          method: "POST",
          body: JSON.stringify({
            plans,
            config: planConfig,
          }),
        });
        onDataChanged?.();
      }

      onOpenChange(false);
    } catch (submitError) {
      console.error(submitError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!initialData || !onDelete) return;
    const shouldDelete = await new Promise<boolean>((resolve) => {
      confirm({
        title: "确认删除",
        description: "删除后目标及其计划将无法恢复。",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!shouldDelete) return;
    await onDelete(initialData.id);
  };

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheetContent
        className={cn(
          "flex flex-col transition-all duration-300",
          step === 2 ? "h-[85vh] max-w-[1040px] xl:max-w-[1120px]" : ""
        )}
        hideClose
      >
        <BottomSheetHeader>
          <BottomSheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="rounded-full bg-blue-50 p-2 text-blue-600">{step === 1 ? <Wallet className="h-5 w-5" /> : <PiggyBank className="h-5 w-5" />}</div>
            {step === 1 ? "新建储蓄目标" : `制定计划 - ${name}`}
          </BottomSheetTitle>
          <BottomSheetDescription className="text-sm leading-6">{step === 1 ? "填写目标基础信息并进入逐月计划表。" : "按月份逐行编辑计划与金额。"}</BottomSheetDescription>
        </BottomSheetHeader>

        {step === 1 ? (
          <div className="space-y-3 overflow-y-auto py-2">
            <ThemeDialogSection className="space-y-4">
              <ThemeFormField label="目标名称">
                <Input required placeholder="例如：买房首付" value={name} onChange={(event) => handleBasicInfoChange("name", event.target.value)} className="h-10 rounded-lg bg-white" />
              </ThemeFormField>
            </ThemeDialogSection>

            <ThemeDialogSection className="space-y-4">
              <ThemeFormGrid>
                <ThemeFormField label="存钱模式" labelClassName="text-sm text-slate-500">
                  <Select value={type} onValueChange={(value) => handleBasicInfoChange("type", value)}>
                    <SelectTrigger className="h-10 rounded-lg bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">每月存</SelectItem>
                      <SelectItem value="BI_MONTHLY_ODD">隔月存(单月)</SelectItem>
                      <SelectItem value="BI_MONTHLY_EVEN">隔月存(双月)</SelectItem>
                      <SelectItem value="YEARLY">年度目标</SelectItem>
                      <SelectItem value="LONG_TERM">长期目标</SelectItem>
                    </SelectContent>
                  </Select>
                </ThemeFormField>
                <ThemeFormField label="资金性质" labelClassName="text-sm text-slate-500">
                  <Select value={depositType} onValueChange={(value) => handleBasicInfoChange("depositType", value)}>
                    <SelectTrigger className="h-10 rounded-lg bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">现金</SelectItem>
                      <SelectItem value="FIXED_TERM">定期存款</SelectItem>
                      <SelectItem value="HELP_DEPOSIT">他人帮存</SelectItem>
                    </SelectContent>
                  </Select>
                </ThemeFormField>
              </ThemeFormGrid>
            </ThemeDialogSection>

            <ThemeDialogSection className="space-y-4">
              <ThemeFormGrid>
                <ThemeFormField label="开始月份" labelClassName="text-sm text-slate-500">
                  <Input type="month" value={startMonth} onChange={(event) => handleBasicInfoChange("startMonth", event.target.value)} className="h-10 rounded-lg bg-white" />
                </ThemeFormField>
                <ThemeFormField label="持续月数" labelClassName="text-sm text-slate-500">
                  <Input type="number" value={duration} onChange={(event) => handleBasicInfoChange("duration", Number(event.target.value))} className="h-10 rounded-lg bg-white" />
                </ThemeFormField>
              </ThemeFormGrid>
            </ThemeDialogSection>

            <ThemeActionBar className="justify-between">
              {initialData && onDelete ? (
                <Button type="button" variant="outline" className="rounded-lg text-red-600" onClick={() => void handleDeleteGoal()}>
                  删除目标
                </Button>
              ) : (
                <span />
              )}
              <Button onClick={handleNext} className="h-11 rounded-lg bg-blue-500 hover:bg-blue-600">
                下一步
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </ThemeActionBar>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ThemeToolbar className="mb-3 justify-between">
              <div className="text-base text-slate-500">提示：修改第一行数据可作为后续月份的参考模板。当前共 {calculatedRows.length} 个月，可滚动查看完整计划。</div>
              {type !== "MONTHLY" ? (
                <Button variant="outline" size="sm" className="h-10 rounded-xl px-4 text-sm font-medium" onClick={() => {
                  const nextName = prompt("请输入列名(如：房租)");
                  if (!nextName) return;
                  setExpenseColumns((current) => [...current, { id: Math.random().toString(36).slice(2, 7), name: nextName }]);
                  setIsDirty(true);
                }}>
                  <Plus className="mr-1 h-4 w-4" />
                  添加支出列
                </Button>
              ) : null}
            </ThemeToolbar>

            <ThemeTable className="flex min-h-0 flex-1 flex-col">
              <div ref={tableScrollRef} className="min-h-0 flex-1 overflow-auto">
                <table className="relative table-auto text-left text-base" style={{ width: "max-content", minWidth: type === "MONTHLY" ? "100%" : "1400px" }}>
                  <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 shadow-sm">
                    <tr>
                      <th className="sticky left-0 z-20 min-w-[80px] whitespace-nowrap bg-slate-50 p-3 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">月份</th>
                      {type !== "MONTHLY" ? (
                        <>
                          <th className="min-w-[80px] whitespace-nowrap p-3 text-center">月薪</th>
                          {expenseColumns.map((column) => (
                            <th key={column.id} className="group relative min-w-[140px] whitespace-nowrap p-3">
                              <div className="flex items-center justify-between">
                                {column.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpenseColumns((current) => current.filter((item) => item.id !== column.id));
                                    setRows((current) =>
                                      current.map((row) => {
                                        const nextExpenses = { ...row.expenses };
                                        delete nextExpenses[column.name];
                                        return { ...row, expenses: nextExpenses };
                                      })
                                    );
                                  }}
                                  className="opacity-0 transition group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </th>
                          ))}
                          <th className="min-w-[80px] whitespace-nowrap p-3 text-center text-slate-500">本月结余</th>
                          <th className="min-w-[80px] whitespace-nowrap p-3 text-center font-bold text-blue-600">可存金额</th>
                        </>
                      ) : null}
                      <th className="min-w-[80px] whitespace-nowrap p-3 text-center">计划存款</th>
                      {type !== "MONTHLY" ? <th className="min-w-[80px] whitespace-nowrap p-3 text-center text-purple-600">下月结余</th> : null}
                      <th className="min-w-[100px] whitespace-nowrap p-3 text-center">状态</th>
                      <th className="min-w-[180px] whitespace-nowrap p-3 text-center">打卡凭证</th>
                      <th className="min-w-[200px] p-3 text-center">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {calculatedRows.map((row, index) => (
                      <tr key={row.id} className={cn("transition-colors hover:bg-slate-50/50", index === 0 && "bg-blue-50/30", row.month === currentMonth && "ring-1 ring-blue-200")}>
                        <td className="sticky left-0 z-10 whitespace-nowrap bg-white p-2 text-center font-medium text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          {row.month.replace("-", "/")}
                        </td>
                        {type !== "MONTHLY" ? (
                          <>
                            <td className="p-2 text-center">
                              <input type="number" className="w-full border-b border-transparent bg-transparent text-center outline-none transition hover:border-slate-300 focus:border-blue-500" value={row.salary || ""} placeholder="0" onChange={(event) => updateRow(index, { salary: Number(event.target.value) })} />
                            </td>
                            {expenseColumns.map((column) => (
                              <td key={column.id} className="p-2">
                                <input type="number" className="w-full border-b border-transparent bg-transparent text-center outline-none transition hover:border-slate-300 focus:border-blue-500" value={row.expenses[column.name] || ""} placeholder="0" onChange={(event) => updateExpense(index, column.name, Number(event.target.value))} />
                              </td>
                            ))}
                            <td className="p-2 text-center text-slate-500">¥{row.balance?.toLocaleString()}</td>
                            <td className="p-2 text-center font-medium text-blue-600">¥{row.totalAvailable?.toLocaleString()}</td>
                          </>
                        ) : null}
                        <td className="p-2 text-center">
                          <input type="number" className="w-full border-b border-transparent bg-transparent text-center font-bold text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500" value={row.amount || ""} placeholder="0" onChange={(event) => updateRow(index, { amount: Number(event.target.value) })} />
                        </td>
                        {type !== "MONTHLY" ? <td className="p-2 text-center font-medium text-purple-600">¥{row.finalBalance?.toLocaleString()}</td> : null}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => updateRow(index, { status: row.status === "COMPLETED" ? "PENDING" : "COMPLETED" })}
                            className={cn("rounded-lg px-3 py-2 text-sm font-medium", row.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}
                          >
                            {row.status === "COMPLETED" ? "已存款" : "未存款"}
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <div
                            className={cn(
                              "flex min-h-10 items-center justify-center gap-2 rounded-md border border-dashed px-2 py-1.5 transition-colors",
                              dragOverProofId === row.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50/60"
                            )}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setDragOverProofId(row.id);
                            }}
                            onDragLeave={() => setDragOverProofId(null)}
                            onDrop={(event) => {
                              event.preventDefault();
                              setDragOverProofId(null);
                              handleProofUpload(index, event.dataTransfer.files?.[0]);
                            }}
                          >
                            <label htmlFor={`proof-${row.id}`} className="inline-flex cursor-pointer items-center">
                              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">上传</span>
                            </label>
                            <input id={`proof-${row.id}`} type="file" accept="image/*" className="hidden" onChange={(event) => handleProofUpload(index, event.target.files?.[0])} />
                            {row.proofImage ? (
                              <>
                                <Image src={row.proofImage} alt="打卡凭证" width={32} height={32} unoptimized className="h-8 w-8 rounded border object-cover" />
                                <button type="button" className="text-xs font-medium text-blue-600 hover:underline" onClick={() => window.open(row.proofImage, "_blank")}>
                                  查看
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">可拖入</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <input className="w-full border-b border-transparent bg-transparent text-slate-500 outline-none transition hover:border-slate-300 focus:border-blue-500" value={row.remark} placeholder="备注..." onChange={(event) => updateRow(index, { remark: event.target.value })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-amber-200 bg-amber-50/80 font-semibold">
                      <td className="sticky left-0 z-20 whitespace-nowrap bg-amber-50/80 p-3 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">汇总</td>
                      {type !== "MONTHLY" ? (
                        <>
                          <td className="p-3 text-center text-slate-900">¥{summary.totalSalary.toLocaleString()}</td>
                          {expenseColumns.map((column) => (
                            <td key={`sum-${column.id}`} className="p-3 whitespace-nowrap text-slate-700">¥{(summary.expenseTotals[column.name] || 0).toLocaleString()}</td>
                          ))}
                          <td className="p-3 text-center text-slate-700">¥{summary.totalBalance.toLocaleString()}</td>
                          <td className="p-3 text-center text-blue-700">¥{summary.totalAvailable.toLocaleString()}</td>
                        </>
                      ) : null}
                      <td className="p-3 text-center text-slate-900">¥{summary.totalAmount.toLocaleString()}</td>
                      {type !== "MONTHLY" ? <td className="p-3 text-center text-purple-700">¥{summary.endingBalance.toLocaleString()}</td> : null}
                      <td className="p-3" />
                      <td className="p-3" />
                      <td className="p-3 whitespace-nowrap text-center text-slate-600">{calculatedRows.length} 个月</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </ThemeTable>

            <ThemeActionBar className="mt-auto justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-lg h-11">
                上一步
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="h-11 rounded-lg bg-green-600 hover:bg-green-700">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {initialData ? "保存计划" : "确认创建"}
              </Button>
            </ThemeActionBar>
          </div>
        )}
      </BottomSheetContent>

      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="max-w-sm rounded-lg bg-black px-4 py-3 text-base text-white shadow-lg">
            {toast.message}
          </div>
        ))}
      </div>

      {ConfirmDialog}
    </BottomSheet>
  );
}
