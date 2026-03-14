"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { 
  SavingsDefaultTheme, 
  SavingsGoal, 
  TransactionItem 
} from "@/features/savings/components/themes/DefaultSavings";
import { SavingsGoalDialog } from "@/features/savings/components/SavingsGoalDialog";

export default function SavingsPage() {
  const [items, setItems] = useState<SavingsGoal[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoal | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Load Goals
      const goalsData = await apiFetch<{ items: any[] }>("/api/savings");
      const list = goalsData.items.map((i) => ({
        ...i,
        targetAmount: Number(i.targetAmount),
        currentAmount: Number(i.currentAmount),
      }));
      setItems(list);

      // 2. Load Savings Related Transactions
      // Filter by common savings keywords
      const qs = new URLSearchParams({
        page: "1",
        pageSize: "50",
      });
      // We can't filter by multiple categories easily in current API without loop or new API
      // For now, let's fetch recent transactions and filter client side or use a broad search if available
      // The current API supports 'category' param? No, it supports type, platform, date.
      // Let's use the 'category' filter if I added it? I didn't add category filter to GET /api/transactions
      // I will fetch recent 100 transactions and filter client side for now as a quick fix
      // TODO: Add category filter to backend
      const transData = await apiFetch<{ items: TransactionItem[] }>(`/api/transactions?pageSize=100`);
      const savingsKeywords = ["储蓄", "存款", "理财", "基金", "股票", "定投", "Savings", "Deposit"];
      const filtered = transData.items.filter(t => 
        savingsKeywords.some(k => t.category.includes(k))
      );
      setTransactions(filtered);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingItem(null);
    setModalStep(1);
    setIsModalOpen(true);
  }

  function openEdit(item: SavingsGoal) {
    setEditingItem(item);
    setModalStep(1);
    setIsModalOpen(true);
  }

  function openPunch(item: SavingsGoal) {
    setEditingItem(item);
    setModalStep(2);
    setIsModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    setIsModalOpen(open);
    if (!open) setModalStep(1);
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
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onOpenPunch={openPunch}
      />

      <SavingsGoalDialog
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        initialData={editingItem}
        onSave={handleSave}
        onDelete={handleDelete}
        defaultStep={modalStep}
        onDataChanged={loadData}
      />
    </>
  );
}
