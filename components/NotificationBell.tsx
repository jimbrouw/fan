"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as { notifications?: NotificationRow[] };
        if (isActive) setNotifications(data.notifications ?? []);
      } catch {
        // Anonymous users and local auth setup failures should not block the shell.
      }
    }

    loadNotifications();
    const timer = window.setInterval(loadNotifications, 15000);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, []);

  const unread = notifications.filter((notification) => !notification.readAt);
  const latest = unread[0];

  return (
    <div className="relative">
      {latest?.actionUrl ? (
        <a
          href={latest.actionUrl}
          className="grid size-9 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--foreground)]"
          title={latest.title}
        >
          <Bell size={18} />
        </a>
      ) : (
        <div className="grid size-9 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--foreground)]" title={latest?.title ?? "Notifications"}>
          <Bell size={18} />
        </div>
      )}
      {unread.length > 0 && (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[var(--foreground)]">
          {unread.length}
        </span>
      )}
    </div>
  );
}
