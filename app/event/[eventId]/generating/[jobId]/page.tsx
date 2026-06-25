"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";

type GenState = "generating" | "done" | "failed";

export default function GeneratingPage() {
  const { eventId } = useParams<{ eventId: string; jobId: string }>();
  const router = useRouter();
  const [state, setState] = useState<GenState>("generating");
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    const doneTimer = setTimeout(() => setState("done"), 3000);
    return () => {
      clearInterval(dotTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <BingoFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
        {state === "generating" && (
          <>
            <div className="relative flex h-36 w-36 items-center justify-center">
              {/* Spinning gradient ring */}
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
                Your AI bingo portrait is being generated. This takes about 30 seconds.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-center">
              {["Analysing your selfie", "Generating portrait", "Adding bingo magic"].map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-[13px]">
                  <div className={`h-4 w-4 rounded-full border-2 ${i === 1 ? "border-[var(--accent)] bg-[var(--accent)]/20" : i === 0 ? "border-[var(--accent-lime)] bg-[var(--accent-lime)]/20" : "border-[var(--line)]"}`} />
                  <span className={i <= 1 ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>{step}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {state === "done" && (
          <>
            <div className="relative">
              <div
                className="h-52 w-40 rounded-[18px] shadow-[0_24px_48px_rgba(204,0,0,0.35)]"
                style={{ background: "linear-gradient(135deg, #CC0000, #880000)" }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end rounded-[18px] p-3">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[13px] font-bold text-white">
                  You
                </span>
              </div>
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

        {state === "failed" && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={40} className="text-red-400" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-[24px] text-[var(--foreground)]">Generation failed</h1>
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                Something went wrong. Please try again with a clearer photo.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              <Button onClick={() => setState("generating")} className="w-full">
                <RefreshCw size={16} />
                Try again
              </Button>
              <Button variant="secondary" onClick={() => router.push(`/event/${eventId}/capture`)} className="w-full">
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
