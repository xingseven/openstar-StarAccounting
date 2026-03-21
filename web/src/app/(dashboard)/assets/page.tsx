"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Asset } from "@/types";
import { MOCK_ASSETS } from "@/features/shared/mockData";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetFooter,
} from "@/components/ui/bottomsheet";

const AssetsDefaultTheme = dynamic(
  () => import("@/features/assets/components/themes/DefaultAssets").then(mod => mod.AssetsDefaultTheme),
  {
    ssr: false,
    loading: () => null
  }
);

const SUPPORTED_CURRENCIES = ["CNY", "USD", "EUR", "HKD", "JPY", "GBP"];

// 根据名称获取 Logo URL
function getLogoUrl(name: string, type: string): string | null {
  const lowerName = name.toLowerCase();

  // 支付宝
  if (type === "ALIPAY" || lowerName.includes('支付宝') || lowerName.includes('zfb')) {
    return "/logo/ZFB.svg";
  }

  // 微信
  if (type === "WECHAT" || lowerName.includes('微信') || lowerName.includes('wx')) {
    return "/logo/WX.svg";
  }

  // 招商银行 CMB
  if (lowerName.includes('招商') || lowerName.includes('cmb')) {
    return "/logo/CMB.svg";
  }

  // 工商银行 ICBC
  if (lowerName.includes('工商') || lowerName.includes('icbc')) {
    return "/logo/ICBC.svg";
  }

  // 建设银行 CCB
  if (lowerName.includes('建设') || lowerName.includes('ccb')) {
    return "/logo/CCB.svg";
  }

  // 农业银行 ABC
  if (lowerName.includes('农业') || lowerName.includes('abc')) {
    return "/logo/ABC.svg";
  }

  // 中国银行 BOC
  if (lowerName.includes('中国银行') || lowerName.includes('boc')) {
    return "/logo/BOC.svg";
  }

  // 交通银行 BCM
  if (lowerName.includes('交通') || lowerName.includes('bcom') || lowerName.includes('bcm')) {
    return "/logo/BCM.svg";
  }

  // 浦发银行 SPD
  if (lowerName.includes('浦发') || lowerName.includes('spd')) {
    return "/logo/SPD.svg";
  }

  // 兴业银行 CIB
  if (lowerName.includes('兴业') || lowerName.includes('cib')) {
    return "/logo/CIB.svg";
  }

  // 民生银行 CMBC
  if (lowerName.includes('民生') || lowerName.includes('cmbc')) {
    return "/logo/CMBC.svg";
  }

  // 平安银行 PAB
  if (lowerName.includes('平安') || lowerName.includes('pab') || lowerName.includes('pingan')) {
    return "/logo/PAB.svg";
  }

  // 邮储银行 PSBC
  if (lowerName.includes('邮储') || lowerName.includes('psbc')) {
    return "/logo/PSBC.svg";
  }

  // 中信银行 CITIC
  if (lowerName.includes('中信') || lowerName.includes('citic')) {
    return "/logo/CITIC.svg";
  }

  // 华夏银行 HXB
  if (lowerName.includes('华夏') || lowerName.includes('hxb')) {
    return "/logo/HXB.svg";
  }

  // 广发银行 GDB
  if (lowerName.includes('广发') || lowerName.includes('gdb')) {
    return "/logo/GDB.svg";
  }

  // 银行卡类型默认银联
  if (type === "BANK_CARD" || type === "CREDIT_CARD") {
    return "/logo/UNION.svg";
  }

  return null;
}

async function fetchAssetsData(currency: string): Promise<Asset[]> {
  const data = await apiFetch<{ items: Asset[] }>(`/api/assets?currency=${currency}`);
  return data.items.map((i) => ({
    ...i,
    balance: Number(i.balance),
    estimatedValue: Number(i.estimatedValue ?? i.balance),
  }));
}

export default function AssetsPage() {
  const [items, setItems] = useState<Asset[]>(MOCK_ASSETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Asset | null>(null);

  // Display settings
  const [displayCurrency, setDisplayCurrency] = useState("CNY");

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("CASH");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("CNY");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      const data = await fetchAssetsData(displayCurrency);
      // 如果 API 返回空数据，使用 mock 数据用于展示
      if (data.length === 0) {
        setItems(MOCK_ASSETS);
      } else {
        setItems(data);
      }
    } catch (e) {
      console.warn("Failed to fetch assets data, using mock data:", e);
      setItems(MOCK_ASSETS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [displayCurrency]);

  function openCreate() {
    setEditingItem(null);
    setName("");
    setType("CASH");
    setBalance("");
    setCurrency("CNY");
    setError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: Asset) {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setBalance(String(item.balance));
    setCurrency(item.currency);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = {
        name,
        type,
        balance,
        currency,
      };

      if (editingItem) {
        await apiFetch(`/api/assets/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/api/assets", {
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

  function openDeleteDialog(item: Asset) {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      await apiFetch(`/api/assets/${deletingItem.id}`, { method: "DELETE" });
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      loadItems();
    } catch (e) {
      alert("删除失败");
    }
  }

  const totalAssets = items.reduce((sum, item) => sum + item.estimatedValue, 0);

  return (
    <>
      <AssetsDefaultTheme
        items={items}
        totalAssets={totalAssets}
        displayCurrency={displayCurrency}
        onCurrencyChange={setDisplayCurrency}
        supportedCurrencies={SUPPORTED_CURRENCIES}
        loading={loading}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onDelete={handleDelete}
      />

      <BottomSheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle className="text-center sm:text-left">
              {editingItem ? "编辑资产" : "新增资产"}
            </BottomSheetTitle>
          </BottomSheetHeader>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">名称</label>
              <div className="flex items-center gap-3">
                <input
                  required
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：招商银行储蓄卡"
                />
                {getLogoUrl(name, type) && (
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center p-1.5 border border-gray-100 overflow-hidden">
                    <img
                      src={getLogoUrl(name, type)!}
                      alt="logo"
                      style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">类型</label>
                <select
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="CASH">现金</option>
                  <option value="BANK_CARD">银行卡</option>
                  <option value="CREDIT_CARD">信用卡</option>
                  <option value="ALIPAY">支付宝</option>
                  <option value="WECHAT">微信</option>
                  <option value="INVESTMENT">投资</option>
                  <option value="OTHER">其他</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">币种</label>
                <input
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">余额</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>

            <BottomSheetFooter className="flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "保存中..." : "保存"}
              </button>
            </BottomSheetFooter>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  openDeleteDialog(editingItem);
                }}
                className="w-full text-center text-xs text-red-500 hover:underline pt-2"
              >
                删除此资产
              </button>
            )}
          </form>
        </BottomSheetContent>
      </BottomSheet>

      {/* Delete Confirmation BottomSheet */}
      <BottomSheet open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle className="text-center">确认删除</BottomSheetTitle>
          </BottomSheetHeader>
          <div className="py-6 text-center text-gray-600">
            确定要删除资产「{deletingItem?.name}」吗？此操作不可撤销。
          </div>
          <BottomSheetFooter className="flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              删除
            </button>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
}
