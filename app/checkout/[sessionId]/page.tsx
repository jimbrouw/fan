"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Package, Lock, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";

type MockSessionDetails = {
  jobId: string;
  optionId: "download" | "poster" | "bundle";
  price: string;
  name: string;
};

export default function CheckoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = React.use(params);
  const sessionId = resolvedParams.sessionId;
  
  const [details, setDetails] = useState<MockSessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Billing details inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    // Parse mock session details from the session ID
    // ID format: mock_sess_[jobId]_[optionId]
    if (sessionId.startsWith("mock_sess_")) {
      const parts = sessionId.replace("mock_sess_", "").split("_");
      const jobId = parts[0];
      const optionId = parts[1] as MockSessionDetails["optionId"];
      
      const optionMap = {
        download: { name: "Download — no watermark", price: "£7.99" },
        poster: { name: "A3 poster — delivered", price: "£29.99" },
        bundle: { name: "The gift set", price: "£89.99" },
      };
      
      const selection = optionMap[optionId] || optionMap.poster;
      
      setDetails({
        jobId,
        optionId,
        price: selection.price,
        name: selection.name,
      });
      setLoading(false);
    } else {
      setError("Invalid session ID format.");
      setLoading(false);
    }
  }, [sessionId]);

  const handleAutofill = () => {
    setName("Jim Brouwer");
    setEmail("jim@kitface.app");
    setCardNumber("4242 •••• •••• 4242");
    setExpiry("12/28");
    setCvc("242");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Please fill in your billing details.");
      return;
    }
    
    setPaying(true);
    setError(null);

    try {
      // 1. Trigger the Printful draft order API backend
      const response = await fetch("/api/fulfillment/printful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: details?.jobId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Fulfillment creation failed.");
      }

      // 2. Redirect to success screen with real order IDs
      const successUrl = `/order/success?orderId=${data.orderId}&provider=${data.provider}&optionId=${details?.optionId}`;
      window.location.href = successUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Simulated checkout failed.";
      setError(message);
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <RefreshCw size={24} className="animate-spin text-[var(--accent)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">Initializing payment gateway...</p>
      </div>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-6 pb-6">
      <div className="flex items-center justify-between">
        <Link href={details ? `/upgrade/${details.jobId}` : "/"} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--foreground)] transition">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(49,240,213,0.12)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)] border border-[var(--accent)]/20">
          <ShieldCheck size={12} /> Stripe Simulator
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-[35px] leading-none text-[var(--foreground)]">Complete payment.</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Mock payment gateway powered by Stripe. Use test inputs below.
        </p>
      </div>

      {details && (
        <div className="grid gap-6 md:grid-cols-[1fr_380px]">
          {/* Form container */}
          <form onSubmit={handlePayment} className="space-y-5 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_14px_34px_rgba(42,0,79,0.03)]">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Billing Details</h3>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[var(--muted)]">Name on Card</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jim Brouwer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={paying}
                  className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/50 px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[var(--muted)]">Email Address</span>
                <input
                  type="email"
                  required
                  placeholder="e.g. jim@kitface.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={paying}
                  className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/50 px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/30 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Credit Card Details</span>
                  <CreditCard size={16} className="text-[var(--muted)]" />
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--muted)]">Card Number</span>
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    disabled={paying}
                    className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[var(--muted)]">Expiry Date</span>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      disabled={paying}
                      className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[var(--muted)]">CVC</span>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      disabled={paying}
                      className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3">
              <Button type="submit" disabled={paying} className="w-full">
                {paying ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Simulating payment approval...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Submit simulated payment — {details.price}
                  </>
                )}
              </Button>
              
              <button
                type="button"
                onClick={handleAutofill}
                disabled={paying}
                className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)] underline-offset-4 hover:underline text-center"
              >
                🪄 Fill test card details
              </button>
            </div>

            {error && (
              <p className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-xs leading-5 text-[var(--accent)]">
                {error}
              </p>
            )}
          </form>

          {/* Cart side-card */}
          <div className="space-y-4 rounded-[20px] border border-[var(--line)] bg-[var(--surface-soft)]/50 p-5 self-start">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Order Summary</h3>

            <div className="flex items-center gap-3 rounded-[14px] bg-[var(--surface)] p-3 border border-[var(--line)]">
              <div className="grid size-10 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--foreground)]">
                <Package size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--foreground)] truncate">{details.name}</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">ID: {details.jobId.slice(0, 8)}</p>
              </div>
              <p className="text-xs font-bold text-[var(--accent)]">{details.price}</p>
            </div>

            <div className="border-t border-[var(--line)] pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Subtotal</span>
                <span className="font-bold text-[var(--foreground)]">{details.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Shipping</span>
                <span className="font-bold text-[var(--foreground)]">Free</span>
              </div>
              <div className="flex justify-between border-t border-[var(--line)] pt-2 text-sm">
                <span className="font-bold text-[var(--foreground)]">Total</span>
                <span className="font-bold text-[var(--accent)]">{details.price}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
