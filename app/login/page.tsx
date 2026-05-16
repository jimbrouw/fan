"use client";

import { Bell, CheckCircle2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [next, setNext] = useState("/create");

  useEffect(() => {
    let isActive = true;
    const nextParam = new URLSearchParams(window.location.search).get("next") ?? "/create";
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
          </>
        )}
      </section>
    </AppFrame>
  );
}
