import { MeetingsHistoryPanel } from "@/components/meetings/meetings-history-panel";
import { PageHeader } from "@/components/foundation/page-header";

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Review meeting history, inspect transcript previews, and track linked task volume."
      />
      <MeetingsHistoryPanel />
    </div>
  );
}
