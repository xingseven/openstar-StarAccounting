"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export const DEFAULT_INCOME_CATEGORIES = [
  "工资",
  "奖金",
  "报销",
  "兼职收入",
  "转账收入",
  "理财收益",
  "其他收入",
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  "餐饮",
  "购物",
  "交通",
  "娱乐",
  "生活",
  "医疗",
  "教育",
  "住房",
  "通讯",
  "还款",
  "信用卡还款",
  "贷款还款",
  "转账支出",
  "其他支出",
] as const;

export type TransactionCategoryCatalog = {
  income: string[];
  expense: string[];
};

const DEFAULT_CATEGORY_CATALOG: TransactionCategoryCatalog = {
  income: [...DEFAULT_INCOME_CATEGORIES],
  expense: [...DEFAULT_EXPENSE_CATEGORIES],
};

export function mergeCategoryOptions(...groups: Array<Iterable<string | null | undefined>>) {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    for (const value of group) {
      if (typeof value !== "string") continue;
      const normalizedValue = value.trim();
      if (!normalizedValue || seen.has(normalizedValue)) continue;
      seen.add(normalizedValue);
      result.push(normalizedValue);
    }
  }

  return result;
}

async function fetchTransactionCategoryCatalog() {
  return apiFetch<TransactionCategoryCatalog>("/api/transactions/categories");
}

export function useTransactionCategories() {
  const [categories, setCategories] = useState<TransactionCategoryCatalog>(DEFAULT_CATEGORY_CATALOG);

  const refresh = useCallback(async () => {
    try {
      const remoteCatalog = await fetchTransactionCategoryCatalog();
      setCategories({
        income: mergeCategoryOptions(DEFAULT_INCOME_CATEGORIES, remoteCatalog.income),
        expense: mergeCategoryOptions(DEFAULT_EXPENSE_CATEGORIES, remoteCatalog.expense),
      });
    } catch {
      setCategories(DEFAULT_CATEGORY_CATALOG);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    categories,
    refresh,
  };
}
