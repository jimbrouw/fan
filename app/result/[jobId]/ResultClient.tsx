"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy, Download, RefreshCw, RotateCcw, Share2 } from "lucide-react";
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
  const [pageUrl, setPageUrl] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<string | null>(null);
  const [isSendingToPrintful, setIsSendingToPrintful] = useState(false);

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

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const imageShareUrl = job?.outputUrl ? `/api/jobs/${jobId}/image` : "";
  const absoluteImageShareUrl = imageShareUrl && pageUrl ? new URL(imageShareUrl, pageUrl).href : imageShareUrl;
  const pageShareUrl = pageUrl;
  const shareText = "I made a Kitface matchday poster.";

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

  async function sendToPrintful() {
    if (job?.status !== "completed") return;

    setIsSendingToPrintful(true);
    setFulfillmentStatus(null);

    try {
      const response = await fetch("/api/fulfillment/printful", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ jobId })
      });
      const data = (await response.json()) as { orderId?: string; status?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Printful draft order failed.");
      }

      setFulfillmentStatus(`Printful draft order ${data.orderId} created (${data.status ?? "draft"}).`);
    } catch (sendError) {
      setFulfillmentStatus(sendError instanceof Error ? sendError.message : "Printful draft order failed.");
    } finally {
      setIsSendingToPrintful(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6 pb-4">
      <div className="space-y-3">
        <h1 className="font-display text-[35px] leading-none text-[var(--foreground)]">Your poster.</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Poster <span className="font-mono text-[var(--foreground)]">{jobId.slice(0, 8)}</span> is {job?.status ?? "loading"}.
        </p>
      </div>

      <div className="kitface-gradient-border grid flex-1 place-items-center overflow-hidden rounded-[18px] text-center text-sm leading-6 text-[var(--muted)] shadow-[0_18px_40px_rgba(42,0,79,0.08)]">
        {job?.status === "completed" && job.outputUrl ? (
          <div className="relative grid h-full max-h-[62vh] w-full place-items-center">
            <Image
              src={job.outputUrl}
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
                  Share image
                </Button>
                <a
                  href={imageShareUrl}
                  download={`kitface-${jobId}.png`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white active:scale-[0.98]"
                >
                  <Download size={17} />
                  Download
                </a>
                <Button type="button" variant="secondary" onClick={() => copyShareLink(absoluteImageShareUrl, "Image link copied.")}>
                  <Copy size={17} />
                  Copy image link
                </Button>
                <Button type="button" variant="secondary" className="col-span-2" onClick={() => copyShareLink(pageShareUrl, "Page link copied.")}>
                  <Copy size={17} />
                  Copy page link
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
            <div className="col-span-2 space-y-2 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <Button type="button" variant="secondary" className="w-full" onClick={sendToPrintful} disabled={isSendingToPrintful}>
                {isSendingToPrintful ? "Sending..." : "Send draft to Printful"}
              </Button>
              <p className="text-xs leading-5 text-[var(--muted)]">
                Creates a draft Printful order using the current poster image. It does not confirm, charge, or send the order to production.
              </p>
              {fulfillmentStatus && <p className="text-xs font-semibold leading-5 text-[var(--foreground)]">{fulfillmentStatus}</p>}
            </div>
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
