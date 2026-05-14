import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="kitface-shell min-h-[100dvh] px-4 py-5 text-[var(--foreground)] sm:px-6">
      <div className="paper-panel mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] px-5 py-5">
        <header className="flex items-center justify-between pb-6">
          <Link href="/" className="font-display text-[34px] leading-none text-[var(--foreground)]">
            Kitface
          </Link>
          <div className="flex items-center gap-3 text-[var(--foreground)]">
            <div className="hidden items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[11px] text-[var(--muted)] sm:flex">
              <ShieldCheck size={14} className="text-[var(--accent)]" />
              Private photos
            </div>
            <Menu size={23} strokeWidth={1.75} />
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
