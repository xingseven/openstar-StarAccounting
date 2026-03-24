import { Header } from "@/components/shared/Header";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { AuthGate } from "@/components/shared/AuthGate";
import { GridDecoration } from "@/components/shared/GridDecoration";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="h-screen overflow-hidden [background:var(--theme-app-bg)] p-0 md:p-3">
        <div className="flex h-full gap-3">
          <Sidebar />

          <div className="relative flex-1 overflow-hidden rounded-none border-0 bg-transparent shadow-none md:rounded-[28px] md:border md:[border-color:var(--theme-shell-border)] md:[background:var(--theme-shell-bg)] md:[box-shadow:var(--theme-shell-shadow)]">
            <GridDecoration mode="light" className="pointer-events-none absolute inset-0 hidden opacity-20 md:block" />

            <div className="relative z-10 flex h-full flex-col overflow-hidden">
              <div className="px-2 pt-2 md:px-3 md:pt-3">
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
