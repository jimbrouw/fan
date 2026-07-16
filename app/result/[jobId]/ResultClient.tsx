"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, Download, Package, RefreshCw, RotateCcw, Share2, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { getGenerationFailureMessage } from "@/lib/ai/generationErrors";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
  kitNotes?: string | null;
};

export function ResultClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState("");
  const [showTestControls, setShowTestControls] = useState(false);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);

  const loadJob = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      const data = (await response.json()) as JobResponse & { error?: string };
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(`/result/${jobId}`)}`;
        return;
      }
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

  useEffect(() => {
    setPageUrl(window.location.href);
    setShowTestControls(
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    );
  }, []);

  const imageShareUrl = job?.outputUrl ? `/api/jobs/${jobId}/image` : "";
  const imageDownloadUrl = job?.outputUrl ? `/api/jobs/${jobId}/image?download=1` : "";
  const absoluteImageShareUrl = imageShareUrl && pageUrl ? new URL(imageShareUrl, pageUrl).href : imageShareUrl;
  const shareText = "I made a Kitface matchday poster.";
  const statusText = job?.status === "completed"
    ? "Your Kitface poster is ready."
    : job?.status === "failed"
      ? "Your Kitface poster needs another try."
      : "Your Kitface poster is loading.";

  async function copyShareLink(url: string, message = "Link copied.") {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(message);
    } catch {
      setShareStatus("Copy failed. Long-press the image to save or share it.");
    }
  }

  async function getPosterShareFile() {
    if (!imageShareUrl) return null;

    const response = await fetch(imageShareUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Poster image is not ready to share.");

    const blob = await response.blob();
    const type = blob.type.startsWith("image/") ? blob.type : "image/png";
    const extension = type.includes("jpeg") || type.includes("jpg") ? "jpg" : type.includes("webp") ? "webp" : "png";

    return new File([blob], `kitface-poster.${extension}`, { type });
  }

  async function shareNative() {
    if (!imageShareUrl) return;

    if (navigator.share) {
      try {
        const posterFile = await getPosterShareFile();
        const fileShareData = posterFile
          ? {
              title: "Kitface poster",
              text: shareText,
              files: [posterFile],
            }
          : undefined;

        if (fileShareData && (!navigator.canShare || navigator.canShare(fileShareData))) {
          await navigator.share(fileShareData);
          setShareStatus("Shared image.");
          return;
        }

        await navigator.share({
          title: "Kitface poster",
          text: shareText,
          url: absoluteImageShareUrl,
        });
        setShareStatus("Shared.");
        return;
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") return;
        setShareStatus(shareError instanceof Error ? shareError.message : "Image sharing failed.");
        return;
      }
    }

    await copyShareLink(absoluteImageShareUrl, "Native sharing is not available here. Image link copied.");
  }

  async function buyMorePosters() {
    setIsBuyingCredits(true);
    setShareStatus(null);

    try {
      const response = await fetch("/api/checkout/credits", { method: "POST" });
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(`/result/${jobId}`)}`;
        return;
      }

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Could not start checkout.");
      window.location.href = data.url;
    } catch (creditsError) {
      setShareStatus(creditsError instanceof Error ? creditsError.message : "Could not start checkout.");
      setIsBuyingCredits(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6 pb-4">
      <div className="space-y-3">
        <h1 className="font-display text-[35px] leading-none text-[var(--foreground)]">
          {job?.status === "completed" ? "Ready for the group chat." : "Your matchday poster."}
        </h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          {statusText}
        </p>
      </div>

      <div className="kitface-gradient-border grid flex-1 place-items-center overflow-hidden rounded-[18px] text-center text-sm leading-6 text-[var(--muted)] shadow-[0_18px_40px_rgba(42,0,79,0.08)]">
        {job?.status === "completed" && job.outputUrl ? (
          <div className="relative grid h-full max-h-[62vh] w-full place-items-center">
            <Image
              src={`/api/jobs/${jobId}/image`}
              alt="Generated Kitface poster"
              width={1200}
              height={1600}
              className="h-full w-full object-contain"
              unoptimized
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-4">
              <div className="flex items-center gap-2 rounded-full border border-white/35 bg-[rgba(42,0,79,0.85)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md sm:text-xs">
                <span className="font-display text-sm leading-none tracking-normal sm:text-base">Kitface</span>
                <span className="h-1 w-1 rounded-full bg-white/75" aria-hidden="true" />
                <span>kitface.app</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {job?.status === "failed"
              ? getGenerationFailureMessage(job.error)
              : error ?? job?.error ?? "The generated poster image is not available yet."}
          </div>
        )}
      </div>

      {job?.status === "completed" && (
        <button
          type="button"
          onClick={() => { window.location.href = `/upgrade/${jobId}`; }}
          className="group flex w-full items-center gap-4 rounded-[18px] border-2 border-[var(--accent)] bg-gradient-to-r from-[var(--accent)] to-[rgba(49,240,213,0.75)] p-4 text-left shadow-[0_14px_34px_rgba(49,240,213,0.22)] transition duration-300 active:scale-[0.98]"
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white/30 backdrop-blur-sm">
            <Package size={22} className="text-[var(--foreground)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-[var(--foreground)]">Download without watermark - £3.99</p>
            <p className="mt-0.5 text-xs leading-5 text-[var(--foreground)]/70">Keep the clean file, or choose a printed gift.</p>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {job?.status === "completed" ? (
          <>
            <div className="col-span-2 space-y-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                <Button type="button" onClick={shareNative} className="w-full min-[380px]:col-span-2">
                  <Share2 size={17} />
                  Share poster
                </Button>
                <a
                  href={imageDownloadUrl}
                  download={`kitface-${jobId}.png`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white active:scale-[0.98] min-[380px]:col-span-2"
                >
                  <Download size={17} />
                  Save watermarked preview
                </a>
                <Button type="button" variant="secondary" onClick={buyMorePosters} disabled={isBuyingCredits} className="w-full min-[380px]:col-span-2">
                  <Zap size={17} />
                  {isBuyingCredits ? "Opening..." : "Make 3 more - £4.99"}
                </Button>
              </div>
              {shareStatus && <p className="text-xs leading-5 text-[var(--muted)]">{shareStatus}</p>}
            </div>

            {showTestControls && (
              <Link href="/create">
                <Button variant="secondary" className="w-full">
                  <RotateCcw size={17} />
                  Regenerate test
                </Button>
              </Link>
            )}
            <Link href="/create" className="col-span-2">
              <span className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-center text-sm font-semibold leading-5 text-[var(--foreground)] transition hover:border-[rgba(42,0,79,0.2)] hover:bg-white active:scale-[0.98]">
                <RotateCcw size={17} className="shrink-0" />
                <span className="min-w-0 whitespace-normal">Make another with these photos</span>
              </span>
            </Link>
            <Link href="/capture?restart=1" className="col-span-2">
              <span className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-center text-sm font-semibold leading-5 text-[var(--foreground)] transition hover:border-[rgba(42,0,79,0.2)] hover:bg-white active:scale-[0.98]">
                <Camera size={17} className="shrink-0" />
                <span className="min-w-0 whitespace-normal">Retake photos</span>
              </span>
            </Link>
          </>
        ) : (
          job?.status === "failed" ? (
            <>
              <Link href="/create" className="col-span-2">
                <Button className="w-full">
                  <RotateCcw size={17} />
                  Try again with same photos
                </Button>
              </Link>
              <Link href="/capture?restart=1" className="col-span-2">
                <Button variant="secondary" className="w-full">
                  <Camera size={17} />
                  Retake photos
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
                New photos
              </Button>
            </Link>
            </>
          )
        )}
      </div>
    </section>
  );
}
