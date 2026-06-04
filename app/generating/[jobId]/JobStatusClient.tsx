"use client";

import { LoaderCircle, RotateCcw, Bell, Mail, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

type NotificationPreferences = {
  emailEnabled: boolean;
  available: boolean;
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

const notificationUnavailableMessage =
  "Notifications are currently disabled. You can still keep this window open to track progress.";

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function JobStatusClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<JobResponse>({ status: "processing" });
  const [error, setError] = useState<string | null>(null);
  const [showTestControls, setShowTestControls] = useState(false);

  // Notification states
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: false,
    available: false,
  });
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);

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
    let isActive = true;

    async function loadPreferences() {
      try {
        const response = await fetch("/api/notification-preferences", { cache: "no-store" });
        const data = (await response.json()) as Partial<NotificationPreferences> & { error?: string };
        if (!response.ok || !isActive) return;

        setPreferences({
          emailEnabled: Boolean(data.emailEnabled),
          available: Boolean(data.available),
        });
      } catch {
        // Notification preferences should never block the generation screen.
      }
    }

    loadPreferences();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setShowTestControls(["localhost", "127.0.0.1", "::1"].includes(window.location.hostname));
  }, []);

  async function savePreferences(nextPreferences: NotificationPreferences) {
    setPreferences(nextPreferences);
    setPreferenceMessage(null);

    try {
      const response = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          emailEnabled: nextPreferences.emailEnabled,
        }),
      });
      const data = (await response.json()) as Partial<NotificationPreferences> & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Notification preference update failed.");

      setPreferences({
        emailEnabled: Boolean(data.emailEnabled),
        available: Boolean(data.available),
      });

      if (!data.available) {
        setPreferenceMessage(notificationUnavailableMessage);
      }
    } catch (preferenceError) {
      setPreferenceMessage(preferenceError instanceof Error ? preferenceError.message : "Notification preference update failed.");
    }
  }

  async function toggleEmail() {
    await savePreferences({
      ...preferences,
      emailEnabled: !preferences.emailEnabled,
    });
  }

  return (
    <section className="flex flex-1 flex-col justify-center gap-7 pb-4 text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-full bg-[var(--surface-soft)]/70">
        <LoaderCircle size={42} className="animate-spin text-[var(--accent)]" />
      </div>
      
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Creating now</p>
        <h1 className="font-display text-[44px] leading-none text-[var(--foreground)]">Making your poster.</h1>
        <p className="mx-auto max-w-[19rem] text-base leading-6 text-[var(--muted)]">
          Keep this page open, or choose a notification for when it is ready.
        </p>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Your poster is {job.status ?? "processing"}.
        </p>
      </div>

      {/* Waiting panel */}
      <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/65 px-5 py-5 text-center">
        <p className="text-3xl" aria-hidden="true">{waitingMessage.emoji}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{waitingMessage.text}</p>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Sit tight — you&apos;ll be redirected automatically.
        </p>
      </div>

      {/* Notification Toggle Panel */}
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

        <div className="mt-4">
          <button
            type="button"
            onClick={toggleEmail}
            disabled={!preferences.available}
            className="flex min-h-12 w-full items-center justify-between rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 text-left text-sm text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-[var(--accent)]" />
              Email me when it&apos;s ready
            </span>
            {preferences.emailEnabled ? <CheckCircle2 size={18} className="text-[var(--accent)]" /> : <span className="text-xs text-[var(--muted)]">Off</span>}
          </button>
        </div>

        {(preferenceMessage || !preferences.available) && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            {preferenceMessage ?? notificationUnavailableMessage}
          </p>
        )}
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
