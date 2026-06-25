"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";
import { MOCK_EVENT } from "@/lib/bingo/mockData";

export default function JoinEventPage() {
  useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const event = MOCK_EVENT;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    router.push(`/event/${event.id}/capture`);
  }

  return (
    <BingoFrame>
      <header className="flex items-center justify-between pb-6">
        <span className="font-display kitface-ramp-text text-[28px] leading-none">AI Bingo</span>
        <span className="flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-[12px] font-bold text-[var(--accent-strong)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Live
        </span>
      </header>

      <section className="flex flex-1 flex-col gap-6">
        <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/60 px-5 py-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">You&apos;re joining</p>
          <h1 className="mt-1 font-display text-[28px] leading-tight text-[var(--foreground)]">
            {event.name}
          </h1>
          <div className="mt-3 flex items-center gap-1.5 text-[13px] text-[var(--muted)]">
            <Users size={13} />
            {event.playerCount} players joined
          </div>
        </div>

        <form onSubmit={handleJoin} className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="player-name" className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
              Your name
            </label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              autoFocus
              className="h-14 rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[17px] font-semibold text-[var(--foreground)] placeholder:font-normal placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>

          <p className="text-[13px] leading-[1.5] text-[var(--muted)]">
            Next you&apos;ll take a selfie so we can generate your AI portrait for the bingo card.
          </p>

          <Button type="submit" className="mt-auto w-full" disabled={!name.trim()}>
            Continue to selfie
            <ArrowRight size={17} />
          </Button>
        </form>
      </section>
    </BingoFrame>
  );
}
