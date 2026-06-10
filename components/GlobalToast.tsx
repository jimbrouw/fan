"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import Link from "next/link";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export function GlobalToast() {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [activeToast, setActiveToast] = useState<NotificationRow | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as { notifications?: NotificationRow[] };
        if (!isActive) return;

        const allNotes = data.notifications ?? [];

        // Find the newest unread notification
        const unread = allNotes.filter((n) => !n.readAt);
        
        if (unread.length > 0) {
            const latest = unread[0];
            setSeenIds((prev) => {
                // If we haven't shown a toast for this unread notification yet in this session
                if (!prev.has(latest.id)) {
                    setActiveToast(latest);
                    const next = new Set(prev);
                    next.add(latest.id);
                    return next;
                }
                return prev;
            });
        }

      } catch {
        // Ignore
      }
    }

    // Load immediately on mount
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 10000); // Check every 10s

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, []);

  // Auto-dismiss active toast after 6 seconds
  useEffect(() => {
      if (activeToast) {
          const t = setTimeout(() => {
              setActiveToast(null);
          }, 6000);
          return () => clearTimeout(t);
      }
  }, [activeToast]);

  const markRead = async (id: string) => {
      try {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: id })
        });
      } catch {}
  };

  if (!activeToast) return null;

  const isError = activeToast.title.toLowerCase().includes("failed");

  return (
    <div className="fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-0 right-0 z-50 mx-auto w-full max-w-[400px] px-4 pointer-events-none transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in-0">
      <div className="pointer-events-auto flex items-center gap-3 overflow-hidden rounded-[16px] bg-[var(--surface)] p-4 shadow-[0_16px_40px_rgba(28,25,54,0.15)] border border-[var(--line)]">
        <div className={`shrink-0 ${isError ? "text-red-500" : "text-[var(--accent)]"}`}>
          {isError ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-bold text-[var(--foreground)] truncate">{activeToast.title}</h4>
          <p className="text-[12px] text-[var(--muted)] truncate">{activeToast.body}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
            {activeToast.actionUrl && (
                <Link 
                  href={activeToast.actionUrl as any} 
                  onClick={() => markRead(activeToast.id)}
                  className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)] hover:bg-[var(--line)]"
                >
                    View
                </Link>
            )}
            <button 
                onClick={() => {
                    markRead(activeToast.id);
                    setActiveToast(null);
                }}
                className="grid size-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
      </div>
    </div>
  );
}
