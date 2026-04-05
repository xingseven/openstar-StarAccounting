import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DashboardData } from "@/types";
import type { ThemeId } from "@/themes/registry";
import { DashboardLoadingShell } from "@/features/dashboard/components/themes/DashboardLoadingShell";
import { AnalyticsLoadingShell } from "@/features/dashboard/components/themes/AnalyticsLoadingShell";
import { OrangePurpleLoadingShell } from "@/features/dashboard/components/themes/OrangePurpleLoadingShell";
import { DustyBlueLoadingShell } from "@/features/dashboard/components/themes/DustyBlueLoadingShell";
import { VibrantLoadingShell } from "@/features/dashboard/components/themes/VibrantLoadingShell";
import { CharmingPurpleLoadingShell } from "@/features/dashboard/components/themes/CharmingPurpleLoadingShell";
import { WhiteGridLoadingShell } from "@/features/dashboard/components/themes/WhiteGridLoadingShell";
import { getThemeManifest, type DashboardVariantId } from "@/themes/theme-manifest";
import { getDashboardEntryFileNameForTheme } from "@/themes/dashboard-routes";

export type DashboardThemeProps = {
  data: DashboardData;
  loading?: boolean;
};

type DashboardThemeComponent = ComponentType<DashboardThemeProps>;

const DASHBOARD_COMPONENTS: Record<DashboardVariantId, DashboardThemeComponent> = {
  default: dynamic(
    () => import("@/features/dashboard/components/themes/DefaultDashboard").then((mod) => mod.DashboardDefaultTheme),
    {
      ssr: false,
      loading: () => <DashboardLoadingShell />,
    },
  ),
  analytics: dynamic(
    () => import("@/features/dashboard/components/themes/AnalyticsDashboard").then((mod) => mod.AnalyticsDashboard),
    {
      ssr: false,
      loading: () => <AnalyticsLoadingShell />,
    },
  ),
  "orange-purple": dynamic(
    () => import("@/features/dashboard/components/themes/OrangePurpleDashboard").then((mod) => mod.OrangePurpleDashboard),
    {
      ssr: false,
      loading: () => <OrangePurpleLoadingShell />,
    },
  ),
  "dusty-blue": dynamic(
    () => import("@/features/dashboard/components/themes/DustyBlueDashboard").then((mod) => mod.DustyBlueDashboard),
    {
      ssr: false,
      loading: () => <DustyBlueLoadingShell />,
    },
  ),
  vibrant: dynamic(
    () => import("@/features/dashboard/components/themes/VibrantDashboard").then((mod) => mod.VibrantDashboard),
    {
      ssr: false,
      loading: () => <VibrantLoadingShell />,
    },
  ),
  "charming-purple": dynamic(
    () => import("@/features/dashboard/components/themes/CharmingPurpleDashboard").then((mod) => mod.CharmingPurpleDashboard),
    {
      ssr: false,
      loading: () => <CharmingPurpleLoadingShell />,
    },
  ),
  "white-grid": dynamic(
    () => import("@/features/dashboard/components/themes/WhiteGridDashboard").then((mod) => mod.WhiteGridDashboard),
    {
      ssr: false,
      loading: () => <WhiteGridLoadingShell />,
    },
  ),
};

export function getDashboardThemeComponent(themeId: ThemeId) {
  return DASHBOARD_COMPONENTS[getThemeManifest(themeId).dashboardVariant];
}

export function getDashboardEntryFileName(themeId: ThemeId) {
  return getDashboardEntryFileNameForTheme(themeId);
}
