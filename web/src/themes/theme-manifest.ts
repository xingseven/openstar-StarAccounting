import type { ThemeId } from "@/themes/registry";

export type DashboardVariantId =
  | "default"
  | "analytics"
  | "orange-purple"
  | "dusty-blue"
  | "vibrant"
  | "charming-purple"
  | "white-grid";

export type SidebarVariantId = DashboardVariantId;
export type HeaderVariantId = "surface" | "transparent";
export type MobileNavVariantId = "default" | "analytics";
export type ThemePreviewTone = "light" | "dark" | "nova" | "frost";

export type ThemeManifest = {
  dashboardVariant: DashboardVariantId;
  headerVariant: HeaderVariantId;
  mobileNavVariant: MobileNavVariantId;
  previewTone: ThemePreviewTone;
  sidebar: {
    variant: SidebarVariantId;
    widthClass: string;
    shellClass: string;
    shadow: "default" | "none";
    floating?: boolean;
  };
};

type ThemeManifestOverrides = Partial<Omit<ThemeManifest, "sidebar">> & {
  sidebar?: Partial<ThemeManifest["sidebar"]>;
};

const DEFAULT_THEME_MANIFEST: ThemeManifest = {
  dashboardVariant: "default",
  headerVariant: "surface",
  mobileNavVariant: "default",
  previewTone: "light",
  sidebar: {
    variant: "default",
    widthClass: "w-[164px]",
    shellClass: "rounded-[34px] border p-0 backdrop-blur-xl",
    shadow: "default",
  },
};

function defineThemeManifest(overrides: ThemeManifestOverrides = {}): ThemeManifest {
  return {
    ...DEFAULT_THEME_MANIFEST,
    ...overrides,
    sidebar: {
      ...DEFAULT_THEME_MANIFEST.sidebar,
      ...overrides.sidebar,
    },
  };
}

export const THEME_MANIFESTS: Record<ThemeId, ThemeManifest> = {
  default: DEFAULT_THEME_MANIFEST,
  analytics: defineThemeManifest({
    dashboardVariant: "analytics",
    headerVariant: "transparent",
    mobileNavVariant: "analytics",
    sidebar: {
      variant: "analytics",
      widthClass: "w-[240px] pl-2",
      shellClass: "rounded-none border-none bg-transparent p-0",
      shadow: "none",
    },
  }),
  "orange-purple": defineThemeManifest({
    dashboardVariant: "orange-purple",
    headerVariant: "transparent",
    sidebar: {
      variant: "orange-purple",
      widthClass: "w-[180px]",
      shellClass: "rounded-none border-r border-[#f0f1f7] bg-white p-0",
      shadow: "none",
    },
  }),
  "dusty-blue": defineThemeManifest({
    dashboardVariant: "dusty-blue",
    headerVariant: "transparent",
    sidebar: {
      variant: "dusty-blue",
      widthClass: "w-[90px]",
      shellClass: "rounded-none border-r border-[#E4E9F0] bg-[#F9FAFC] p-0",
      shadow: "none",
    },
  }),
  vibrant: defineThemeManifest({
    dashboardVariant: "vibrant",
    headerVariant: "transparent",
    sidebar: {
      variant: "vibrant",
      widthClass: "w-[90px]",
      shellClass: "rounded-none border-r border-transparent bg-white p-0",
      shadow: "none",
    },
  }),
  "charming-purple": defineThemeManifest({
    dashboardVariant: "charming-purple",
    headerVariant: "transparent",
    sidebar: {
      variant: "charming-purple",
      widthClass: "w-[240px] pl-2",
      shellClass: "rounded-none border-none bg-transparent p-0",
      shadow: "none",
    },
  }),
  "white-grid": defineThemeManifest({
    dashboardVariant: "white-grid",
    headerVariant: "transparent",
    sidebar: {
      variant: "white-grid",
      widthClass: "w-[240px] pl-2",
      shellClass: "bg-transparent pl-2 pr-4",
      shadow: "none",
      floating: true,
    },
  }),
  graphite: defineThemeManifest(),
  spruce: defineThemeManifest(),
  terracotta: defineThemeManifest(),
  nova: defineThemeManifest({
    previewTone: "nova",
  }),
  midnight: defineThemeManifest({
    previewTone: "dark",
  }),
  frost: defineThemeManifest({
    previewTone: "frost",
  }),
};

export function getThemeManifest(themeId: ThemeId) {
  return THEME_MANIFESTS[themeId] ?? DEFAULT_THEME_MANIFEST;
}
