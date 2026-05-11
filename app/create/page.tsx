"use client";

import { ImagePlus, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import type { CaptureStepType } from "@/types/capture";

type LocalCapture = {
  type: CaptureStepType;
  imageUrl?: string;
};

export default function CreatePage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [kitNotes, setKitNotes] = useState("");
  const [targetPosterUrl, setTargetPosterUrl] = useState("");
  const [captures, setCaptures] = useState<LocalCapture[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sourceImageUrl = useMemo(
    () =>
      captures.find((capture) => capture.type === "neutral_front")?.imageUrl ??
      captures.find((capture) => capture.imageUrl)?.imageUrl,
    [captures]
  );
  const canSubmit = teamName.trim() && kitNotes.trim() && targetPosterUrl.trim() && sourceImageUrl && sessionId;

  useEffect(() => {
    setSessionId(localStorage.getItem("fan-hero-session-id"));
    setCaptures(JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[]);
  }, []);

  async function submitJob() {
    if (!canSubmit || !sourceImageUrl || !sessionId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/muapi/face-swap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sourceImageUrl,
          targetImageUrl: targetPosterUrl,
          teamName,
          kitNotes
        })
      });

      const data = (await response.json()) as { jobId?: string; error?: string };
      if (!response.ok || !data.jobId) {
        throw new Error(data.error ?? "Generation job failed.");
      }

      router.push(`/generating/${data.jobId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Generation job failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <AppFrame>
      <section className="flex flex-1 flex-col gap-6 pb-4">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-none tracking-[-0.03em]">Create poster.</h1>
          <p className="text-sm leading-6 text-white/62">
            Add team styling and a target poster image URL. The server route then prepares an image-only MUAPI face swap job.
          </p>
        </div>

        <form className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Team</span>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="AFC Wimbledon"
              className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/34"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Kit notes</span>
            <textarea
              value={kitNotes}
              onChange={(event) => setKitNotes(event.target.value)}
              placeholder="Home and away kit colours, badge direction, shirt number ideas"
              className="min-h-28 w-full resize-none rounded-lg border border-white/12 bg-white/[0.07] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-white/34"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Target poster URL</span>
            <div className="relative">
              <ImagePlus size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={targetPosterUrl}
                onChange={(event) => setTargetPosterUrl(event.target.value)}
                placeholder="https://..."
                className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/34"
              />
            </div>
          </label>
        </form>

        <div className="rounded-lg border border-white/10 bg-black/24 p-4 text-sm leading-6 text-white/58">
          {sourceImageUrl
            ? "A Supabase-hosted reference image is ready for the MUAPI image-only swap."
            : "Connect Supabase credentials and retake at least one capture so MUAPI can access a hosted source image."}
        </div>

        {error && (
          <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm leading-6 text-white/76">
            {error}
          </div>
        )}

        <Button type="button" disabled={!canSubmit || isSubmitting} onClick={submitJob} className="mt-auto w-full">
          <WandSparkles size={17} />
          {isSubmitting ? "Starting..." : "Start Image Swap"}
        </Button>
      </section>
    </AppFrame>
  );
}
