"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { CameraCapture } from "@/components/CameraCapture";
import { ProgressRail } from "@/components/ProgressRail";
import { captureSteps } from "@/lib/captureSteps";
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

    const existing = localStorage.getItem("fan-hero-session-id");
    const existingCaptures = JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[];
    setCaptures(existingCaptures);

    if (existing) {
      setSessionId(existing);
    } else {
      createSession();
    }
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
    <AppFrame>
      <div className="mb-6">
        <ProgressRail activeIndex={activeIndex} />
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {captureSteps.map((step, index) => (
          <button
            key={step.type}
            onClick={() => setActiveIndex(index)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
              index === activeIndex
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--foreground)]"
                : capturedTypes.has(step.type)
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--foreground)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
            }`}
          >
            {step.shortLabel}
          </button>
        ))}
      </div>
      {isSaving && (
        <div className="mb-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/55 p-3 text-sm text-[var(--foreground)]">
          Saving photo...
        </div>
      )}
      <CameraCapture key={activeStep.type} step={activeStep} onUsePhoto={handleUsePhoto} />
    </AppFrame>
  );
}
