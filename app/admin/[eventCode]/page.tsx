"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { BingoFrame } from "@/components/BingoFrame";

type Portrait = {
  id: string;
  player_name: string;
  output_url: string | null;
  job_id: string;
};

const POLL_INTERVAL_MS = 4000;

export default function AdminEventPage() {
  const { eventCode } = useParams<{ eventCode: string }>();
  const router = useRouter();

  const [portraits, setPortraits] = useState<Portrait[]>([]);
  const [calledIds, setCalledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [portraitsRes, eventRes] = await Promise.all([
      fetch(`/api/bingo/portraits?eventCode=${eventCode}`, { cache: "no-store" }),
      fetch(`/api/bingo/events/${eventCode}`, { cache: "no-store" }),
    ]);
    const [portraitsData, eventData] = await Promise.all([
      portraitsRes.json() as Promise<{ portraits?: Portrait[] }>,
      eventRes.json() as Promise<{ calledPortraitIds?: string[] }>,
    ]);
    if (portraitsData.portraits) setPortraits(portraitsData.portraits);
    if (eventData.calledPortraitIds) setCalledIds(eventData.calledPortraitIds);
  }, [eventCode]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const calledSet = new Set(calledIds);
  const playerCount = new Set(portraits.map((p) => p.player_name)).size;

  // Sort: called portraits in call order first, then uncalled alphabetically
  const calledPortraits = calledIds
    .map((id) => portraits.find((p) => p.id === id))
    .filter(Boolean) as Portrait[];
  const uncalledPortraits = portraits
    .filter((p) => !calledSet.has(p.id))
    .sort((a, b) => a.player_name.localeCompare(b.player_name));
  const sortedPortraits = [...calledPortraits, ...uncalledPortraits];

  return (
    <BingoFrame wide>
      {/* Header */}
      <header className="flex items-center justify-between pb-5">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ChevronLeft size={16} />
          Admin
        </button>
        <span className="font-mono text-[20px] font-black tracking-widest text-[var(--foreground)]">
          {eventCode}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/host/${eventCode}/controller`, "_blank")}
            className="flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Controller <ExternalLink size={10} />
          </button>
          <button
            onClick={() => window.open(`/display/${eventCode}`, "_blank")}
            className="flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Display <ExternalLink size={10} />
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="mb-5 flex flex-wrap gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
        <Stat label="Portraits" value={portraits.length} />
        <Stat label="Players" value={playerCount} />
        <Stat label="Called" value={calledIds.length} />
        <Stat label="Remaining" value={portraits.length - calledIds.length} />
      </div>

      {/* Portrait grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : portraits.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[var(--line)] py-12 text-center text-[13px] text-[var(--muted)]">
          <p className="text-[28px]">🎨</p>
          <p className="mt-2">No portraits yet</p>
          <p className="mt-1 text-[11px]">
            Share{" "}
            <span className="font-mono font-bold text-[var(--foreground)]">
              /event/{eventCode}
            </span>{" "}
            with players
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {sortedPortraits.map((portrait, i) => {
            const callOrder = calledIds.indexOf(portrait.id);
            const isCalled = callOrder !== -1;
            return (
              <div key={portrait.id} className="relative">
                {portrait.output_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/bingo/jobs/${portrait.job_id}/image`}
                    alt={portrait.player_name}
                    className={`aspect-[3/4] w-full rounded-[8px] object-cover ${isCalled ? "portrait-called" : "opacity-60"}`}
                  />
                ) : (
                  <div
                    className={`aspect-[3/4] w-full rounded-[8px] bg-[var(--surface-soft)] ${isCalled ? "portrait-called" : "opacity-60"}`}
                  />
                )}
                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 rounded-b-[8px] bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-3">
                  <p className="truncate text-center text-[7px] font-bold leading-none text-white">
                    {portrait.player_name}
                  </p>
                </div>
                {/* Call order badge */}
                {isCalled && (
                  <div className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--foreground)] text-[7px] font-black text-white">
                    {callOrder + 1}
                  </div>
                )}
                {/* Generating indicator — has job_id but no output_url yet */}
                {!portrait.output_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 animate-spin rounded-full border border-[var(--accent)] border-t-transparent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Join link hint */}
      {!loading && portraits.length > 0 && (
        <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
          Players join at{" "}
          <span className="font-mono font-bold text-[var(--foreground)]">
            /event/{eventCode}
          </span>
        </p>
      )}
    </BingoFrame>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[20px] font-black leading-none text-[var(--foreground)]">{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">{label}</span>
    </div>
  );
}
