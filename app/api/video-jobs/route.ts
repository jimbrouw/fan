import { NextResponse } from "next/server";
import { FalSeedanceVideoProvider } from "@/lib/ai/providers/falVideo";
import { KITFACE_VIDEO_PROMPT_4_SECONDS } from "@/lib/ai/videoTypes";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CreateVideoBody = {
  generationJobId?: string;
};

type GenerationJobRow = {
  id: string;
  user_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to animate this poster." }, { status: 401 });
    }

    const body = (await request.json()) as CreateVideoBody;
    if (!body.generationJobId) {
      return NextResponse.json({ error: "Missing generationJobId." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: imageJob, error: imageJobError } = await supabase
      .from("generation_jobs")
      .select("id,user_id,status,output_url")
      .eq("id", body.generationJobId)
      .single<GenerationJobRow>();

    if (imageJobError || !imageJob) {
      return NextResponse.json({ error: imageJobError?.message ?? "Poster job not found." }, { status: 404 });
    }

    if (imageJob.user_id !== user.id) {
      return NextResponse.json({ error: "You can only animate your own posters." }, { status: 403 });
    }

    if (imageJob.status !== "completed" || !imageJob.output_url) {
      return NextResponse.json({ error: "The static poster must finish before animation can start." }, { status: 409 });
    }

    const existing = await supabase
      .from("video_jobs")
      .select("id,status,output_url,error")
      .eq("generation_job_id", imageJob.id)
      .in("status", ["queued", "processing", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; status: string; output_url: string | null; error: string | null }>();

    if (existing.data) {
      return NextResponse.json({
        videoJobId: existing.data.id,
        status: existing.data.status,
        outputUrl: existing.data.output_url,
        error: existing.data.error,
      });
    }

    const provider = new FalSeedanceVideoProvider();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/video` : undefined;
    const { providerJobId } = await provider.submitVideoJob({
      sourceImageUrl: imageJob.output_url,
      prompt: KITFACE_VIDEO_PROMPT_4_SECONDS,
      durationSeconds: 4,
      webhookUrl,
    });

    const videoJobId = crypto.randomUUID();
    const now = new Date().toISOString();
    const insert = await supabase.from("video_jobs").insert({
      id: videoJobId,
      generation_job_id: imageJob.id,
      user_id: user.id,
      source_poster_url: imageJob.output_url,
      provider: provider.id,
      provider_job_id: providerJobId,
      status: "processing",
      duration_seconds: 4,
      created_at: now,
      updated_at: now,
    });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({ videoJobId, providerJobId, status: "processing" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video job creation failed." },
      { status: 500 }
    );
  }
}
