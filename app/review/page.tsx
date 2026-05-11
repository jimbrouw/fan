"use client";

import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
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
          <h1 className="text-4xl font-semibold leading-none tracking-[-0.03em]">Review your scan.</h1>
          <p className="text-sm leading-6 text-white/62">
            Check every pose before creating the MUAPI image generation job.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {captureSteps.map((step) => {
            const capture = captures.find((item) => item.type === step.type);
            return (
              <div key={step.type} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                <div className="aspect-[3/4] bg-black">
                  {capture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capture.objectUrl} alt={step.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-white/38">Missing</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-xs text-white/48">{step.purpose}</p>
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
              New Scan
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
