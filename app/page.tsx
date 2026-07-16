import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <AppFrame>
      <section className="flex flex-1 flex-col gap-6 pb-2">
        <div className="space-y-5">
          <div className="border-y border-[var(--line)] py-5">
            <h1 className="font-display max-w-[11ch] text-[44px] leading-[0.94] text-[var(--foreground)] min-[390px]:text-[52px]">
              Get your kit on.
            </h1>
            <p className="mt-4 max-w-[31ch] text-[15px] leading-6 text-[var(--muted)]">
              Upload two photos, pick your team, and send the group chat a poster worth shouting about.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">
              {["Photo", "Kit", "Poster"].map((step) => (
                <span key={step} className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)]/55 px-2 py-2">
                  {step}
                </span>
              ))}
            </div>
            <Link href={{ pathname: "/login", query: { next: "/capture?restart=1" } }} className="mt-5 inline-block">
              <Button className="min-w-40">
                Make my poster
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>

          <div className="relative mx-auto w-[82%] rotate-[-3deg] min-[390px]:w-[88%]">
            <div className="overflow-hidden rounded-[18px] border border-white/80 bg-[var(--surface)] shadow-[0_32px_64px_rgba(42,0,79,0.22)]">
              <Image
                src="/hero-image.png"
                alt="Kitface poster hero"
                width={853}
                height={1280}
                className="max-h-[43vh] w-full object-cover object-top min-[390px]:max-h-none"
                priority
              />
            </div>
            <div className="kitface-ramp absolute -inset-1 -z-10 rounded-[20px] opacity-30 blur-xl" />
          </div>

          <footer className="border-t border-[var(--line)] pt-4 text-[11px] leading-5 text-[var(--muted)]">
            <p>
              Kitface is a fan-made poster tool for football fun. It is not an official FIFA, Premier League,
              club, team, or competition app, and it is not endorsed by or affiliated with those organisations.
            </p>
            <p className="mt-2">
              For app notices, contact <a className="font-semibold text-[var(--foreground-soft)]" href="mailto:no-reply@kitface.app">no-reply@kitface.app</a>.
            </p>
          </footer>
        </div>
      </section>
    </AppFrame>
  );
}
