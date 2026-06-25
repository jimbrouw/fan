"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { MOCK_PORTRAITS, MOCK_CALLED_IDS, MOCK_EVENT } from "@/lib/bingo/mockData";

export default function DisplayPage() {
  useParams();
  const portraits = MOCK_PORTRAITS;
  const event = MOCK_EVENT;

  const [calledIdx, setCalledIdx] = useState(MOCK_CALLED_IDS.length - 1);
  const [calledIds, setCalledIds] = useState<string[]>(MOCK_CALLED_IDS);

  const currentPortrait = portraits.find((p) => p.id === calledIds[calledIdx]) ?? portraits[0];
  const remaining = portraits.filter((p) => !calledIds.includes(p.id));

  function callNext() {
    if (remaining.length === 0) return;
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    const nextIds = [...calledIds, next.id];
    setCalledIds(nextIds);
    setCalledIdx(nextIds.length - 1);
  }

  return (
    <main
      className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden text-white"
      style={{
        background: `linear-gradient(135deg, ${currentPortrait.colors[0]}22, ${currentPortrait.colors[1]}22), #1A0000`,
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 blur-[80px]"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${currentPortrait.colors[0]}, ${currentPortrait.colors[1]}, transparent 70%)` }}
      />

      {/* Event name top */}
      <div className="absolute left-0 right-0 top-6 flex items-center justify-between px-8 text-white/60">
        <span className="font-display text-[22px] font-black tracking-tight text-white/80">AI Bingo</span>
        <span className="text-[16px]">{event.name}</span>
      </div>

      {/* Portrait */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          className="rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
          style={{
            background: `linear-gradient(135deg, ${currentPortrait.colors[0]}, ${currentPortrait.colors[1]})`,
            width: "clamp(180px, 30vw, 340px)",
            aspectRatio: "3/4",
          }}
        />

        <div className="text-center">
          <p className="font-display text-[clamp(36px,6vw,80px)] font-black leading-none tracking-tight text-white">
            {currentPortrait.name}
          </p>
          <p className="mt-2 text-[clamp(16px,2.5vw,28px)] font-semibold text-white/60">
            Portrait #{calledIds.length}
          </p>
        </div>
      </div>

      {/* Called history strip */}
      <div className="absolute bottom-20 left-0 right-0 overflow-hidden px-8">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-white/40">Called</span>
          <div className="flex gap-1.5">
            {calledIds.slice(0, -1).map((id) => {
              const p = portraits.find((pp) => pp.id === id);
              if (!p) return null;
              return (
                <div
                  key={id}
                  className="h-9 w-7 shrink-0 rounded-[6px] opacity-60"
                  style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                  title={p.name}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls — subtle, bottom right */}
      <div className="absolute bottom-6 right-8 flex items-center gap-3">
        <span className="text-[13px] text-white/30">{remaining.length} remaining</span>
        <button
          onClick={callNext}
          disabled={remaining.length === 0}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[14px] font-semibold text-white/70 transition hover:bg-white/20 disabled:opacity-30"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </main>
  );
}
