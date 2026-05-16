"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Download, Package, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";

type JobResponse = {
  status?: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string | null;
  error?: string | null;
};

type UpgradeOption = {
  id: "download" | "poster" | "bundle";
  name: string;
  price: string;
  icon: typeof Download;
  description: string;
  includes: string[];
};

const upgradeOptions: UpgradeOption[] = [
  {
    id: "download",
    name: "High-res download",
    price: "£7.99",
    icon: Download,
    description: "Upscaled private file with no Kitface watermark.",
    includes: ["A3-ready image target", "No watermark", "Private download link"],
  },
  {
    id: "poster",
    name: "A3 poster delivered",
    price: "£29.99",
    icon: Package,
    description: "Print-ready file sent to fulfilment after payment.",
    includes: ["High-res upscale", "A3 print file", "UK delivery flow"],
  },
  {
    id: "bundle",
    name: "Digital + A3 poster",
    price: "£34.99",
    icon: Sparkles,
    description: "Best future bundle once Stripe and fulfilment are live.",
    includes: ["Download copy", "A3 poster", "Best margin product"],
  },
];

export function UpgradeClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<UpgradeOption["id"]>("poster");
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

  const selectedOption = upgradeOptions.find((option) => option.id === selectedOptionId) ?? upgradeOptions[1];
  const canContinue = job?.status === "completed" && Boolean(job.outputUrl);

  function handleContinue() {
    setStatus(
      `${selectedOption.name} selected. Next build step: Stripe checkout, upscale job, then private download or Printful draft order.`
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-6 pb-4">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Upgrade poster</p>
        <h1 className="font-display text-[36px] leading-none text-[var(--foreground)]">Make it print-ready.</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Free preview stays branded. Paid upgrade creates private high-res file for download or print.
        </p>
      </div>

      <div className="grid grid-cols-[92px_1fr] gap-4 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-[var(--surface-soft)]">
          {job?.status === "completed" && job.outputUrl ? (
            <Image src={job.outputUrl} alt="Kitface poster preview" fill className="object-cover" unoptimized />
          ) : (
            <div className="grid h-full place-items-center p-2 text-center text-xs leading-4 text-[var(--muted)]">
              {error ?? job?.error ?? "Preview loading"}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">Poster {jobId.slice(0, 8)}</p>
          <p className="text-xs leading-5 text-[var(--muted)]">
            Status: {job?.status ?? "loading"}. Upscale target: A3 around 3508 x 4961 px before print.
          </p>
          {!canContinue && (
            <Button type="button" variant="secondary" onClick={loadJob} disabled={isLoading} className="mt-1 w-full">
              <RefreshCw size={16} />
              {isLoading ? "Checking..." : "Check poster"}
            </Button>
          )}
        </div>
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
              className={`w-full rounded-[18px] border p-4 text-left transition ${
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
                    <p className="text-sm font-bold text-[var(--foreground)]">{option.name}</p>
                    <p className="text-sm font-bold text-[var(--accent)]">{option.price}</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{option.description}</p>
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

      <div className="space-y-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
        <Button type="button" className="w-full" disabled={!canContinue} onClick={handleContinue}>
          Continue
        </Button>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Checkout is not live yet. This page now owns future Stripe, upscale, and Printful/Gelato fulfilment flow.
        </p>
        {status && <p className="text-xs font-semibold leading-5 text-[var(--foreground)]">{status}</p>}
      </div>

      <Link href={`/result/${jobId}`} className="text-center text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:underline">
        Back to poster
      </Link>
    </section>
  );
}
