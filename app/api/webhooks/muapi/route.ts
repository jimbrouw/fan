import { NextResponse } from "next/server";
import { getMuapiOutputUrl, normalizeMuapiStatus } from "@/lib/jobs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MuapiWebhookBody = {
  request_id?: string;
  id?: string;
  status?: string;
  output?: string | string[];
  error?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MuapiWebhookBody;
    const requestId = body.request_id ?? body.id;
    if (!requestId) {
      return NextResponse.json({ error: "Missing request id." }, { status: 400 });
    }

    const outputUrl = getMuapiOutputUrl(body);
    const status = normalizeMuapiStatus(body.status);
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("generation_jobs")
      .update({
        status,
        output_url: outputUrl,
        error: body.error,
        updated_at: new Date().toISOString()
      })
      .eq("muapi_request_id", requestId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handling failed." },
      { status: 500 }
    );
  }
}
