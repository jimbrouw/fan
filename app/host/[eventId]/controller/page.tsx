"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";
import { MOCK_PORTRAITS, MOCK_CALLED_IDS } from "@/lib/bingo/mockData";

type Claim = {
  id: string;
  playerName: string;
  pattern: string;
  status: "pending" | "accepted" | "rejected";
};

const INITIAL_CLAIMS: Claim[] = [
  { id: "claim-1", playerName: "Alex", pattern: "Diagonal", status: "pending" },
];

export default function HostControllerPage() {
  useParams<{ eventId: string }>();
  const router = useRouter();

  const [calledIdx, setCalledIdx] = useState(MOCK_CALLED_IDS.length - 1);
  const [calledIds, setCalledIds] = useState<string[]>(MOCK_CALLED_IDS);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);

  const portraits = MOCK_PORTRAITS;
  const currentPortrait = portraits.find((p) => p.id === calledIds[calledIdx]) ?? portraits[calledIdx];
  const calledPortraits = calledIds.map((id) => portraits.find((p) => p.id === id)!).filter(Boolean);
  const remaining = portraits.filter((p) => !calledIds.includes(p.id));

  function callNext() {
    if (remaining.length === 0) return;
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setCalledIds((prev) => [...prev, next.id]);
    setCalledIdx(calledIds.length);
  }

  function handleClaim(id: string, accepted: boolean) {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: accepted ? "accepted" : "rejected" } : c))
    );
  }

  const pendingClaims = claims.filter((c) => c.status === "pending");

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
            <div
              className="h-56 w-44 rounded-[18px] shadow-[0_20px_48px_rgba(49,240,213,0.35)]"
              style={{ background: `linear-gradient(135deg, ${currentPortrait.colors[0]}, ${currentPortrait.colors[1]})` }}
            />
            <div className="absolute bottom-0 left-0 right-0 rounded-b-[18px] bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-8">
              <p className="text-center text-[16px] font-bold text-white">{currentPortrait.name}</p>
            </div>
          </div>

          {/* Call count */}
          <p className="font-display text-[42px] leading-none text-[var(--foreground)]">
            #{calledIds.length}
          </p>

          {/* Controls */}
          <div className="flex w-full flex-col gap-2">
            <Button onClick={callNext} disabled={remaining.length === 0} className="w-full">
              <ChevronRight size={17} />
              Call next portrait
            </Button>
            <Button variant="secondary" className="w-full gap-1.5">
              <RotateCcw size={14} />
              Reset game
            </Button>
          </div>

          {remaining.length === 0 && (
            <p className="text-center text-[12px] text-[var(--muted)]">All portraits have been called</p>
          )}
        </div>

        {/* Right: called history + claims */}
        <div className="flex flex-1 flex-col gap-5">
          {/* Claims panel */}
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
                    <button
                      onClick={() => handleClaim(claim.id, true)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-lime)] text-[var(--foreground)] hover:bg-[var(--accent-lime)]/80"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleClaim(claim.id, false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {claims.filter((c) => c.status !== "pending").length > 0 && (
            <div className="flex flex-col gap-1.5">
              {claims.filter((c) => c.status !== "pending").map((claim) => (
                <div key={claim.id} className="flex items-center justify-between rounded-[10px] border border-[var(--line)] px-3 py-2 text-[13px]">
                  <span className="font-semibold text-[var(--foreground)]">{claim.playerName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${claim.status === "accepted" ? "bg-[var(--accent-lime)]/20 text-[var(--accent-strong)]" : "bg-[var(--surface-soft)] text-[var(--muted)]"}`}>
                    {claim.status === "accepted" ? "Accepted" : "Rejected"}
                  </span>
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
                  <div
                    className={`aspect-[3/4] rounded-[8px] ${p.id === currentPortrait.id ? "portrait-called" : ""}`}
                    style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                  />
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
                  <div
                    key={p.id}
                    className="aspect-[3/4] rounded-[8px]"
                    style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BingoFrame>
  );
}
