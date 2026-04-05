import { notFound } from "next/navigation";
import { DashboardPageShell } from "@/features/dashboard/components/DashboardPageShell";
import { isDashboardRouteSegment } from "@/themes/dashboard-routes";

type DashboardEntryPageProps = {
  params: Promise<{
    dashboardEntry: string;
  }>;
};

export default async function DashboardEntryPage({ params }: DashboardEntryPageProps) {
  const { dashboardEntry } = await params;

  if (!isDashboardRouteSegment(dashboardEntry)) {
    notFound();
  }

  return <DashboardPageShell />;
}
