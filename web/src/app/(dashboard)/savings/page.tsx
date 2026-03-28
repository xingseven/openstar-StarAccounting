"use client";

import { apiFetch } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { SavingsGoal, TransactionItem } from "@/features/savings/components/themes/DefaultSavings";
import { MOCK_SAVINGS, MOCK_SAVINGS_TRANSACTIONS } from "@/features/shared/mockData";
import { useNoticeDialog } from "@/components/ui/confirm-dialog";
import { SavingsLoadingShell } from "@/features/savings/components/themes/SavingsLoadingShell";

const SavingsDefaultTheme = dynamic(
  () => import("@/features/savings/components/themes/DefaultSavings").then(mod => mod.SavingsDefaultTheme),
  {
    ssr: false,
    loading: () => <SavingsLoadingShell />
  }
);
import { SavingsGoalDialog } from "@/features/savings/components/SavingsGoalDialog";
import { SavingsPlanDialog } from "@/features/savings/components/SavingsPlanDialog";
import { SavingsWithdrawalDialog } from "@/features/savings/components/SavingsWithdrawalDialog";

type SavingsApiItem = Omit<SavingsGoal, "targetAmount" | "currentAmount"> & {
  targetAmount: number | string;
  currentAmount: number | string;
};

async function fetchSavingsData() {
  const [goalsData, transactionsData] = await Promise.all([
    apiFetch<{ items: SavingsApiItem[] }>("/api/savings"),
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
  const { notify, NoticeDialog } = useNoticeDialog();
  const [items, setItems] = useState<SavingsGoal[]>(MOCK_SAVINGS);
  const [transactions, setTransactions] = useState<TransactionItem[]>(MOCK_SAVINGS_TRANSACTIONS);
  const [loading, setLoading] = useState(true);

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoal | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planItem, setPlanItem] = useState<SavingsGoal | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalItem, setWithdrawalItem] = useState<SavingsGoal | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSavingsData();
      // 如果 API 返回空数据，使用 mock 数据用于展示
      if (data.items.length === 0) {
        setItems(MOCK_SAVINGS);
        setTransactions(MOCK_SAVINGS_TRANSACTIONS);
      } else {
        setItems(data.items);
        setTransactions(data.transactions);
      }
    } catch (loadError) {
      console.warn("Failed to fetch savings data, using mock data:", loadError);
      setItems(MOCK_SAVINGS);
      setTransactions(MOCK_SAVINGS_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      await loadData();
    } catch (err) {
      notify({
        title: "保存储蓄目标失败",
        description: err instanceof Error ? err.message : "请稍后重试。",
      });
      throw err;
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/savings/${id}`, { method: "DELETE" });
      setIsModalOpen(false);
      await loadData();
    } catch (deleteError) {
      notify({
        title: "删除储蓄目标失败",
        description: deleteError instanceof Error ? deleteError.message : "请稍后重试。",
      });
      throw deleteError;
    }
  }

  async function handleArchive(item: SavingsGoal) {
    try {
      await apiFetch(`/api/savings/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, status: "ARCHIVED" }),
      });
      await loadData();
    } catch (archiveError) {
      notify({
        title: "归档储蓄目标失败",
        description: archiveError instanceof Error ? archiveError.message : "请稍后重试。",
      });
      throw archiveError;
    }
  }

  async function handleBatchDelete(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => apiFetch(`/api/savings/${id}`, { method: "DELETE" })));
      await loadData();
    } catch (deleteError) {
      notify({
        title: "批量删除失败",
        description: deleteError instanceof Error ? deleteError.message : "请稍后重试。",
      });
      throw deleteError;
    }
  }

  async function handleBatchArchive(ids: string[]) {
    try {
      await Promise.all(
        ids.map((id) => {
          const item = items.find((entry) => entry.id === id);
          if (!item) {
            return Promise.resolve(undefined);
          }
          return apiFetch(`/api/savings/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ...item, status: "ARCHIVED" }),
          });
        })
      );
      await loadData();
    } catch (archiveError) {
      notify({
        title: "批量归档失败",
        description: archiveError instanceof Error ? archiveError.message : "请稍后重试。",
      });
      throw archiveError;
    }
  }

  function handleCopy(item: SavingsGoal) {
    // Open create dialog with copied data
    setEditingItem({
      ...item,
      id: "",
      name: `${item.name} (副本)`,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  }

  async function handleImageChange(item: SavingsGoal, image: string | null) {
    try {
      await apiFetch(`/api/savings/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, image }),
      });
      await loadData();
    } catch (imageError) {
      notify({
        title: "保存图片失败",
        description: imageError instanceof Error ? imageError.message : "请稍后重试。",
      });
    }
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
        onImageChange={handleImageChange}
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

      {NoticeDialog}
    </>
  );
}
