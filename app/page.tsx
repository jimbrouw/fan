import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <AppFrame>
      <section className="flex flex-1 flex-col gap-8 pb-2">
        <div className="space-y-7">
          <div className="border-y border-[var(--line)] py-7">
            <h1 className="font-display max-w-[10ch] text-[52px] leading-[0.92] text-[var(--foreground)]">
              Pick your kit. Make it yours.
            </h1>
            <p className="mt-5 max-w-[28ch] text-[15px] leading-6 text-[var(--muted)]">
              Turn your photos into official-style football posters.
            </p>
            <Link href={{ pathname: "/login", query: { next: "/capture?restart=1" } }} className="mt-6 inline-block">
              <Button className="min-w-40">
                Start now
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>

          {/* Real generated poster — angled card */}
          <div className="relative mx-auto w-[88%] rotate-[-3deg]">
            <div className="overflow-hidden rounded-[16px] shadow-[0_32px_64px_rgba(42,0,79,0.22)]">
              <Image
                src="/example-poster.jpg"
                alt="Example Kitface poster"
                width={800}
                height={1067}
                className="w-full object-cover"
                priority
              />
            </div>
            {/* Ramp glow behind card */}
            <div className="kitface-ramp absolute -inset-1 -z-10 rounded-[20px] opacity-30 blur-xl" />
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
