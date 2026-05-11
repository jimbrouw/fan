"use client";

import Image from "next/image";
import Link from "next/link";
import { RefreshCw, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

export function ResultClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadJob = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      const data = (await response.json()) as JobResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Job lookup failed.");
      setJob(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Job lookup failed.");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  return (
    <section className="flex flex-1 flex-col gap-6 pb-4">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold leading-none tracking-[-0.03em]">Result.</h1>
        <p className="text-sm leading-6 text-white/62">
          Job <span className="font-mono text-white">{jobId}</span> is {job?.status ?? "loading"}.
        </p>
      </div>

      <div className="grid flex-1 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] text-center text-sm leading-6 text-white/54">
        {job?.status === "completed" && job.outputUrl ? (
          <Image
            src={job.outputUrl}
            alt="Generated fan hero poster"
            width={1200}
            height={1600}
            className="h-full max-h-[62vh] w-full object-contain"
            unoptimized
          />
        ) : (
          <div className="p-8">
            {error ?? job?.error ?? "The generated poster image is not available yet."}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {job?.status === "completed" ? (
          <>
            <Button
              className="w-full bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue)]/80"
              onClick={() => alert("Approved! This would trigger the high-res render and fulfilment pipeline.")}
            >
              Approve & Finalize
            </Button>
            <Link href="/create">
              <Button variant="secondary" className="w-full">
                <RotateCcw size={17} />
                Regenerate
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={loadJob} disabled={isLoading}>
              <RefreshCw size={17} />
              {isLoading ? "Checking..." : "Check Status"}
            </Button>
            <Link href="/capture">
              <Button className="w-full">
                <RotateCcw size={17} />
                New Scan
              </Button>
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
