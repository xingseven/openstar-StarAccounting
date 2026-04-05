import type { ThemeId } from "@/themes/registry";
import { getThemeManifest, type DashboardVariantId } from "@/themes/theme-manifest";

export const DASHBOARD_ENTRY_FILES: Record<DashboardVariantId, string> = {
  default: "DefaultDashboard.tsx",
  analytics: "AnalyticsDashboard.tsx",
  "orange-purple": "OrangePurpleDashboard.tsx",
  "dusty-blue": "DustyBlueDashboard.tsx",
  vibrant: "VibrantDashboard.tsx",
  "charming-purple": "CharmingPurpleDashboard.tsx",
  "white-grid": "WhiteGridDashboard.tsx",
};

function stripDashboardFileExtension(fileName: string) {
  return fileName.replace(/\.tsx$/i, "");
}

export const DASHBOARD_ROUTE_SEGMENTS = Object.values(DASHBOARD_ENTRY_FILES).map(stripDashboardFileExtension);

export function getDashboardEntryFileNameForTheme(themeId: ThemeId) {
  return DASHBOARD_ENTRY_FILES[getThemeManifest(themeId).dashboardVariant];
}

export function getDashboardRouteSegment(themeId: ThemeId) {
  return stripDashboardFileExtension(getDashboardEntryFileNameForTheme(themeId));
}

export function getDashboardRoutePath(themeId: ThemeId) {
  return `/${getDashboardRouteSegment(themeId)}`;
}

export function isDashboardRouteSegment(value: string) {
  return DASHBOARD_ROUTE_SEGMENTS.includes(value);
}

export function isDashboardRoutePath(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  const normalizedPath = pathname.split("?")[0].replace(/^\/+|\/+$/g, "");
  return normalizedPath.length > 0 ? isDashboardRouteSegment(normalizedPath) : false;
}
