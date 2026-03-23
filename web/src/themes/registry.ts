export type ThemeId = "default" | "graphite" | "spruce";

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    shell: string;
    surface: string;
    accent: string;
    contrast: string;
  };
  vars: Record<string, string>;
};

export const DEFAULT_THEME_ID: ThemeId = "default";

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  default: {
    id: "default",
    name: "默认主题",
    description: "干净的白底工作台，适合长期使用。",
    preview: {
      shell: "linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%)",
      surface: "#ffffff",
      accent: "#2563eb",
      contrast: "#0f172a",
    },
    vars: {
      "theme-app-bg": "linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%)",
      "theme-shell-bg": "#ffffff",
      "theme-shell-border": "#e2e8f0",
      "theme-shell-shadow": "0 1px 3px rgba(15,23,42,0.08)",
      "theme-header-bg": "#ffffff",
      "theme-header-border": "#e2e8f0",
      "theme-header-shadow": "0 1px 2px rgba(15,23,42,0.06)",
      "theme-sidebar-bg": "#ffffff",
      "theme-sidebar-border": "#e2e8f0",
      "theme-sidebar-text": "#475569",
      "theme-sidebar-muted": "#94a3b8",
      "theme-sidebar-hover-bg": "#f8fafc",
      "theme-sidebar-hover-text": "#0f172a",
      "theme-sidebar-active-bg": "#eff6ff",
      "theme-sidebar-active-text": "#1d4ed8",
      "theme-sidebar-icon-bg": "#f1f5f9",
      "theme-sidebar-icon-text": "#64748b",
      "theme-sidebar-icon-active-bg": "#ffffff",
      "theme-sidebar-icon-active-text": "#2563eb",
      "theme-surface-bg": "#ffffff",
      "theme-surface-border": "#e2e8f0",
      "theme-surface-shadow": "0 1px 2px rgba(15,23,42,0.06)",
      "theme-hero-bg": "#ffffff",
      "theme-hero-border": "#e2e8f0",
      "theme-hero-shadow": "0 1px 2px rgba(15,23,42,0.06)",
      "theme-dark-panel-bg": "#0f172a",
      "theme-dark-panel-border": "rgba(15,23,42,0.1)",
      "theme-dark-panel-shadow": "0 1px 2px rgba(15,23,42,0.14)",
      "theme-metric-bg": "#ffffff",
      "theme-metric-border": "#e2e8f0",
      "theme-metric-shadow": "0 1px 2px rgba(15,23,42,0.05)",
    },
  },
  graphite: {
    id: "graphite",
    name: "石墨主题",
    description: "更克制的灰阶工作台，视觉更沉稳。",
    preview: {
      shell: "linear-gradient(180deg,#f3f4f6 0%,#e5e7eb 100%)",
      surface: "#ffffff",
      accent: "#0f172a",
      contrast: "#111827",
    },
    vars: {
      "theme-app-bg": "linear-gradient(180deg,#f3f4f6 0%,#e5e7eb 100%)",
      "theme-shell-bg": "#fcfcfd",
      "theme-shell-border": "#d1d5db",
      "theme-shell-shadow": "0 1px 3px rgba(17,24,39,0.08)",
      "theme-header-bg": "#fcfcfd",
      "theme-header-border": "#d1d5db",
      "theme-header-shadow": "0 1px 2px rgba(17,24,39,0.05)",
      "theme-sidebar-bg": "#f8fafc",
      "theme-sidebar-border": "#d1d5db",
      "theme-sidebar-text": "#4b5563",
      "theme-sidebar-muted": "#9ca3af",
      "theme-sidebar-hover-bg": "#f3f4f6",
      "theme-sidebar-hover-text": "#111827",
      "theme-sidebar-active-bg": "#e5e7eb",
      "theme-sidebar-active-text": "#111827",
      "theme-sidebar-icon-bg": "#e5e7eb",
      "theme-sidebar-icon-text": "#6b7280",
      "theme-sidebar-icon-active-bg": "#ffffff",
      "theme-sidebar-icon-active-text": "#111827",
      "theme-surface-bg": "#ffffff",
      "theme-surface-border": "#d1d5db",
      "theme-surface-shadow": "0 1px 2px rgba(17,24,39,0.05)",
      "theme-hero-bg": "#ffffff",
      "theme-hero-border": "#d1d5db",
      "theme-hero-shadow": "0 1px 2px rgba(17,24,39,0.05)",
      "theme-dark-panel-bg": "#111827",
      "theme-dark-panel-border": "rgba(17,24,39,0.12)",
      "theme-dark-panel-shadow": "0 1px 2px rgba(17,24,39,0.16)",
      "theme-metric-bg": "#ffffff",
      "theme-metric-border": "#d1d5db",
      "theme-metric-shadow": "0 1px 2px rgba(17,24,39,0.04)",
    },
  },
  spruce: {
    id: "spruce",
    name: "云杉主题",
    description: "带一点绿色气息的清爽工作台。",
    preview: {
      shell: "linear-gradient(180deg,#f4fbf8 0%,#e7f4ee 100%)",
      surface: "#ffffff",
      accent: "#0f766e",
      contrast: "#134e4a",
    },
    vars: {
      "theme-app-bg": "linear-gradient(180deg,#f4fbf8 0%,#e7f4ee 100%)",
      "theme-shell-bg": "#ffffff",
      "theme-shell-border": "#d1fae5",
      "theme-shell-shadow": "0 1px 3px rgba(15,118,110,0.08)",
      "theme-header-bg": "#ffffff",
      "theme-header-border": "#d1fae5",
      "theme-header-shadow": "0 1px 2px rgba(15,118,110,0.05)",
      "theme-sidebar-bg": "#f6fffb",
      "theme-sidebar-border": "#d1fae5",
      "theme-sidebar-text": "#0f766e",
      "theme-sidebar-muted": "#6b9f97",
      "theme-sidebar-hover-bg": "#ecfdf5",
      "theme-sidebar-hover-text": "#134e4a",
      "theme-sidebar-active-bg": "#d1fae5",
      "theme-sidebar-active-text": "#115e59",
      "theme-sidebar-icon-bg": "#ecfdf5",
      "theme-sidebar-icon-text": "#0f766e",
      "theme-sidebar-icon-active-bg": "#ffffff",
      "theme-sidebar-icon-active-text": "#0f766e",
      "theme-surface-bg": "#ffffff",
      "theme-surface-border": "#d1fae5",
      "theme-surface-shadow": "0 1px 2px rgba(15,118,110,0.05)",
      "theme-hero-bg": "#ffffff",
      "theme-hero-border": "#d1fae5",
      "theme-hero-shadow": "0 1px 2px rgba(15,118,110,0.05)",
      "theme-dark-panel-bg": "#134e4a",
      "theme-dark-panel-border": "rgba(19,78,74,0.12)",
      "theme-dark-panel-shadow": "0 1px 2px rgba(19,78,74,0.18)",
      "theme-metric-bg": "#ffffff",
      "theme-metric-border": "#d1fae5",
      "theme-metric-shadow": "0 1px 2px rgba(15,118,110,0.04)",
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
