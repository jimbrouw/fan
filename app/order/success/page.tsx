import type Stripe from "stripe";
import Link from "next/link";
import { ArrowRight, Download, MailCheck, Plus, ShieldCheck, Truck } from "lucide-react";
import { getStripe } from "@/lib/stripe/server";

type OrderSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
    orderId?: string;
    optionId?: string;
  }>;
};

const optionNameMap = {
  "fathers-day-card": "Father's Day card",
  "birthday-card": "Birthday card",
  download: "Download - no watermark",
  poster: "A3 poster - delivered",
} as const;

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const session = await retrieveCheckoutSession(params.session_id);
  const optionId = session?.metadata?.optionId ?? params.optionId ?? "fathers-day-card";
  const jobId = session?.metadata?.jobId;
  const isPaid = session?.payment_status === "paid";
  const isDownload = optionId === "download";
  const isPhysicalOrder = optionId === "fathers-day-card" || optionId === "birthday-card" || optionId === "poster";
  const selectedName = optionNameMap[optionId as keyof typeof optionNameMap] || "Father's Day card";
  const orderId = params.orderId || params.session_id || "N/A";
  const receiptReference = params.session_id ? params.session_id.slice(-10).toUpperCase() : orderId;
  const statusLabel = isPhysicalOrder ? "Fulfillment Status" : "Delivery Status";
  const statusText = isPhysicalOrder ? "Queued" : "Digital";
  const fulfillmentCenter = isPhysicalOrder ? "Print partner" : "Digital delivery";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kitface-app.vercel.app";
  const downloadUrl =
    isDownload && isPaid && jobId && params.session_id
      ? `/api/jobs/${jobId}/image?download=1&noWatermark=1&session_id=${encodeURIComponent(params.session_id)}`
      : null;
  const email = await resolveSessionEmail(session);

  return (
    <section className="flex min-h-[75vh] flex-1 flex-col items-center justify-center gap-6 pb-6">
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_50px_rgba(42,0,79,0.06)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--accent)] to-[rgba(49,240,213,0.7)]" />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="grid size-16 place-items-center rounded-full border border-[var(--accent)]/20 bg-[rgba(49,240,213,0.12)] text-[var(--accent)]">
            <ShieldCheck size={32} />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Order Confirmed</p>
            <h1 className="font-display text-[28px] leading-tight text-[var(--foreground)]">
              {isDownload ? "Your download is ready." : "It's on the way!"}
            </h1>
            <p className="px-4 text-sm leading-6 text-[var(--muted)]">
              {isDownload
                ? "Your payment cleared successfully. Download the full-resolution file with no watermark."
                : "Your payment cleared successfully. Your order is being registered for fulfillment."}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3.5 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/50 p-4">
          <ReceiptRow label="Product Purchased" value={selectedName} />
          <ReceiptRow label="Receipt Reference" value={receiptReference} mono accent />
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-xs">
            <span className="font-semibold text-[var(--muted)]">{statusLabel}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600">
              {isDownload ? <Download size={10} /> : <Truck size={10} />} {statusText}
            </span>
          </div>
          <ReceiptRow label={isPhysicalOrder ? "Fulfillment" : "Delivery"} value={fulfillmentCenter} uppercase />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {downloadUrl ? (
            <>
              <a
                href={downloadUrl}
                download={`kitface-${jobId}.png`}
                className="kitface-btn-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[var(--accent)] px-5 text-sm font-bold text-[var(--foreground)] shadow-[0_12px_28px_rgba(49,240,213,0.28)] transition duration-300 hover:bg-[var(--accent-strong)] active:scale-[0.98]"
              >
                <Download size={16} />
                Download, no watermark
              </a>
              <div className="flex items-start gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-left">
                <MailCheck size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <p className="text-xs leading-5 text-[var(--muted)]">
                  We&apos;ve also emailed this download link{email ? ` to ${email}` : ""}.
                </p>
              </div>
            </>
          ) : isDownload ? (
            <a
              href={jobId ? `/result/${jobId}` : appUrl}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface-soft)] px-5 text-sm font-bold text-[var(--foreground)] transition duration-300 hover:bg-white active:scale-[0.98]"
            >
              Return to poster
              <ArrowRight size={15} />
            </a>
          ) : null}

          <Link
            href="/capture"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--foreground)] transition duration-300 hover:bg-white active:scale-[0.98]"
          >
            <Plus size={16} />
            Make another poster
          </Link>

          {isPhysicalOrder && (
            <a
              href="https://printful.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface-soft)] px-5 text-sm font-bold text-[var(--foreground)] transition duration-300 hover:bg-white active:scale-[0.98]"
            >
              View order details
              <ArrowRight size={15} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function ReceiptRow({
  label,
  value,
  accent = false,
  mono = false,
  uppercase = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-xs last:border-b-0 last:pb-0">
      <span className="font-semibold text-[var(--muted)]">{label}</span>
      <span
        className={[
          "font-bold",
          accent ? "text-[var(--accent)]" : "text-[var(--foreground)]",
          mono ? "font-mono" : "",
          uppercase ? "uppercase tracking-[0.05em]" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

async function retrieveCheckoutSession(stripeSessionId: string | undefined) {
  if (!stripeSessionId?.startsWith("cs_")) return null;

  try {
    return await getStripe().checkout.sessions.retrieve(stripeSessionId);
  } catch (error) {
    console.error("Order success Stripe lookup failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function resolveSessionEmail(session: Stripe.Checkout.Session | null) {
  return session?.customer_details?.email ?? session?.customer_email ?? null;
}
