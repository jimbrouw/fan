import { NextResponse } from "next/server";
import { createUserSupabaseClient } from "@/lib/supabase/auth-server";
import { upsertUserProfile } from "@/lib/users";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next") ?? "/create";

  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    next = "/create";
  }

  try {
    if (code) {
      const supabase = await createUserSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.warn(`Google auth callback failed: ${error.message}`);
        return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, requestUrl.origin));
      }

      if (data.user) {
        await upsertUserProfile(data.user);
      }
    }
  } catch (error) {
    console.warn(`Google auth callback failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
