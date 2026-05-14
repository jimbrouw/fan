"use client";

import { Camera, Check, RefreshCw, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
          setError("Camera needs HTTPS on iPhone. Open the secure ngrok link, not the local network URL.");
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setError("This browser does not expose camera access. Open the secure link in Safari and allow camera access.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" }
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
      } catch (cameraError) {
        if (cameraError instanceof DOMException) {
          if (cameraError.name === "NotAllowedError") {
            setError("Camera permission was denied. In Safari, allow camera access for this site, then reload.");
            return;
          }

          if (cameraError.name === "NotFoundError") {
            setError("No camera was found on this device or browser.");
            return;
          }

          if (cameraError.name === "NotReadableError") {
            setError("The camera is already in use by another app or browser tab. Close it, then reload.");
            return;
          }

          setError(`Camera failed: ${cameraError.name}. Reload the secure Safari page and try again.`);
          return;
        }

        setError("Camera permission is needed to create your Kitface poster.");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    };
  }, [capturedUrl]);

  const captureFrame = useCallback(async () => {
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
  }, [capturedUrl]);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null || !isCameraReady || capturedBlob || error || isValidating) return;

    let nextCount = step.countdownSeconds ?? 3;
    setCountdown(nextCount);

    countdownTimerRef.current = window.setInterval(() => {
      nextCount -= 1;

      if (nextCount <= 0) {
        clearCountdown();
        setCountdown(null);
        captureFrame();
        return;
      }

      setCountdown(nextCount);
    }, 1000);
  }, [captureFrame, capturedBlob, clearCountdown, error, isCameraReady, isValidating, step.countdownSeconds]);

  useEffect(() => clearCountdown, [clearCountdown]);

  function retake() {
    clearCountdown();
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
    setValidation(null);
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-[31px] leading-none text-[var(--foreground)]">{step.title}</h1>
        <p className="mx-auto max-w-[29ch] text-sm leading-6 text-[var(--muted)]">{step.instruction}</p>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface-soft)] shadow-[0_28px_55px_rgba(42,0,79,0.12)]">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-[var(--muted)]">
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
              onLoadedMetadata={() => setIsCameraReady(true)}
              className="h-full w-full scale-x-[-1] object-contain"
            />
            {capturedUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedUrl} alt="Captured pose" className="absolute inset-0 h-full w-full object-contain" />
            )}
            <CaptureOverlay overlay={step.overlay} />
            {countdown !== null && (
              <div className="absolute inset-0 grid place-items-center bg-[rgba(42,0,79,0.25)]">
                <div className="grid size-28 place-items-center rounded-full border border-white/36 bg-[var(--surface)] text-6xl font-semibold text-[var(--foreground)] shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                  {countdown}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {step.autoCapture && !capturedBlob && (
        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/70 p-4 text-sm leading-6 text-[var(--foreground)]">
          Press the shutter, then move into position during the 5 second countdown.
        </div>
      )}

      {validation && (
        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--foreground)]">
          {validation.messages[0]}
        </div>
      )}

      <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3 pb-2">
        <Button variant="secondary" onClick={retake} disabled={!capturedBlob}>
          <RefreshCw size={17} />
          Retake
        </Button>
        <button
          aria-label={step.autoCapture ? "Start countdown" : "Capture photo"}
          onClick={step.autoCapture ? startCountdown : captureFrame}
          disabled={Boolean(error) || isValidating || countdown !== null}
          className="grid size-[72px] place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] shadow-[0_18px_38px_rgba(42,0,79,0.12)] transition active:scale-95 disabled:opacity-50"
        >
          <Camera size={26} />
        </button>
        <Button
          variant="primary"
          disabled={!capturedBlob || !validation}
          onClick={() => capturedBlob && validation && onUsePhoto(capturedBlob, validation)}
        >
          <Check size={17} />
          Use photo
        </Button>
      </div>
    </section>
  );
}
