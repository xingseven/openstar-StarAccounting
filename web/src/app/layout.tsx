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
    default: "OpenStar XFDashboard",
    template: "%s | XFDashboard",
  },
  description: "个人财务管理仪表盘 - 智能记账、预算管理、资产追踪",
  keywords: ["财务管理", "记账", "预算", "资产", "消费分析"],
  authors: [{ name: "OpenStar Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "XFDashboard",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "XFDashboard",
    title: "OpenStar XFDashboard",
    description: "个人财务管理仪表盘 - 智能记账、预算管理、资产追踪",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenStar XFDashboard",
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
