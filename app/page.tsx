import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { KitPreviewSVG } from "@/components/KitPreviewSVG";

const valueProps: Array<[string, string, LucideIcon]> = [
  ["Used for posters", "Your reference photos power the poster generation flow.", LockKeyhole]
];

export default function Home() {
  return (
    <AppFrame>
      <section className="flex flex-1 flex-col justify-between gap-8 pb-2">
        <div className="space-y-7">
          <div className="border-y border-[var(--line)] py-7">
            <h1 className="font-display max-w-[10ch] text-[52px] leading-[0.92] text-[var(--foreground)]">
              Pick your kit. Make it yours.
            </h1>
            <p className="mt-5 max-w-[28ch] text-[15px] leading-6 text-[var(--muted)]">
              Turn your photos into official-style football posters.
            </p>
            <Link href={{ pathname: "/login", query: { next: "/capture" } }} className="mt-6 inline-block">
              <Button className="min-w-40">
                Start now
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>

          {/* Premium polaroid card */}
          <div className="kitface-gradient-border relative mx-auto w-[84%] rotate-[-5deg] rounded-[6px] bg-white p-3 shadow-[0_28px_56px_rgba(42,0,79,0.18)]">
            {/* Inner photo area */}
            <div className="overflow-hidden rounded-[3px] bg-[#f0ede8]">
              {/* Top label strip */}
              <div className="flex items-center justify-between bg-[#1a0a2e] px-3 py-2">
                <span className="font-display text-[11px] tracking-widest text-white/90">KITFACE</span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-white/40">2024/25</span>
              </div>

              {/* Jersey on warm off-white background */}
              <div className="relative flex justify-center bg-[#ede9e3] px-6 pb-6 pt-5">
                {/* Soft drop shadow beneath jersey */}
                <div className="absolute bottom-3 left-1/2 h-4 w-32 -translate-x-1/2 rounded-full bg-black/10 blur-md" />
                <div className="relative w-44 drop-shadow-[0_8px_20px_rgba(0,0,0,0.22)]">
                  <KitPreviewSVG />
                </div>
              </div>

              {/* Polaroid caption strip */}
              <div className="border-t border-black/5 bg-white px-3 py-2.5">
                <p className="text-[11px] font-semibold text-[#1a0a2e]">Arsenal · Home Kit</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#1a0a2e]/40">adidas · Emirates · 24/25</p>
              </div>
            </div>

            {/* Media day badge */}
            <div className="absolute -right-4 bottom-12 grid size-14 rotate-12 place-items-center rounded-full border border-[var(--foreground)] text-[9px] uppercase tracking-[0.12em] text-[var(--foreground)]">
              Media day
            </div>
          </div>

          <div className="rounded-[14px] bg-[var(--surface-soft)] px-4 py-4">
            {valueProps.map(([title, body, Icon]) => (
              <div key={title} className="flex items-center gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)]">
                  <Icon size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
