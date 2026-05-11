import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";

type WebhookBody = {
  request_id?: string;
  id?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebhookBody;
    const requestId = body.request_id ?? body.id;
    if (!requestId) {
      return NextResponse.json({ error: "Missing request id." }, { status: 400 });
    }

    // Instead of parsing the provider-specific webhook payload,
    // we use the provider to fetch the definitive status.
    const provider = new MuapiGenerationProvider();
    const statusResult = await provider.getJobStatus(requestId);

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("generation_jobs")
      .update({
        status: statusResult.status,
        output_url: statusResult.outputUrl,
        error: statusResult.error,
        updated_at: new Date().toISOString()
      })
      .eq("provider_job_id", requestId);

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
