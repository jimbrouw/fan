"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";

type JobStatus = "queued" | "processing" | "completed" | "failed";

type PollResult = {
  status?: JobStatus;
  outputUrl?: string | null;
  error?: string | null;
};

const POLL_INTERVAL_MS = 3000;
const MOCK_JOB_ID = "job-demo";

export default function GeneratingPage() {
  const { eventId, jobId } = useParams<{ eventId: string; jobId: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<JobStatus>("queued");
  const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dots, setDots] = useState(1);
  const pollRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Animated dots while generating
  useEffect(() => {
    if (status === "queued" || status === "processing") {
      const timer = setInterval(() => setDots((d) => (d % 3) + 1), 500);
      return () => clearInterval(timer);
    }
  }, [status]);

  useEffect(() => {
    // Mock job for demo — skip polling
    if (jobId === MOCK_JOB_ID) {
      const t = setTimeout(() => setStatus("completed"), 3000);
      return () => clearTimeout(t);
    }

    async function poll() {
      try {
        const res = await fetch(`/api/bingo/jobs/${jobId}`, { cache: "no-store" });
        const data = (await res.json()) as PollResult;
        const nextStatus = data.status ?? "processing";
        setStatus(nextStatus);

        if (nextStatus === "completed") {
          // Use the image proxy so we stay on 'self' and avoid CSP issues
          setOutputImageUrl(`/api/bingo/jobs/${jobId}/image`);
        } else if (nextStatus === "failed") {
          setErrorMsg(data.error ?? "Generation failed.");
        } else {
          // Still running — schedule next poll
          pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        // Network hiccup — retry after a longer delay
        pollRef.current = setTimeout(poll, POLL_INTERVAL_MS * 2);
      }
    }

    poll();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [jobId]);

  const isGenerating = status === "queued" || status === "processing";

  // Derive which step is active for the progress list
  const stepIndex = status === "queued" ? 0 : status === "processing" ? 1 : 2;

  return (
    <BingoFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">

        {/* ── Generating ── */}
        {isGenerating && (
          <>
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #FF5500, #CC0000, #880000, #FF5500, #CC0000)",
                  animation: "spin 1.4s linear infinite",
                  padding: "3px",
                }}
              />
              <div className="relative flex h-[calc(100%-6px)] w-[calc(100%-6px)] items-center justify-center rounded-full bg-white">
                <span className="text-[44px]">🎨</span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="font-display text-[26px] text-[var(--foreground)]">
                Making your portrait{".".repeat(dots)}
              </h1>
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                Your AI bingo portrait is being generated. This takes about 30–60 seconds.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-center">
              {["Analysing your selfie", "Generating portrait", "Adding bingo magic"].map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-[13px]">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      i < stepIndex
                        ? "border-[var(--accent-lime)] bg-[var(--accent-lime)]/20"
                        : i === stepIndex
                        ? "border-[var(--accent)] bg-[var(--accent)]/20"
                        : "border-[var(--line)]"
                    }`}
                  />
                  <span className={i <= stepIndex ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Done ── */}
        {status === "completed" && (
          <>
            <div className="relative">
              {outputImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={outputImageUrl}
                  alt="Your AI portrait"
                  className="h-52 w-40 rounded-[18px] object-cover shadow-[0_24px_48px_rgba(204,0,0,0.35)]"
                />
              ) : (
                <div
                  className="h-52 w-40 rounded-[18px] shadow-[0_24px_48px_rgba(204,0,0,0.35)]"
                  style={{ background: "linear-gradient(135deg, #CC0000, #880000)" }}
                />
              )}
              <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-lime)] text-[16px] shadow-lg">
                ✓
              </div>
            </div>

            <div className="text-center">
              <h1 className="font-display text-[28px] text-[var(--foreground)]">Portrait ready!</h1>
              <p className="mt-1.5 text-[14px] text-[var(--muted)]">
                Your card is waiting — let&apos;s play.
              </p>
            </div>

            <Button onClick={() => router.push(`/event/${eventId}/card`)} className="w-full max-w-[280px]">
              See my bingo card
              <ArrowRight size={17} />
            </Button>
          </>
        )}

        {/* ── Failed ── */}
        {status === "failed" && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={40} className="text-red-400" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-[24px] text-[var(--foreground)]">Generation failed</h1>
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                {errorMsg ?? "Something went wrong. Please try again with a clearer photo."}
              </p>
            </div>
            <div className="flex w-full max-w-[280px] flex-col gap-3">
              <Button variant="secondary" onClick={() => router.push(`/event/${eventId}/capture`)} className="w-full">
                <RefreshCw size={16} />
                Retake photo
              </Button>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </BingoFrame>
  );
}
