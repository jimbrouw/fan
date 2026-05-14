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
      <div className="grid size-24 place-items-center rounded-full bg-[var(--surface-soft)]/70">
        <LoaderCircle size={42} className="animate-spin text-[var(--accent)]" />
      </div>
      <div className="space-y-3">
        <h1 className="font-display text-[35px] leading-none text-[var(--foreground)]">Making your poster.</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Poster <span className="font-mono text-[var(--foreground)]">{jobId.slice(0, 8)}</span> is {job.status ?? "processing"}.
        </p>
      </div>

      {error && (
        <div className="rounded-[16px] border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm leading-6 text-[var(--foreground)]">
          {error}
        </div>
      )}

      {job.status === "failed" && (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--muted)]">{job.error ?? "The poster could not be made."}</p>
          <Button type="button" variant="secondary" onClick={() => router.push("/create")}>
            Try Again
          </Button>
        </div>
      )}
    </section>
  );
}
