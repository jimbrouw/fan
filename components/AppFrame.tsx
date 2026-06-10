import Link from "next/link";

import { AccountButton } from "@/components/AccountButton";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="kitface-shell min-h-[100dvh] px-4 py-5 text-[var(--foreground)] sm:px-6">
      <div className="paper-panel mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-[430px] flex-col rounded-[28px] px-5 py-5">
        <header className="flex items-center justify-between pb-6">
          <Link href="/" className="font-display text-[34px] leading-none text-[var(--foreground)]">
            Kitface
          </Link>
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <AccountButton />
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
