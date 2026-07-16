"use client";

import { AlertTriangle, LoaderCircle, RotateCcw, Bell, Mail, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { getGenerationFailureMessage } from "@/lib/ai/generationErrors";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

const waitingMessages = [
  { emoji: "⏱️", text: "The fourth official is holding up the board… just one more minute." },
  { emoji: "🧤", text: "Keeper's on the eight-second countdown. Everyone's counting with the ref." },
  { emoji: "📺", text: "VAR is checking this. And checking. And checking…" },
  { emoji: "🎙️", text: "Even the commentator has run out of things to say." },
  { emoji: "🥤", text: "Tactical water break. Nobody's actually thirsty." },
  { emoji: "🥤", text: "Mandatory hydration break. Three minutes, two sips, one tactical team talk." },
  { emoji: "🔥", text: "North America heat check. The ref has ordered everyone to drink something." },
  { emoji: "📺", text: "Broadcast has gone to a hydration-break replay package. Your poster stays live." },
  { emoji: "🎙️", text: "Commentator voice: this has 104-match tournament energy." },
  { emoji: "🌎", text: "Forty-eight teams, one poster. The group chat is not ready." },
  { emoji: "📋", text: "Best third-place maths are being calculated somewhere in the stadium." },
  { emoji: "🏟️", text: "Round of 32 nerves. Even the tunnel camera looks stressed." },
  { emoji: "🇨🇦", text: "Canada, Mexico, USA. Three hosts, one very dramatic poster reveal." },
  { emoji: "🇲🇽", text: "Azteca opener energy: loud, bright, and slightly unhinged." },
  { emoji: "🇺🇸", text: "MetLife final lighting is being tested on your poster." },
  { emoji: "🧊", text: "Cooling towels are out. The touchline looks like a spa with shin pads." },
  { emoji: "🧃", text: "Hydration break discourse is already louder than the vuvuzelas." },
  { emoji: "🎙️", text: "And if you're just joining us, the poster is still being checked for vibes." },
  { emoji: "🧤", text: "Keeper held it too long. Corner given. Internet argument unlocked." },
  { emoji: "👑", text: "Captain-only chat with the ref. Everyone else is doing the walk-away shuffle." },
  { emoji: "📐", text: "Semi-automated offside lines are drawing themselves like stadium laser art." },
  { emoji: "🔢", text: "Twelve groups, too many permutations, and somehow your mate still thinks they're through." },
  { emoji: "🪄", text: "VAR says clear and obvious poster magic." },
  { emoji: "📣", text: "The co-commentator has just said momentum for the sixth time." },
  { emoji: "🕶️", text: "Pitch-side camera caught the manager pretending this was always the plan." },
  { emoji: "🧢", text: "Fourth official is explaining stoppage time like a group-stage tiebreaker." },
  { emoji: "🧱", text: "Ten men in the wall and the ref is still counting." },
  { emoji: "🟨", text: "Ref's lost his cards. Patting every pocket." },
  { emoji: "⚽", text: "Ball's gone out for a throw. Nobody knows whose it is." },
  { emoji: "📋", text: "Sub warming up on the touchline since the 60th minute." },
  { emoji: "🎺", text: "The away fans are making more noise than the home end." },
];

const missingJobGracePeriodMs = 2 * 60 * 1000;

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function JobStatusClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<JobResponse>({ status: "processing" });
  const [error, setError] = useState<string | null>(null);
  const [showTestControls, setShowTestControls] = useState(false);
  const firstPollAtRef = useRef<number | null>(null);

  const waitingMessage = useMemo(() => pickRandom(waitingMessages), []);

  useEffect(() => {
    let isActive = true;

    async function pollJob() {
      try {
        firstPollAtRef.current ??= Date.now();
        const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        const data = (await response.json()) as JobResponse & { error?: string };
        if (response.status === 404 && Date.now() - firstPollAtRef.current < missingJobGracePeriodMs) {
          if (isActive) {
            setJob((currentJob) => ({ ...currentJob, status: currentJob.status ?? "processing" }));
            setError(null);
          }
          return;
        }
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
    setShowTestControls(
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    );
  }, []);

  return (
    <section className="flex flex-1 flex-col justify-center gap-7 pb-4 text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-full bg-[var(--surface-soft)]/70">
        {job.status === "failed" ? (
          <AlertTriangle size={42} className="text-[var(--accent)]" />
        ) : (
          <LoaderCircle size={42} className="animate-spin text-[var(--accent)]" />
        )}
      </div>
      
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          {job.status === "failed" ? "Needs another try" : "Creating now"}
        </p>
        <h1 className="font-display text-[44px] leading-none text-[var(--foreground)]">
          {job.status === "failed" ? "Your poster needs another try." : "Making your poster."}
        </h1>
        <p className="mx-auto max-w-[19rem] text-base leading-6 text-[var(--muted)]">
          {job.status === "failed"
            ? getGenerationFailureMessage(job.error)
            : "Keep this page open, or choose a notification for when it is ready."}
        </p>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Your poster is {job.status ?? "processing"}.
        </p>
      </div>

      {job.status !== "failed" && (
        <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/65 px-5 py-5 text-center">
          <p className="text-3xl" aria-hidden="true">{waitingMessage.emoji}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{waitingMessage.text}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Sit tight — you&apos;ll be redirected automatically.
          </p>
        </div>
      )}

      {/* Notification status panel */}
      <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/65 p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent)]/20 text-[var(--foreground)]">
            <Bell size={18} />
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Get the final whistle</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">We&apos;ll email you when your poster is ready.</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex min-h-12 w-full items-center justify-between rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 text-left text-sm text-[var(--foreground)]">
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-[var(--accent)]" />
              Email me when it&apos;s ready
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-[var(--foreground)]">
              <CheckCircle2 size={18} className="text-[var(--accent)]" />
              On
            </span>
          </div>
          
          <div className="flex min-h-12 w-full items-center justify-between rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 text-left text-sm text-[var(--foreground)]">
            <span className="flex items-center gap-2">
              <Bell size={16} className="text-[var(--accent)]" />
              App notification
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-[var(--foreground)]">
              <CheckCircle2 size={18} className="text-[var(--accent)]" />
              On
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          Notifications are on by default. You can also keep this window open to track progress.
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
            Try again with same photos
          </Button>
        </div>
      )}
    </section>
  );
}
