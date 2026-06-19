import { NextResponse } from "next/server";
import { decideOwnedResourceAccess } from "@/lib/authz";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { captureBucket, createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedStorageUrl, parseSupabaseStorageUri } from "@/lib/supabase/storage";
import { checkRateLimit } from "@/lib/rateLimit";

type CaptureSessionRow = {
  id: string;
  user_id: string | null;
};

type SignBody = {
  sessionId?: string;
  imageUrls?: string[];
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  const message = error.message ?? "";
  return (
    new RegExp(`Could not find the '${column}' column`, "i").test(message) ||
    new RegExp(`column .*\\.${column} does not exist`, "i").test(message)
  );
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to restore photos." }, { status: 401 });
    }

    // Rate Limit (authenticated or IP)
    const limitResponse = checkRateLimit(user.id, "signed-urls", { limit: 30, windowMs: 60 * 1000 });
    if (limitResponse) return limitResponse;

    const body = (await request.json()) as SignBody;
    const imageUrls = body.imageUrls?.filter((url): url is string => typeof url === "string") ?? [];
    if (!body.sessionId || imageUrls.length === 0) {
      return NextResponse.json({ signedUrls: {} });
    }

    const supabase = createServerSupabaseClient();
    let userIdColumnMissing = false;
    let sessionQuery = await supabase
      .from("capture_sessions")
      .select("id,user_id")
      .eq("id", body.sessionId)
      .maybeSingle<CaptureSessionRow>();

    if (sessionQuery.error && isMissingSchemaColumn(sessionQuery.error, "user_id")) {
      userIdColumnMissing = true;
      const fallback = await supabase
        .from("capture_sessions")
        .select("id")
        .eq("id", body.sessionId)
        .maybeSingle<Omit<CaptureSessionRow, "user_id">>();

      sessionQuery = {
        ...fallback,
        data: fallback.data ? { ...fallback.data, user_id: null } : null,
      } as typeof sessionQuery;
    }

    if (sessionQuery.error || !sessionQuery.data) {
      return NextResponse.json({ error: sessionQuery.error?.message ?? "Capture session not found." }, { status: 404 });
    }

    const access = decideOwnedResourceAccess({
      ownerColumnAvailable: !userIdColumnMissing,
      resourceUserId: sessionQuery.data.user_id,
      requesterUserId: user.id,
    });

    if (access === "deny") {
      return NextResponse.json({ error: "Capture session not found." }, { status: 404 });
    }

    const signedEntries = await Promise.all(
      imageUrls.map(async (imageUrl) => {
        const parsed = parseSupabaseStorageUri(imageUrl);
        if (!parsed || parsed.bucket !== captureBucket) return [imageUrl, imageUrl] as const;
        if (!parsed.path.startsWith(`${body.sessionId}/`)) return [imageUrl, imageUrl] as const;

        const signedUrl = await createSignedStorageUrl(supabase, parsed.bucket, parsed.path);
        return [imageUrl, signedUrl] as const;
      })
    );

    return NextResponse.json({ signedUrls: Object.fromEntries(signedEntries) as Record<string, string> });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not restore signed capture URLs." },
      { status: 500 }
    );
  }
}
