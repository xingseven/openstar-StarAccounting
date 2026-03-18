import { Header } from "@/components/shared/Header";
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
      <div className="h-screen flex overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-stable p-4 md:p-6">
            {children}
          </main>
          {/* 固定在底部的背景装饰 */}
          <GridDecoration mode="light" className="fixed bottom-0 left-0 right-0 pointer-events-none z-0 opacity-30" />
        </div>
      </div>
    </AuthGate>
  );
}

