"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Truck, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/Button";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId") || sessionId || "N/A";
  const provider = searchParams.get("provider") || (sessionId ? "stripe" : "printful");
  const optionId = searchParams.get("optionId") || "fathers-day-card";

  const optionNameMap = {
    "fathers-day-card": "Father's Day card",
    "birthday-card": "Birthday card",
    download: "Download — no watermark",
    poster: "A3 poster — delivered",
  };

  const selectedName = optionNameMap[optionId as keyof typeof optionNameMap] || "Father's Day card";

  return (
    <section className="flex flex-1 flex-col gap-6 pb-6 items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-[480px] rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_50px_rgba(42,0,79,0.06)] relative overflow-hidden">
        {/* Subtle glow border at top */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[var(--accent)] to-[rgba(49,240,213,0.7)]" />

        <div className="flex flex-col items-center text-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-[rgba(49,240,213,0.12)] text-[var(--accent)] border border-[var(--accent)]/20 animate-bounce">
            <ShieldCheck size={32} />
          </div>
          
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Order Confirmed</p>
            <h1 className="font-display text-[28px] leading-tight text-[var(--foreground)]">It&apos;s on the way!</h1>
            <p className="text-sm text-[var(--muted)] px-4">
              Your payment cleared successfully. Physical orders are registered for fulfilment after Stripe confirms payment.
            </p>
          </div>
        </div>

        {/* Receipt specs */}
        <div className="mt-6 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/50 p-4 space-y-3.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-[var(--line)]">
            <span className="text-[var(--muted)] font-semibold">Product Purchased</span>
            <span className="font-bold text-[var(--foreground)]">{selectedName}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-[var(--line)]">
            <span className="text-[var(--muted)] font-semibold">{sessionId ? "Stripe Session" : provider === "printful" ? "Printful Draft ID" : "Order ID"}</span>
            <span className="font-mono font-bold text-[var(--accent)]">{orderId}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-[var(--line)]">
            <span className="text-[var(--muted)] font-semibold">{provider === "printful" ? "Postage Status" : "Delivery Status"}</span>
            <span className="inline-flex items-center gap-1 font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full text-[10px]">
              <Truck size={10} /> {provider === "printful" ? "Registered Draft" : "Digital"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--muted)] font-semibold">Fulfillment Center</span>
            <span className="font-bold text-[var(--foreground)] uppercase tracking-[0.05em]">{sessionId ? "stripe" : provider} V2</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/capture">
            <Button className="w-full">
              <Plus size={16} />
              Make another card
            </Button>
          </Link>

          <a 
            href="https://printful.com" 
            target="_blank" 
            rel="noreferrer"
            className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[var(--line)] bg-[var(--surface-soft)] px-5 text-sm font-bold text-[var(--foreground)] transition duration-300 hover:bg-white active:scale-[0.98]"
          >
            Check Printful Dashboard
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <p className="text-sm font-semibold text-[var(--muted)]">Loading order details...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
