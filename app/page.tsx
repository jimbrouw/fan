import Link from "next/link";
import { ArrowRight, Camera, LockKeyhole, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";

const valueProps: Array<[string, string, LucideIcon]> = [
  ["Guided poses", "Eight reference shots for face, body, and celebration energy.", Camera],
  ["Private by design", "Your reference pack is stored for generation workflows only.", LockKeyhole],
  ["Poster ready", "Prepared for image-only MUAPI face swap generation.", Sparkles]
];

export default function Home() {
  return (
    <AppFrame>
      <section className="flex flex-1 flex-col justify-between gap-10 pb-4 pt-8">
        <div className="space-y-7">
          <div className="relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.06] p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="mb-16 flex items-center justify-between text-xs text-white/54">
              <span>Identity Capture</span>
              <span>~2 mins</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.04em]">
                Build your fan profile.
              </h1>
              <p className="max-w-[30ch] text-base leading-7 text-white/68">
                Capture the angles needed for consistent, recognisable football artwork.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {valueProps.map(([title, body, Icon]) => (
              <div key={title} className="flex gap-4 rounded-lg border border-white/10 bg-black/22 p-4">
                <Icon size={20} className="mt-0.5 shrink-0 text-[var(--accent-blue)]" />
                <div>
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/58">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href="/capture">
          <Button className="w-full">
            Create Your Fan Profile
            <ArrowRight size={18} />
          </Button>
        </Link>
      </section>
    </AppFrame>
  );
}
