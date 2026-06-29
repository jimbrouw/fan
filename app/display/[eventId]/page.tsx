"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type Portrait = {
  id: string;
  player_name: string;
  output_url: string | null;
  job_id: string;
};

const POLL_INTERVAL_MS = 3000;

export default function DisplayPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [portraits, setPortraits] = useState<Portrait[]>([]);
  const [calledIds, setCalledIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    const [portraitsRes, eventRes] = await Promise.all([
      fetch(`/api/bingo/portraits?eventCode=${eventId}`, { cache: "no-store" }),
      fetch(`/api/bingo/events/${eventId}`, { cache: "no-store" }),
    ]);
    const [portraitsData, eventData] = await Promise.all([
      portraitsRes.json() as Promise<{ portraits?: Portrait[] }>,
      eventRes.json() as Promise<{ calledPortraitIds?: string[] }>,
    ]);
    if (portraitsData.portraits) setPortraits(portraitsData.portraits);
    if (eventData.calledPortraitIds) setCalledIds(eventData.calledPortraitIds);
  }, [eventId]);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const currentPortrait = calledIds.length > 0
    ? portraits.find((p) => p.id === calledIds[calledIds.length - 1]) ?? null
    : null;

  const previousIds = calledIds.slice(0, -1);

  return (
    <main
      className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden text-white"
      style={{ background: "#1A0000" }}
    >
      {/* Background glow — red accent when something is called */}
      {currentPortrait && (
        <div className="pointer-events-none absolute inset-0 opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(ellipse at 50% 40%, #FF5500, #CC0000, transparent 70%)" }}
        />
      )}

      {/* Event name top */}
      <div className="absolute left-0 right-0 top-6 flex items-center justify-between px-8 text-white/60">
        <span className="font-display text-[22px] font-black tracking-tight text-white/80">AI Bingo</span>
        <span className="font-mono text-[16px] font-bold tracking-widest text-white/60">{eventId}</span>
      </div>

      {/* Portrait */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {currentPortrait ? (
          <>
            <div
              className="overflow-hidden rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
              style={{
                width: "clamp(180px, 30vw, 340px)",
                aspectRatio: "3/4",
              }}
            >
              {currentPortrait.output_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/bingo/jobs/${currentPortrait.job_id}/image`}
                  alt={currentPortrait.player_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#330000]" />
              )}
            </div>

            <div className="text-center">
              <p className="font-display text-[clamp(36px,6vw,80px)] font-black leading-none tracking-tight text-white">
                {currentPortrait.player_name}
              </p>
              <p className="mt-2 text-[clamp(16px,2.5vw,28px)] font-semibold text-white/60">
                Portrait #{calledIds.length}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="font-display text-[clamp(32px,5vw,64px)] font-black text-white/30">
              Waiting to start…
            </p>
            <p className="mt-3 font-mono text-[clamp(14px,2vw,24px)] tracking-widest text-white/20">
              {eventId}
            </p>
          </div>
        )}
      </div>

      {/* Called history strip */}
      {previousIds.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 overflow-hidden px-8">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-white/40">Called</span>
            <div className="flex gap-1.5 overflow-x-auto">
              {previousIds.map((id) => {
                const p = portraits.find((pp) => pp.id === id);
                if (!p) return null;
                return p.output_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={id}
                    src={`/api/bingo/jobs/${p.job_id}/image`}
                    alt={p.player_name}
                    className="h-9 w-7 shrink-0 rounded-[6px] object-cover opacity-60"
                    title={p.player_name}
                  />
                ) : (
                  <div
                    key={id}
                    className="h-9 w-7 shrink-0 rounded-[6px] bg-[#330000] opacity-60"
                    title={p.player_name}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stats bottom right */}
      <div className="absolute bottom-6 right-8 text-[13px] text-white/30">
        {calledIds.length} called · {portraits.length - calledIds.length} remaining
      </div>
    </main>
  );
}
