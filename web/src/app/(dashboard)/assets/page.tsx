"use client";

import { apiFetch } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Asset } from "@/types";
import { MOCK_ASSETS } from "@/features/shared/mockData";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { useNoticeDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  THEME_DIALOG_INPUT_CLASS,
  THEME_DIALOG_SELECT_CLASS,
  ThemeActionBar,
  ThemeDialogSection,
  ThemeFormField,
  ThemeFormGrid,
  ThemeNotice,
} from "@/components/shared/theme-primitives";

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
  const { notify, NoticeDialog } = useNoticeDialog();
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

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchAssetsData(displayCurrency);
      // 如果 API 返回空数据，使用 mock 数据用于展示
      if (data.length === 0) {
        setItems(MOCK_ASSETS);
      } else {
        setItems(data);
      }
    } catch (loadError) {
      console.warn("Failed to fetch assets data, using mock data:", loadError);
      setItems(MOCK_ASSETS);
    } finally {
      setLoading(false);
    }
  }, [displayCurrency]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

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
      await loadItems();
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
      await loadItems();
    } catch (deleteError) {
      notify({
        title: "删除资产失败",
        description: deleteError instanceof Error ? deleteError.message : "请稍后重试。",
      });
    }
  }

  const totalAssets = items.reduce((sum, item) => sum + item.estimatedValue, 0);
  const logoUrl = getLogoUrl(name, type);

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
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>{editingItem ? "编辑资产" : "新增资产"}</BottomSheetTitle>
            <BottomSheetDescription>维护资产名称、类型、币种和当前余额。</BottomSheetDescription>
          </BottomSheetHeader>

          {error ? <ThemeNotice tone="red" className="mb-4" description={error} /> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <ThemeDialogSection className="space-y-4">
              <ThemeFormField label="名称">
                <div className="flex items-center gap-3">
                  <Input
                    required
                    className={`${THEME_DIALOG_INPUT_CLASS} flex-1`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：招商银行储蓄卡"
                  />
                  {logoUrl ? (
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-1.5">
                      <Image src={logoUrl} alt="logo" width={28} height={28} className="h-full w-auto object-contain" unoptimized />
                    </div>
                  ) : null}
                </div>
              </ThemeFormField>

              <ThemeFormGrid>
                <ThemeFormField label="类型">
                  <select
                    className={THEME_DIALOG_SELECT_CLASS}
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
                </ThemeFormField>

                <ThemeFormField label="币种">
                  <Input
                    className={THEME_DIALOG_INPUT_CLASS}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </ThemeFormField>
              </ThemeFormGrid>

              <ThemeFormField label="余额">
                <Input
                  required
                  type="number"
                  step="0.01"
                  className={THEME_DIALOG_INPUT_CLASS}
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </ThemeFormField>
            </ThemeDialogSection>

            <ThemeActionBar>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-11 rounded-2xl sm:min-w-28"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-2xl sm:min-w-28"
              >
                {loading ? "保存中..." : "保存"}
              </Button>
            </ThemeActionBar>

            {editingItem ? (
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  openDeleteDialog(editingItem);
                }}
                className="w-full pt-2 text-center text-xs text-red-500 hover:underline"
              >
                删除此资产
              </button>
            ) : null}
          </form>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>确认删除</BottomSheetTitle>
            <BottomSheetDescription>确定要删除资产「{deletingItem?.name}」吗？此操作不可撤销。</BottomSheetDescription>
          </BottomSheetHeader>
          <BottomSheetFooter className="flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-11 rounded-2xl sm:min-w-28"
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              className="h-11 rounded-2xl sm:min-w-28"
            >
              删除
            </Button>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>

      {NoticeDialog}
    </>
  );
}
