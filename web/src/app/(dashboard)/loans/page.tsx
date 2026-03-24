"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Loan } from "@/types";
import { apiFetch } from "@/lib/api";
import { BottomSheet, BottomSheetContent, BottomSheetDescription, BottomSheetFooter, BottomSheetHeader, BottomSheetTitle } from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm, useNoticeDialog, usePromptDialog } from "@/components/ui/confirm-dialog";
import { MOCK_LOANS, MOCK_LOANS_PAID_VS_REMAINING, MOCK_LOANS_PLATFORM_DATA } from "@/features/shared/mockData";
import { ThemeActionBar, ThemeDialogSection } from "@/components/shared/theme-primitives";

const LoansDefaultTheme = dynamic(
  () => import("@/features/loans/components/themes/DefaultLoans").then((mod) => mod.LoansDefaultTheme),
  {
    ssr: false,
    loading: () => null,
  }
);

async function fetchLoansData(): Promise<Loan[]> {
  const data = await apiFetch<{ items: Array<Record<string, unknown>> }>("/api/loans");
  return data.items.map((item) => ({
    ...item,
    totalAmount: Number(item.totalAmount),
    remainingAmount: Number(item.remainingAmount),
    monthlyPayment: Number(item.monthlyPayment),
  })) as Loan[];
}

function computeLoansDerivedData(items: Loan[]) {
  const platformData = items
    .reduce((acc, item) => {
      const existing = acc.find((entry) => entry.name === item.platform);
      if (existing) {
        existing.value += item.remainingAmount;
      } else {
        acc.push({ name: item.platform, value: item.remainingAmount });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>)
    .map((item, index) => ({
      ...item,
      fill: `var(--color-chart-${(index % 5) + 1})`,
    }));

  const paidVsRemainingData = items.map((item) => ({
    platform: item.platform,
    paid: item.totalAmount - item.remainingAmount,
    remaining: item.remainingAmount,
  }));

  return { platformData, paidVsRemainingData };
}

type RepayState = {
  item: Loan | null;
  amount: string;
  description: string;
};

export default function LoansPage() {
  const { confirmAsync, ConfirmDialog } = useConfirm();
  const { notify, NoticeDialog } = useNoticeDialog();
  const { prompt, PromptDialog } = usePromptDialog();
  const [items, setItems] = useState<Loan[]>(MOCK_LOANS);
  const [platformData, setPlatformData] = useState(MOCK_LOANS_PLATFORM_DATA);
  const [paidVsRemainingData, setPaidVsRemainingData] = useState(MOCK_LOANS_PAID_VS_REMAINING);
  const [loading, setLoading] = useState(false);

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
  const [schedule, setSchedule] = useState<Array<{ index: number; date: string; amount: number; remaining: number }>>([]);

  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [repayState, setRepayState] = useState<RepayState>({ item: null, amount: "", description: "" });

  async function loadItems() {
    setLoading(true);
    try {
      const data = await fetchLoansData();
      if (data.length === 0) {
        setItems(MOCK_LOANS);
        setPlatformData(MOCK_LOANS_PLATFORM_DATA);
        setPaidVsRemainingData(MOCK_LOANS_PAID_VS_REMAINING);
      } else {
        const derived = computeLoansDerivedData(data);
        setItems(data);
        setPlatformData(derived.platformData);
        setPaidVsRemainingData(derived.paidVsRemainingData);
      }
    } catch (loadError) {
      console.warn("Failed to fetch loans data, using mock data:", loadError);
      setItems(MOCK_LOANS);
      setPlatformData(MOCK_LOANS_PLATFORM_DATA);
      setPaidVsRemainingData(MOCK_LOANS_PAID_VS_REMAINING);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  function openCreate() {
    setEditingItem(null);
    setPlatform("");
    setTotalAmount("");
    setRemainingAmount("");
    setPeriods("12");
    setPaidPeriods("0");
    setMonthlyPayment("0");
    setDueDate("1");
    setStatus("ACTIVE");
    setError(null);
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

  async function handleDelete(id: string) {
    const confirmed = await confirmAsync({
      title: "确认删除贷款",
      description: "删除后这条贷款记录将无法恢复。",
      confirmText: "删除",
      cancelText: "取消",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await apiFetch(`/api/loans/${id}`, { method: "DELETE" });
      await loadItems();
    } catch (deleteError) {
      notify({
        title: "删除失败",
        description: deleteError instanceof Error ? deleteError.message : "请稍后重试。",
      });
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

  async function openSchedule(item: Loan) {
    setScheduleItem(item);

    const list = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let year = currentYear;
    let month = currentDay <= item.dueDate ? currentMonth : currentMonth + 1;
    let remaining = item.remainingAmount;
    const count = item.periods - item.paidPeriods;

    for (let i = 1; i <= count; i += 1) {
      if (remaining <= 0) break;
      if (month > 11) {
        year += Math.floor(month / 12);
        month %= 12;
      }

      const dateObj = new Date(year, month, item.dueDate);
      const amount = Math.min(remaining, item.monthlyPayment);
      remaining -= amount;

      list.push({
        index: i,
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
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onOpenSchedule={openSchedule}
        onRepay={openRepay}
      />

      <BottomSheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>{editingItem ? "编辑贷款" : "新增贷款"}</BottomSheetTitle>
            <BottomSheetDescription>移动端和桌面端都统一改成底部滑出的编辑面板。</BottomSheetDescription>
          </BottomSheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">贷款平台 / 名称</span>
              <Input required value={platform} onChange={(event) => setPlatform(event.target.value)} className="h-11 rounded-2xl" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">总金额</span>
                <Input required type="number" step="0.01" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} className="h-11 rounded-2xl" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">剩余金额</span>
                <Input type="number" step="0.01" value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value)} className="h-11 rounded-2xl" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">总期数</span>
                <Input type="number" value={periods} onChange={(event) => setPeriods(event.target.value)} className="h-11 rounded-2xl" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">已还期数</span>
                <Input type="number" value={paidPeriods} onChange={(event) => setPaidPeriods(event.target.value)} className="h-11 rounded-2xl" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">每月还款额</span>
                <Input type="number" step="0.01" value={monthlyPayment} onChange={(event) => setMonthlyPayment(event.target.value)} className="h-11 rounded-2xl" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">还款日</span>
                <Input type="number" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-11 rounded-2xl" />
              </label>
            </div>

            {editingItem ? (
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">状态</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm">
                  <option value="ACTIVE">还款中</option>
                  <option value="PAID_OFF">已结清</option>
                  <option value="OVERDUE">已逾期</option>
                </select>
              </label>
            ) : null}

            <BottomSheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-11 rounded-2xl sm:min-w-28">
                取消
              </Button>
              <Button type="submit" className="h-11 rounded-2xl sm:min-w-28">
                保存
              </Button>
            </BottomSheetFooter>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet open={isRepayOpen} onOpenChange={setIsRepayOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>登记还款</BottomSheetTitle>
            <BottomSheetDescription>
              {repayState.item ? `当前剩余 ¥${repayState.item.remainingAmount.toFixed(2)}` : "为当前贷款记录补一笔还款。"}
            </BottomSheetDescription>
          </BottomSheetHeader>

          <form onSubmit={handleRepaySubmit} className="space-y-4">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">还款金额</span>
              <Input
                type="number"
                step="0.01"
                value={repayState.amount}
                onChange={(event) => setRepayState((current) => ({ ...current, amount: event.target.value }))}
                className="h-11 rounded-2xl"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">备注</span>
              <div className="flex gap-2">
                <Input
                  value={repayState.description}
                  onChange={(event) => setRepayState((current) => ({ ...current, description: event.target.value }))}
                  className="h-11 rounded-2xl"
                  placeholder="备注（可选）"
                />
                <Button type="button" variant="outline" onClick={() => void handleAddRemarkTemplate()} className="h-11 rounded-2xl">
                  编辑
                </Button>
              </div>
            </label>

            <BottomSheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsRepayOpen(false)} className="h-11 rounded-2xl sm:min-w-28">
                取消
              </Button>
              <Button type="submit" className="h-11 rounded-2xl sm:min-w-28">
                确认还款
              </Button>
            </BottomSheetFooter>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <BottomSheetContent className="max-w-3xl">
          <BottomSheetHeader>
            <BottomSheetTitle>{scheduleItem ? `还款计划 · ${scheduleItem.platform}` : "还款计划"}</BottomSheetTitle>
            <BottomSheetDescription>按期查看后续还款金额与剩余本金。</BottomSheetDescription>
          </BottomSheetHeader>

          <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-200">
            {schedule.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">当前贷款已全部结清。</div>
            ) : (
              <table className="w-full min-w-[560px] text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">期数</th>
                    <th className="px-4 py-3 font-medium">预计还款日</th>
                    <th className="px-4 py-3 font-medium text-right">应还金额</th>
                    <th className="px-4 py-3 font-medium text-right">剩余本金</th>
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
          </div>
        </BottomSheetContent>
      </BottomSheet>

      {ConfirmDialog}
      {NoticeDialog}
      {PromptDialog}
    </>
  );
}
