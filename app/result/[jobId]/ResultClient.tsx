"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy, Download, Film, MessageCircle, RefreshCw, RotateCcw, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { getDefaultMuapiVideoModel, MUAPI_VIDEO_MODELS, type MuapiVideoModelId } from "@/lib/ai/providers/muapiVideo";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
  kitNotes?: string | null;
  videoJob?: VideoJobResponse | null;
};

type VideoJobResponse = {
  id: string;
  provider?: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

type VideoTestImage = {
  bucket: string;
  path: string;
  name: string;
  signedUrl: string;
};

export function ResultClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState("");
  const [videoJob, setVideoJob] = useState<VideoJobResponse | null>(null);
  const [isStartingVideo, setIsStartingVideo] = useState(false);
  const [selectedVideoModel, setSelectedVideoModel] = useState<MuapiVideoModelId>(getDefaultMuapiVideoModel());
  const [videoError, setVideoError] = useState<string | null>(null);
  const [correctionPrompt, setCorrectionPrompt] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionStatus, setCorrectionStatus] = useState<string | null>(null);
  const [showTestControls, setShowTestControls] = useState(false);
  const [videoSourceMode, setVideoSourceMode] = useState<"poster" | "supabase">("poster");
  const [testImages, setTestImages] = useState<VideoTestImage[]>([]);
  const [selectedTestImagePath, setSelectedTestImagePath] = useState("");
  const [isLoadingTestImages, setIsLoadingTestImages] = useState(false);
  const [testImagesError, setTestImagesError] = useState<string | null>(null);
  const [showDevVideoSource, setShowDevVideoSource] = useState(false);

  const loadJob = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      const data = (await response.json()) as JobResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Job lookup failed.");
      setJob(data);
      setVideoJob(data.videoJob ?? null);
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
    setShowTestControls(["localhost", "127.0.0.1", "::1"].includes(window.location.hostname));
  }, []);

  useEffect(() => {
    if (!showTestControls) return;

    let isActive = true;

    async function loadTestImages() {
      setIsLoadingTestImages(true);
      setTestImagesError(null);

      try {
        const response = await fetch("/api/video-test-images", { cache: "no-store" });
        const data = (await response.json()) as { images?: VideoTestImage[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not load Supabase test images.");

        if (isActive) {
          const images = data.images ?? [];
          setTestImages(images);
          setSelectedTestImagePath((current) => current || images[0]?.path || "");
        }
      } catch (loadError) {
        if (isActive) {
          setTestImagesError(loadError instanceof Error ? loadError.message : "Could not load Supabase test images.");
        }
      } finally {
        if (isActive) {
          setIsLoadingTestImages(false);
        }
      }
    }

    loadTestImages();

    return () => {
      isActive = false;
    };
  }, [showTestControls]);

  const activeVideoJobId = videoJob?.id;
  const activeVideoJobStatus = videoJob?.status;

  useEffect(() => {
    if (!activeVideoJobId || activeVideoJobStatus === "completed" || activeVideoJobStatus === "failed") return;

    let isActive = true;

    async function pollVideoJob() {
      try {
        const response = await fetch(`/api/video-jobs/${activeVideoJobId}`, { cache: "no-store" });
        const data = (await response.json()) as VideoJobResponse & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Animation lookup failed.");
        if (isActive) {
          setVideoJob(data);
          setVideoError(null);
        }
      } catch (pollError) {
        if (isActive) {
          setVideoError(pollError instanceof Error ? pollError.message : "Animation lookup failed.");
        }
      }
    }

    pollVideoJob();
    const timer = window.setInterval(pollVideoJob, 4000);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [activeVideoJobId, activeVideoJobStatus]);

  const imageShareUrl = job?.outputUrl ? `/api/jobs/${jobId}/image` : "";
  const videoShareUrl = videoJob?.outputUrl ? `/api/video-jobs/${videoJob.id}/file` : "";
  const absoluteImageShareUrl = imageShareUrl && pageUrl ? new URL(imageShareUrl, pageUrl).href : imageShareUrl;
  const absoluteVideoShareUrl = videoShareUrl && pageUrl ? new URL(videoShareUrl, pageUrl).href : videoShareUrl;
  const pageShareUrl = pageUrl;
  const shareText = "I made a Kitface matchday poster.";
  const selectedTestImage = testImages.find((image) => image.path === selectedTestImagePath);
  const videoIsBusy = isStartingVideo || videoJob?.status === "processing" || videoJob?.status === "queued";

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

  async function getVideoShareFile() {
    if (!videoShareUrl) return null;

    const response = await fetch(videoShareUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Animated poster is not ready to share.");

    const blob = await response.blob();
    const type = blob.type.startsWith("video/") ? blob.type : "video/mp4";

    return new File([blob], "kitface-poster.mp4", { type });
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

  async function shareVideoNative() {
    if (!videoShareUrl) return;

    if (navigator.share) {
      try {
        const videoFile = await getVideoShareFile();
        const fileShareData = videoFile
          ? {
              title: "Kitface animated poster",
              text: shareText,
              files: [videoFile],
            }
          : undefined;

        if (fileShareData && (!navigator.canShare || navigator.canShare(fileShareData))) {
          await navigator.share(fileShareData);
          setShareStatus("Shared animation.");
          return;
        }

        await navigator.share({
          title: "Kitface animated poster",
          text: shareText,
          url: absoluteVideoShareUrl || pageShareUrl,
        });
        setShareStatus("Shared.");
        return;
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") return;
        setShareStatus(shareError instanceof Error ? shareError.message : "Video sharing failed.");
        return;
      }
    }

    await copyShareLink(absoluteVideoShareUrl || pageShareUrl, "Native sharing is not available here. Animation link copied.");
  }

  async function startVideoJob() {
    if (job?.status !== "completed" || !job.outputUrl) return;
    if (videoSourceMode === "supabase" && !selectedTestImagePath) {
      setVideoError("Choose a Supabase test image before starting animation.");
      return;
    }

    setIsStartingVideo(true);
    setVideoError(null);
    setShareStatus(null);

    try {
      const posterType = job?.kitNotes?.includes("Match:") ? "vs" : "single";
      const response = await fetch("/api/video-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationJobId: jobId,
          videoModel: selectedVideoModel,
          testSourceImagePath: videoSourceMode === "supabase" ? selectedTestImagePath : undefined,
          posterType,
        }),
      });
      const data = (await response.json()) as {
        videoJobId?: string;
        provider?: string;
        status?: VideoJobResponse["status"];
        outputUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.videoJobId) {
        if (response.status === 401) {
          window.location.href = `/login?next=${encodeURIComponent(`/result/${jobId}`)}`;
          return;
        }
        throw new Error(data.error ?? "Animation job failed to start.");
      }

      setVideoJob({
        id: data.videoJobId,
        provider: data.provider ?? `muapi:${selectedVideoModel}`,
        status: data.status ?? "processing",
        outputUrl: data.outputUrl,
      });
    } catch (startError) {
      setVideoError(startError instanceof Error ? startError.message : "Animation job failed to start.");
    } finally {
      setIsStartingVideo(false);
    }
  }

  async function submitCorrection() {
    if (!correctionPrompt.trim()) return;

    setIsCorrecting(true);
    setCorrectionStatus(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctionPrompt }),
      });
      const data = (await response.json()) as { jobId?: string; error?: string };

      if (!response.ok || !data.jobId) {
        if (response.status === 401) {
          window.location.href = `/login?next=${encodeURIComponent(`/result/${jobId}`)}`;
          return;
        }
        throw new Error(data.error ?? "Correction job failed.");
      }

      window.location.href = `/generating/${data.jobId}`;
    } catch (correctionError) {
      setCorrectionStatus(correctionError instanceof Error ? correctionError.message : "Correction job failed.");
    } finally {
      setIsCorrecting(false);
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
            {error ?? job?.error ?? "The generated poster image is not available yet."}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {job?.status === "completed" ? (
          <>
            <div className="col-span-2 space-y-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Video test model</span>
                <select
                  value={selectedVideoModel}
                  onChange={(event) => setSelectedVideoModel(event.target.value as MuapiVideoModelId)}
                  disabled={videoIsBusy}
                  className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:opacity-60"
                >
                  {MUAPI_VIDEO_MODELS.map((model) => (
                    <option key={model.id} value={model.id} className="bg-[var(--surface)] text-[var(--foreground)]">
                      {model.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-[var(--muted)]">
                  {MUAPI_VIDEO_MODELS.find((model) => model.id === selectedVideoModel)?.description}
                </p>
              </label>
              {showTestControls && showDevVideoSource && (
                <div className="space-y-3 rounded-[14px] border border-dashed border-[var(--line)] bg-[var(--surface)] p-3">
                  <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={videoSourceMode === "supabase"}
                      onChange={(event) => setVideoSourceMode(event.target.checked ? "supabase" : "poster")}
                      disabled={videoIsBusy}
                      className="h-5 w-5 accent-[var(--accent)]"
                    />
                    Use stored test image
                  </label>
                  <p className="text-xs leading-5 text-[var(--muted)]">
                    Dev only. Off means animate current poster.
                  </p>
                  {videoSourceMode === "supabase" && (
                    <div className="space-y-3">
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                          Test image
                        </span>
                        <select
                          value={selectedTestImagePath}
                          onChange={(event) => setSelectedTestImagePath(event.target.value)}
                          disabled={videoIsBusy || isLoadingTestImages || testImages.length === 0}
                          className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/70 px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:opacity-60"
                        >
                          {testImages.map((image) => (
                            <option key={image.path} value={image.path} className="bg-[var(--surface)] text-[var(--foreground)]">
                              {image.path}
                            </option>
                          ))}
                        </select>
                      </label>
                      {selectedTestImage && (
                        <Image
                          src={selectedTestImage.signedUrl}
                          alt={`Supabase test image ${selectedTestImage.name}`}
                          width={900}
                          height={1200}
                          className="aspect-[3/4] w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-soft)] object-cover"
                          unoptimized
                        />
                      )}
                      <p className="text-xs leading-5 text-[var(--muted)]">
                        {isLoadingTestImages
                          ? "Loading Supabase test images..."
                          : testImagesError
                            ? testImagesError
                            : `Using bucket ${selectedTestImage?.bucket ?? "f9cbab46-9d5e-41e4-9261-70e1e5477a8d"}.`}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {showTestControls && !showDevVideoSource && (
                <button
                  type="button"
                  onClick={() => setShowDevVideoSource(true)}
                  className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] underline-offset-4 hover:underline"
                >
                  Dev source options
                </button>
              )}
              <Button
                type="button"
                onClick={startVideoJob}
                disabled={videoIsBusy || (videoSourceMode === "supabase" && !selectedTestImagePath)}
                className="w-full"
              >
                <Film size={17} />
                {videoJob?.status === "completed"
                  ? "Video ready"
                  : videoJob?.status === "processing" || videoJob?.status === "queued"
                    ? "Animating..."
                    : isStartingVideo
                      ? "Starting..."
                      : "Animate"}
              </Button>
              {videoError && !videoJob && (
                <p className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3 text-xs leading-5 text-[var(--accent)]">
                  {videoError}
                </p>
              )}
              {videoJob && (
                <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3">
                  {videoJob.status === "completed" && videoJob.outputUrl ? (
                    <video
                      src={videoJob.outputUrl}
                      controls
                      loop
                      playsInline
                      muted
                      className="aspect-[3/4] w-full rounded-[10px] bg-black object-contain"
                    />
                  ) : (
                    <p className="text-xs leading-5 text-[var(--muted)]">
                      Animation is {videoJob.status}. You can stay in Kitface while it runs.
                    </p>
                  )}
                  {videoJob.provider && (
                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                      Provider: {videoJob.provider}
                    </p>
                  )}
                  {(videoError || videoJob.error) && (
                    <p className="mt-2 text-xs leading-5 text-[var(--accent)]">
                      {videoError ?? videoJob.error}
                    </p>
                  )}
                </div>
              )}
              {videoJob?.status === "failed" && (
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Your static poster is still available. Try animation again when the provider is ready.
                </p>
              )}
            </div>
            <div className="col-span-2 space-y-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" onClick={shareNative} className="col-span-2 w-full">
                  <Share2 size={17} />
                  Share image
                </Button>
                {videoJob?.status === "completed" && videoJob.outputUrl && (
                  <>
                    <Button type="button" onClick={shareVideoNative} className="col-span-2 w-full">
                      <Share2 size={17} />
                      Share video
                    </Button>
                    <a
                      href={videoShareUrl}
                      download={`kitface-${videoJob.id}.mp4`}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white active:scale-[0.98]"
                    >
                      <Download size={17} />
                      MP4
                    </a>
                    <Button type="button" variant="secondary" onClick={() => copyShareLink(absoluteVideoShareUrl, "Video link copied.")}>
                      <Copy size={17} />
                      Copy video
                    </Button>
                  </>
                )}
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
                <Button type="button" variant="secondary" className="col-span-2" onClick={shareNative}>
                  <MessageCircle size={17} />
                  WhatsApp
                </Button>
              </div>
              {shareStatus && <p className="text-xs leading-5 text-[var(--muted)]">{shareStatus}</p>}
            </div>
            <Button className="w-full" onClick={() => {
              window.location.href = `/upgrade/${jobId}`;
            }}>
              Upgrade
            </Button>
            {showTestControls && (
              <Link href="/create">
                <Button variant="secondary" className="w-full">
                  <RotateCcw size={17} />
                  Regenerate test
                </Button>
              </Link>
            )}
            <div className="col-span-2 space-y-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Correction</span>
                <textarea
                  value={correctionPrompt}
                  onChange={(event) => setCorrectionPrompt(event.target.value)}
                  placeholder="remove the scarf, make the number 10 not 7..."
                  className="min-h-20 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/60 px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)]"
                />
              </label>
              <Button type="button" variant="secondary" className="w-full" onClick={submitCorrection} disabled={isCorrecting || !correctionPrompt.trim()}>
                {isCorrecting ? "Revising..." : "Apply correction"}
              </Button>
              {correctionStatus && <p className="text-xs leading-5 text-[var(--accent)]">{correctionStatus}</p>}
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
