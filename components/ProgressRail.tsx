import { clsx } from "clsx";
import { captureSteps } from "@/lib/captureSteps";

export function ProgressRail({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Photo set</span>
        <span>
          {activeIndex + 1}/{captureSteps.length}
        </span>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {captureSteps.map((step, index) => (
          <div
            key={step.type}
            className={clsx(
              "h-1.5 rounded-full",
              index <= activeIndex ? "bg-[var(--accent-green)]" : "bg-[rgba(40,55,45,0.14)]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
