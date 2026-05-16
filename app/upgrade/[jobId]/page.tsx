import { AppFrame } from "@/components/AppFrame";
import { UpgradeClient } from "./UpgradeClient";

export default async function UpgradePage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  return (
    <AppFrame>
      <UpgradeClient jobId={jobId} />
    </AppFrame>
  );
}
