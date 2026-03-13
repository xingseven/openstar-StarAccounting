"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Loan = {
  id: string;
  platform: string;
  totalAmount: number;
  remainingAmount: number;
  periods: number;
  paidPeriods: number;
  monthlyPayment: number;
  dueDate: number;
  status: "ACTIVE" | "COMPLETED" | "DEFAULT";
  createdAt: string;
};

export default function LoansPage() {
  const [items, setItems] = useState<Loan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Loan | null>(null);

  // Form states
  const [platform, setPlatform] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [periods, setPeriods] = useState("12");
  const [paidPeriods, setPaidPeriods] = useState("0");
  const [monthlyPayment, setMonthlyPayment] = useState("0");
  const [dueDate, setDueDate] = useState("1");
  const [status, setStatus] = useState("ACTIVE");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Schedule modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<{ index: number; date: string; amount: number; remaining: number }[]>([]);

  async function loadItems() {
    try {
      const data = await apiFetch<{ items: any[] }>("/api/loans");
      const list = data.items.map((i) => ({
        ...i,
        totalAmount: Number(i.totalAmount),
        remainingAmount: Number(i.remainingAmount),
        monthlyPayment: Number(i.monthlyPayment),
      }));
      setItems(list);
    } catch (e) {
      console.error(e);
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
    setLoading(true);
    setError(null);

    try {
      const body = {
        platform,
        totalAmount,
        remainingAmount: remainingAmount || totalAmount, // Default to total if not set
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
    } finally {
      setLoading(false);
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

  function openSchedule(item: Loan) {
    setScheduleItem(item);
    
    // Generate simple schedule
    const list = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();
    
    // Start from next payment date
    // If today is before due date, next payment is this month
    // If today is after due date, next payment is next month
    let year = currentYear;
    let month = currentDay <= item.dueDate ? currentMonth : currentMonth + 1;
    
    let remaining = item.remainingAmount;
    const count = item.periods - item.paidPeriods;
    
    for (let i = 1; i <= count; i++) {
      if (remaining <= 0) break;
      
      // Handle month overflow
      if (month > 11) {
        year += Math.floor(month / 12);
        month = month % 12;
      }
      
      // Construct date string YYYY-MM-DD
      // Handle days that don't exist (e.g. Feb 30) -> auto corrected by Date object but we want clean string
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">贷款管理</h1>
          <p className="text-sm text-gray-600">追踪贷款还款进度与每月账单</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          新增贷款
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded border p-8 text-center text-gray-500">
          暂无贷款记录
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const progress =
              item.totalAmount > 0
                ? Math.min(100, ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100)
                : 0;
            return (
              <div key={item.id} className="rounded border p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{item.platform}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      每月 {item.dueDate} 日还款 · ¥{item.monthlyPayment}/月
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openSchedule(item)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      计划
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs text-gray-600 hover:text-black"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">已还期数</span>
                    <span className="font-medium">{item.paidPeriods} / {item.periods}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>剩余 ¥{item.remainingAmount}</span>
                    <span>总额 ¥{item.totalAmount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-semibold">
              {editingItem ? "编辑贷款" : "新增贷款"}
            </h2>
            {error && (
              <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium">贷款平台/名称</span>
                <input
                  required
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="例如：房贷、车贷、蚂蚁借呗"
                />
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">总金额</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">剩余金额</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={remainingAmount}
                    onChange={(e) => setRemainingAmount(e.target.value)}
                    placeholder="不填默认等于总金额"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">总期数</span>
                  <input
                    type="number"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={periods}
                    onChange={(e) => setPeriods(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">已还期数</span>
                  <input
                    type="number"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={paidPeriods}
                    onChange={(e) => setPaidPeriods(e.target.value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">每月还款额</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">每月还款日</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </label>
              </div>

              {editingItem && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium">状态</span>
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ACTIVE">还款中</option>
                    <option value="COMPLETED">已结清</option>
                    <option value="DEFAULT">已逾期</option>
                  </select>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded px-4 py-2 text-sm hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScheduleOpen && scheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg max-h-[80vh] flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">还款计划 - {scheduleItem.platform}</h2>
              <button onClick={() => setIsScheduleOpen(false)} className="text-gray-500 hover:text-black">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {schedule.length === 0 ? (
                <div className="py-8 text-center text-gray-500">已全部还清，无剩余还款计划</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b text-left text-gray-600">
                      <th className="py-2">期数</th>
                      <th className="py-2">预计还款日</th>
                      <th className="py-2 text-right">应还金额</th>
                      <th className="py-2 text-right">剩余本金</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.index} className="border-b last:border-0">
                        <td className="py-2 text-gray-600">第 {row.index} 期</td>
                        <td className="py-2">{row.date}</td>
                        <td className="py-2 text-right font-medium">¥{row.amount.toFixed(2)}</td>
                        <td className="py-2 text-right text-gray-500">¥{row.remaining.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              *此计划基于当前剩余金额与月供简单推算，不包含利息变动，仅供参考。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
