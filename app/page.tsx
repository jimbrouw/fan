"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Tv2, Users } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/event/evt-demo`);
  }

  return (
    <BingoFrame>
      <header className="flex items-center justify-between pb-6">
        <span className="font-display kitface-ramp-text text-[32px] leading-none">
          AI Bingo
        </span>
        <Link href="/host/evt-demo" className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">
          Host →
        </Link>
      </header>

      <section className="flex flex-1 flex-col gap-8">
        <div className="border-y border-[var(--line)] py-6">
          <h1 className="font-display text-[42px] leading-[0.92] text-[var(--foreground)] min-[390px]:text-[50px]">
            Your face.{" "}
            <span className="kitface-ramp-text">The game.</span>
          </h1>
          <p className="mt-3 max-w-[30ch] text-[15px] leading-[1.55] text-[var(--muted)]">
            Get your AI portrait, receive a bingo card, and play with everyone at the event.
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <label className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
            Event code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. BINGO01"
            maxLength={12}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="h-14 rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[18px] font-bold uppercase tracking-[0.12em] text-[var(--foreground)] placeholder:text-[var(--muted)]/50 placeholder:normal-case placeholder:tracking-normal focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          />
          <Button type="submit" className="w-full">
            Join event
            <ArrowRight size={17} />
          </Button>
        </form>

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--line)] pt-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
            Running the event?
          </p>
          <div className="flex gap-2">
            <Link href="/host/evt-demo" className="flex-1">
              <Button variant="secondary" className="w-full gap-2">
                <Users size={15} />
                Host dashboard
              </Button>
            </Link>
            <Link href="/display/evt-demo" className="flex-1">
              <Button variant="secondary" className="w-full gap-2">
                <Tv2 size={15} />
                Display screen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </BingoFrame>
  );
}
