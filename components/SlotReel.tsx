"use client";

import { useEffect, useRef, useState } from "react";
import type { ReelItem } from "@/lib/slop/reelData";

type Props = {
  items: ReelItem[];
  label: string;
  isSpinning: boolean;
  finalIndex: number;
  onStop: () => void;
};

const SPIN_PHASES = [
  { interval: 55, count: 22 },
  { interval: 110, count: 8 },
  { interval: 180, count: 5 },
  { interval: 300, count: 3 },
];

export function SlotReel({ items, label, isSpinning, finalIndex, onStop }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blur, setBlur] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isSpinning) {
      setBlur(false);
      return;
    }

    setBlur(true);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    let idx = currentIndex;
    let delay = 0;

    for (const phase of SPIN_PHASES) {
      for (let i = 0; i < phase.count; i++) {
        delay += phase.interval;
        const capturedDelay = delay;
        const t = setTimeout(() => {
          idx = (idx + 1) % items.length;
          setCurrentIndex(idx);
        }, capturedDelay);
        timeoutsRef.current.push(t);
      }
    }

    const finalDelay = delay + 200;
    const stopT = setTimeout(() => {
      setCurrentIndex(finalIndex);
      setBlur(false);
      onStop();
    }, finalDelay);
    timeoutsRef.current.push(stopT);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning]);

  const item = items[currentIndex];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300/70">
        {label}
      </span>
      <div
        className={[
          "relative flex h-28 w-24 flex-col items-center justify-center overflow-hidden rounded-xl",
          "border-2 transition-all duration-100",
          isSpinning
            ? "border-yellow-400 bg-[#1a002e] shadow-[0_0_18px_rgba(250,204,21,0.5)]"
            : "border-purple-700/60 bg-[#120022] shadow-inner",
        ].join(" ")}
      >
        {/* scanline overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.08)_3px,rgba(0,0,0,0.08)_4px)]" />

        <span
          className="select-none text-4xl transition-all duration-75"
          style={{ filter: blur ? "blur(3px)" : "none" }}
        >
          {item.emoji}
        </span>
        <span
          className="mt-1.5 max-w-[80px] text-center text-[11px] font-bold leading-tight text-white transition-all duration-75"
          style={{ filter: blur ? "blur(2px)" : "none" }}
        >
          {item.label}
        </span>
      </div>
    </div>
  );
}
