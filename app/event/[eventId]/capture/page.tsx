"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, ImageIcon, RefreshCw, ArrowRight, ChevronLeft } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";

type CaptureState = "idle" | "captured";

export default function CapturePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [state, setState] = useState<CaptureState>("idle");

  function handleCapture() {
    setState("captured");
  }

  function handleRetake() {
    setState("idle");
  }

  function handleContinue() {
    router.push(`/event/${eventId}/generating/job-demo`);
  }

  return (
    <BingoFrame>
      <header className="flex items-center gap-3 pb-5">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-[var(--foreground)]">Take your selfie</span>
      </header>

      <section className="flex flex-1 flex-col gap-5">
        {/* Viewfinder */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[22px] bg-[var(--surface-soft)]">
          {state === "idle" ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)] shadow-[var(--paper-shadow)]">
                <Camera size={32} className="text-[var(--muted)]" />
              </div>
              <p className="text-[14px] text-[var(--muted)]">Camera preview appears here</p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center" style={{ background: "linear-gradient(135deg, #CC0000, #880000)" }}>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-[40px] font-black text-white">
                  😊
                </div>
                <p className="text-[13px] font-semibold text-white/80">Preview captured</p>
              </div>
            </div>
          )}

          {/* Face guide overlay */}
          {state === "idle" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[52%] w-[58%] rounded-full border-2 border-dashed border-[var(--muted)]/40" />
            </div>
          )}
        </div>

        {/* Instructions */}
        {state === "idle" && (
          <p className="text-center text-[13px] leading-[1.5] text-[var(--muted)]">
            Look straight ahead and keep your face inside the guide. Good lighting helps.
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3">
          {state === "idle" ? (
            <>
              <Button onClick={handleCapture} className="w-full">
                <Camera size={17} />
                Take photo
              </Button>
              <Button variant="secondary" onClick={handleCapture} className="w-full">
                <ImageIcon size={15} />
                Upload from library
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleContinue} className="w-full">
                Use this photo
                <ArrowRight size={17} />
              </Button>
              <Button variant="secondary" onClick={handleRetake} className="w-full">
                <RefreshCw size={15} />
                Retake
              </Button>
            </>
          )}
        </div>
      </section>
    </BingoFrame>
  );
}
