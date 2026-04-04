"use client";

import { useEffect, useState } from "react";
import type { Loan } from "@/types";
import { apiFetch } from "@/lib/api";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNoticeDialog, usePromptDialog } from "@/components/ui/confirm-dialog";
import dynamic from "next/dynamic";
import { LoansLoadingShell } from "@/features/loans/components/themes/LoansLoadingShell";
import { getCachedLoansData, loadLoansData } from "@/features/loans/data-loader";

const LoansDefaultTheme = dynamic(
  () => import("@/features/loans/components/themes/DefaultLoans").then(mod => mod.LoansDefaultTheme),
  {
    ssr: false,
    loading: () => <LoansLoadingShell />
  }
);
import {
  THEME_DIALOG_INPUT_CLASS,
  THEME_DIALOG_SELECT_CLASS,
  ThemeActionBar,
  ThemeDialogSection,
  ThemeFormField,
  ThemeFormGrid,
  ThemeNotice,
  ThemeTable,
} from "@/components/shared/theme-primitives";

type RepayState = {
  item: Loan | null;
  amount: string;
  description: string;
};

type ScheduleRow = {
  index: number;
  date: string;
  amount: number;
  remaining: number;
};

type ReconcileLoanResult = {
  item: Loan;
  matchedCount: number;
  repaymentCount: number;
  totalRepaid: number;
};

export default function LoansPage() {
  const initialData = getCachedLoansData();
  const { notify, NoticeDialog } = useNoticeDialog();
  const { prompt, PromptDialog } = usePromptDialog();
  const [items, setItems] = useState<Loan[]>(initialData?.items ?? []);
  const [platformData, setPlatformData] = useState(initialData?.platformData ?? []);
  const [paidVsRemainingData, setPaidVsRemainingData] = useState(initialData?.paidVsRemainingData ?? []);
  const [loading, setLoading] = useState(!initialData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Loan | null>(null);
  const [platform, setPlatform] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [periods, setPeriods] = useState("12");
  const [paidPeriods, setPaidPeriods] = useState("0");
  const [monthlyPayment, setMonthlyPayment] = useState("0");
  const [dueDate, setDueDate] = useState("1");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);

  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [reconcileLoadingId, setReconcileLoadingId] = useState<string | null>(null);
  const [repayState, setRepayState] = useState<RepayState>({
    item: null,
    amount: "",
    description: "",
  });

  async function loadItems() {
    const cachedData = getCachedLoansData();
    if (cachedData) {
      setItems(cachedData.items);
      setPlatformData(cachedData.platformData);
      setPaidVsRemainingData(cachedData.paidVsRemainingData);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const nextData = await loadLoansData();
    setItems(nextData.items);
    setPlatformData(nextData.platformData);
    setPaidVsRemainingData(nextData.paidVsRemainingData);
    setLoading(false);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  function resetForm() {
    setPlatform("");
    setTotalAmount("");
    setRemainingAmount("");
    setPeriods("12");
    setPaidPeriods("0");
    setMonthlyPayment("0");
    setDueDate("1");
    setStatus("ACTIVE");
    setError(null);
  }

  function openCreate() {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(item: Loan) {
    setEditingItem(item);
    setPlatform(item.platform);
    setTotalAmount(String(item.totalAmount));
    setRemainingAmount(String(item.remainingAmount));
    setPeriods(String(item.periods));
    setPaidPeriods(String(item.paidPeriods));
    setMonthlyPayment(String(item.monthlyPayment));
    setDueDate(String(item.dueDate));
    setStatus(item.status);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const body = {
        platform,
        totalAmount,
        remainingAmount: remainingAmount || totalAmount,
        periods,
        paidPeriods,
        monthlyPayment,
        dueDate,
        status,
      };

      if (editingItem) {
        await apiFetch(`/api/loans/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/api/loans", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setIsModalOpen(false);
      await loadItems();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
    }
  }

  function openRepay(item: Loan) {
    setRepayState({
      item,
      amount: item.monthlyPayment > 0 ? item.monthlyPayment.toFixed(2) : "",
      description: "",
    });
    setIsRepayOpen(true);
  }

  async function handleRepaySubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!repayState.item) return;

    const amount = Number(repayState.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      notify({
        title: "金额无效",
        description: "还款金额必须大于 0。",
      });
      return;
    }

    try {
      await apiFetch(`/api/loans/${repayState.item.id}/repay`, {
        method: "POST",
        body: JSON.stringify({
          amount,
          description: repayState.description,
          date: new Date().toISOString(),
        }),
      });
      setIsRepayOpen(false);
      await loadItems();
    } catch (repayError) {
      notify({
        title: "登记还款失败",
        description: repayError instanceof Error ? repayError.message : "请稍后重试。",
      });
    }
  }

  async function handleReconcile(item: Loan) {
    setReconcileLoadingId(item.id);
    try {
      const result = await apiFetch<ReconcileLoanResult>(`/api/loans/${item.id}/reconcile`, {
        method: "POST",
      });
      notify({
        title: result.matchedCount > 0 ? "历史还款已匹配" : "未发现可匹配记录",
        description:
          result.matchedCount > 0
            ? `新关联 ${result.matchedCount} 条历史还款，累计识别 ${result.repaymentCount} 条，还款总额 ¥${result.totalRepaid.toFixed(2)}。`
            : "当前账户下没有识别到可回溯到这笔贷款的历史还款记录。",
      });
      await loadItems();
    } catch (reconcileError) {
      notify({
        title: "扫描历史还款失败",
        description: reconcileError instanceof Error ? reconcileError.message : "请稍后重试。",
      });
    } finally {
      setReconcileLoadingId(null);
    }
  }

  function openSchedule(item: Loan) {
    setScheduleItem(item);

    const list: ScheduleRow[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let year = currentYear;
    let month = currentDay <= item.dueDate ? currentMonth : currentMonth + 1;
    let remaining = item.remainingAmount;
    const count = item.periods - item.paidPeriods;

    for (let index = 1; index <= count; index += 1) {
      if (remaining <= 0) break;
      if (month > 11) {
        year += Math.floor(month / 12);
        month %= 12;
      }

      const dateObj = new Date(year, month, item.dueDate);
      const amount = Math.min(remaining, item.monthlyPayment);
      remaining -= amount;

      list.push({
        index,
        date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`,
        amount,
        remaining: Math.max(0, remaining),
      });

      month += 1;
    }

    setSchedule(list);
    setIsScheduleOpen(true);
  }

  async function handleAddRemarkTemplate() {
    const result = await prompt({
      title: "补充备注",
      description: "可选，直接确认即可跳过。",
      placeholder: "备注（可选）",
      defaultValue: repayState.description,
      required: false,
      confirmText: "保存",
      cancelText: "取消",
    });

    if (result === null) return;
    setRepayState((current) => ({ ...current, description: result }));
  }

  return (
    <>
      <LoansDefaultTheme
        items={items}
        platformData={platformData}
        paidVsRemainingData={paidVsRemainingData}
        loading={loading}
        reconcileLoadingId={reconcileLoadingId}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onOpenSchedule={openSchedule}
        onRepay={openRepay}
        onReconcile={(item) => void handleReconcile(item)}
      />

      <BottomSheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle className="text-lg sm:text-xl">{editingItem ? "编辑贷款" : "新增贷款"}</BottomSheetTitle>
            <BottomSheetDescription className="text-sm leading-6">移动端和桌面端统一使用底部滑出的编辑面板。</BottomSheetDescription>
          </BottomSheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <ThemeNotice tone="red" description={error} /> : null}

            <ThemeDialogSection className="space-y-4">
              <ThemeFormField label="贷款平台 / 名称">
                <Input required value={platform} onChange={(event) => setPlatform(event.target.value)} className={THEME_DIALOG_INPUT_CLASS} />
              </ThemeFormField>

              <ThemeFormGrid>
                <ThemeFormField label="总金额">
                  <Input required type="number" step="0.01" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} className={THEME_DIALOG_INPUT_CLASS} />
                </ThemeFormField>
                <ThemeFormField label="剩余金额">
                  <Input type="number" step="0.01" value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value)} className={THEME_DIALOG_INPUT_CLASS} />
                </ThemeFormField>
              </ThemeFormGrid>

              <ThemeFormGrid>
                <ThemeFormField label="总期数">
                  <Input type="number" value={periods} onChange={(event) => setPeriods(event.target.value)} className={THEME_DIALOG_INPUT_CLASS} />
                </ThemeFormField>
                <ThemeFormField label="已还期数">
                  <Input type="number" value={paidPeriods} onChange={(event) => setPaidPeriods(event.target.value)} className={THEME_DIALOG_INPUT_CLASS} />
                </ThemeFormField>
              </ThemeFormGrid>

              <ThemeFormGrid>
                <ThemeFormField label="每月还款额">
                  <Input type="number" step="0.01" value={monthlyPayment} onChange={(event) => setMonthlyPayment(event.target.value)} className={THEME_DIALOG_INPUT_CLASS} />
                </ThemeFormField>
                <ThemeFormField label="还款日">
                  <Input type="number" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={THEME_DIALOG_INPUT_CLASS} />
                </ThemeFormField>
              </ThemeFormGrid>

              {editingItem ? (
                <ThemeFormField label="状态">
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className={THEME_DIALOG_SELECT_CLASS}>
                    <option value="ACTIVE">还款中</option>
                    <option value="PAID_OFF">已结清</option>
                    <option value="OVERDUE">已逾期</option>
                  </select>
                </ThemeFormField>
              ) : null}
            </ThemeDialogSection>

            <ThemeActionBar>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-11 rounded-2xl sm:min-w-28">
                取消
              </Button>
              <Button type="submit" className="h-11 rounded-2xl sm:min-w-28">
                保存
              </Button>
            </ThemeActionBar>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet open={isRepayOpen} onOpenChange={setIsRepayOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle className="text-lg sm:text-xl">登记还款</BottomSheetTitle>
            <BottomSheetDescription className="text-sm leading-6">
              {repayState.item ? `当前剩余 ¥${repayState.item.remainingAmount.toFixed(2)}` : "为当前贷款记录补一笔还款。"}
            </BottomSheetDescription>
          </BottomSheetHeader>

          <form onSubmit={handleRepaySubmit} className="space-y-4">
            <ThemeDialogSection className="space-y-4">
              <ThemeFormField label="还款金额">
                <Input
                  type="number"
                  step="0.01"
                  value={repayState.amount}
                  onChange={(event) => setRepayState((current) => ({ ...current, amount: event.target.value }))}
                  className={THEME_DIALOG_INPUT_CLASS}
                />
              </ThemeFormField>

              <ThemeFormField label="备注">
                <div className="flex gap-2">
                  <Input
                    value={repayState.description}
                    onChange={(event) => setRepayState((current) => ({ ...current, description: event.target.value }))}
                    className={THEME_DIALOG_INPUT_CLASS}
                    placeholder="备注（可选）"
                  />
                  <Button type="button" variant="outline" onClick={() => void handleAddRemarkTemplate()} className="h-11 rounded-2xl">
                    编辑
                  </Button>
                </div>
              </ThemeFormField>
            </ThemeDialogSection>

            <ThemeActionBar>
              <Button type="button" variant="outline" onClick={() => setIsRepayOpen(false)} className="h-11 rounded-2xl sm:min-w-28">
                取消
              </Button>
              <Button type="submit" className="h-11 rounded-2xl sm:min-w-28">
                确认还款
              </Button>
            </ThemeActionBar>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <BottomSheetContent className="max-w-3xl">
          <BottomSheetHeader>
            <BottomSheetTitle className="text-lg sm:text-xl">{scheduleItem ? `还款计划 · ${scheduleItem.platform}` : "还款计划"}</BottomSheetTitle>
            <BottomSheetDescription className="text-sm leading-6">按期查看后续还款金额与剩余本金。</BottomSheetDescription>
          </BottomSheetHeader>

          <ThemeTable className="max-h-[60vh] overflow-auto">
            {schedule.length === 0 ? (
              <div className="px-4 py-10 text-center text-base text-slate-500">当前贷款已全部结清。</div>
            ) : (
              <table className="w-full min-w-[560px] text-sm sm:text-base">
                <thead className="sticky top-0 bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">期数</th>
                    <th className="px-4 py-3 font-medium">预计还款日</th>
                    <th className="px-4 py-3 text-right font-medium">应还金额</th>
                    <th className="px-4 py-3 text-right font-medium">剩余本金</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.index} className="border-t border-slate-200">
                      <td className="px-4 py-3 text-slate-600">第 {row.index} 期</td>
                      <td className="px-4 py-3 text-slate-900">{row.date}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-950">¥{row.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-slate-500">¥{row.remaining.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ThemeTable>
        </BottomSheetContent>
      </BottomSheet>

      {NoticeDialog}
      {PromptDialog}
    </>
  );
}
