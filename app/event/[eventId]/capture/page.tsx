"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { Camera, ImageIcon, RefreshCw, ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";
import { SlotReel } from "@/components/SlotReel";
import { styleReel, colourReel, chaosReel } from "@/lib/slop/reelData";

type SpinState = "idle" | "spinning" | "stopped";

function randomIndex(len: number) {
  return Math.floor(Math.random() * len);
}

export default function CapturePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name") ?? "Player";

  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reel state
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [stoppedCount, setStoppedCount] = useState(0);
  const [finalIndices, setFinalIndices] = useState([0, 0, 0]);

  const allStopped = stoppedCount >= 3;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setError(null);
    e.target.value = "";
  }

  function handleRetake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setSpinState("idle");
    setStoppedCount(0);
    setError(null);
  }

  function handleSpin() {
    setStoppedCount(0);
    setFinalIndices([
      randomIndex(styleReel.length),
      randomIndex(colourReel.length),
      randomIndex(chaosReel.length),
    ]);
    setSpinState("spinning");
    setError(null);
  }

  function handleReelStop() {
    setStoppedCount((n) => {
      const next = n + 1;
      if (next >= 3) setSpinState("stopped");
      return next;
    });
  }

  async function handleGenerate() {
    if (!file || !allStopped) return;
    setIsUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("styleId", styleReel[finalIndices[0]].id);
      body.append("colourId", colourReel[finalIndices[1]].id);
      body.append("chaosId", chaosReel[finalIndices[2]].id);

      const res = await fetch("/api/bingo/generate", { method: "POST", body });
      const data = (await res.json()) as { jobId?: string; error?: string };

      if (!res.ok || !data.jobId) {
        throw new Error(data.error ?? "Generation request failed.");
      }

      const nameParam = encodeURIComponent(playerName);
      router.push(`/event/${eventId}/generating/${data.jobId}?name=${nameParam}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsUploading(false);
    }
  }

  const hasPhoto = Boolean(file && previewUrl);
  const spinLabel =
    spinState === "idle" ? "SPIN" : spinState === "spinning" ? "SPINNING…" : "SPIN AGAIN";

  return (
    <BingoFrame>
      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="user" className="sr-only" onChange={onFileChange} />
      <input ref={libraryRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />

      <header className="flex items-center gap-3 pb-5">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-[var(--foreground)]">
          {hasPhoto ? "Choose your style" : "Take your selfie"}
        </span>
      </header>

      <section className="flex flex-1 flex-col gap-5">
        {/* Viewfinder */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[22px] bg-[var(--surface-soft)]">
          {!hasPhoto ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)] shadow-[var(--paper-shadow)]">
                <Camera size={32} className="text-[var(--muted)]" />
              </div>
              <p className="text-[14px] text-[var(--muted)]">Camera preview appears here</p>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl!} alt="Your selfie" className="h-full w-full object-cover" />
          )}

          {!hasPhoto && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[52%] w-[58%] rounded-full border-2 border-dashed border-[var(--muted)]/40" />
            </div>
          )}

          {hasPhoto && (
            <button
              onClick={handleRetake}
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm"
            >
              <RefreshCw size={12} />
              Retake
            </button>
          )}
        </div>

        {/* No photo: shoot/upload buttons */}
        {!hasPhoto && (
          <>
            <p className="text-center text-[13px] leading-[1.5] text-[var(--muted)]">
              Look straight ahead. Good lighting helps.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => cameraRef.current?.click()} className="w-full">
                <Camera size={17} />
                Take photo
              </Button>
              <Button variant="secondary" onClick={() => libraryRef.current?.click()} className="w-full">
                <ImageIcon size={15} />
                Upload from library
              </Button>
            </div>
          </>
        )}

        {/* Has photo: slot reels + generate */}
        {hasPhoto && (
          <>
            {/* Reels */}
            <div className="rounded-[20px] bg-[#100020] px-4 pb-5 pt-4">
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-purple-400">
                Spin to choose your style
              </p>
              <div className="flex justify-center gap-3">
                <SlotReel
                  items={styleReel}
                  label="Style"
                  isSpinning={spinState === "spinning"}
                  finalIndex={finalIndices[0]}
                  onStop={handleReelStop}
                />
                <SlotReel
                  items={colourReel}
                  label="Colour"
                  isSpinning={spinState === "spinning"}
                  finalIndex={finalIndices[1]}
                  onStop={handleReelStop}
                />
                <SlotReel
                  items={chaosReel}
                  label="Chaos"
                  isSpinning={spinState === "spinning"}
                  finalIndex={finalIndices[2]}
                  onStop={handleReelStop}
                />
              </div>

              <button
                onClick={handleSpin}
                disabled={spinState === "spinning" || isUploading}
                className={[
                  "mt-4 w-full rounded-full py-2.5 text-[13px] font-black uppercase tracking-widest transition-all",
                  spinState === "spinning" || isUploading
                    ? "cursor-not-allowed bg-purple-900/50 text-purple-400"
                    : "bg-yellow-400 text-black shadow-[0_0_16px_rgba(250,204,21,0.5)] hover:bg-yellow-300 active:scale-95",
                ].join(" ")}
              >
                {spinLabel}
              </button>
            </div>

            {error && (
              <p className="rounded-[10px] bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!allStopped || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  Generate my portrait
                  <ArrowRight size={17} />
                </>
              )}
            </Button>

            {!allStopped && (
              <p className="text-center text-[12px] text-[var(--muted)]">
                {spinState === "idle" ? "Spin the reels to pick your style" : "Reels still spinning…"}
              </p>
            )}
          </>
        )}
      </section>
    </BingoFrame>
  );
}
