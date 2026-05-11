import { NextResponse } from "next/server";
import { getMuapiPredictionResult } from "@/lib/muapi";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMuapiOutputUrl, normalizeMuapiStatus } from "@/lib/jobs";

type JobRow = {
  id: string;
  session_id: string;
  team_name: string;
  kit_notes: string;
  target_poster_url: string;
  muapi_request_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const supabase = createServerSupabaseClient();
    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select("*")
      .eq("id", jobId)
      .single<JobRow>();

    if (error || !job) {
      return NextResponse.json({ error: error?.message ?? "Job not found." }, { status: 404 });
    }

    if (job.status === "completed" || job.status === "failed" || !job.muapi_request_id) {
      return NextResponse.json(toResponse(job));
    }

    const muapi = await getMuapiPredictionResult(job.muapi_request_id);
    const nextStatus = normalizeMuapiStatus(muapi.status);
    const outputUrl = getMuapiOutputUrl(muapi) ?? job.output_url;
    const nextError = muapi.error ?? job.error;

    const { data: updatedJob, error: updateError } = await supabase
      .from("generation_jobs")
      .update({
        status: nextStatus,
        output_url: outputUrl,
        error: nextError
      })
      .eq("id", job.id)
      .select("*")
      .single<JobRow>();

    if (updateError || !updatedJob) {
      return NextResponse.json({ error: updateError?.message ?? "Job update failed." }, { status: 500 });
    }

    return NextResponse.json(toResponse(updatedJob));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Job lookup failed." },
      { status: 500 }
    );
  }
}

function toResponse(job: JobRow) {
  return {
    id: job.id,
    sessionId: job.session_id,
    teamName: job.team_name,
    kitNotes: job.kit_notes,
    targetPosterUrl: job.target_poster_url,
    requestId: job.muapi_request_id,
    status: job.status,
    outputUrl: job.output_url,
    error: job.error,
    createdAt: job.created_at,
    updatedAt: job.updated_at
  };
}
