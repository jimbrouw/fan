import { AppFrame } from "@/components/AppFrame";
import { JobStatusClient } from "./JobStatusClient";

export default async function GeneratingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  return (
    <AppFrame>
      <JobStatusClient jobId={jobId} />
    </AppFrame>
  );
}
