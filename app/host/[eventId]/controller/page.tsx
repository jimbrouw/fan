"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";

type Portrait = {
  id: string;
  player_name: string;
  output_url: string | null;
  job_id: string;
};

type Claim = {
  id: string;
  playerName: string;
  pattern: string;
  status: "pending" | "accepted" | "rejected";
};

const POLL_INTERVAL_MS = 4000;

export default function HostControllerPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const [portraits, setPortraits] = useState<Portrait[]>([]);
  const [calledIds, setCalledIds] = useState<string[]>([]);
  const [claims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);

  const fetchPortraits = useCallback(async () => {
    const res = await fetch(`/api/bingo/portraits?eventCode=${eventId}`, { cache: "no-store" });
    const data = (await res.json()) as { portraits?: Portrait[] };
    if (data.portraits) setPortraits(data.portraits);
  }, [eventId]);

  const fetchCalled = useCallback(async () => {
    const res = await fetch(`/api/bingo/events/${eventId}`, { cache: "no-store" });
    const data = (await res.json()) as { calledPortraitIds?: string[] };
    if (data.calledPortraitIds) setCalledIds(data.calledPortraitIds);
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

  const currentPortrait = calledIds.length > 0
    ? portraits.find((p) => p.id === calledIds[calledIds.length - 1]) ?? null
    : null;

  const calledPortraits = calledIds
    .map((id) => portraits.find((p) => p.id === id))
    .filter(Boolean) as Portrait[];

  const remaining = portraits.filter((p) => !calledIds.includes(p.id));

  async function callNext() {
    if (remaining.length === 0 || calling) return;
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setCalling(true);
    try {
      const res = await fetch(`/api/bingo/events/${eventId}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portraitId: next.id }),
      });
      const data = (await res.json()) as { calledPortraitIds?: string[] };
      if (data.calledPortraitIds) setCalledIds(data.calledPortraitIds);
    } finally {
      setCalling(false);
    }
  }

  const pendingClaims = claims.filter((c) => c.status === "pending");

  if (loading) {
    return (
      <BingoFrame wide>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      </BingoFrame>
    );
  }

  return (
    <BingoFrame wide>
      <header className="flex items-center justify-between pb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ChevronLeft size={16} />
          Dashboard
        </button>
        <span className="font-display kitface-ramp-text text-[22px] leading-none">Controller</span>
        <span className="text-[12px] text-[var(--muted)]">{calledIds.length}/{portraits.length} called</span>
      </header>

      <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Left: current portrait + controls */}
        <div className="flex flex-col items-center gap-5 sm:w-[260px] sm:flex-shrink-0">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Now calling</p>
          </div>

          {/* Current portrait */}
          <div className="relative">
            {currentPortrait ? (
              currentPortrait.output_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/bingo/jobs/${currentPortrait.job_id}/image`}
                  alt={currentPortrait.player_name}
                  className="h-56 w-44 rounded-[18px] object-cover shadow-[0_20px_48px_rgba(49,240,213,0.35)]"
                />
              ) : (
                <div className="h-56 w-44 rounded-[18px] bg-[var(--surface-soft)] shadow-[0_20px_48px_rgba(49,240,213,0.35)]" />
              )
            ) : (
              <div className="flex h-56 w-44 items-center justify-center rounded-[18px] border-2 border-dashed border-[var(--line)] text-[var(--muted)]">
                <p className="text-[13px]">Not started</p>
              </div>
            )}
            {currentPortrait && (
              <div className="absolute bottom-0 left-0 right-0 rounded-b-[18px] bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-8">
                <p className="text-center text-[16px] font-bold text-white">{currentPortrait.player_name}</p>
              </div>
            )}
          </div>

          {calledIds.length > 0 && (
            <p className="font-display text-[42px] leading-none text-[var(--foreground)]">
              #{calledIds.length}
            </p>
          )}

          <div className="flex w-full flex-col gap-2">
            <Button onClick={callNext} disabled={remaining.length === 0 || calling} className="w-full">
              {calling ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <ChevronRight size={17} />
              )}
              Call next portrait
            </Button>
            <Button variant="secondary" className="w-full gap-1.5" onClick={() => window.location.reload()}>
              <RotateCcw size={14} />
              Refresh
            </Button>
          </div>

          {portraits.length === 0 && (
            <p className="text-center text-[12px] text-[var(--muted)]">No portraits yet — players need to join and generate</p>
          )}
          {remaining.length === 0 && portraits.length > 0 && (
            <p className="text-center text-[12px] text-[var(--muted)]">All portraits have been called</p>
          )}
        </div>

        {/* Right: called history + claims */}
        <div className="flex flex-1 flex-col gap-5">
          {pendingClaims.length > 0 && (
            <div className="rounded-[16px] border-2 border-[var(--accent-lime)] bg-[var(--accent-lime)]/10 px-4 py-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.07em] text-[var(--foreground)]">
                🎉 Bingo claims ({pendingClaims.length})
              </p>
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-4 py-3">
                  <div>
                    <p className="text-[14px] font-bold text-[var(--foreground)]">{claim.playerName}</p>
                    <p className="text-[12px] text-[var(--muted)]">{claim.pattern}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-lime)] text-[var(--foreground)] hover:bg-[var(--accent-lime)]/80">
                      <Check size={16} />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Called portrait history */}
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.07em] text-[var(--muted)]">
              Called portraits ({calledPortraits.length})
            </p>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
              {calledPortraits.map((p, i) => (
                <div key={p.id} className="relative">
                  {p.output_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/bingo/jobs/${p.job_id}/image`}
                      alt={p.player_name}
                      className={`aspect-[3/4] w-full rounded-[8px] object-cover ${p.id === currentPortrait?.id ? "portrait-called" : ""}`}
                    />
                  ) : (
                    <div className={`aspect-[3/4] rounded-[8px] bg-[var(--surface-soft)] ${p.id === currentPortrait?.id ? "portrait-called" : ""}`} />
                  )}
                  <div className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--foreground)] text-[7px] font-black text-white">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining */}
          {remaining.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.07em] text-[var(--muted)]">
                Remaining ({remaining.length})
              </p>
              <div className="grid grid-cols-6 gap-1.5 opacity-40 sm:grid-cols-8">
                {remaining.map((p) => (
                  p.output_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.id}
                      src={`/api/bingo/jobs/${p.job_id}/image`}
                      alt={p.player_name}
                      className="aspect-[3/4] w-full rounded-[8px] object-cover"
                    />
                  ) : (
                    <div key={p.id} className="aspect-[3/4] rounded-[8px] bg-[var(--surface-soft)]" />
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BingoFrame>
  );
}
