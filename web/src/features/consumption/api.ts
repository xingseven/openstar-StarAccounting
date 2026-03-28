import { apiFetch } from "@/lib/api";
import type { ConsumptionData } from "@/features/consumption/components/ConsumptionDefaultTheme";

type DashboardResponse = Omit<ConsumptionData, "summary"> & {
  summary: Omit<ConsumptionData["summary"], "comparison">;
};

function buildPath(path: string, params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export async function fetchConsumptionData(
  startDate?: string,
  endDate?: string,
  compareStartDate?: string,
  compareEndDate?: string,
  bucket: "day" | "month" = "day",
): Promise<ConsumptionData> {
  function calcChangeRate(current: number, previous: number) {
    if (!Number.isFinite(previous) || previous <= 0) return null;
    return ((current - previous) / previous) * 100;
  }

  const dashboardPath = buildPath("/api/consumption/dashboard", {
    startDate,
    endDate,
    bucket,
  });
  const compareDashboardPath = buildPath("/api/consumption/dashboard", {
    startDate: compareStartDate,
    endDate: compareEndDate,
    bucket,
  });
  const [dashboardData, compareDashboardData] = await Promise.all([
    apiFetch<DashboardResponse>(dashboardPath),
    compareStartDate && compareEndDate
      ? apiFetch<DashboardResponse>(compareDashboardPath)
      : Promise.resolve<DashboardResponse | null>(null),
  ]);

  return {
    ...dashboardData,
    summary: {
      ...dashboardData.summary,
      comparison: {
        totalExpenseRate: calcChangeRate(
          dashboardData.summary.totalExpense,
          compareDashboardData?.summary.totalExpense ?? 0,
        ),
        totalIncomeRate: calcChangeRate(
          dashboardData.summary.totalIncome,
          compareDashboardData?.summary.totalIncome ?? 0,
        ),
        wechatExpenseRate: calcChangeRate(
          dashboardData.summary.wechat.expense,
          compareDashboardData?.summary.wechat.expense ?? 0,
        ),
        wechatIncomeRate: calcChangeRate(
          dashboardData.summary.wechat.income,
          compareDashboardData?.summary.wechat.income ?? 0,
        ),
        alipayExpenseRate: calcChangeRate(
          dashboardData.summary.alipay.expense,
          compareDashboardData?.summary.alipay.expense ?? 0,
        ),
        alipayIncomeRate: calcChangeRate(
          dashboardData.summary.alipay.income,
          compareDashboardData?.summary.alipay.income ?? 0,
        ),
      },
    },
  };
}
