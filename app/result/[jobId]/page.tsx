import { AppFrame } from "@/components/AppFrame";
import { ResultClient } from "./ResultClient";

export default async function ResultPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  return (
    <AppFrame>
      <ResultClient jobId={jobId} />
    </AppFrame>
  );
}
