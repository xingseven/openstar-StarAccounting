"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  LoadingPageShell,
} from "@/components/shared/PageLoadingShell";
import { Skeleton } from "@/components/shared/Skeletons";
import {
  THEME_DIALOG_INPUT_CLASS,
  THEME_DIALOG_SELECT_CLASS,
  ThemeActionBar,
  ThemeDialogSection,
  ThemeFormField,
  ThemeFormGrid,
  ThemeHero,
  ThemeMetricCard,
  ThemeNotice,
  ThemeSectionHeader,
  ThemeSurface,
} from "@/components/shared/theme-primitives";
import { BottomSheet, BottomSheetContent, BottomSheetDescription, BottomSheetHeader, BottomSheetTitle } from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm, useNoticeDialog } from "@/components/ui/confirm-dialog";

type BudgetStatus = "normal" | "warning" | "overdue";

type Budget = {
  id: string;
  category: string;
  platform?: string | null;
  amount: number;
  used: number;
  percent: number;
  period: "MONTHLY" | "YEARLY";
  scopeType: "GLOBAL" | "CATEGORY" | "PLATFORM";
  alertPercent: number;
  status: BudgetStatus;
  createdAt: string;
};

const SCOPE_TYPE_OPTIONS = [
  { value: "GLOBAL", label: "全局预算" },
  { value: "CATEGORY", label: "分类预算" },
  { value: "PLATFORM", label: "平台预算" },
] as const;

const COMMON_CATEGORIES = ["ALL", "餐饮", "交通", "购物", "娱乐", "医疗", "教育", "居住", "通讯", "其他"];
const COMMON_PLATFORMS = ["支付宝", "微信", "现金", "银行卡", "信用卡", "APP"];

function getStatusLabel(status: BudgetStatus) {
  switch (status) {
    case "overdue":
      return "超支";
    case "warning":
      return "预警";
    default:
      return "正常";
  }
}

function getStatusAccent(status: BudgetStatus) {
  switch (status) {
    case "overdue":
      return "bg-red-500";
    case "warning":
      return "bg-amber-500";
    default:
      return "bg-emerald-500";
  }
}

function getScopeTypeLabel(scopeType: string) {
  return SCOPE_TYPE_OPTIONS.find((option) => option.value === scopeType)?.label ?? scopeType;
}

export default function BudgetsPage() {
  const { confirmAsync, ConfirmDialog } = useConfirm();
  const { notify, NoticeDialog } = useNoticeDialog();
  const [items, setItems] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Budget | null>(null);
  const [category, setCategory] = useState("ALL");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [scopeType, setScopeType] = useState<"GLOBAL" | "CATEGORY" | "PLATFORM">("GLOBAL");
  const [platform, setPlatform] = useState("");
  const [alertPercent, setAlertPercent] = useState("80");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: Array<Record<string, unknown>> }>("/api/budgets");
      setItems(
        data.items.map((item) => ({
          id: String(item.id),
          category: String(item.category),
          platform: typeof item.platform === "string" ? item.platform : null,
          amount: Number(item.amount),
          used: Number(item.used),
          percent: Number(item.percent),
          period: item.period === "YEARLY" ? "YEARLY" : "MONTHLY",
          scopeType: item.scopeType === "CATEGORY" || item.scopeType === "PLATFORM" ? item.scopeType : "GLOBAL",
          alertPercent: Number(item.alertPercent ?? 80),
          status:
            item.status === "overdue" || item.status === "warning" ? (item.status as BudgetStatus) : "normal",
          createdAt: String(item.createdAt ?? ""),
        }))
      );
    } catch (loadError) {
      notify({
        title: "加载预算失败",
        description: loadError instanceof Error ? loadError.message : "请稍后重试。",
      });
    } finally {
      setPageLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  function openCreate() {
    setEditingItem(null);
    setCategory("ALL");
    setAmount("");
    setPeriod("MONTHLY");
    setScopeType("GLOBAL");
    setPlatform("");
    setAlertPercent("80");
    setError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: Budget) {
    setEditingItem(item);
    setCategory(item.category);
    setAmount(String(item.amount));
    setPeriod(item.period);
    setScopeType(item.scopeType);
    setPlatform(item.platform ?? "");
    setAlertPercent(String(item.alertPercent ?? 80));
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        category,
        amount,
        period,
        scopeType,
        alertPercent: Number(alertPercent),
      };

      if (scopeType === "PLATFORM" && platform) {
        body.platform = platform;
      }

      if (editingItem) {
        await apiFetch(`/api/budgets/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ amount, alertPercent: Number(alertPercent) }),
        });
      } else {
        await apiFetch("/api/budgets", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setIsModalOpen(false);
      await loadItems();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmAsync({
      title: "确认删除预算",
      description: "删除后当前预算配置会立即失效，确定继续吗？",
      confirmText: "删除",
      cancelText: "取消",
      tone: "danger",
    });

    if (!confirmed) return;

    try {
      await apiFetch(`/api/budgets/${id}`, { method: "DELETE" });
      await loadItems();
    } catch (deleteError) {
      notify({
        title: "删除失败",
        description: deleteError instanceof Error ? deleteError.message : "请稍后重试。",
      });
    }
  }

  const totalBudget = items.reduce((sum, item) => sum + item.amount, 0);
  const totalUsed = items.reduce((sum, item) => sum + item.used, 0);
  const warningCount = items.filter((item) => item.status !== "normal").length;

  const isSkeletonVisible = pageLoading;

  if (isSkeletonVisible) {
    return (
      <LoadingPageShell maxWidth="5xl">
        <section className="relative overflow-hidden rounded-[22px] [background:var(--theme-hero-bg)] p-4 sm:rounded-[26px] sm:p-6 lg:p-8">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-3">
              <Skeleton className="h-8 w-32 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full max-w-lg rounded-[14px]" />
                <Skeleton className="h-4 w-full max-w-xl rounded-full" />
                <Skeleton className="h-4 w-full max-w-lg rounded-full opacity-60" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[20px] p-4" style={{ background: "var(--theme-metric-bg)" }}>
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-20 rounded-full bg-white/70" />
                    <Skeleton className="h-7 w-24 rounded-[12px] bg-white/85" />
                    <Skeleton className="h-3 w-24 rounded-full bg-white/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="rounded-[22px] p-4 sm:p-6" style={{ background: "var(--theme-surface-bg)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
              <Skeleton className="h-7 w-32 rounded-[12px]" />
              <Skeleton className="h-3 w-56 rounded-full opacity-60" />
            </div>
            <Skeleton className="h-10 w-28 rounded-2xl" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="rounded-[22px] border border-slate-200 p-4 shadow-sm" style={{ background: "var(--theme-surface-bg)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-32 rounded-full opacity-60" />
                    <Skeleton className="h-3 w-24 rounded-full opacity-60" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-10 rounded-full" />
                    <Skeleton className="h-7 w-10 rounded-full" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20 rounded-full opacity-60" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16 rounded-full opacity-60" />
                    <Skeleton className="h-3 w-16 rounded-full opacity-60" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </LoadingPageShell>
    );
  }

  return (
    <PageContainer>
      <ThemeHero className="bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_35%)]">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted-text)" }}>
              Budget Control
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--theme-body-text)" }}>移动端弹窗已统一到底部，预算面板也同步跟上</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: "var(--theme-label-text)" }}>
                预算创建、编辑和删除现在都使用底部滑出的交互，移动端不再出现遮挡内容的居中模态。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <ThemeMetricCard label="预算数" value={`${items.length} 项`} tone="amber" icon={ShieldAlert} detail="当前账户下全部预算" />
            <ThemeMetricCard label="总预算" value={`¥${totalBudget.toFixed(2)}`} tone="blue" detail={`已使用 ¥${totalUsed.toFixed(2)}`} />
            <ThemeMetricCard label="预警项" value={`${warningCount} 项`} tone={warningCount > 0 ? "red" : "green"} detail="接近或已经超出阈值" />
          </div>
        </div>
      </ThemeHero>

      <ThemeSurface className="p-4 sm:p-6">
        <ThemeSectionHeader
          eyebrow="预算列表"
          title="多维预算"
          description="支持全局、分类、平台三种预算范围。"
          action={
            <Button onClick={openCreate} className="h-10 rounded-2xl">
              <Plus className="h-4 w-4" />
              新增预算
            </Button>
          }
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 p-10 text-center text-sm sm:col-span-2 xl:col-span-3" style={{ background: "var(--theme-dialog-section-bg)", color: "var(--theme-muted-text)" }}>
              还没有预算记录，先创建第一条预算。
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="rounded-[22px] border border-slate-200 p-4 shadow-sm" style={{ background: "var(--theme-surface-bg)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{item.category === "ALL" ? "总预算" : item.category}</h2>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--theme-muted-text)" }}>
                      {item.period === "MONTHLY" ? "月度" : "年度"} · {getScopeTypeLabel(item.scopeType)}
                      {item.scopeType === "PLATFORM" && item.platform ? ` · ${item.platform}` : ""}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--theme-muted-text)" }}>预警阈值 {item.alertPercent}%</p>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button onClick={() => openEdit(item)} className="rounded-full px-2 py-1 transition" style={{ color: "var(--theme-label-text)" }}>
                      编辑
                    </button>
                    <button onClick={() => void handleDelete(item.id)} className="rounded-full px-2 py-1 text-red-600 transition hover:bg-red-50/50">
                      删除
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--theme-muted-text)" }}>已用 ¥{item.used.toFixed(2)}</span>
                    <span className="font-semibold" style={{ color: "var(--theme-body-text)" }}>{item.percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--theme-empty-icon-bg)" }}>
                    <div className={getStatusAccent(item.status)} style={{ width: `${Math.min(item.percent, 100)}%`, height: "100%" }} />
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--theme-muted-text)" }}>
                    <span>剩余 ¥{(item.amount - item.used).toFixed(2)}</span>
                    <span>限额 ¥{item.amount.toFixed(2)}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </ThemeSurface>

      <BottomSheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BottomSheetContent className="max-w-md">
          <BottomSheetHeader>
            <BottomSheetTitle>{editingItem ? "编辑预算" : "新增预算"}</BottomSheetTitle>
            <BottomSheetDescription>统一维护预算作用域、周期、限额和预警阈值。</BottomSheetDescription>
          </BottomSheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <ThemeNotice tone="red" description={error} /> : null}

            <ThemeDialogSection className="space-y-4">
              <ThemeFormGrid>
                <ThemeFormField label="作用域">
                  <select
                    disabled={Boolean(editingItem)}
                    className={THEME_DIALOG_SELECT_CLASS}
                    value={scopeType}
                    onChange={(event) => setScopeType(event.target.value as typeof scopeType)}
                  >
                    {SCOPE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </ThemeFormField>

                <ThemeFormField label="周期">
                  <select
                    disabled={Boolean(editingItem)}
                    className={THEME_DIALOG_SELECT_CLASS}
                    value={period}
                    onChange={(event) => setPeriod(event.target.value as typeof period)}
                  >
                    <option value="MONTHLY">月度</option>
                    <option value="YEARLY">年度</option>
                  </select>
                </ThemeFormField>
              </ThemeFormGrid>

              <ThemeFormField label="分类">
                <Input
                  required
                  disabled={Boolean(editingItem)}
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  list="budget-categories"
                  className={THEME_DIALOG_INPUT_CLASS}
                  placeholder="选择或输入分类"
                />
                <datalist id="budget-categories">
                  {COMMON_CATEGORIES.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </ThemeFormField>

              {scopeType === "PLATFORM" ? (
                <ThemeFormField label="平台">
                  <Input
                    required
                    disabled={Boolean(editingItem)}
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                    list="budget-platforms"
                    className={THEME_DIALOG_INPUT_CLASS}
                    placeholder="选择或输入平台"
                  />
                  <datalist id="budget-platforms">
                    {COMMON_PLATFORMS.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                </ThemeFormField>
              ) : null}

              <ThemeFormGrid>
                <ThemeFormField label="限额">
                  <Input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className={THEME_DIALOG_INPUT_CLASS}
                  />
                </ThemeFormField>

                <ThemeFormField label="预警阈值" hint="1-100 之间">
                  <Input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={alertPercent}
                    onChange={(event) => setAlertPercent(event.target.value)}
                    className={THEME_DIALOG_INPUT_CLASS}
                  />
                </ThemeFormField>
              </ThemeFormGrid>
            </ThemeDialogSection>

            <ThemeActionBar>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-11 rounded-2xl sm:min-w-28">
                取消
              </Button>
              <Button type="submit" disabled={loading} className="h-11 rounded-2xl sm:min-w-28">
                {loading ? "保存中..." : "保存"}
              </Button>
            </ThemeActionBar>
          </form>
        </BottomSheetContent>
      </BottomSheet>

      {ConfirmDialog}
      {NoticeDialog}
    </PageContainer>
  );
}
