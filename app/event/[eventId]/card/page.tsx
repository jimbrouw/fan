"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Trophy, Volume2 } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";
import { MOCK_EVENT, MOCK_PORTRAITS, MOCK_CALLED_IDS } from "@/lib/bingo/mockData";

type ClaimState = "idle" | "pending" | "accepted" | "rejected";

function hasBingo(marked: Set<string>, portraits: { id: string }[]): boolean {
  const size = 4;
  const isMarked = (idx: number) => marked.has(portraits[idx].id);
  for (let r = 0; r < size; r++) {
    if (Array.from({ length: size }, (_, c) => isMarked(r * size + c)).every(Boolean)) return true;
  }
  for (let c = 0; c < size; c++) {
    if (Array.from({ length: size }, (_, r) => isMarked(r * size + c)).every(Boolean)) return true;
  }
  if ([0, 5, 10, 15].every(isMarked)) return true;
  if ([3, 6, 9, 12].every(isMarked)) return true;
  return false;
}

export default function PlayerCardPage() {
  useParams();
  const event = MOCK_EVENT;
  const portraits = MOCK_PORTRAITS;
  const calledIds = new Set(MOCK_CALLED_IDS);

  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [claimState, setClaimState] = useState<ClaimState>("idle");

  const bingo = hasBingo(marked, portraits);

  function toggleMark(id: string) {
    if (!calledIds.has(id)) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleClaim() {
    setClaimState("pending");
    setTimeout(() => setClaimState("accepted"), 2000);
  }

  return (
    <BingoFrame>
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{event.name}</p>
          <p className="text-[15px] font-bold text-[var(--foreground)]">Your card</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-[12px] font-bold text-[var(--accent-strong)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {MOCK_CALLED_IDS.length} called
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {portraits.map((portrait) => {
          const isCalled = calledIds.has(portrait.id);
          const isMarked = marked.has(portrait.id);
          return (
            <button
              key={portrait.id}
              onClick={() => toggleMark(portrait.id)}
              disabled={!isCalled}
              className={`relative flex aspect-[3/4] flex-col overflow-hidden rounded-[10px] transition-all duration-200 active:scale-[0.96] ${
                isCalled ? "cursor-pointer" : "cursor-default opacity-80"
              } ${isMarked ? "portrait-marked scale-[1.02]" : isCalled ? "portrait-called" : ""}`}
              aria-label={`${portrait.name}${isCalled ? " — called" : ""}${isMarked ? " — marked" : ""}`}
            >
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${portrait.colors[0]}, ${portrait.colors[1]})`,
                }}
              />
              {/* Name label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 pb-1.5 pt-4">
                <p className="truncate text-center text-[9px] font-bold leading-none text-white">
                  {portrait.name}
                </p>
              </div>
              {/* Marked checkmark */}
              {isMarked && (
                <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-lime)] text-[10px] font-black leading-none text-[var(--foreground)]">
                  ✓
                </div>
              )}
              {/* Called indicator (not yet marked) */}
              {isCalled && !isMarked && (
                <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-white/20">
                  <Volume2 size={8} className="text-[var(--accent)]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[var(--accent)] shadow-[0_0_5px_rgba(49,240,213,0.5)]" />
          Called — tap to mark
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--accent-lime)]/30 shadow-[0_0_5px_rgba(215,255,47,0.5)]" />
          Marked
        </span>
      </div>

      {/* Bingo claim */}
      <div className="mt-4 flex flex-col gap-2">
        {claimState === "idle" && bingo && (
          <button
            onClick={handleClaim}
            className="bingo-glow w-full rounded-[15px] py-4 text-[18px] font-black text-[var(--foreground)]"
            style={{ background: "linear-gradient(90deg, #FF5500, #CC0000)" }}
          >
            🎉 Claim Bingo!
          </button>
        )}

        {claimState === "pending" && (
          <div className="flex items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface-soft)] py-4 text-[14px] font-semibold text-[var(--muted)]">
            <div className="h-4 w-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            Checking your card…
          </div>
        )}

        {claimState === "accepted" && (
          <div className="flex items-center justify-center gap-2 rounded-[15px] py-4 text-[16px] font-black text-[var(--foreground)]" style={{ background: "linear-gradient(90deg, #FF5500, #CC0000)" }}>
            <Trophy size={20} />
            Bingo confirmed! You win!
          </div>
        )}

        {claimState === "rejected" && (
          <div className="rounded-[15px] border border-red-200 bg-red-50 px-4 py-3 text-center">
            <p className="text-[14px] font-semibold text-red-600">Not quite — keep marking!</p>
            <button onClick={() => setClaimState("idle")} className="mt-1 text-[12px] text-red-400 underline">
              Dismiss
            </button>
          </div>
        )}

        {!bingo && claimState === "idle" && (
          <p className="text-center text-[12px] text-[var(--muted)]">
            Mark 4 in a row to claim bingo
          </p>
        )}

        <Button
          variant="ghost"
          className="text-[12px] text-[var(--muted)]"
          onClick={() => window.location.reload()}
        >
          Demo: reset card
        </Button>
      </div>
    </BingoFrame>
  );
}
