"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

export function JobStatusClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<JobResponse>({ status: "processing" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function pollJob() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        const data = (await response.json()) as JobResponse & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Job lookup failed.");
        if (!isActive) return;

        setJob(data);
        setError(null);

        if (data.status === "completed") {
          router.push(`/result/${jobId}`);
        }
      } catch (pollError) {
        if (isActive) {
          setError(pollError instanceof Error ? pollError.message : "Job lookup failed.");
        }
      }
    }

    pollJob();
    const timer = window.setInterval(pollJob, 3500);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [jobId, router]);

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
      <LoaderCircle size={44} className="animate-spin text-[var(--accent-blue)]" />
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Generating.</h1>
        <p className="text-sm leading-6 text-white/62">
          Job <span className="font-mono text-white">{jobId}</span> is {job.status ?? "processing"}.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm leading-6 text-white/76">
          {error}
        </div>
      )}

      {job.status === "failed" && (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-white/62">{job.error ?? "The image swap failed."}</p>
          <Button type="button" variant="secondary" onClick={() => router.push("/create")}>
            Try Again
          </Button>
        </div>
      )}
    </section>
  );
}
