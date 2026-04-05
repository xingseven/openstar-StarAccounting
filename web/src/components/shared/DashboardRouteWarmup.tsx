"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { preloadAssetsData } from "@/features/assets/data-loader";
import { preloadConsumptionData } from "@/features/consumption/data-loader";
import { preloadDashboardData } from "@/features/dashboard/data-loader";
import { preloadLoansData } from "@/features/loans/data-loader";
import { preloadSavingsData } from "@/features/savings/data-loader";
import { NAV_ITEMS, resolveNavigationHref } from "@/components/shared/navigation";
import { useTheme } from "@/components/shared/theme-provider";
import { isDashboardRoutePath } from "@/themes/dashboard-routes";

type IdleCallbackHandle = {
  type: "idle" | "timeout";
  id: number;
};

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadlineLike) => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

const PRIMARY_ROUTE_ORDER = ["/", "/consumption", "/assets", "/savings", "/loans", "/data"];

const ROUTE_DATA_PRELOADERS: Partial<Record<string, () => void>> = {
  "/": preloadDashboardData,
  "/assets": () => preloadAssetsData("CNY"),
  "/consumption": () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    const compareStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0).toISOString();
    const compareEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

    preloadConsumptionData({
      startDate,
      endDate,
      compareStartDate,
      compareEndDate,
      bucketMode: "day",
    });
  },
  "/savings": preloadSavingsData,
  "/loans": preloadLoansData,
};

function scheduleWhenIdle(callback: () => void, timeoutMs: number): IdleCallbackHandle {
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    const requestIdleCallbackFn = idleWindow.requestIdleCallback;

    return {
      type: "idle",
      id: requestIdleCallbackFn(() => callback(), { timeout: timeoutMs }),
    };
  }

  return {
    type: "timeout",
    id: window.setTimeout(callback, timeoutMs),
  };
}

function cancelScheduledTask(handle?: IdleCallbackHandle) {
  if (!handle) return;

  const idleWindow = window as IdleWindow;
  if (handle.type === "idle" && idleWindow.cancelIdleCallback) {
    const cancelIdleCallbackFn = idleWindow.cancelIdleCallback;
    cancelIdleCallbackFn(handle.id);
    return;
  }

  window.clearTimeout(handle.id);
}

function getPrefetchPlan(pathname: string, themeId: ReturnType<typeof useTheme>["themeId"]) {
  const allRoutes = NAV_ITEMS.map((item) => resolveNavigationHref(item.href, themeId));
  const primaryRoutes = PRIMARY_ROUTE_ORDER
    .map((href) => resolveNavigationHref(href, themeId))
    .filter((href, index, routes) => href !== pathname && routes.indexOf(href) === index);
  const secondaryRoutes = allRoutes.filter((href) => href !== pathname && !primaryRoutes.includes(href));
  return { primaryRoutes, secondaryRoutes };
}

function getNetworkProfile() {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return {
    saveData: Boolean(connection?.saveData),
    effectiveType: connection?.effectiveType ?? "",
  };
}

export function DashboardRouteWarmup() {
  const router = useRouter();
  const pathname = usePathname();
  const { themeId } = useTheme();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const { saveData, effectiveType } = getNetworkProfile();
    const { primaryRoutes, secondaryRoutes } = getPrefetchPlan(pathname, themeId);
    const allowSecondaryRoutes = !saveData && !["slow-2g", "2g", "3g"].includes(effectiveType);
    const queue = allowSecondaryRoutes ? [...primaryRoutes, ...secondaryRoutes] : primaryRoutes;

    let cancelled = false;
    let nextTask: IdleCallbackHandle | undefined;
    let index = 0;

    const warmNextRoute = () => {
      if (cancelled || index >= queue.length) {
        return;
      }

      const href = queue[index];
      index += 1;

      router.prefetch(href);
      const preloader = isDashboardRoutePath(href) ? preloadDashboardData : ROUTE_DATA_PRELOADERS[href];
      preloader?.();

      const isPrimaryRoute = index < primaryRoutes.length;
      nextTask = scheduleWhenIdle(warmNextRoute, isPrimaryRoute ? 350 : 900);
    };

    nextTask = scheduleWhenIdle(warmNextRoute, 500);

    return () => {
      cancelled = true;
      cancelScheduledTask(nextTask);
    };
  }, [pathname, router, themeId]);

  return null;
}
