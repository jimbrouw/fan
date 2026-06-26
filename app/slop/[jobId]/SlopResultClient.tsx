"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type JobStatus = "queued" | "processing" | "completed" | "failed";

type StatusResponse = {
  status: JobStatus;
  outputUrl?: string | null;
  error?: string | null;
};

const SLOP_MESSAGES = [
  { emoji: "🤖", text: "The AI is counting fingers… one, two, three, seven…" },
  { emoji: "🎨", text: "Applying award-winning quality. Do not adjust your screen." },
  { emoji: "👁️", text: "Adding eyes. Perhaps too many eyes. We'll see." },
  { emoji: "🦾", text: "Calculating correct number of limbs. Results may vary." },
  { emoji: "💀", text: "Consulting the ancient AI scrolls of bad anatomy." },
  { emoji: "🌀", text: "Melting faces at optimal temperature. This is fine." },
  { emoji: "🖐️", text: "Fingers: check. Number of fingers: unclear." },
  { emoji: "✨", text: "Generating masterpiece. Masterpiece generating." },
  { emoji: "🎰", text: "The slop machine is doing what it does best." },
  { emoji: "🍌", text: "Neural network currently arguing with itself about hands." },
];

function pickMessage(n: number) {
  return SLOP_MESSAGES[n % SLOP_MESSAGES.length];
}

const POLL_INTERVAL_MS = 3000;

export function SlopResultClient({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>("processing");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const pollCount = useRef(0);

  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const msgTimer = setInterval(() => {
      setMsgIndex((n) => n + 1);
    }, 4000);

    const poll = async () => {
      try {
        const res = await fetch(`/api/slop/status/${jobId}`, { cache: "no-store" });
        const data = (await res.json()) as StatusResponse;
        pollCount.current += 1;

        setStatus(data.status);
        if (data.outputUrl) setOutputUrl(data.outputUrl);
        if (data.error && data.status === "failed") setErrorMsg(data.error);
      } catch {
        // transient network error — keep polling
      }
    };

    poll();
    const pollTimer = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      clearInterval(msgTimer);
      clearInterval(pollTimer);
    };
  }, [jobId, status]);

  const msg = pickMessage(msgIndex);

  if (status === "completed" && outputUrl) {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="w-full overflow-hidden rounded-2xl border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={outputUrl} alt="Your glorious AI slop" className="w-full object-cover" />
        </div>

        <p className="text-center text-sm font-semibold text-green-400">
          🎉 Your slop is ready. Behold.
        </p>

        <div className="flex w-full gap-3">
          <a
            href={outputUrl}
            download="slop.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-purple-700 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-purple-600 active:scale-[0.98]"
          >
            Download
          </a>
          <Link
            href="/slop"
            className="flex-1 rounded-xl bg-yellow-400 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-yellow-300 active:scale-[0.98]"
          >
            Make another
          </Link>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "The Slop Machine", url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href).catch(() => {});
            }
          }}
          className="w-full rounded-xl border border-purple-700 py-3 text-sm font-bold text-purple-300 transition-colors hover:border-purple-500 hover:text-purple-200"
        >
          Share this slop 🔗
        </button>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="rounded-2xl bg-red-950/50 px-6 py-8 text-center">
          <p className="text-3xl">💀</p>
          <p className="mt-3 font-bold text-red-300">The AI had a bad day.</p>
          <p className="mt-1 text-sm text-red-400/70">{errorMsg ?? "Generation failed."}</p>
        </div>
        <Link
          href="/slop"
          className="w-full rounded-xl bg-yellow-400 py-3 text-center text-sm font-bold text-black hover:bg-yellow-300"
        >
          Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-900 border-t-purple-400" />
        <span className="text-5xl">{msg.emoji}</span>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-purple-200">{msg.text}</p>
        <p className="mt-1 text-xs text-purple-500">
          {status === "queued" ? "Queued…" : "Processing…"}
        </p>
      </div>
    </div>
  );
}
