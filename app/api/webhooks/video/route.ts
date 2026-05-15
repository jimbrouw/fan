import { NextResponse } from "next/server";
import { FalSeedanceVideoProvider } from "@/lib/ai/providers/falVideo";
import { notifyUser } from "@/lib/notifications";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type WebhookBody = {
  request_id?: string;
  id?: string;
};

type VideoJobRow = {
  id: string;
  generation_job_id: string;
  user_id: string;
  status: "queued" | "processing" | "completed" | "failed";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebhookBody;
    const requestId = body.request_id ?? body.id;
    if (!requestId) {
      return NextResponse.json({ error: "Missing request id." }, { status: 400 });
    }

    const provider = new FalSeedanceVideoProvider();
    const statusResult = await provider.getVideoJobStatus(requestId);
    const supabase = createServerSupabaseClient();

    const { data: existingJob } = await supabase
      .from("video_jobs")
      .select("id,generation_job_id,user_id,status")
      .eq("provider_job_id", requestId)
      .single<VideoJobRow>();

    const { error } = await supabase
      .from("video_jobs")
      .update({
        status: statusResult.status,
        output_url: statusResult.outputUrl,
        error: statusResult.error,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_job_id", requestId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (existingJob && statusResult.status !== existingJob.status && ["completed", "failed"].includes(statusResult.status)) {
      const isCompleted = statusResult.status === "completed";
      await notifyUser({
        userId: existingJob.user_id,
        type: isCompleted ? "video_completed" : "video_failed",
        title: isCompleted ? "Your animated Kitface poster is ready" : "Your Kitface animation failed",
        body: isCompleted ? "Your MP4 poster animation has finished generating." : statusResult.error ?? "The animation generation failed.",
        actionUrl: `/result/${existingJob.generation_job_id}`,
        eventKey: `video:${existingJob.id}:${statusResult.status}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video webhook handling failed." },
      { status: 500 }
    );
  }
}
