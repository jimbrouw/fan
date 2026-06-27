"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Volume2 } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";

type Portrait = {
  id: string;
  player_name: string;
  output_url: string | null;
  job_id: string;
};

type ClaimState = "idle" | "pending" | "accepted" | "rejected";

const POLL_INTERVAL_MS = 4000;
const CARD_SIZE = 16;

function hasBingo(marked: Set<string>, portraits: Portrait[]): boolean {
  const size = 4;
  const isMarked = (idx: number) => marked.has(portraits[idx]?.id ?? "");
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
  const { eventId } = useParams<{ eventId: string }>();

  const [portraits, setPortraits] = useState<Portrait[]>([]);
  const [calledIds, setCalledIds] = useState<Set<string>>(new Set());
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [claimState, setClaimState] = useState<ClaimState>("idle");
  const [loading, setLoading] = useState(true);

  const fetchPortraits = useCallback(async () => {
    const res = await fetch(`/api/bingo/portraits?eventCode=${eventId}`, { cache: "no-store" });
    const data = (await res.json()) as { portraits?: Portrait[] };
    if (data.portraits) setPortraits(data.portraits.slice(0, CARD_SIZE));
  }, [eventId]);

  const fetchCalled = useCallback(async () => {
    const res = await fetch(`/api/bingo/events/${eventId}`, { cache: "no-store" });
    const data = (await res.json()) as { calledPortraitIds?: string[] };
    if (data.calledPortraitIds) setCalledIds(new Set(data.calledPortraitIds));
  }, [eventId]);

  useEffect(() => {
    async function init() {
      await Promise.all([fetchPortraits(), fetchCalled()]);
      setLoading(false);
    }
    void init();

    const interval = setInterval(() => {
      void fetchPortraits();
      void fetchCalled();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchPortraits, fetchCalled]);

  const bingo = portraits.length === CARD_SIZE && hasBingo(marked, portraits);

  function toggleMark(id: string) {
    if (!calledIds.has(id)) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleClaim() {
    setClaimState("pending");
    setTimeout(() => setClaimState("accepted"), 2000);
  }

  if (loading) {
    return (
      <BingoFrame>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      </BingoFrame>
    );
  }

  if (portraits.length === 0) {
    return (
      <BingoFrame>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-[28px]">🎨</p>
          <h1 className="font-display text-[22px] text-[var(--foreground)]">Waiting for portraits</h1>
          <p className="text-[13px] text-[var(--muted)]">
            Players need to generate their portraits before the card is ready.
          </p>
        </div>
      </BingoFrame>
    );
  }

  return (
    <BingoFrame>
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{eventId}</p>
          <p className="text-[15px] font-bold text-[var(--foreground)]">Your card</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-[12px] font-bold text-[var(--accent-strong)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {calledIds.size} called
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
              aria-label={`${portrait.player_name}${isCalled ? " — called" : ""}${isMarked ? " — marked" : ""}`}
            >
              {portrait.output_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/bingo/jobs/${portrait.job_id}/image`}
                  alt={portrait.player_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[var(--surface-soft)]" />
              )}

              {/* Name label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-4">
                <p className="truncate text-center text-[9px] font-bold leading-none text-white">
                  {portrait.player_name}
                </p>
              </div>

              {isMarked && (
                <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-lime)] text-[10px] font-black leading-none text-[var(--foreground)]">
                  ✓
                </div>
              )}
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
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
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
          Refresh card
        </Button>
      </div>
    </BingoFrame>
  );
}
