import { NextResponse } from "next/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { formatCorrectionInstructions, parseCorrectionPrompt } from "@/lib/ai/corrections";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validatePosterPersonalisation } from "@/lib/safety/profanity";

type JobRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  team_name: string;
  kit_notes: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to revise this poster." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { correctionPrompt?: string };
    if (!body.correctionPrompt?.trim()) {
      return NextResponse.json({ error: "Missing correction prompt." }, { status: 400 });
    }

    const personalisationSafetyError = validatePosterPersonalisation({
      correctionPrompt: body.correctionPrompt
    });

    if (personalisationSafetyError) {
      return NextResponse.json(
        {
          error: personalisationSafetyError.message,
          field: personalisationSafetyError.field,
          code: "unsafe_personalisation"
        },
        { status: 400 }
      );
    }

    const { jobId } = await params;
    const supabase = createServerSupabaseClient();
    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select("id,session_id,user_id,team_name,kit_notes,status,output_url")
      .eq("id", jobId)
      .single<JobRow>();

    if (error || !job) {
      return NextResponse.json({ error: error?.message ?? "Job not found." }, { status: 404 });
    }

    if (job.user_id !== user.id) {
      return NextResponse.json({ error: "You can only revise your own posters." }, { status: 403 });
    }

    if (job.status !== "completed" || !job.output_url) {
      return NextResponse.json({ error: "The poster must be complete before it can be revised." }, { status: 409 });
    }

    const correction = parseCorrectionPrompt(body.correctionPrompt);
    if (correction.ambiguityWarning && correction.confidence < 0.55) {
      return NextResponse.json({ error: correction.ambiguityWarning }, { status: 422 });
    }

    const prompt = `Revise this existing Kitface football poster using the completed poster image as the source of truth.
Preserve the approved composition, face identity, kit era, team, poster style, watermark, and aspect ratio unless the correction explicitly changes one of those details.
Do not invent new logos, words, sponsors, badges, or unrelated layout changes.

${formatCorrectionInstructions(correction)}`;

    const provider = new MuapiGenerationProvider();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/generation` : undefined;
    const { providerJobId } = await provider.submitJob({
      prompt,
      referenceImageUrls: [job.output_url],
      model: "wan2.7-image-edit",
      webhookUrl,
    });

    const correctedJobId = crypto.randomUUID();
    const now = new Date().toISOString();
    const insert = await supabase.from("generation_jobs").insert({
      id: correctedJobId,
      session_id: job.session_id,
      user_id: user.id,
      team_name: job.team_name,
      kit_notes: `${job.kit_notes}\nCorrection: ${body.correctionPrompt}`,
      target_poster_url: job.output_url,
      provider_job_id: providerJobId,
      status: "processing",
      created_at: now,
      updated_at: now,
    });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({ jobId: correctedJobId, requestId: providerJobId, status: "processing" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Correction job failed." },
      { status: 500 }
    );
  }
}
