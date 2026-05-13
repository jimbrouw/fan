"use client";

import Image from "next/image";
import Link from "next/link";
import { AtSign, Copy, MessageCircle, RefreshCw, RotateCcw, Send, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

export function ResultClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const loadJob = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      const data = (await response.json()) as JobResponse & { error?: string };
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

  const shareUrl = job?.outputUrl ?? "";
  const shareText = "I made a Kitface matchday poster.";
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedShareText = encodeURIComponent(`${shareText} ${shareUrl}`);

  async function copyShareLink(message = "Link copied.") {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(message);
    } catch {
      setShareStatus("Copy failed. Long-press the image to save or share it.");
    }
  }

  async function shareNative() {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kitface poster",
          text: shareText,
          url: shareUrl,
        });
        setShareStatus("Shared.");
        return;
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      }
    }

    await copyShareLink("Native sharing is not available here. Link copied.");
  }

  return (
    <section className="flex flex-1 flex-col gap-6 pb-4">
      <div className="space-y-3">
        <h1 className="font-display text-[35px] leading-none text-[var(--foreground)]">Your poster.</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Poster <span className="font-mono text-[var(--foreground)]">{jobId.slice(0, 8)}</span> is {job?.status ?? "loading"}.
        </p>
      </div>

      <div className="grid flex-1 place-items-center overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--surface)] text-center text-sm leading-6 text-[var(--muted)] shadow-[0_18px_40px_rgba(53,42,27,0.12)]">
        {job?.status === "completed" && job.outputUrl ? (
          <Image
            src={job.outputUrl}
            alt="Generated Kitface poster"
            width={1200}
            height={1600}
            className="h-full max-h-[62vh] w-full object-contain"
            unoptimized
          />
        ) : (
          <div className="p-8">
            {error ?? job?.error ?? "The generated poster image is not available yet."}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {job?.status === "completed" ? (
          <>
            <div className="col-span-2 space-y-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" onClick={shareNative} className="col-span-2 w-full">
                  <Share2 size={17} />
                  Share
                </Button>
                <a
                  href={`https://wa.me/?text=${encodedShareText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white active:scale-[0.98]"
                >
                  <MessageCircle size={17} />
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedShareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white active:scale-[0.98]"
                >
                  <Send size={17} />
                  X
                </a>
                <Button type="button" variant="secondary" onClick={() => copyShareLink("Image link copied for Instagram.")}>
                  <AtSign size={17} />
                  Instagram
                </Button>
                <Button type="button" variant="secondary" onClick={() => copyShareLink()}>
                  <Copy size={17} />
                  Copy Link
                </Button>
              </div>
              {shareStatus && <p className="text-xs leading-5 text-[var(--muted)]">{shareStatus}</p>}
            </div>
            <Button
              className="w-full"
              onClick={() => alert("Approved! This would trigger the high-res render and fulfilment pipeline.")}
            >
              Approve & Finalize
            </Button>
            <Link href="/create">
              <Button variant="secondary" className="w-full">
                <RotateCcw size={17} />
                Regenerate
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
        )}
      </div>
    </section>
  );
}
