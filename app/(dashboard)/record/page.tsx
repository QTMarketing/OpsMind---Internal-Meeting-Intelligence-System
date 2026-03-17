import { RecordUploadPanel } from "@/components/record/record-upload-panel";
import { PageHeader } from "@/components/foundation/page-header";

export default function RecordPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Record & Upload"
        description="Upload audio recordings for transcription and task extraction pipeline processing."
      />
      <RecordUploadPanel />
    </div>
  );
}
