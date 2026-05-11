"use client";

import { Camera, Check, RefreshCw, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CaptureOverlay } from "@/components/CaptureOverlay";
import { Button } from "@/components/Button";
import { validateImageBlob, type ClientValidationResult } from "@/lib/validation";
import type { CaptureStep } from "@/types/capture";

type CameraCaptureProps = {
  step: CaptureStep;
  onUsePhoto: (blob: Blob, validation: ClientValidationResult) => void;
};

export function CameraCapture({ step, onUsePhoto }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [validation, setValidation] = useState<ClientValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 1920 }
          },
          audio: false
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError("Camera permission is needed to create your Fan Hero profile.");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    };
  }, [capturedUrl]);

  async function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setIsValidating(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsValidating(false);
        return;
      }

      const result = await validateImageBlob(blob);
      const nextUrl = URL.createObjectURL(blob);
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
      setCapturedBlob(blob);
      setCapturedUrl(nextUrl);
      setValidation(result);
      setIsValidating(false);
    }, "image/jpeg", 0.92);
  }

  function retake() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
    setValidation(null);
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold leading-none tracking-[-0.02em]">{step.title}</h1>
        <p className="max-w-[29ch] text-sm leading-6 text-white/64">{step.instruction}</p>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/12 bg-black shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-white/70">
            <VideoOff size={34} className="text-[var(--accent)]" />
            <p className="text-sm leading-6">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full scale-x-[-1] object-cover"
            />
            {capturedUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedUrl} alt="Captured pose" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <CaptureOverlay overlay={step.overlay} />
          </>
        )}
      </div>

      {validation && (
        <div className="rounded-lg border border-white/12 bg-white/7 p-4 text-sm text-white/70">
          {validation.messages[0]}
        </div>
      )}

      <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3 pb-2">
        <Button variant="secondary" onClick={retake} disabled={!capturedBlob}>
          <RefreshCw size={17} />
          Retake
        </Button>
        <button
          aria-label="Capture photo"
          onClick={captureFrame}
          disabled={Boolean(error) || isValidating}
          className="grid size-[72px] place-items-center rounded-full border border-white/18 bg-white text-black shadow-[0_18px_44px_rgba(255,255,255,0.2)] transition active:scale-95 disabled:opacity-50"
        >
          <Camera size={26} />
        </button>
        <Button
          variant="primary"
          disabled={!capturedBlob || !validation}
          onClick={() => capturedBlob && validation && onUsePhoto(capturedBlob, validation)}
        >
          <Check size={17} />
          Use
        </Button>
      </div>
    </section>
  );
}
