import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PWARegister } from "@/components/shared/PWARegister";
import { DEFAULT_THEME_ID, THEMES } from "@/themes/registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const PRELOADED_THEME_VARS = Object.fromEntries(
  Object.entries(THEMES).map(([themeId, theme]) => [themeId, theme.vars])
);

const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var THEMES=${JSON.stringify(PRELOADED_THEME_VARS)};var DEFAULT_THEME_ID=${JSON.stringify(DEFAULT_THEME_ID)};var id=localStorage.getItem("openstar-theme-id");var themeId=id&&THEMES[id]?id:DEFAULT_THEME_ID;var vars=THEMES[themeId]||THEMES[DEFAULT_THEME_ID];var root=document.documentElement;Object.keys(vars).forEach(function(k){root.style.setProperty("--"+k,vars[k]);});root.dataset.theme=themeId;}catch(e){}})();`;

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
    { media: "(prefers-color-scheme: light)", color: "#f5f5f9" },
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
            __html: THEME_BOOTSTRAP_SCRIPT,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
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
