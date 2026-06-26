"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SlotReel } from "./SlotReel";
import { styleReel, colourReel, chaosReel } from "@/lib/slop/reelData";

type SpinState = "idle" | "spinning" | "stopped";

function randomIndex(len: number) {
  return Math.floor(Math.random() * len);
}

export function SlopMachine() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [stoppedCount, setStoppedCount] = useState(0);
  const [finalIndices, setFinalIndices] = useState([0, 0, 0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allStopped = stoppedCount >= 3;
  const canGenerate = allStopped && !!imageFile && !isGenerating;

  function handleSpin() {
    if (isGenerating) return;
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleGenerate() {
    if (!canGenerate || !imageFile) return;
    setIsGenerating(true);
    setError(null);

    try {
      const base64 = await fileToBase64(imageFile);
      const style = styleReel[finalIndices[0]];
      const colour = colourReel[finalIndices[1]];
      const chaos = chaosReel[finalIndices[2]];

      const res = await fetch("/api/slop/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleId: style.id,
          colourId: colour.id,
          chaosId: chaos.id,
          imageBase64: base64,
        }),
      });

      const data = (await res.json()) as { jobId?: string; error?: string };
      if (!res.ok || !data.jobId) {
        throw new Error(data.error ?? "Generation failed. Try again.");
      }

      router.push(`/slop/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsGenerating(false);
    }
  }

  const spinLabel = spinState === "idle" ? "SPIN" : spinState === "spinning" ? "SPINNING…" : "SPIN AGAIN";
  const btnDisabled = spinState === "spinning" || isGenerating;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Reels */}
      <div className="flex gap-3">
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

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={btnDisabled}
        className={[
          "rounded-full px-8 py-3 text-sm font-black uppercase tracking-widest transition-all",
          btnDisabled
            ? "cursor-not-allowed bg-purple-900/50 text-purple-400"
            : "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:bg-yellow-300 active:scale-95",
        ].join(" ")}
      >
        {spinLabel}
      </button>

      {/* Divider */}
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-purple-800/40" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
          Your face
        </span>
        <div className="h-px flex-1 bg-purple-800/40" />
      </div>

      {/* Upload slot */}
      <div
        className={[
          "relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all",
          imagePreview
            ? "border-purple-500 bg-[#120022]"
            : "border-purple-700/50 bg-[#0e001a] hover:border-purple-500",
        ].join(" ")}
        style={{ minHeight: imagePreview ? "auto" : "120px" }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {imagePreview ? (
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Your uploaded face"
              className="max-h-52 w-full rounded-xl object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <span className="text-sm font-bold text-white">Change photo</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="text-3xl">📸</span>
            <p className="text-sm font-semibold text-purple-300">Drop your photo here</p>
            <p className="text-xs text-purple-500">or tap to choose · jpg/png · max 6MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="w-full rounded-lg bg-red-900/40 px-4 py-3 text-center text-sm font-semibold text-red-300">
          {error}
        </p>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={[
          "w-full rounded-2xl py-4 text-base font-black uppercase tracking-widest transition-all",
          canGenerate
            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] active:scale-[0.98]"
            : "cursor-not-allowed bg-purple-900/30 text-purple-600",
        ].join(" ")}
      >
        {isGenerating ? "🎰 Generating slop…" : "🎰 Make the slop"}
      </button>

      {!allStopped && (
        <p className="text-center text-xs text-purple-500">
          {spinState === "idle" ? "Spin the reels first" : "Reels still spinning…"}
        </p>
      )}
      {allStopped && !imageFile && (
        <p className="text-center text-xs text-purple-500">Upload your face to generate</p>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
