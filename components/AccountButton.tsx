"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function AccountButton() {
  const [initials, setInitials] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) { setChecked(true); return; }
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const name = data.user.user_metadata?.full_name || data.user.email || "";
        const parts = name.split(" ");
        const init = parts.length >= 2
          ? parts[0][0] + parts[parts.length - 1][0]
          : name.slice(0, 2);
        setInitials(init.toUpperCase());
      }
      setChecked(true);
    }
    check();
  }, []);

  if (!checked) {
    // Skeleton placeholder — same size as the button
    return <div className="size-9 rounded-full bg-[var(--surface-soft)] animate-pulse" />;
  }

  if (initials) {
    return (
      <Link
        href="/create"
        title="Your account"
        className="grid size-9 place-items-center rounded-full bg-[var(--foreground)] text-[11px] font-bold tracking-wide text-white"
      >
        {initials}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--foreground)] leading-none"
    >
      Sign in
    </Link>
  );
}
