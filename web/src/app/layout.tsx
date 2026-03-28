import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PWARegister } from "@/components/shared/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "openstar-StarAccounting",
    template: "%s | StarAccounting",
  },
  description: "个人财务管理仪表盘 - 智能记账、预算管理、资产追踪",
  keywords: ["财务管理", "记账", "预算", "资产", "消费分析"],
  authors: [{ name: "OpenStar Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StarAccounting",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "StarAccounting",
    title: "openstar-StarAccounting",
    description: "个人财务管理仪表盘 - 智能记账、预算管理、资产追踪",
  },
  twitter: {
    card: "summary_large_image",
    title: "openstar-StarAccounting",
    description: "个人财务管理仪表盘 - 智能记账、预算管理、资产追踪",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* 消除主题 FOUC：在 hydration 前读取 localStorage 并立即注入 CSS 变量 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var THEMES={default:{"theme-app-bg":"linear-gradient(180deg,#f9fbfd 0%,#edf3f8 100%)","theme-shell-bg":"rgba(255,255,255,0.48)","theme-shell-border":"rgba(148,163,184,0.12)","theme-shell-shadow":"none","theme-header-bg":"rgba(255,255,255,0.72)","theme-header-border":"rgba(148,163,184,0.08)","theme-header-shadow":"none","theme-sidebar-bg":"rgba(255,255,255,0.56)","theme-sidebar-border":"rgba(148,163,184,0.08)","theme-sidebar-text":"#475569","theme-sidebar-muted":"#94a3b8","theme-sidebar-hover-bg":"rgba(255,255,255,0.58)","theme-sidebar-hover-text":"#0f172a","theme-sidebar-active-bg":"rgba(239,246,255,0.9)","theme-sidebar-active-text":"#1d4ed8","theme-sidebar-icon-bg":"rgba(241,245,249,0.72)","theme-sidebar-icon-text":"#64748b","theme-sidebar-icon-active-bg":"rgba(255,255,255,0.92)","theme-sidebar-icon-active-text":"#2563eb","theme-surface-bg":"rgba(255,255,255,0.74)","theme-surface-border":"rgba(148,163,184,0.08)","theme-surface-shadow":"none","theme-hero-bg":"linear-gradient(180deg,rgba(255,255,255,0.92) 0%,rgba(247,250,253,0.88) 100%)","theme-hero-border":"rgba(148,163,184,0.08)","theme-hero-shadow":"none","theme-dark-panel-bg":"#0f172a","theme-dark-panel-border":"rgba(15,23,42,0.08)","theme-dark-panel-shadow":"0 16px 38px rgba(15,23,42,0.18)","theme-metric-bg":"rgba(255,255,255,0.58)","theme-metric-border":"rgba(148,163,184,0.06)","theme-metric-shadow":"none","theme-label-text":"#374151","theme-hint-text":"#6b7280","theme-body-text":"#0f172a","theme-muted-text":"#64748b","theme-dialog-section-bg":"rgba(248,250,252,0.7)","theme-empty-icon-bg":"#f1f5f9","theme-empty-icon-text":"#94a3b8","theme-input-bg":"rgba(255,255,255,0.88)","theme-input-border":"rgba(148,163,184,0.6)"},graphite:{"theme-app-bg":"linear-gradient(180deg,#f5f6f8 0%,#eceff2 100%)","theme-shell-bg":"rgba(252,252,253,0.46)","theme-shell-border":"rgba(107,114,128,0.12)","theme-shell-shadow":"none","theme-header-bg":"rgba(252,252,253,0.72)","theme-header-border":"rgba(107,114,128,0.08)","theme-header-shadow":"none","theme-sidebar-bg":"rgba(248,250,252,0.62)","theme-sidebar-border":"rgba(107,114,128,0.08)","theme-sidebar-text":"#4b5563","theme-sidebar-muted":"#9ca3af","theme-sidebar-hover-bg":"rgba(243,244,246,0.74)","theme-sidebar-hover-text":"#111827","theme-sidebar-active-bg":"rgba(229,231,235,0.84)","theme-sidebar-active-text":"#111827","theme-sidebar-icon-bg":"rgba(229,231,235,0.72)","theme-sidebar-icon-text":"#6b7280","theme-sidebar-icon-active-bg":"rgba(255,255,255,0.92)","theme-sidebar-icon-active-text":"#111827","theme-surface-bg":"rgba(255,255,255,0.72)","theme-surface-border":"rgba(107,114,128,0.08)","theme-surface-shadow":"none","theme-hero-bg":"linear-gradient(180deg,rgba(255,255,255,0.9) 0%,rgba(247,247,248,0.86) 100%)","theme-hero-border":"rgba(107,114,128,0.08)","theme-hero-shadow":"none","theme-dark-panel-bg":"#111827","theme-dark-panel-border":"rgba(17,24,39,0.08)","theme-dark-panel-shadow":"0 16px 38px rgba(17,24,39,0.18)","theme-metric-bg":"rgba(255,255,255,0.58)","theme-metric-border":"rgba(107,114,128,0.06)","theme-metric-shadow":"none","theme-label-text":"#374151","theme-hint-text":"#6b7280","theme-body-text":"#111827","theme-muted-text":"#6b7280","theme-dialog-section-bg":"rgba(243,244,246,0.7)","theme-empty-icon-bg":"#e5e7eb","theme-empty-icon-text":"#9ca3af","theme-input-bg":"rgba(255,255,255,0.88)","theme-input-border":"rgba(107,114,128,0.6)"},spruce:{"theme-app-bg":"linear-gradient(180deg,#f6fbf9 0%,#eaf3ef 100%)","theme-shell-bg":"rgba(255,255,255,0.48)","theme-shell-border":"rgba(15,118,110,0.12)","theme-shell-shadow":"none","theme-header-bg":"rgba(255,255,255,0.72)","theme-header-border":"rgba(15,118,110,0.08)","theme-header-shadow":"none","theme-sidebar-bg":"rgba(246,255,251,0.62)","theme-sidebar-border":"rgba(15,118,110,0.08)","theme-sidebar-text":"#0f766e","theme-sidebar-muted":"#6b9f97","theme-sidebar-hover-bg":"rgba(236,253,245,0.76)","theme-sidebar-hover-text":"#134e4a","theme-sidebar-active-bg":"rgba(209,250,229,0.84)","theme-sidebar-active-text":"#115e59","theme-sidebar-icon-bg":"rgba(236,253,245,0.76)","theme-sidebar-icon-text":"#0f766e","theme-sidebar-icon-active-bg":"rgba(255,255,255,0.92)","theme-sidebar-icon-active-text":"#0f766e","theme-surface-bg":"rgba(255,255,255,0.72)","theme-surface-border":"rgba(15,118,110,0.08)","theme-surface-shadow":"none","theme-hero-bg":"linear-gradient(180deg,rgba(255,255,255,0.92) 0%,rgba(245,252,249,0.88) 100%)","theme-hero-border":"rgba(15,118,110,0.08)","theme-hero-shadow":"none","theme-dark-panel-bg":"#134e4a","theme-dark-panel-border":"rgba(19,78,74,0.08)","theme-dark-panel-shadow":"0 16px 38px rgba(19,78,74,0.18)","theme-metric-bg":"rgba(255,255,255,0.6)","theme-metric-border":"rgba(15,118,110,0.06)","theme-metric-shadow":"none","theme-label-text":"#0f5952","theme-hint-text":"#4a8b82","theme-body-text":"#134e4a","theme-muted-text":"#6b9f97","theme-dialog-section-bg":"rgba(236,253,245,0.6)","theme-empty-icon-bg":"#d1fae5","theme-empty-icon-text":"#6ee7b7","theme-input-bg":"rgba(255,255,255,0.88)","theme-input-border":"rgba(15,118,110,0.5)"},terracotta:{"theme-app-bg":"linear-gradient(180deg,#fff8f2 0%,#f5eadd 100%)","theme-shell-bg":"rgba(255,253,249,0.5)","theme-shell-border":"rgba(154,91,67,0.12)","theme-shell-shadow":"none","theme-header-bg":"rgba(255,253,249,0.74)","theme-header-border":"rgba(154,91,67,0.08)","theme-header-shadow":"none","theme-sidebar-bg":"rgba(255,248,242,0.64)","theme-sidebar-border":"rgba(154,91,67,0.08)","theme-sidebar-text":"#9a5b43","theme-sidebar-muted":"#c08a72","theme-sidebar-hover-bg":"rgba(255,241,231,0.78)","theme-sidebar-hover-text":"#7c3a20","theme-sidebar-active-bg":"rgba(253,225,209,0.86)","theme-sidebar-active-text":"#9f3415","theme-sidebar-icon-bg":"rgba(251,231,220,0.78)","theme-sidebar-icon-text":"#b46949","theme-sidebar-icon-active-bg":"rgba(255,253,249,0.92)","theme-sidebar-icon-active-text":"#c65d3a","theme-surface-bg":"rgba(255,253,249,0.74)","theme-surface-border":"rgba(154,91,67,0.08)","theme-surface-shadow":"none","theme-hero-bg":"linear-gradient(180deg,rgba(255,250,245,0.94) 0%,rgba(252,243,236,0.88) 100%)","theme-hero-border":"rgba(154,91,67,0.08)","theme-hero-shadow":"none","theme-dark-panel-bg":"#6f2f1d","theme-dark-panel-border":"rgba(111,47,29,0.1)","theme-dark-panel-shadow":"0 16px 38px rgba(111,47,29,0.18)","theme-metric-bg":"rgba(255,253,249,0.6)","theme-metric-border":"rgba(154,91,67,0.06)","theme-metric-shadow":"none","theme-label-text":"#7c3a20","theme-hint-text":"#a0613f","theme-body-text":"#6f2f1d","theme-muted-text":"#c08a72","theme-dialog-section-bg":"rgba(255,241,231,0.6)","theme-empty-icon-bg":"#fde8d8","theme-empty-icon-text":"#f4a47c","theme-input-bg":"rgba(255,253,249,0.88)","theme-input-border":"rgba(154,91,67,0.5)"},midnight:{"theme-app-bg":"linear-gradient(180deg,#0d1526 0%,#0a1020 100%)","theme-shell-bg":"rgba(15,23,42,0.72)","theme-shell-border":"rgba(148,163,184,0.08)","theme-shell-shadow":"none","theme-header-bg":"rgba(15,23,42,0.88)","theme-header-border":"rgba(148,163,184,0.06)","theme-header-shadow":"0 1px 0 rgba(0,0,0,0.2)","theme-sidebar-bg":"rgba(15,23,42,0.9)","theme-sidebar-border":"rgba(148,163,184,0.06)","theme-sidebar-text":"#94a3b8","theme-sidebar-muted":"#475569","theme-sidebar-hover-bg":"rgba(30,41,59,0.8)","theme-sidebar-hover-text":"#e2e8f0","theme-sidebar-active-bg":"rgba(37,99,235,0.18)","theme-sidebar-active-text":"#93c5fd","theme-sidebar-icon-bg":"rgba(30,41,59,0.8)","theme-sidebar-icon-text":"#64748b","theme-sidebar-icon-active-bg":"rgba(37,99,235,0.22)","theme-sidebar-icon-active-text":"#60a5fa","theme-surface-bg":"rgba(30,41,59,0.72)","theme-surface-border":"rgba(148,163,184,0.06)","theme-surface-shadow":"none","theme-hero-bg":"linear-gradient(180deg,rgba(30,41,59,0.9) 0%,rgba(15,23,42,0.86) 100%)","theme-hero-border":"rgba(148,163,184,0.06)","theme-hero-shadow":"none","theme-dark-panel-bg":"#020617","theme-dark-panel-border":"rgba(2,6,23,0.12)","theme-dark-panel-shadow":"0 16px 38px rgba(2,6,23,0.48)","theme-metric-bg":"rgba(30,41,59,0.6)","theme-metric-border":"rgba(148,163,184,0.06)","theme-metric-shadow":"none","theme-label-text":"#cbd5e1","theme-hint-text":"#64748b","theme-body-text":"#f1f5f9","theme-muted-text":"#64748b","theme-dialog-section-bg":"rgba(15,23,42,0.6)","theme-empty-icon-bg":"#1e293b","theme-empty-icon-text":"#334155","theme-input-bg":"rgba(15,23,42,0.88)","theme-input-border":"rgba(148,163,184,0.2)"}};var id=localStorage.getItem("openstar-theme-id");var vars=THEMES[id]||THEMES["default"];var root=document.documentElement;Object.keys(vars).forEach(function(k){root.style.setProperty("--"+k,vars[k]);});root.dataset.theme=id||"default";}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <PWARegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
