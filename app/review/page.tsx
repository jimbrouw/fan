"use client";

import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { captureSteps } from "@/lib/captureSteps";
import type { CaptureStepType } from "@/types/capture";

type LocalCapture = {
  type: CaptureStepType;
  objectUrl: string;
  imageUrl?: string;
};

export default function ReviewPage() {
  const [captures, setCaptures] = useState<LocalCapture[]>([]);

  useEffect(() => {
    setCaptures(JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[]);
  }, []);

  return (
    <AppFrame>
      <section className="flex flex-1 flex-col gap-6 pb-4">
        <div className="space-y-3">
          <h1 className="font-display text-[34px] leading-none text-[var(--foreground)]">Review.</h1>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Check every photo before choosing the kit and poster style.
          </p>
        </div>

        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--mist)]/65 p-4">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent-green)] text-white">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">Looks good.</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Retake anything that feels blurry or awkward.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {captureSteps.map((step) => {
            const capture = captures.find((item) => item.type === step.type);
            return (
              <div key={step.type} className="overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface)]">
                <div className="aspect-[3/4] bg-[var(--surface-soft)]">
                  {capture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capture.objectUrl} alt={step.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-[var(--muted)]">Missing</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-[var(--surface-soft)] text-[10px] text-[var(--foreground)]">
                      {captureSteps.findIndex((item) => item.type === step.type) + 1}
                    </span>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{step.shortLabel}</p>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span className={`size-2 rounded-full ${capture ? "bg-[var(--accent-green)]" : "bg-[var(--accent)]"}`} />
                    {capture ? "Ready" : "Retake"}
                  </p>
                  <Link href={`/capture?step=${step.type}`} className="mt-3 block">
                    <Button variant="secondary" className="h-10 w-full text-xs">
                      <Camera size={15} />
                      Retake
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <Link href="/capture?step=neutral_front">
            <Button variant="secondary" className="w-full">
              <Camera size={17} />
              New photos
            </Button>
          </Link>
          <Link href="/create">
            <Button className="w-full">
              Continue
              <ArrowRight size={17} />
            </Button>
          </Link>
        </div>
      </section>
    </AppFrame>
  );
}
