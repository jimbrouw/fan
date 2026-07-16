import { NextResponse } from "next/server";
import { notifyUser } from "@/lib/notifications";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { decideOwnedResourceAccess } from "@/lib/authz";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { decodeFalGptImageProviderJobId, FalGptImage2GenerationProvider } from "@/lib/ai/providers/fal";
import type { GenerationResponse } from "@/lib/ai/types";
import { isTransientGenerationError } from "@/lib/ai/generationErrors";

type JobRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  team_name: string;
  kit_notes: string;
  target_poster_url: string;
  provider_job_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

type VideoSummaryRow = {
  id: string;
  provider: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  error: string | null;
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  return new RegExp(`Could not find the '${column}' column`, "i").test(error.message ?? "");
}

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to view this poster." }, { status: 401 });
    }

    const { jobId } = await params;
    const supabase = createServerSupabaseClient();
    let userIdColumnMissing = false;
    let jobQuery = await supabase
      .from("generation_jobs")
      .select("*")
      .eq("id", jobId)
      .single<JobRow>();
    if (jobQuery.error && isMissingSchemaColumn(jobQuery.error, "user_id")) {
      userIdColumnMissing = true;
      const fallback = await supabase
        .from("generation_jobs")
        .select("id,session_id,team_name,kit_notes,target_poster_url,provider_job_id,status,output_url,error,created_at,updated_at")
        .eq("id", jobId)
        .single<Omit<JobRow, "user_id">>();
      jobQuery = {
        ...fallback,
        data: fallback.data ? { ...fallback.data, user_id: null } : null,
      } as typeof jobQuery;
    }
    const { data: job, error } = jobQuery;

    if (error || !job) {
      return NextResponse.json({ error: error?.message ?? "Job not found." }, { status: 404 });
    }

    const access = decideOwnedResourceAccess({
      ownerColumnAvailable: !userIdColumnMissing,
      resourceUserId: job.user_id,
      requesterUserId: user.id,
    });
    if (access === "deny") {
      // 404 rather than 403 so we don't reveal that the job exists.
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const shouldRetryTransientFailure = job.status === "failed" && isTransientGenerationError(job.error) && Boolean(job.provider_job_id);

    if ((job.status === "completed" && job.output_url) || (job.status === "failed" && !shouldRetryTransientFailure) || !job.provider_job_id) {
      return NextResponse.json(await toResponse(job, supabase));
    }

    let providerStatus: GenerationResponse;
    try {
      providerStatus = await getStaticGenerationStatus(job.provider_job_id);
    } catch (providerError) {
      const message = providerError instanceof Error ? providerError.message : "Provider status check failed.";
      if (!isTransientGenerationError(message)) throw providerError;

      console.warn("Transient generation provider status check failed:", message, { jobId: job.id });
      if (shouldRetryTransientFailure) {
        const { data: recoveredJob, error: recoverError } = await supabase
          .from("generation_jobs")
          .update({ status: "processing", error: null })
          .eq("id", job.id)
          .select("*")
          .single<JobRow>();

        if (recoverError || !recoveredJob) {
          return NextResponse.json({ error: recoverError?.message ?? "Job recovery failed." }, { status: 500 });
        }

        return NextResponse.json(await toResponse(recoveredJob, supabase));
      }

      return NextResponse.json(await toResponse({ ...job, error: null }, supabase));
    }

    // Only update if something changed
    if (providerStatus.status !== job.status || providerStatus.outputUrl || providerStatus.error) {
      const nextError = providerStatus.error ?? (providerStatus.status === "failed" ? job.error : null);
      const { data: updatedJob, error: updateError } = await supabase
        .from("generation_jobs")
        .update({
          status: providerStatus.status,
          output_url: providerStatus.outputUrl ?? job.output_url,
          error: nextError
        })
        .eq("id", job.id)
        .select("*")
        .single<JobRow>();

      if (updateError || !updatedJob) {
        return NextResponse.json({ error: updateError?.message ?? "Job update failed." }, { status: 500 });
      }

      if (providerStatus.status !== job.status && ["completed", "failed"].includes(providerStatus.status)) {
        const isCompleted = providerStatus.status === "completed";
        await notifyUser({
          userId: updatedJob.user_id,
          type: isCompleted ? "image_completed" : "image_failed",
          title: isCompleted ? "Your Kitface poster is ready" : "Your Kitface poster needs another try",
          body: isCompleted ? "Your static football poster has finished generating." : providerStatus.error ?? "The poster generation failed.",
          actionUrl: `/result/${job.id}`,
          eventKey: `generation:${job.id}:${providerStatus.status}`,
        });
      }

      return NextResponse.json(await toResponse(updatedJob, supabase));
    }

    return NextResponse.json(await toResponse(job, supabase));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Job lookup failed." },
      { status: 500 }
    );
  }
}

async function getStaticGenerationStatus(providerJobId: string): Promise<GenerationResponse> {
  if (decodeFalGptImageProviderJobId(providerJobId)) {
    return new FalGptImage2GenerationProvider().getJobStatus(providerJobId);
  }

  return new MuapiGenerationProvider().getJobStatus(providerJobId);
}

async function toResponse(job: JobRow, supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data: videoJob } = await supabase
    .from("video_jobs")
    .select("id,provider,status,output_url,error")
    .eq("generation_job_id", job.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<VideoSummaryRow>();

  return {
    id: job.id,
    sessionId: job.session_id,
    userId: job.user_id,
    teamName: job.team_name,
    kitNotes: job.kit_notes,
    targetPosterUrl: job.target_poster_url,
    requestId: job.provider_job_id,
    status: job.status,
    outputUrl: job.output_url,
    error: job.error,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    videoJob: videoJob
      ? {
          id: videoJob.id,
          provider: videoJob.provider,
          status: videoJob.status,
          outputUrl: videoJob.output_url,
          error: videoJob.error,
        }
      : null,
  };
}
