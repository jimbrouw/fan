import { NextResponse } from "next/server";
import { notifyUser } from "@/lib/notifications";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";

type WebhookBody = {
  request_id?: string;
  id?: string;
};

type GenerationJobRow = {
  id: string;
  user_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  return new RegExp(`Could not find the '${column}' column`, "i").test(error.message ?? "");
}

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

    let existingJobQuery = await supabase
      .from("generation_jobs")
      .select("id,user_id,status")
      .eq("provider_job_id", requestId)
      .single<GenerationJobRow>();
    if (existingJobQuery.error && isMissingSchemaColumn(existingJobQuery.error, "user_id")) {
      const fallback = await supabase
        .from("generation_jobs")
        .select("id,status")
        .eq("provider_job_id", requestId)
        .single<Omit<GenerationJobRow, "user_id">>();
      existingJobQuery = {
        ...fallback,
        data: fallback.data ? { ...fallback.data, user_id: null } : null,
      } as typeof existingJobQuery;
    }
    const { data: existingJob } = existingJobQuery;

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

    if (existingJob && statusResult.status !== existingJob.status && ["completed", "failed"].includes(statusResult.status)) {
      const isCompleted = statusResult.status === "completed";
      await notifyUser({
        userId: existingJob.user_id,
        type: isCompleted ? "image_completed" : "image_failed",
        title: isCompleted ? "Your Kitface poster is ready" : "Your Kitface poster needs another try",
        body: isCompleted ? "Your static football poster has finished generating." : statusResult.error ?? "The poster generation failed.",
        actionUrl: `/result/${existingJob.id}`,
        eventKey: `generation:${existingJob.id}:${statusResult.status}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handling failed." },
      { status: 500 }
    );
  }
}
