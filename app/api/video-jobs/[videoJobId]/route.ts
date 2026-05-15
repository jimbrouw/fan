import { NextResponse } from "next/server";
import { FalSeedanceVideoProvider } from "@/lib/ai/providers/falVideo";
import { notifyUser } from "@/lib/notifications";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type VideoJobRow = {
  id: string;
  generation_job_id: string;
  user_id: string;
  source_poster_url: string;
  provider: string;
  provider_job_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  error: string | null;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ videoJobId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to view this animation job." }, { status: 401 });
    }

    const { videoJobId } = await params;
    const supabase = createServerSupabaseClient();
    const { data: videoJob, error } = await supabase
      .from("video_jobs")
      .select("*")
      .eq("id", videoJobId)
      .single<VideoJobRow>();

    if (error || !videoJob) {
      return NextResponse.json({ error: error?.message ?? "Video job not found." }, { status: 404 });
    }

    if (videoJob.user_id !== user.id) {
      return NextResponse.json({ error: "You can only view your own animation jobs." }, { status: 403 });
    }

    if ((videoJob.status === "completed" && videoJob.output_url) || videoJob.status === "failed" || !videoJob.provider_job_id) {
      return NextResponse.json(toResponse(videoJob));
    }

    const provider = new FalSeedanceVideoProvider();
    const providerStatus = await provider.getVideoJobStatus(videoJob.provider_job_id);

    if (providerStatus.status !== videoJob.status || providerStatus.outputUrl || providerStatus.error) {
      const { data: updatedJob, error: updateError } = await supabase
        .from("video_jobs")
        .update({
          status: providerStatus.status,
          output_url: providerStatus.outputUrl ?? videoJob.output_url,
          error: providerStatus.error ?? videoJob.error,
        })
        .eq("id", videoJob.id)
        .select("*")
        .single<VideoJobRow>();

      if (updateError || !updatedJob) {
        return NextResponse.json({ error: updateError?.message ?? "Video job update failed." }, { status: 500 });
      }

      if (providerStatus.status !== videoJob.status && ["completed", "failed"].includes(providerStatus.status)) {
        const isCompleted = providerStatus.status === "completed";
        await notifyUser({
          userId: updatedJob.user_id,
          type: isCompleted ? "video_completed" : "video_failed",
          title: isCompleted ? "Your animated Kitface poster is ready" : "Your Kitface animation failed",
          body: isCompleted ? "Your MP4 poster animation has finished generating." : providerStatus.error ?? "The animation generation failed.",
          actionUrl: `/result/${updatedJob.generation_job_id}`,
          eventKey: `video:${updatedJob.id}:${providerStatus.status}`,
        });
      }

      return NextResponse.json(toResponse(updatedJob));
    }

    return NextResponse.json(toResponse(videoJob));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video job lookup failed." },
      { status: 500 }
    );
  }
}

function toResponse(videoJob: VideoJobRow) {
  return {
    id: videoJob.id,
    generationJobId: videoJob.generation_job_id,
    sourcePosterUrl: videoJob.source_poster_url,
    provider: videoJob.provider,
    providerJobId: videoJob.provider_job_id,
    status: videoJob.status,
    outputUrl: videoJob.output_url,
    error: videoJob.error,
    durationSeconds: videoJob.duration_seconds,
    createdAt: videoJob.created_at,
    updatedAt: videoJob.updated_at,
  };
}
