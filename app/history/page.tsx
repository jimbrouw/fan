"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Clock, Loader2, LogOut, Sparkles, AlertTriangle, RefreshCw, Eye } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type GenerationJob = {
  id: string;
  team_name: string;
  kit_notes: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  error: string | null;
  created_at: string;
};

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login?next=/history";
        return;
      }

      setUser(data.user);

      const { data: jobsData, error: jobsErr } = await supabase
        .from("generation_jobs")
        .select("id, team_name, kit_notes, status, output_url, error, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (!jobsErr && jobsData) {
        setJobs(jobsData as GenerationJob[]);
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/";
  }

  if (isLoading) {
    return (
      <AppFrame>
        <div className="flex flex-1 flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
          <p className="text-sm text-[var(--muted)]">Loading your matches...</p>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <section className="flex flex-1 flex-col gap-6 pb-6 animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div className="space-y-1">
            <h1 className="font-display text-[30px] leading-none text-[var(--foreground)]">History.</h1>
            <p className="text-xs text-[var(--muted)]">Logged in as {user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          >
            <LogOut size={13} />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        {/* Start New CTA */}
        <div className="flex items-center justify-between rounded-[18px] bg-[var(--surface-soft)]/50 p-4 border border-[var(--line)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">Create a new poster</h3>
            <p className="text-xs text-[var(--muted)]">Start a fresh match or single player poster.</p>
          </div>
          <Link href="/capture?restart=1">
            <Button className="h-10 text-xs px-4 flex items-center gap-1.5">
              Create New
              <Sparkles size={13} />
            </Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-[20px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)]/20">
            <Clock className="text-[var(--muted)]/50 mb-3" size={36} />
            <h2 className="text-base font-bold text-[var(--foreground)]">No posters yet</h2>
            <p className="mt-1 max-w-[24ch] text-xs leading-5 text-[var(--muted)]">
              You haven&apos;t generated any football posters yet. Choose a team and start capturing!
            </p>
            <Link href="/capture?restart=1" className="mt-5">
              <Button variant="secondary" className="h-9 text-xs px-4">
                Get started
              </Button>
            </Link>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Your Generations</h2>
            {jobs.map((job) => {
              const dateStr = new Date(job.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={job.id}
                  className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 relative"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-[12px] bg-[var(--surface-soft)] border border-[var(--line)] flex items-center justify-center">
                      {job.status === "completed" && job.output_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={job.output_url}
                          alt={job.team_name}
                          className="h-full w-full object-cover"
                        />
                      ) : job.status === "failed" ? (
                        <AlertTriangle className="text-rose-500/80" size={24} />
                      ) : (
                        <Loader2 className="animate-spin text-[var(--accent)]" size={22} />
                      )}
                    </div>

                    {/* Metadata & Details */}
                    <div className="flex flex-col min-w-0 flex-1 justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-tight text-[var(--foreground)] truncate">
                            {job.team_name}
                          </h3>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            job.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : job.status === "failed"
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-cyan-500/10 text-cyan-400 animate-pulse"
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--muted)]">
                          Created {dateStr}
                        </p>
                      </div>

                      {/* CTA Buttons */}
                      <div className="mt-3 flex gap-2">
                        {job.status === "completed" && (
                          <Link href={`/result/${job.id}`} className="flex-1">
                            <button className="flex w-full h-8 items-center justify-center gap-1 rounded-[8px] bg-[var(--surface-soft)] border border-[var(--line)] text-[11px] font-bold text-[var(--foreground)] transition hover:border-[var(--accent)] active:scale-[0.98]">
                              <Eye size={12} />
                              View Result
                            </button>
                          </Link>
                        )}
                        {(job.status === "processing" || job.status === "queued") && (
                          <Link href={`/generating/${job.id}`} className="flex-1">
                            <button className="flex w-full h-8 items-center justify-center gap-1 rounded-[8px] bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[11px] font-bold text-[var(--accent)] transition hover:bg-[var(--accent)]/20 active:scale-[0.98]">
                              <Loader2 className="animate-spin" size={11} />
                              Track Progress
                            </button>
                          </Link>
                        )}
                        {job.status === "failed" && (
                          <button
                            onClick={() => window.location.href = "/create"}
                            className="flex-1 flex h-8 items-center justify-center gap-1 rounded-[8px] bg-[var(--surface-soft)] border border-[var(--line)] text-[11px] font-bold text-[var(--foreground)] transition hover:border-[var(--accent)] active:scale-[0.98]"
                          >
                            <RefreshCw size={12} />
                            Retry Create
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppFrame>
  );
}
