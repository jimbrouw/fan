"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, ImageIcon, Play, Tv2, ChevronRight } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";
import { MOCK_EVENT, MOCK_PORTRAITS } from "@/lib/bingo/mockData";

export default function HostDashboardPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = MOCK_EVENT;

  const readyToStart = event.playerCount >= 4 && event.portraitCount >= 4;

  return (
    <BingoFrame>
      <header className="flex items-center justify-between pb-6">
        <span className="font-display kitface-ramp-text text-[28px] leading-none">AI Bingo</span>
        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-[12px] font-bold text-[var(--muted)] uppercase tracking-[0.07em]">
          Host
        </span>
      </header>

      <section className="flex flex-1 flex-col gap-5">
        {/* Event info */}
        <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/60 px-5 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Active event</p>
          <h1 className="mt-1 font-display text-[26px] leading-tight text-[var(--foreground)]">{event.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-[var(--foreground)]/10 px-2.5 py-0.5 font-mono text-[13px] font-bold tracking-[0.1em] text-[var(--foreground)]">
              {event.code}
            </span>
            <span className="text-[12px] text-[var(--muted)]">entry code</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
            <div className="flex items-center gap-1.5 text-[var(--muted)]">
              <Users size={13} />
              <span className="text-[11px] font-bold uppercase tracking-[0.07em]">Players</span>
            </div>
            <span className="font-display text-[36px] leading-none text-[var(--foreground)]">
              {event.playerCount}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
            <div className="flex items-center gap-1.5 text-[var(--muted)]">
              <ImageIcon size={13} />
              <span className="text-[11px] font-bold uppercase tracking-[0.07em]">Portraits</span>
            </div>
            <span className="font-display text-[36px] leading-none text-[var(--foreground)]">
              {event.portraitCount}
            </span>
          </div>
        </div>

        {/* Portrait grid preview */}
        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.07em] text-[var(--muted)]">
            Generated portraits
          </p>
          <div className="grid grid-cols-8 gap-1">
            {MOCK_PORTRAITS.map((p) => (
              <div
                key={p.id}
                className="aspect-[3/4] rounded-[6px]"
                style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                title={p.name}
              />
            ))}
          </div>
        </div>

        {/* Status */}
        {!readyToStart && (
          <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-[13px] text-[var(--muted)]">
            Waiting for more players… Need at least 4 with generated portraits to start.
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3">
          <Link href={`/host/${eventId}/controller`}>
            <Button className="w-full" disabled={!readyToStart}>
              <Play size={16} />
              Start game / Open controller
              <ChevronRight size={16} />
            </Button>
          </Link>
          <Link href={`/display/${eventId}`} target="_blank">
            <Button variant="secondary" className="w-full gap-2">
              <Tv2 size={15} />
              Open display screen
            </Button>
          </Link>
        </div>
      </section>
    </BingoFrame>
  );
}
