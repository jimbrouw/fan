"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Shuffle, Zap } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";
import { Button } from "@/components/Button";

type EventSummary = {
  code: string;
  portraitCount: number;
  playerCount: number;
  calledCount: number;
  createdAt: string;
};

const POLL_INTERVAL_MS = 4000;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/bingo/admin/events", { cache: "no-store" });
    const data = (await res.json()) as { events?: EventSummary[] };
    if (data.events) setEvents(data.events);
  }, []);

  useEffect(() => {
    fetchEvents().finally(() => setLoading(false));
    const interval = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  function handleCodeInput(value: string) {
    setCreateError(null);
    setNewCode(value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode) return;
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/bingo/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error ?? "Failed to create event.");
      router.push(`/admin/${data.code}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong.");
      setCreating(false);
    }
  }

  return (
    <BingoFrame wide>
      {/* Header */}
      <header className="flex items-center justify-between pb-6">
        <span className="font-display kitface-ramp-text text-[28px] leading-none">Bingo Admin</span>
        <span className="flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-[12px] font-bold text-[var(--accent-strong)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          Live
        </span>
      </header>

      {/* Create event */}
      <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-5">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
          Create new event
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCode}
              onChange={(e) => handleCodeInput(e.target.value)}
              placeholder="e.g. PARTY01"
              maxLength={12}
              className="h-12 flex-1 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-4 font-mono text-[17px] font-bold tracking-widest text-[var(--foreground)] placeholder:font-normal placeholder:tracking-normal placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
            <button
              type="button"
              onClick={() => setNewCode(randomCode())}
              className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
              title="Generate random code"
            >
              <Shuffle size={18} />
            </button>
          </div>
          {createError && (
            <p className="rounded-[8px] bg-red-50 px-3 py-2 text-[12px] text-red-600">{createError}</p>
          )}
          <Button type="submit" disabled={!newCode || creating} className="w-full">
            {creating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus size={16} />
            )}
            Create event
          </Button>
        </form>
      </div>

      {/* Events list */}
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
          All events {!loading && `(${events.length})`}
        </p>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="rounded-[16px] border border-dashed border-[var(--line)] py-10 text-center text-[13px] text-[var(--muted)]">
            No events yet — create one above
          </div>
        )}

        {events.map((event) => (
          <div
            key={event.code}
            className="rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[22px] font-black tracking-widest text-[var(--foreground)]">
                  {event.code}
                </p>
                <p className="mt-1 text-[13px] text-[var(--muted)]">
                  <span className="font-semibold text-[var(--foreground)]">{event.portraitCount}</span> portraits
                  {" · "}
                  <span className="font-semibold text-[var(--foreground)]">{event.playerCount}</span> players
                  {" · "}
                  <span className="font-semibold text-[var(--foreground)]">{event.calledCount}</span> called
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">{timeAgo(event.createdAt)}</p>
              </div>
              <div className="flex flex-col gap-1.5 text-right">
                <Button
                  onClick={() => router.push(`/admin/${event.code}`)}
                  className="h-8 px-3 text-[12px]"
                >
                  <Zap size={13} />
                  View
                </Button>
                <button
                  onClick={() => window.open(`/host/${event.code}/controller`, "_blank")}
                  className="flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Controller <ExternalLink size={10} />
                </button>
                <button
                  onClick={() => window.open(`/display/${event.code}`, "_blank")}
                  className="flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Display <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BingoFrame>
  );
}
