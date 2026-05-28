"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

const waitingMessages = [
  { emoji: "⏱️", text: "The fourth official is holding up the board… just one more minute." },
  { emoji: "🧤", text: "Keeper's time-wasting on every goal kick. Classic." },
  { emoji: "📺", text: "VAR is checking this. And checking. And checking…" },
  { emoji: "🎙️", text: "Even the commentator has run out of things to say." },
  { emoji: "🥤", text: "Tactical water break. Nobody's actually thirsty." },
  { emoji: "🧱", text: "Ten men in the wall and the ref is still counting." },
  { emoji: "🟨", text: "Ref's lost his cards. Patting every pocket." },
  { emoji: "⚽", text: "Ball's gone out for a throw. Nobody knows whose it is." },
  { emoji: "📋", text: "Sub warming up on the touchline since the 60th minute." },
  { emoji: "🎺", text: "The away fans are making more noise than the home end." },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function JobStatusClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<JobResponse>({ status: "processing" });
  const [error, setError] = useState<string | null>(null);
  const [showTestControls, setShowTestControls] = useState(false);

  const waitingMessage = useMemo(() => pickRandom(waitingMessages), []);

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

  useEffect(() => {
    setShowTestControls(["localhost", "127.0.0.1", "::1"].includes(window.location.hostname));
  }, []);

  return (
    <section className="flex flex-1 flex-col justify-center gap-7 pb-4 text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-full bg-[var(--surface-soft)]/70">
        <LoaderCircle size={42} className="animate-spin text-[var(--accent)]" />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Creating now</p>
        <h1 className="font-display text-[44px] leading-none text-[var(--foreground)]">Making your poster.</h1>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Poster <span className="font-mono text-[var(--foreground)]">{jobId.slice(0, 8)}</span> is {job.status ?? "processing"}.
        </p>
      </div>

      <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/65 px-5 py-5 text-center">
        <p className="text-3xl" aria-hidden="true">{waitingMessage.emoji}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{waitingMessage.text}</p>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Sit tight — you&apos;ll be redirected automatically.
        </p>
      </div>

      {showTestControls && (
        <div className="rounded-[16px] border border-dashed border-[var(--line)] bg-[var(--surface)] p-3">
          <Button type="button" variant="secondary" className="w-full" onClick={() => router.push("/create")}>
            <RotateCcw size={17} />
            Regenerate test
          </Button>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Local testing only. Starts another poster from the create screen.
          </p>
        </div>
      )}

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
