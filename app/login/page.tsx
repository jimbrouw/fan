"use client";

import { Bell, CheckCircle2, LogIn, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSendingEmailLink, setIsSendingEmailLink] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [next, setNext] = useState("/create");
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let nextParam = new URLSearchParams(window.location.search).get("next") ?? "/create";
    if (!nextParam.startsWith("/") || nextParam.startsWith("//") || nextParam.includes("\\")) {
      nextParam = "/create";
    }
    setNext(nextParam);

    const timeout = setTimeout(() => {
      if (isActive) setIsCheckingSession(false);
    }, 3000);

    async function checkSession() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        clearTimeout(timeout);
        if (isActive) setIsCheckingSession(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();
        if (!isActive) return;
        clearTimeout(timeout);

        if (data.user) {
          window.location.assign(nextParam);
          return;
        }
      } catch {
        clearTimeout(timeout);
      }

      if (isActive) setIsCheckingSession(false);
    }

    checkSession();

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, []);

  async function signInWithGoogle() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase auth is not configured.");
      return;
    }

    setIsSigningIn(true);
    setError(null);

    const origin = window.location.origin;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (signInError) {
      setError(
        signInError.message.includes("Unsupported provider")
          ? "Google sign-in is not enabled in Supabase yet. Enable Google under Supabase Auth providers, then add the Google OAuth client ID and secret."
          : signInError.message
      );
      setIsSigningIn(false);
    }
  }

  async function signInWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase auth is not configured.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }

    setIsSendingEmailLink(true);
    setError(null);
    setEmailMessage(null);

    const origin = window.location.origin;
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setIsSendingEmailLink(false);
      return;
    }

    setEmailMessage("Check your email for a sign-in link.");
    setIsSendingEmailLink(false);
  }

  return (
    <AppFrame>
      <section className="flex flex-1 flex-col justify-center gap-6 pb-4">
        {isCheckingSession ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="inline-block size-4 rounded-full bg-[var(--accent)] animate-pulse" />
              <p className="text-sm text-[var(--muted)]">Signing you in…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">One quick save point</p>
              <h1 className="font-display text-[48px] leading-none text-[var(--foreground)]">Keep your posters.</h1>
              <p className="max-w-[18rem] text-base leading-6 text-[var(--muted)]">
                Sign in once, then create without losing your photos or results.
              </p>
            </div>

            <div className="space-y-3">
              <Button type="button" onClick={signInWithGoogle} disabled={isSigningIn} className="h-13 w-full text-base">
                <LogIn size={18} />
                {isSigningIn ? "Opening Google..." : "Continue with Google"}
              </Button>
              <form className="space-y-3" onSubmit={signInWithEmail}>
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Or use email</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-13 w-full rounded-[15px] border border-[var(--line)] bg-[var(--surface)] px-4 text-base font-semibold text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.65)] focus:border-[var(--accent)]"
                  />
                </label>
                <Button type="submit" variant="secondary" disabled={isSendingEmailLink} className="h-13 w-full text-base">
                  <Mail size={18} />
                  {isSendingEmailLink ? "Sending link..." : "Email me a sign-in link"}
                </Button>
              </form>
              <div className="grid gap-2 text-sm leading-5 text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--accent)]" />
                  <span>Save poster history</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[var(--accent)]" />
                  <span>Choose email or push updates later</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-[14px] border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-3 text-sm leading-6 text-[var(--foreground)]">
                {error}
              </p>
            )}
            {emailMessage && (
              <p className="rounded-[14px] border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-3 text-sm leading-6 text-[var(--foreground)]">
                {emailMessage}
              </p>
            )}
          </>
        )}
      </section>
    </AppFrame>
  );
}
