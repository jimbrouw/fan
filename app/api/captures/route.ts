import { NextResponse } from "next/server";
import { captureBucket, createServerSupabaseClient } from "@/lib/supabase/server";
import type { CaptureStepType } from "@/types/capture";

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

    const upload = await supabase.storage.from(captureBucket).upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(captureBucket).getPublicUrl(path);
    const now = new Date().toISOString();
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Capture upload failed." },
      { status: 500 }
    );
  }
}
