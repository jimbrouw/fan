"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraCapture } from "@/components/CameraCapture";
import { captureSteps } from "@/lib/captureSteps";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { ClientValidationResult } from "@/lib/validation";
import type { CaptureStepType, CaptureValidationStatus } from "@/types/capture";

interface DatabaseCapture {
  type: CaptureStepType;
  image_url: string;
  validation_status: CaptureValidationStatus;
  validation_results: Record<string, unknown>;
}

type LocalCapture = {
  type: CaptureStepType;
  objectUrl?: string;
  imageUrl?: string;
  validation: ClientValidationResult;
};

async function signRestoredCaptureUrls(sessionId: string, captures: LocalCapture[]) {
  const imageUrls = captures.map((capture) => capture.imageUrl).filter((url): url is string => Boolean(url));
  if (imageUrls.length === 0) return captures;

  const response = await fetch("/api/captures/signed-urls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, imageUrls }),
  });

  if (!response.ok) return captures;

  const data = (await response.json()) as { signedUrls?: Record<string, string> };
  return captures.map((capture) => ({
    ...capture,
    imageUrl: capture.imageUrl ? data.signedUrls?.[capture.imageUrl] ?? capture.imageUrl : undefined,
  }));
}

export function CaptureClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [captures, setCaptures] = useState<LocalCapture[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [pastSession, setPastSession] = useState<{ id: string; capturesCount: number; dateStr: string; rawCaptures: DatabaseCapture[] } | null>(null);
  const activeStep = captureSteps[activeIndex];

  const capturedTypes = useMemo(() => new Set(captures.map((capture) => capture.type)), [captures]);

  useEffect(() => {
    const stepType = searchParams.get("step");
    const shouldRestart = searchParams.get("restart") === "1" || !stepType;

    async function createSession() {
      try {
        const response = await fetch("/api/sessions", { method: "POST" });
        if (!response.ok) throw new Error("Session API unavailable.");
        const data = (await response.json()) as { id: string };
        setSessionId(data.id);
        localStorage.setItem("fan-hero-session-id", data.id);
      } catch {
        const fallbackId = crypto.randomUUID();
        setSessionId(fallbackId);
        localStorage.setItem("fan-hero-session-id", fallbackId);
      }
    }

    async function bootCapture() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        window.location.href = "/login?next=/capture";
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login?next=/capture?restart=1";
        return;
      }

      // Check if there are past captures to restore
      try {
        const { data: sessions, error: sessionsErr } = await supabase
          .from("capture_sessions")
          .select("id, created_at, captures ( type, image_url, validation_status, validation_results )")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!sessionsErr && sessions && sessions.length > 0) {
          const latest = sessions[0];
          if (latest.captures && latest.captures.length > 0) {
            const date = new Date(latest.created_at);
            const dateStr = date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            setPastSession({
              id: latest.id,
              capturesCount: latest.captures.length,
              dateStr,
              rawCaptures: latest.captures,
            });
          }
        }
      } catch (err) {
        console.warn("Could not check for restorable sessions:", err);
      }

      if (shouldRestart) {
        localStorage.removeItem("fan-hero-session-id");
        localStorage.removeItem("fan-hero-captures");
        setCaptures([]);
        await createSession();
        setIsCheckingAuth(false);
        return;
      }

      const existing = localStorage.getItem("fan-hero-session-id");
      const existingCaptures = JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[];
      setCaptures(existingCaptures);
      if (existing) {
        setSessionId(existing);
      } else {
        await createSession();
      }

      setIsCheckingAuth(false);
    }

    bootCapture();
  }, [searchParams]);

  useEffect(() => {
    const stepType = searchParams.get("step");
    const stepIndex = captureSteps.findIndex((step) => step.type === stepType);
    if (stepIndex >= 0) {
      setActiveIndex(stepIndex);
    }
  }, [searchParams]);

  async function handleRestoreSession() {
    if (!pastSession) return;
    setIsSaving(true);
    try {
      const restoredCaptures = pastSession.rawCaptures.map((cap: DatabaseCapture) => {
        const results = cap.validation_results || {};
        return {
          type: cap.type,
          imageUrl: cap.image_url,
          validation: {
            status: cap.validation_status ?? "manual_review",
            checks: {
              brightness: typeof results.brightness === "number" ? results.brightness : 255,
              blurScore: typeof results.blurScore === "number" ? results.blurScore : 10,
            },
            messages: [] as string[]
          }
        };
      });
      const signedCaptures = await signRestoredCaptureUrls(pastSession.id, restoredCaptures);

      localStorage.setItem("fan-hero-session-id", pastSession.id);
      localStorage.setItem("fan-hero-captures", JSON.stringify(signedCaptures));
      setCaptures(signedCaptures);
      setSessionId(pastSession.id);

      router.push("/review");
    } catch (err) {
      console.error("Error restoring session:", err);
      setUploadError("Could not restore your previous photos. Please try taking them manually.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUsePhoto(blob: Blob, validation: ClientValidationResult) {
    setIsSaving(true);
    setUploadError(null);
    const objectUrl = URL.createObjectURL(blob);
    let imageUrl: string | undefined;

    if (sessionId) {
      const form = new FormData();
      form.append("file", blob, `${activeStep.type}.jpg`);
      form.append("sessionId", sessionId);
      form.append("type", activeStep.type);
      form.append("validationStatus", validation.status);
      form.append("validationResults", JSON.stringify(validation.checks));

      try {
        const response = await fetch("/api/captures", {
          method: "POST",
          body: form
        });
        if (response.ok) {
          const data = (await response.json()) as { imageUrl?: string };
          imageUrl = data.imageUrl;
        } else {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          setUploadError(data.error ?? "Photo upload failed. You can retake or continue and retry on the next screen.");
        }
      } catch {
        setUploadError("Photo upload failed. You can retake or continue and retry on the next screen.");
      }
    }

    const nextCapture = { type: activeStep.type, objectUrl, imageUrl, validation };
    setCaptures((current) => [
      ...current.filter((capture) => capture.type !== activeStep.type),
      nextCapture
    ]);

    const existing = JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[];
    const next = [
      ...existing.filter((capture) => capture.type !== activeStep.type),
      nextCapture
    ];
    localStorage.setItem("fan-hero-captures", JSON.stringify(next));
    setIsSaving(false);

    if (activeIndex === captureSteps.length - 1) {
      router.push("/review");
      return;
    }

    setActiveIndex((index) => index + 1);
  }

  return (
    <div className="fixed inset-0 flex h-[100svh] max-h-[100svh] touch-none justify-center overflow-hidden bg-[var(--background)]">
    <div className="flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[var(--surface)]">

      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <Link href="/" className="font-display text-[26px] leading-none text-[var(--foreground)]">
          Kitface
        </Link>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Photo {activeIndex + 1} of {captureSteps.length}
          </p>
          {/* Dot progress */}
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            {captureSteps.map((step, i) => (
              <button
                key={step.type}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex
                    ? "w-4 bg-[var(--accent)]"
                    : capturedTypes.has(step.type)
                      ? "w-1.5 bg-[var(--accent)]/50"
                      : "w-1.5 bg-[var(--line)]"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {isCheckingAuth ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[var(--muted)]">
          One moment...
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-[max(8px,env(safe-area-inset-bottom))]">
          <div className="shrink-0 pb-2 text-center">
            <h1 className="font-display text-[24px] leading-tight text-[var(--foreground)]">
              {activeStep.title}
            </h1>
            <p className="mx-auto mt-1 max-w-[30ch] text-sm leading-5 text-[var(--muted)]">
              {activeStep.instruction}
            </p>
          </div>

          {activeIndex === 0 && pastSession && captures.length === 0 && (
            <div className="shrink-0 mb-4 p-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/80 relative overflow-hidden">
              <div className="kitface-ramp absolute -inset-1 -z-10 rounded-[18px] opacity-10 blur-md" />
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <span>✨</span> Use your last photos?
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                    Found {pastSession.capturesCount} photos from {pastSession.dateStr}. Skip the camera if they still look good.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRestoreSession}
                  disabled={isSaving}
                  className="w-full h-10 rounded-[10px] bg-[var(--accent)] text-[var(--foreground)] text-xs font-bold transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSaving ? "Loading..." : "Use last photos"}
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="shrink-0 mb-2 rounded-[12px] border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-xs leading-5 text-[var(--foreground)]">
              {uploadError}
            </p>
          )}

          <CameraCapture key={activeStep.type} step={activeStep} onUsePhoto={handleUsePhoto} isSaving={isSaving} />
        </div>
      )}
    </div>
    </div>
  );
}
