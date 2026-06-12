"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Download, Gift, Package, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

type UpgradeOption = {
  id: "fathers-day-card" | "birthday-card" | "download" | "poster";
  name: string;
  price: string;
  icon: typeof Download;
  description: string;
  includes: string[];
  details: string;
  badge?: string;
};

const upgradeOptions: UpgradeOption[] = [
  {
    id: "fathers-day-card",
    name: "Father's Day card",
    price: "£7.99",
    icon: Gift,
    description: "A football card for Dad while Father's Day is close.",
    includes: ["7x5 printed greeting card", "Poster artwork on the front", "Add a custom message inside"],
    details: "Seasonal option for Father's Day next Sunday. We can remove it mid-next week.",
    badge: "This week",
  },
  {
    id: "birthday-card",
    name: "Greeting card",
    price: "£7.99",
    icon: Gift,
    description: "Send their football poster as a proper printed card.",
    includes: ["7x5 printed greeting card", "Poster artwork on the front", "Add a custom message inside"],
    details: "Best first choice for birthdays, matchdays, thank-yous, and football-mad mates.",
    badge: "Best gift",
  },
  {
    id: "download",
    name: "Download — no watermark",
    price: "£3.99",
    icon: Download,
    description: "Full-resolution file with no Kitface watermark.",
    includes: ["High-res file", "No Kitface watermark", "Download link for your order"],
    details: "Fastest option for the group chat, socials, or printing yourself.",
  },
  {
    id: "poster",
    name: "A3 poster — delivered",
    price: "£29.99",
    icon: Package,
    description: "The big wall print if you want the full showpiece.",
    includes: ["Portrait poster print", "Professional A3 finish", "Delivered to your door"],
    details: "Premium anchor option for bedrooms, offices, clubhouses, or a proper framed gift.",
  },
];

const comingSoonProducts = [
  "Sticker with a proper 3x4 crop",
  "Square fridge magnet layout",
  "Mug wrap artwork",
];

export function UpgradeClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<UpgradeOption["id"]>("birthday-card");
  const [cardMessage, setCardMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const loadJob = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      const data = (await response.json()) as JobResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Job lookup failed.");
      setJob(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Job lookup failed.");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const selectedOption = upgradeOptions.find((option) => option.id === selectedOptionId) ?? upgradeOptions[0];
  const canContinue = job?.status === "completed" && Boolean(job.outputUrl);
  const isCardOption = selectedOptionId === "birthday-card" || selectedOptionId === "fathers-day-card";

  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleContinue() {
    setIsRedirecting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          optionId: selectedOptionId,
          cardMessage: isCardOption ? cardMessage.trim() : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to initialize checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred starting checkout.";
      setStatus(message);
    } finally {
      setIsRedirecting(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6 pb-4">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Make it theirs</p>
        <h1 className="font-display text-[36px] leading-none text-[var(--foreground)]">Send the football card they&apos;ll actually show off.</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Start simple: Father&apos;s Day card, printed greeting card, no-watermark download, or the big A3 wall print.
          Mugs, magnets, and stickers need their own artwork formats, so we&apos;re keeping them back until they look right.
        </p>
      </div>

      <div className="grid grid-cols-[92px_1fr] gap-4 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-[var(--surface-soft)]">
          {job?.status === "completed" && job.outputUrl ? (
            <Image src={`/api/jobs/${jobId}/image`} alt="Kitface poster preview" fill className="object-cover" unoptimized />
          ) : (
            <div className="grid h-full place-items-center p-2 text-center text-xs leading-4 text-[var(--muted)]">
              {error ?? job?.error ?? "Preview loading"}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">Your poster preview</p>
          <p className="text-xs leading-5 text-[var(--muted)]">
            Status: {job?.status ?? "loading"}. Paid downloads and printed gifts use the finished image without the preview watermark.
          </p>
          {!canContinue && (
            <Button type="button" variant="secondary" onClick={loadJob} disabled={isLoading} className="mt-1 w-full">
              <RefreshCw size={16} />
              {isLoading ? "Checking..." : "Check image"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Selected gift</p>
            <p className="mt-1 text-sm font-bold text-[var(--foreground)]">{selectedOption.name}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-[var(--accent)]">{selectedOption.price}</p>
        </div>
        <Button type="button" className="w-full" disabled={!canContinue || isRedirecting} onClick={handleContinue}>
          {isRedirecting ? "Processing..." : `Checkout — ${selectedOption.price}`}
        </Button>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Checkout now with the selected option, or switch below.
        </p>
      </div>

      <div className="space-y-3">
        {upgradeOptions.map((option) => {
          const Icon = option.icon;
          const selected = option.id === selectedOptionId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOptionId(option.id)}
              className={`w-full rounded-[18px] border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                selected
                  ? "border-[var(--accent)] bg-[var(--surface-soft)] shadow-[0_14px_34px_rgba(42,0,79,0.08)]"
                  : "border-[var(--line)] bg-[var(--surface)] hover:bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--foreground)]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[var(--foreground)]">{option.name}</p>
                      {option.badge && (
                        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[var(--accent)]">{option.price}</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{option.description}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{option.details}</p>
                  <div className="mt-3 grid gap-1">
                    {option.includes.map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 text-xs leading-5 text-[var(--foreground)]">
                        <Check size={14} className="text-[var(--accent)]" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isCardOption && (
        <label className="block space-y-2 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-4">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Card message</span>
          <textarea
            value={cardMessage}
            onChange={(event) => setCardMessage(event.target.value.slice(0, 240))}
            placeholder={selectedOptionId === "fathers-day-card" ? "Happy Father's Day. Still the captain." : "Hope this makes the group chat jealous."}
            rows={4}
            className="min-h-24 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/60 px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.65)] focus:border-[var(--accent)]"
          />
          <span className="text-right text-[11px] font-semibold text-[var(--muted)]">{cardMessage.length}/240</span>
        </label>
      )}

      <div className="space-y-3 rounded-[18px] border border-dashed border-[var(--line)] bg-[var(--surface)] p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Coming soon</p>
          <p className="mt-1 text-sm font-bold text-[var(--foreground)]">More gifts, with artwork made for the product.</p>
        </div>
        <div className="grid gap-2">
          {comingSoonProducts.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 text-xs leading-5 text-[var(--muted)]">
              <Check size={14} className="text-[var(--accent)]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
        <Button type="button" className="w-full" disabled={!canContinue || isRedirecting} onClick={handleContinue}>
          {isRedirecting ? "Processing..." : `Checkout — ${selectedOption.price}`}
        </Button>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Secure checkout. Printed items are prepared after payment. Downloads are sent to your email. Paid products do not include the preview watermark.
        </p>
        {status && <p className="text-xs font-semibold leading-5 text-[var(--foreground)]">{status}</p>}
      </div>

      <Link href={`/result/${jobId}`} className="text-center text-sm text-[var(--muted)] underline-offset-4 hover:underline">
        Keep the free preview
      </Link>
    </section>
  );
}
