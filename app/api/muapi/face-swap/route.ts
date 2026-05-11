import { NextResponse } from "next/server";
import { createMuapiImageFaceSwap } from "@/lib/muapi";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type FaceSwapBody = {
  sessionId: string;
  sourceImageUrl: string;
  targetImageUrl: string;
  teamName: string;
  kitNotes: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FaceSwapBody;
    if (!body.sessionId || !body.sourceImageUrl || !body.targetImageUrl) {
      return NextResponse.json(
        { error: "Missing sessionId, sourceImageUrl, or targetImageUrl." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/muapi` : undefined;
    const muapi = await createMuapiImageFaceSwap({
      sourceImageUrl: body.sourceImageUrl,
      targetImageUrl: body.targetImageUrl,
      webhookUrl
    });

    const requestId = muapi.request_id ?? muapi.id;
    if (!requestId) {
      return NextResponse.json({ error: "MUAPI response did not include a request id." }, { status: 502 });
    }

    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();
    const jobId = crypto.randomUUID();
    const insert = await supabase.from("generation_jobs").insert({
      id: jobId,
      session_id: body.sessionId,
      team_name: body.teamName,
      kit_notes: body.kitNotes,
      target_poster_url: body.targetImageUrl,
      muapi_request_id: requestId,
      status: "processing",
      created_at: now,
      updated_at: now
    });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({ jobId, requestId, status: "processing" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "MUAPI face swap request failed." },
      { status: 500 }
    );
  }
}
