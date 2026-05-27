import { NextResponse } from "next/server";
import { captureBucket, createServerSupabaseClient } from "@/lib/supabase/server";
import type { CaptureStepType } from "@/types/capture";

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  const message = error.message ?? "";
  return (
    new RegExp(`Could not find the '${column}' column`, "i").test(message) ||
    new RegExp(`column .*\\.${column} does not exist`, "i").test(message)
  );
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const sessionId = String(form.get("sessionId") ?? "");
    const type = String(form.get("type") ?? "") as CaptureStepType;
    const validationStatus = String(form.get("validationStatus") ?? "manual_review");
    const validationResults = String(form.get("validationResults") ?? "{}");

    if (!(file instanceof File) || !sessionId || !type) {
      return NextResponse.json({ error: "Missing file, sessionId, or type." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const path = `${sessionId}/${type}.jpg`;
    const now = new Date().toISOString();

    const sessionInsert = {
      id: sessionId,
      user_id: null,
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

    const { data: publicUrlData } = supabase.storage.from(captureBucket).getPublicUrl(path);
    const id = crypto.randomUUID();

    const insert = await supabase.from("captures").upsert(
      {
        id,
        session_id: sessionId,
        type,
        image_url: publicUrlData.publicUrl,
        validation_status: validationStatus,
        validation_results: JSON.parse(validationResults),
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
      imageUrl: publicUrlData.publicUrl,
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
