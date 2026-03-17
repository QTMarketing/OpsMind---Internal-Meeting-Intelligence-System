import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageHeader } from "@/components/foundation/page-header";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A focused overview of meeting intelligence and operational follow-through."
      />
      <DashboardOverview />
    </div>
  );
}
