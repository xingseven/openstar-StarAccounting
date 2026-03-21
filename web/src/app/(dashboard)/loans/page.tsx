"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Loan } from "@/types";
import { MOCK_LOANS, MOCK_LOANS_PLATFORM_DATA, MOCK_LOANS_PAID_VS_REMAINING } from "@/features/shared/mockData";

const LoansDefaultTheme = dynamic(
  () => import("@/features/loans/components/themes/DefaultLoans").then(mod => mod.LoansDefaultTheme),
  {
    ssr: false,
    loading: () => null
  }
);
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function fetchLoansData(): Promise<Loan[]> {
  const data = await apiFetch<{ items: any[] }>("/api/loans");
  return data.items.map((i) => ({
    ...i,
    totalAmount: Number(i.totalAmount),
    remainingAmount: Number(i.remainingAmount),
    monthlyPayment: Number(i.monthlyPayment),
  }));
}

function computeLoansDerivedData(items: Loan[]) {
  const platformData = items.reduce((acc, item) => {
    const existing = acc.find(p => p.name === item.platform);
    if (existing) {
      existing.value += item.remainingAmount;
    } else {
      acc.push({ name: item.platform, value: item.remainingAmount });
    }
    return acc;
  }, [] as { name: string; value: number }[]).map((item, index) => ({
    ...item,
    fill: `var(--color-chart-${(index % 5) + 1})`,
  }));

  const paidVsRemainingData = items.map(item => ({
    platform: item.platform,
    paid: item.totalAmount - item.remainingAmount,
    remaining: item.remainingAmount,
  }));

  return { platformData, paidVsRemainingData };
}

export default function LoansPage() {
  const [items, setItems] = useState<Loan[]>(MOCK_LOANS);
  const [platformData, setPlatformData] = useState(MOCK_LOANS_PLATFORM_DATA);
  const [paidVsRemainingData, setPaidVsRemainingData] = useState(MOCK_LOANS_PAID_VS_REMAINING);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // Form states
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

  // Schedule modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<{ index: number; date: string; amount: number; remaining: number }[]>([]);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await fetchLoansData();
      const derived = computeLoansDerivedData(data);
      // 如果 API 返回空数据，使用 mock 数据用于展示
      if (data.length === 0) {
        setItems(MOCK_LOANS);
        setPlatformData(MOCK_LOANS_PLATFORM_DATA);
        setPaidVsRemainingData(MOCK_LOANS_PAID_VS_REMAINING);
        setUsingMockData(true);
      } else {
        setItems(data);
        setPlatformData(derived.platformData);
        setPaidVsRemainingData(derived.paidVsRemainingData);
        setUsingMockData(false);
      }
    } catch (e) {
      console.warn("Failed to fetch loans data, using mock data:", e);
      setItems(MOCK_LOANS);
      setPlatformData(MOCK_LOANS_PLATFORM_DATA);
      setPaidVsRemainingData(MOCK_LOANS_PAID_VS_REMAINING);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个贷款记录吗？")) return;
    try {
      await apiFetch(`/api/loans/${id}`, { method: "DELETE" });
      loadItems();
    } catch (e) {
      alert("删除失败");
    }
  }

  async function handleRepay(item: Loan) {
    const amountInput = prompt(`请输入本次还款金额（当前剩余 ¥${item.remainingAmount.toFixed(2)}）`);
    if (!amountInput) return;
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("还款金额必须大于 0");
      return;
    }
    const description = prompt("备注（可选）") ?? "";
    try {
      await apiFetch(`/api/loans/${item.id}/repay`, {
        method: "POST",
        body: JSON.stringify({
          amount,
          description,
          date: new Date().toISOString(),
        }),
      });
      loadItems();
    } catch (e) {
      alert(e instanceof Error ? e.message : "登记还款失败");
    }
  }

  function openSchedule(item: Loan) {
    setScheduleItem(item);

    // Generate simple schedule
    const list = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let year = currentYear;
    let month = currentDay <= item.dueDate ? currentMonth : currentMonth + 1;

    let remaining = item.remainingAmount;
    const count = item.periods - item.paidPeriods;

    for (let i = 1; i <= count; i++) {
      if (remaining <= 0) break;
      if (month > 11) {
        year += Math.floor(month / 12);
        month = month % 12;
      }
      const dateObj = new Date(year, month, item.dueDate);
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");

      const amount = Math.min(remaining, item.monthlyPayment);
      remaining -= amount;

      list.push({
        index: i,
        date: `${y}-${m}-${d}`,
        amount,
        remaining: Math.max(0, remaining),
      });
      month++;
    }

    setSchedule(list);
    setIsScheduleOpen(true);
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
        onRepay={handleRepay}
      />

      {/* Modal & Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingItem ? "编辑贷款" : "新增贷款"}</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">贷款平台/名称</label>
                  <input required className="w-full rounded-md border border-input px-3 py-2 text-sm" value={platform} onChange={e => setPlatform(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-sm font-medium">总金额</label>
                    <input required type="number" step="0.01" className="w-full rounded-md border border-input px-3 py-2 text-sm" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">剩余金额</label>
                    <input type="number" step="0.01" className="w-full rounded-md border border-input px-3 py-2 text-sm" value={remainingAmount} onChange={e => setRemainingAmount(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-sm font-medium">总期数</label>
                    <input type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" value={periods} onChange={e => setPeriods(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">已还期数</label>
                    <input type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" value={paidPeriods} onChange={e => setPaidPeriods(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-sm font-medium">每月还款额</label>
                    <input type="number" step="0.01" className="w-full rounded-md border border-input px-3 py-2 text-sm" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">每月还款日</label>
                    <input type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                </div>
                {editingItem && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">状态</label>
                    <select className="w-full rounded-md border border-input px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="ACTIVE">还款中</option>
                      <option value="COMPLETED">已结清</option>
                      <option value="DEFAULT">已逾期</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-md">取消</button>
                  <button type="submit" className="bg-black text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800">保存</button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isScheduleOpen && scheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
              <CardTitle className="text-base">还款计划 - {scheduleItem.platform}</CardTitle>
              <button onClick={() => setIsScheduleOpen(false)} className="text-gray-500 hover:text-black">✕</button>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-0">
               {schedule.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">已全部还清</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-4 font-medium">期数</th>
                      <th className="py-2 px-4 font-medium">预计还款日</th>
                      <th className="py-2 px-4 font-medium text-right">应还金额</th>
                      <th className="py-2 px-4 font-medium text-right">剩余本金</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.index} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2 px-4 text-gray-600">第 {row.index} 期</td>
                        <td className="py-2 px-4">{row.date}</td>
                        <td className="py-2 px-4 text-right font-medium">¥{row.amount.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right text-gray-500">¥{row.remaining.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
