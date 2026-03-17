"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { 
  SavingsGoal, 
  TransactionItem 
} from "@/features/savings/components/themes/DefaultSavings";

const SavingsDefaultTheme = dynamic(
  () => import("@/features/savings/components/themes/DefaultSavings").then(mod => mod.SavingsDefaultTheme),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }
);
import { SavingsGoalDialog } from "@/features/savings/components/SavingsGoalDialog";
import { SavingsPlanDialog } from "@/features/savings/components/SavingsPlanDialog";
import { SavingsWithdrawalDialog } from "@/features/savings/components/SavingsWithdrawalDialog";

export default function SavingsPage() {
  const [items, setItems] = useState<SavingsGoal[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoal | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planItem, setPlanItem] = useState<SavingsGoal | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalItem, setWithdrawalItem] = useState<SavingsGoal | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Debug: 检查当前用户
      const token = typeof window !== 'undefined' ? localStorage.getItem('openstar_access_token') : null;
      console.log('当前 token:', token ? token.substring(0, 50) + '...' : '无 token');
      
      // 解析 token 中的 userId
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token 中的 userId:', payload.userId);
        } catch (e) {
          console.error('解析 token 失败:', e);
        }
      }
      
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
      console.log('准备调用 /api/transactions...');
      const transData = await apiFetch<{ items: TransactionItem[]; total: number; page: number; pageSize: number }>(`/api/transactions?pageSize=100`);
      console.log('原始交易数据（完整）:', JSON.stringify(transData, null, 2));
      console.log('transData 的类型:', typeof transData);
      console.log('transData.items:', transData.items);
      console.log('transData.items 是否为数组:', Array.isArray(transData.items));
      console.log('transData.items?.length:', transData.items?.length);
      console.log('Object.keys(transData):', Object.keys(transData || {}));
      console.log('交易数量:', transData.items?.length || 0);
      
      const savingsKeywords = ["储蓄", "存款", "理财", "基金", "股票", "定投", "Savings", "Deposit"];
      const filtered = transData.items.filter(t => 
        savingsKeywords.some(k => 
          t.category.includes(k) || 
          (t.description && t.description.includes(k))
        )
      );
      console.log('过滤后的交易:', filtered);
      console.log('过滤数量:', filtered.length);
      
      if (filtered.length > 0) {
        console.log('第一条过滤记录:', filtered[0]);
      }
      
      setTransactions(filtered);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

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
