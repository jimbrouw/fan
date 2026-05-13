import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";

const valueProps: Array<[string, string, LucideIcon]> = [
  ["Private photos", "Your reference photos are used only to make your poster.", LockKeyhole]
];

export default function Home() {
  return (
    <AppFrame>
      <section className="flex flex-1 flex-col justify-between gap-8 pb-2">
        <div className="space-y-7">
          <div className="border-y border-[var(--line)] py-7">
            <h1 className="font-display max-w-[9ch] text-[43px] leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
              Make your matchday poster.
            </h1>
            <p className="mt-5 max-w-[29ch] text-[15px] leading-6 text-[var(--muted)]">
              Choose a kit, take a few photos, and create something worth keeping.
            </p>
            <Link href="/capture" className="mt-6 inline-block">
              <Button className="min-w-40">
                Start
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>

          <div className="relative mx-auto w-[84%] rotate-[-5deg] rounded-[6px] border border-[#d5cbb8] bg-[#f4eadb] p-3 shadow-[0_22px_42px_rgba(55,43,27,0.22)]">
            <div className="aspect-[4/5] overflow-hidden rounded-[3px] bg-[var(--mist)]">
              <div className="flex h-full flex-col justify-between p-5">
                <div>
                  <p className="font-display text-[54px] leading-none text-[var(--foreground)]">Kitface</p>
                  <p className="mt-3 max-w-[12ch] text-[11px] leading-4 text-[var(--accent-green)]">
                    Matchday memories
                  </p>
                </div>
                <div className="relative mx-auto h-48 w-36 rounded-t-full bg-[#f7f1e7]">
                  <div className="absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 rounded-[18px] bg-[var(--surface)] shadow-[0_12px_24px_rgba(53,42,27,0.14)]">
                    <div className="absolute -left-7 top-7 h-16 w-10 -rotate-12 rounded-[12px] bg-[var(--accent-green)]" />
                    <div className="absolute -right-7 top-7 h-16 w-10 rotate-12 rounded-[12px] bg-[var(--accent-green)]" />
                    <div className="absolute inset-x-5 bottom-0 top-2 rounded-t-[16px] bg-[var(--accent-green)]" />
                    <div className="absolute left-1/2 top-2 h-[104px] w-8 -translate-x-1/2 bg-[#f5ead8]" />
                    <div className="absolute left-1/2 top-0 h-7 w-12 -translate-x-1/2 rounded-b-full bg-[#f5ead8]" />
                    <div className="absolute left-4 top-5 h-20 w-2 rounded-full bg-[#f5ead8]/55" />
                    <div className="absolute right-4 top-5 h-20 w-2 rounded-full bg-[#f5ead8]/55" />
                  </div>
                  <div className="absolute bottom-7 left-1/2 h-px w-24 -translate-x-1/2 bg-[var(--line)]" />
                  <p className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-[var(--accent-green)]">
                    Kit preview
                  </p>
                </div>
                <p className="text-[11px] leading-4 text-white">Always part of the game.</p>
              </div>
            </div>
            <div className="absolute -right-4 bottom-10 grid size-14 rotate-12 place-items-center rounded-full border border-[var(--accent)] text-[9px] uppercase tracking-[0.12em] text-[var(--accent)]">
              Made to keep
            </div>
          </div>

          <div className="rounded-[14px] bg-[var(--surface-soft)] px-4 py-4">
            {valueProps.map(([title, body, Icon]) => (
              <div key={title} className="flex items-center gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)]">
                  <Icon size={18} className="text-[var(--accent-green)]" />
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
