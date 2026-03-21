"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { SavingsGoal, TransactionItem } from "@/features/savings/components/themes/DefaultSavings";
import { MOCK_SAVINGS, MOCK_SAVINGS_TRANSACTIONS } from "@/features/shared/mockData";
import { StatsCardSkeleton, ChartSkeleton, ListTableSkeleton } from "@/components/shared/Skeletons";

const SavingsDefaultTheme = dynamic(
  () => import("@/features/savings/components/themes/DefaultSavings").then(mod => mod.SavingsDefaultTheme),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto min-h-[101vh]">
        <div className="grid gap-2 sm:gap-4 grid-cols-3">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid gap-6 md:grid-cols-5">
          <ChartSkeleton className="md:col-span-1" />
          <ChartSkeleton className="md:col-span-1" />
          <div className="md:col-span-3">
            <ListTableSkeleton rows={3} columns={7} />
          </div>
        </div>
      </div>
    )
  }
);
import { SavingsGoalDialog } from "@/features/savings/components/SavingsGoalDialog";
import { SavingsPlanDialog } from "@/features/savings/components/SavingsPlanDialog";
import { SavingsWithdrawalDialog } from "@/features/savings/components/SavingsWithdrawalDialog";

async function fetchSavingsData() {
  const [goalsData, transactionsData] = await Promise.all([
    apiFetch<{ items: any[] }>("/api/savings"),
    apiFetch<{ items: TransactionItem[] }>("/api/transactions?pageSize=100"),
  ]);

  const list: SavingsGoal[] = goalsData.items.map((i) => ({
    ...i,
    targetAmount: Number(i.targetAmount),
    currentAmount: Number(i.currentAmount),
  }));

  return { items: list, transactions: transactionsData.items };
}

export default function SavingsPage() {
  const [items, setItems] = useState<SavingsGoal[]>(MOCK_SAVINGS);
  const [transactions, setTransactions] = useState<TransactionItem[]>(MOCK_SAVINGS_TRANSACTIONS);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoal | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planItem, setPlanItem] = useState<SavingsGoal | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalItem, setWithdrawalItem] = useState<SavingsGoal | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchSavingsData();
      // 如果 API 返回空数据，使用 mock 数据用于展示
      if (data.items.length === 0) {
        setItems(MOCK_SAVINGS);
        setTransactions(MOCK_SAVINGS_TRANSACTIONS);
        setUsingMockData(true);
      } else {
        setItems(data.items);
        setTransactions(data.transactions);
        setUsingMockData(false);
      }
    } catch (e) {
      console.warn("Failed to fetch savings data, using mock data:", e);
      setItems(MOCK_SAVINGS);
      setTransactions(MOCK_SAVINGS_TRANSACTIONS);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditingItem(null);
    setIsModalOpen(true);
  }

  function openEdit(item: SavingsGoal) {
    setEditingItem(item);
    setIsModalOpen(true);
  }

  function openPunch(item: SavingsGoal) {
    setPlanItem(item);
    setIsPlanModalOpen(true);
  }

  function openWithdrawal(item: SavingsGoal) {
    setWithdrawalItem(item);
    setIsWithdrawalModalOpen(true);
  }

  async function handleSave(data: Partial<SavingsGoal>) {
    try {
      if (editingItem) {
        await apiFetch(`/api/savings/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetch("/api/savings", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
      throw err;
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/savings/${id}`, { method: "DELETE" });
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      alert("删除失败");
      throw e;
    }
  }

  async function handleArchive(item: SavingsGoal) {
    try {
      await apiFetch(`/api/savings/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, status: "ARCHIVED" }),
      });
      loadData();
    } catch (e) {
      alert("归档失败");
      throw e;
    }
  }

  async function handleBatchDelete(ids: string[]) {
    try {
      await Promise.all(ids.map(id => apiFetch(`/api/savings/${id}`, { method: "DELETE" })));
      loadData();
    } catch (e) {
      alert("批量删除失败");
      throw e;
    }
  }

  async function handleBatchArchive(ids: string[]) {
    try {
      await Promise.all(ids.map(id => {
        const item = items.find(i => i.id === id);
        if (item) {
          return apiFetch(`/api/savings/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ...item, status: "ARCHIVED" }),
          });
        }
        return Promise.resolve();
      }));
      loadData();
    } catch (e) {
      alert("批量归档失败");
      throw e;
    }
  }

  function handleCopy(item: SavingsGoal) {
    // Open create dialog with copied data
    const { id, createdAt, currentAmount, ...rest } = item;
    setEditingItem({ ...rest, id: "", name: `${item.name} (副本)`, currentAmount: 0, createdAt: new Date().toISOString() });
    setIsModalOpen(true);
  }

  const totalSaved = items.reduce((acc, item) => acc + item.currentAmount, 0);
  const totalTarget = items.reduce((acc, item) => acc + item.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <>
      <SavingsDefaultTheme
        items={items}
        transactions={transactions}
        totalSaved={totalSaved}
        totalTarget={totalTarget}
        overallProgress={overallProgress}
        loading={loading}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onOpenPunch={openPunch}
        onOpenWithdrawal={openWithdrawal}
        onDelete={(item) => handleDelete(item.id)}
        onArchive={handleArchive}
        onBatchDelete={handleBatchDelete}
        onBatchArchive={handleBatchArchive}
        onCopy={handleCopy}
      />

      <SavingsGoalDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingItem}
        onSave={handleSave}
        onDelete={handleDelete}
        onDataChanged={loadData}
      />

      <SavingsPlanDialog
        open={isPlanModalOpen}
        onOpenChange={setIsPlanModalOpen}
        goal={planItem}
        onPlansChanged={loadData}
      />

      <SavingsWithdrawalDialog
        open={isWithdrawalModalOpen}
        onOpenChange={setIsWithdrawalModalOpen}
        goal={withdrawalItem}
        onWithdrawalChanged={loadData}
      />
    </>
  );
}
