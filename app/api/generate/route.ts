import { NextResponse } from "next/server";
import { getPosterStyle } from "@/lib/posterTemplates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { buildPosterPrompt } from "@/lib/ai/promptBuilder";
import { getKitSpec, type KitVariant } from "@/lib/kitSpecs";
import { buildUsableReferenceImageUrls } from "@/lib/remoteImages";
import type { TeamProfile } from "@/lib/teamProfiles";
import type { MatchContext } from "@/lib/ai/promptBuilder";

type GenerateBody = {
  sessionId: string;
  sourceImageUrl: string;
  teamId?: string;
  teamName: string;
  kitNotes: string;
  model?: string;
  kitVariant?: KitVariant;
  posterStyleId?: string;
  matchContext?: MatchContext;
  teamProfile?: {
    name: string;
    primary: string;
    accent: string;
    kitNotes: string;
    trophy?: string;
    group: TeamProfile["group"];
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
    const kitVariant = body.kitVariant ?? "home";
    const kitSpec = body.teamId ? getKitSpec(body.teamId, kitVariant) : undefined;
    const referenceImageUrls = await buildUsableReferenceImageUrls({
      requiredSourceImageUrl: body.sourceImageUrl,
      optionalReferenceImageUrls: kitSpec?.referenceImageUrl ? [kitSpec.referenceImageUrl] : [],
    });
    const prompt = buildPosterPrompt({
      teamProfile: body.teamProfile,
      posterStyle,
      kitSpec,
      matchContext: body.matchContext,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/generation` : undefined;

    const provider = new MuapiGenerationProvider();

    const { providerJobId } = await provider.submitJob({
      prompt,
      referenceImageUrls,
      model: body.model,
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
      kit_notes: [
        body.kitNotes,
        `Kit variant: ${kitVariant}`,
        kitSpec ? `Kit spec: ${kitSpec.season} ${kitSpec.team} ${kitSpec.variant}` : undefined,
        body.matchContext
          ? `Match: ${body.matchContext.homeTeam.name} vs ${body.matchContext.awayTeam.name}; user side: ${body.matchContext.userSide}; opponent mode: ${body.matchContext.opponentMode}`
          : undefined,
        body.matchContext?.matchdayNotes ? `Matchday notes: ${body.matchContext.matchdayNotes}` : undefined,
        `Model: ${body.model || "wan2.7-image-edit"}`,
        `Poster style: ${posterStyle.name}`
      ].filter(Boolean).join("\n"),
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
    const message = error instanceof Error ? error.message : "Generation request failed.";
    if (message.includes("selected face reference image")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
