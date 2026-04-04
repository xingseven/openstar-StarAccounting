import { Header } from "@/components/shared/Header";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { AuthGate } from "@/components/shared/AuthGate";
import { DashboardRouteWarmup } from "@/components/shared/DashboardRouteWarmup";
import { GridDecoration } from "@/components/shared/GridDecoration";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <DashboardRouteWarmup />
      <div className="h-screen overflow-hidden [background:var(--theme-app-bg)] p-0 md:p-3">
        <div className="flex h-full gap-3">
          <Sidebar />

          <div className="relative flex-1 overflow-hidden rounded-none bg-transparent md:rounded-[24px]">
            <GridDecoration mode="light" className="pointer-events-none absolute inset-0 hidden opacity-[0.12] md:block" />

            <div className="relative z-10 flex h-full flex-col overflow-hidden">
              <div className="absolute inset-x-0 top-0 z-20 hidden px-2 pt-2 md:static md:block md:px-3 md:pt-3">
                <Header />
              </div>

              <main
                data-dashboard-scroll-area="true"
                className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-stable px-2 pb-24 pt-3 md:px-4 md:pb-6 md:pt-4"
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
