import { NextResponse } from "next/server";
import { captureBucket, createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { decideOwnedResourceAccess } from "@/lib/authz";
import { buildSupabaseStorageUri, createSignedStorageUrl } from "@/lib/supabase/storage";
import type { CaptureStepType } from "@/types/capture";

const captureStepTypes = [
  "neutral_front",
  "smiling_front",
  "left_45",
  "right_45",
  "side_profile",
  "torso",
  "celebration",
  "opponent_front"
] as const satisfies readonly CaptureStepType[];

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  const message = error.message ?? "";
  return (
    new RegExp(`Could not find the '${column}' column`, "i").test(message) ||
    new RegExp(`column .*\\.${column} does not exist`, "i").test(message)
  );
}

function isCaptureStepType(value: string): value is CaptureStepType {
  return captureStepTypes.includes(value as CaptureStepType);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

type CaptureSessionRow = {
  id: string;
  user_id: string | null;
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to upload photos." }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const sessionId = String(form.get("sessionId") ?? "");
    const type = String(form.get("type") ?? "");
    const validationStatus = String(form.get("validationStatus") ?? "manual_review");
    const validationResults = String(form.get("validationResults") ?? "{}");

    if (!(file instanceof File) || !sessionId || !type) {
      return NextResponse.json({ error: "Missing file, sessionId, or type." }, { status: 400 });
    }

    if (!isUuid(sessionId)) {
      return NextResponse.json({ error: "Capture session expired. Restart capture and try again." }, { status: 400 });
    }

    if (!isCaptureStepType(type)) {
      return NextResponse.json({ error: "Unsupported capture photo type." }, { status: 400 });
    }

    let parsedValidationResults: unknown;
    try {
      parsedValidationResults = JSON.parse(validationResults);
    } catch {
      return NextResponse.json({ error: "Invalid capture validation data." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const path = `${sessionId}/${type}.jpg`;
    const now = new Date().toISOString();
    let userIdColumnMissing = false;

    let existingSessionQuery = await supabase
      .from("capture_sessions")
      .select("id,user_id")
      .eq("id", sessionId)
      .maybeSingle<CaptureSessionRow>();

    if (existingSessionQuery.error && isMissingSchemaColumn(existingSessionQuery.error, "user_id")) {
      userIdColumnMissing = true;
      const fallback = await supabase
        .from("capture_sessions")
        .select("id")
        .eq("id", sessionId)
        .maybeSingle<Omit<CaptureSessionRow, "user_id">>();

      existingSessionQuery = {
        ...fallback,
        data: fallback.data ? { ...fallback.data, user_id: null } : null,
      } as typeof existingSessionQuery;
    }

    if (existingSessionQuery.error) {
      return NextResponse.json({ error: existingSessionQuery.error.message }, { status: 500 });
    }

    if (existingSessionQuery.data) {
      const access = decideOwnedResourceAccess({
        ownerColumnAvailable: !userIdColumnMissing,
        resourceUserId: existingSessionQuery.data.user_id,
        requesterUserId: user.id,
      });

      if (access === "deny") {
        return NextResponse.json({ error: "Capture session not found." }, { status: 404 });
      }
    }

    const sessionInsert = {
      id: sessionId,
      user_id: user.id,
      status: "capturing",
      created_at: now,
      updated_at: now
    };

    let sessionUpsert = await supabase
      .from("capture_sessions")
      .upsert(sessionInsert, { onConflict: "id", ignoreDuplicates: true });

    if (sessionUpsert.error && isMissingSchemaColumn(sessionUpsert.error, "user_id")) {
      const legacySessionInsert: Omit<typeof sessionInsert, "user_id"> = { ...sessionInsert };
      delete (legacySessionInsert as Partial<typeof sessionInsert>).user_id;
      sessionUpsert = await supabase
        .from("capture_sessions")
        .upsert(legacySessionInsert, { onConflict: "id", ignoreDuplicates: true });
    }

    if (sessionUpsert.error) {
      console.error("Capture session upsert failed:", sessionUpsert.error.message, { sessionId });
      return NextResponse.json({ error: sessionUpsert.error.message }, { status: 500 });
    }

    const upload = await supabase.storage.from(captureBucket).upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true
    });

    if (upload.error) {
      console.error("Capture storage upload failed:", upload.error.message, { sessionId, type, path });
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const imageUrl = await createSignedStorageUrl(supabase, captureBucket, path);
    const storageUri = buildSupabaseStorageUri(captureBucket, path);
    const id = crypto.randomUUID();

    const insert = await supabase.from("captures").upsert(
      {
        id,
        session_id: sessionId,
        type,
        image_url: storageUri,
        validation_status: validationStatus,
        validation_results: parsedValidationResults,
        created_at: now,
        updated_at: now
      },
      { onConflict: "session_id,type" }
    );

    if (insert.error) {
      console.error("Capture DB insert failed:", insert.error.message, { sessionId, type });
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({
      id,
      sessionId,
      type,
      imageUrl,
      validationStatus,
      createdAt: now
    });
  } catch (error) {
    console.error("Capture route unhandled error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Capture upload failed." },
      { status: 500 }
    );
  }
}
