"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraCapture } from "@/components/CameraCapture";
import { captureSteps } from "@/lib/captureSteps";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { ClientValidationResult } from "@/lib/validation";
import type { CaptureStepType } from "@/types/capture";

type LocalCapture = {
  type: CaptureStepType;
  objectUrl: string;
  imageUrl?: string;
  validation: ClientValidationResult;
};

export function CaptureClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [captures, setCaptures] = useState<LocalCapture[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const activeStep = captureSteps[activeIndex];

  const capturedTypes = useMemo(() => new Set(captures.map((capture) => capture.type)), [captures]);

  useEffect(() => {
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
        window.location.href = "/login?next=/capture";
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
  }, []);

  useEffect(() => {
    const stepType = searchParams.get("step");
    const stepIndex = captureSteps.findIndex((step) => step.type === stepType);
    if (stepIndex >= 0) {
      setActiveIndex(stepIndex);
    }
  }, [searchParams]);

  async function handleUsePhoto(blob: Blob, validation: ClientValidationResult) {
    setIsSaving(true);
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
        }
      } catch {
        imageUrl = undefined;
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
    // Fixed full-viewport layout — no scroll, camera fills available height
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[var(--surface)]">

      {/* Header — always visible, never shifts */}
      <header className="shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
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
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
          One moment...
        </div>
      ) : (
        <div className="flex flex-1 flex-col min-h-0 px-4 pb-safe">
          {/* Step title + instruction — compact, always above camera */}
          <div className="shrink-0 pb-3 text-center">
            <h1 className="font-display text-[26px] leading-tight text-[var(--foreground)]">
              {activeStep.title}
            </h1>
            <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
              {activeStep.instruction}
            </p>
          </div>

          {/* Camera + controls — fills remaining height */}
          <CameraCapture key={activeStep.type} step={activeStep} onUsePhoto={handleUsePhoto} isSaving={isSaving} />
        </div>
      )}
    </div>
  );
}
