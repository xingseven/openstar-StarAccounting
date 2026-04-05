import { Header } from "@/components/shared/Header";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { AuthGate } from "@/components/shared/AuthGate";
import { DashboardRouteWarmup } from "@/components/shared/DashboardRouteWarmup";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0066ff", // 强制移动端状态栏变成沉浸式的品牌蓝
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <DashboardRouteWarmup />
      <div className="h-[100dvh] overflow-hidden bg-[var(--theme-app-bg,#f5f5f9)] md:p-4">
        
        
        <div className="relative z-10 flex h-full md:gap-4">
          <Sidebar />

          <div className="relative flex-1 overflow-hidden">
            <div className="relative z-10 flex h-full flex-col overflow-hidden">
              <div className="absolute inset-x-0 top-0 z-20 hidden px-1 pt-1 md:static md:block md:px-0 md:pt-0">
                <Header />
              </div>

              <main
                data-dashboard-scroll-area="true"
                className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-stable px-3 pt-3 pb-24 sm:px-5 md:px-1 md:pb-6 md:pt-4"
              >
                {children}
              </main>
            </div>
          </div>
        </div>

        <MobileBottomNav />
      </div>
    </AuthGate>
  );
}
