"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Package, Lock, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";

type MockSessionDetails = {
  jobId: string;
  optionId: "fathers-day-card" | "birthday-card" | "download" | "mug" | "sticker" | "magnet" | "poster";
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
        "fathers-day-card": { name: "Father's Day card", price: "£7.99" },
        "birthday-card": { name: "Greeting card", price: "£7.99" },
        download: { name: "Download — no watermark", price: "£3.99" },
        mug: { name: "11oz mug", price: "£12.99" },
        sticker: { name: "Sticker", price: "£4.99" },
        magnet: { name: "Fridge magnet", price: "£6.99" },
        poster: { name: "A3 poster — delivered", price: "£29.99" },
      };
      
      const selection = optionMap[optionId] || optionMap["fathers-day-card"];
      
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
    setName("Test Customer");
    setEmail("test@example.com");
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
      let provider = "kitface";
      let orderId = "download";

      if (details?.optionId !== "download") {
        const response = await fetch("/api/fulfillment/prodigi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: details?.jobId, optionId: details?.optionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Fulfillment creation failed.");
        }

        provider = data.provider;
        orderId = data.orderId;
      }

      const successUrl = `/order/success?orderId=${orderId}&provider=${provider}&optionId=${details?.optionId}`;
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
        <div className="flex flex-col gap-5 w-full max-w-[480px] mx-auto">
          {/* Cart summary at the top for mobile */}
          <div className="space-y-3.5 rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)]/50 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--foreground)]">
                <Package size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--foreground)] truncate">{details.name}</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">Kitface image: {details.jobId.slice(0, 8)}</p>
              </div>
              <p className="text-xs font-bold text-[var(--accent)]">{details.price}</p>
            </div>
          </div>

          {/* Form container */}
          <form onSubmit={handlePayment} className="space-y-4 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_14px_34px_rgba(42,0,79,0.02)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Billing Details</h3>

            <div className="space-y-3.5">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold text-[var(--muted)]">Name on Card</span>
                <input
                  type="text"
                  required
                  placeholder="Name on card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={paying}
                  className="h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)]/50 px-3.5 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold text-[var(--muted)]">Email Address</span>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={paying}
                  className="h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)]/50 px-3.5 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Credit Card Details</span>
                  <CreditCard size={14} className="text-[var(--muted)]" />
                </div>

                <label className="block space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--muted)]">Card Number</span>
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    disabled={paying}
                    className="h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-[var(--muted)]">Expiry Date</span>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      disabled={paying}
                      className="h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-[var(--muted)]">CVC</span>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      disabled={paying}
                      className="h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button type="submit" disabled={paying} className="w-full min-h-11 rounded-[12px]">
                {paying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    Pay — {details.price}
                  </>
                )}
              </Button>
              
              <button
                type="button"
                onClick={handleAutofill}
                disabled={paying}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)] underline-offset-4 hover:underline text-center py-1"
              >
                🪄 Fill test card details
              </button>
            </div>

            {error && (
              <p className="rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)] p-2.5 text-[11px] leading-5 text-[var(--accent)]">
                {error}
              </p>
            )}
          </form>
        </div>
      )}
    </section>
  );
}
