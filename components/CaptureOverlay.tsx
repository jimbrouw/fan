import { clsx } from "clsx";
import type { CaptureStep } from "@/types/capture";

export function CaptureOverlay({ overlay }: { overlay: CaptureStep["overlay"] }) {
  const isFullBody = overlay === "body" || overlay === "action";
  const isTorso = overlay === "torso";
  const isBodyLike = isFullBody || isTorso;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
      <div className="absolute inset-0 border border-white/22" />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/18" />
      <div className="absolute left-0 top-[42%] h-px w-full bg-white/14" />

      <div
        className={clsx(
          "absolute left-1/2 border border-white/60 shadow-[0_20px_55px_rgba(42,0,79,0.14)]",
          isFullBody && "top-[8%] h-[78%] w-[56%] -translate-x-1/2 rounded-[42%]",
          isTorso && "top-[12%] h-[55%] w-[62%] -translate-x-1/2 rounded-[38%]",
          !isBodyLike && "top-[18%] h-[38%] w-[46%] -translate-x-1/2 rounded-[50%]",
          overlay === "angle-left" && "-rotate-6",
          overlay === "angle-right" && "rotate-6",
          overlay === "profile" && "w-[36%] translate-x-[-42%] rounded-[45%]"
        )}
      />

      {!isBodyLike && (
        <div className="absolute left-1/2 top-[38%] h-px w-[34%] -translate-x-1/2 bg-white/70" />
      )}

      <div className="absolute bottom-4 left-1/2 h-px w-[58%] -translate-x-1/2 bg-white/24" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-white/70">
        {isTorso ? "Head to waist" : "Align shoulders"}
      </div>
    </div>
  );
}
