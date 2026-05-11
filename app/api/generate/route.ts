import { NextResponse } from "next/server";
import { getPosterStyle } from "@/lib/posterTemplates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { buildPosterPrompt } from "@/lib/ai/promptBuilder";

type GenerateBody = {
  sessionId: string;
  sourceImageUrl: string;
  teamName: string;
  kitNotes: string;
  posterStyleId?: string;
  teamProfile?: {
    name: string;
    primary: string;
    accent: string;
    kitNotes: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    if (!body.sessionId || !body.sourceImageUrl || !body.teamName || !body.kitNotes || !body.teamProfile) {
      return NextResponse.json(
        { error: "Missing sessionId, sourceImageUrl, teamName, kitNotes, or teamProfile." },
        { status: 400 }
      );
    }

    const posterStyle = getPosterStyle(body.posterStyleId ?? "hero-card");
    const prompt = buildPosterPrompt({
      teamProfile: body.teamProfile,
      posterStyle,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/generation` : undefined;

    const provider = new MuapiGenerationProvider();

    const { providerJobId } = await provider.submitJob({
      prompt,
      referenceImageUrls: [body.sourceImageUrl],
      webhookUrl,
    });

    if (!providerJobId) {
      return NextResponse.json({ error: "Provider did not return a job id." }, { status: 502 });
    }

    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();
    const jobId = crypto.randomUUID();

    const insert = await supabase.from("generation_jobs").insert({
      id: jobId,
      session_id: body.sessionId,
      team_name: body.teamName,
      kit_notes: `${body.kitNotes}\nPoster style: ${posterStyle.name}`,
      target_poster_url: "", // Not used in this generation mode, but required by schema
      provider_job_id: providerJobId, // Storing the provider job ID
      status: "processing",
      created_at: now,
      updated_at: now
    });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({ jobId, requestId: providerJobId, status: "processing" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation request failed." },
      { status: 500 }
    );
  }
}
