import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="stadium-grid min-h-screen px-4 py-5 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[430px] flex-col">
        <header className="flex items-center justify-between pb-5">
          <Link href="/" className="text-[15px] font-semibold tracking-[0.18em] text-white">
            FAN HERO
          </Link>
          <div className="flex items-center gap-2 text-xs text-white/62">
            <ShieldCheck size={15} className="text-[var(--accent-blue)]" />
            Private scan
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
